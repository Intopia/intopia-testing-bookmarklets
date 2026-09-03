# Draft: shared code patterns

Proposed new section for `SKILL.md`, to sit between **Architectural rules** and
**Minification**. Values marked *(proposed)* are majority-vote across the existing
source files, not universal — adopting them means some existing bookmarklets will
differ from the documented standard until they are next touched.

---

## Shared code patterns

Every element-highlighting bookmarklet is built from the same skeleton. Copy it,
change the slug and the per-element logic, and leave the rest alone. Do not
reinvent the overlay, the badge or the teardown.

### Standard skeleton

```js
// [Bookmarklet name]
// [One line on what it highlights.]
// [Re-run note, spec caveat or deliberate-behaviour note, if any.]
(function () {
  var SLUG = '[slug]';                       // e.g. 'aria-pressed'
  var OVERLAY_ID = 'a11y-' + SLUG + '-overlay';
  var GLOBAL = '_a11y_' + SLUG;

  // Tear down the previous run completely, not just its overlay
  if (window[GLOBAL]) window[GLOBAL]();

  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText =
    'position:absolute;top:0;left:0;width:100%;pointer-events:none;z-index:999999;';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  function makeBadge(text, colour, rect, wrap) {
    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.left = (rect.left + window.scrollX) + 'px';
    b.style.top = (rect.top + window.scrollY - 26) + 'px';
    b.style.background = colour;
    b.style.color = '#ffffff';
    b.style.padding = '2px 6px';
    b.style.fontSize = '14px';
    b.style.fontFamily = 'Arial, sans-serif';
    b.style.borderRadius = '4px';
    b.style.pointerEvents = 'none';
    b.style.zIndex = '999999';
    if (wrap) {
      b.style.whiteSpace = 'normal';
      b.style.maxWidth = '500px';
      b.style.lineHeight = '1.4';
    } else {
      b.style.whiteSpace = 'nowrap';
    }
    overlay.appendChild(b);
    return b;
  }

  function flag(el, colour, text, wrap) {
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge(text, colour, el.getBoundingClientRect(), wrap);
  }

  function noneFound(text) {
    var msg = document.createElement('div');
    msg.textContent = text;
    msg.style.cssText =
      'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
      'background:#333;color:#fff;padding:10px 16px;border-radius:6px;' +
      'font-size:16px;font-family:Arial,sans-serif;z-index:999999;pointer-events:none;';
    overlay.appendChild(msg);
  }

  function teardown() {
    overlay.remove();
    flaggedEls.forEach(function (el) {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
    document.removeEventListener('keydown', onKey);
    delete window[GLOBAL];
  }

  function onKey(e) {
    if (e.key === 'Escape') teardown();
  }

  // ---- per-bookmarklet logic goes here ----
  // document.querySelectorAll('[selector]').forEach(function (el) { ... flag(el, ...) });

  if (flaggedEls.length === 0) {
    noneFound('No [thing] found on this page.');
  }

  window[GLOBAL] = teardown;
  document.addEventListener('keydown', onKey);
})();
```

### Why the global teardown reference

Removing the overlay on re-run is not enough. The previous run's `flaggedEls`
array is gone with its closure, so any element it outlined that no longer matches
the selector keeps that outline permanently, and Esc cannot clear it because the
new run has never heard of it. The stacked `keydown` listeners are a second
symptom of the same gap.

Storing the teardown function on `window` and calling it at the top of the next
run fixes both. This matters most for the state bookmarklets, which are explicitly
designed to be re-run after interaction.

`track-focus-order` already does this, using `window._a11yFocusOrderCleanup`.
The skeleton generalises that pattern to the whole set.

### Badge and outline values *(proposed)*

| Property | Value |
|----------|-------|
| Badge padding | `2px 6px` |
| Badge font size | `14px` |
| Badge font family | `Arial, sans-serif` |
| Badge border radius | `4px` |
| Badge text colour | `#ffffff` |
| Badge vertical offset | `rect.top - 26px` (above element) |
| Badge horizontal offset | `rect.left` (no inset) |
| Outline | `3px solid [colour]` with `outlineOffset: 2px` |
| z-index | `999999` (badge, overlay and banner alike) |

Badges are `white-space: nowrap` by default. Pass `wrap` for badges that can hold
long author-supplied strings — alt text, resolved accessible names, title
attribute values — which switches to `white-space: normal` with a 500px cap.

Badges sit **above** the element by default. Badges sit **inside at the bottom**
only where an above-badge would collide with a parent's badge: list items inside a
list container, row and cell roles inside a table container. Where a bookmarklet
shows two badges on one element (fieldset and legend, TH and scope), the second
goes below.

### Accessible name resolution

Several bookmarklets need a name. Use one helper, in AccName precedence order —
`aria-labelledby`, then `aria-label`, then content, then `title`:

```js
  function getAccessibleName(el) {
    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      var text = labelledBy.trim().split(/\s+/).map(function (id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean).join(' ').trim();
      if (text) return { name: text, source: 'aria-labelledby' };
    }
    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return { name: ariaLabel.trim(), source: 'aria-label' };
    }
    var content = el.textContent.trim().replace(/\s+/g, ' ');
    if (content) return { name: content, source: 'text content' };
    var title = el.getAttribute('title');
    if (title && title.trim()) return { name: title.trim(), source: 'title' };
    return null;
  }
```

The `source` value is what lets a bookmarklet colour a `title`-derived name amber
while a `label`-derived name stays green. Where a bookmarklet only needs the
string, ignore it.

Two rules the helper does not encode, because they are per-bookmarklet:

- Hidden referenced elements still contribute their text, per AccName. Exclude
  them from getting a badge and outline of their own, to avoid a floating badge
  at 0,0, but keep their text in the resolved name.
- Whether `title` counts as a name at all depends on the bookmarklet. For form
  fields and links it is a flagged fallback, not a pass.

### Document-level banner variant

Page language, document title and page encoding do not outline anything and do
not use the overlay. They append a single fixed banner to `document.body`, cleaned
up by class rather than by ID, so a stale banner from a previous run cannot
survive:

```js
  var BANNER_CLASS = 'a11y-[slug]-banner';
  document.querySelectorAll('.' + BANNER_CLASS).forEach(function (el) { el.remove(); });
```

Banner styling differs from badge styling deliberately, because it is a page-level
statement rather than an element annotation: `8px 16px` padding, `16px` font,
`6px` radius, centred at `top: 20px`, with a drop shadow.

### Keyboard filter variant

Dense and table bookmarklets add a fixed legend panel and number-key filtering on
top of the skeleton. Rather than restate it, follow
`highlight-aria-table-roles.js`: a group map, a `setFilter(group)` function that
toggles badge `display` and element `outline` together, legend entries dimmed to
`0.4` opacity when not active, and `n` walking the group list in order.

Filtering must toggle the outline as well as the badge. Hiding the badge alone
leaves an unexplained outline on the page.

### Naming conventions

| Thing | Pattern | Example |
|-------|---------|---------|
| Source file | `src/[slug].js` | `src/highlight-aria-pressed.js` |
| Overlay ID | `a11y-[slug]-overlay` | `a11y-aria-pressed-overlay` |
| Banner class | `a11y-[slug]-banner` | `a11y-doc-title-banner` |
| Teardown global | `_a11y_[slug]` | `_a11y_aria-pressed` |

Slugs are currently inconsistent — `a11y-labelledby-overlay` and
`a11y-aria-table-overlay` shorten the attribute name while others do not. IDs are
internal and invisible to users, so this is not urgent, but new bookmarklets
should use the full name.

### Minification reserved list

The named functions in the skeleton all need protecting from terser:

```js
mangle: { reserved: ['makeBadge', 'flag', 'noneFound', 'teardown', 'onKey', 'getAccessibleName'] }
```

Add any further named function to the list. Prefer `var` over `const` and `let`
inside `forEach` callbacks.

---

## Known drift from these values

Recorded so the next edit to each file can bring it into line. Not a reason to
touch a file on its own.

| File | Drift |
|------|-------|
| `highlight-readonly-fields` | No `fontFamily`, so the badge inherits the page font. No `borderRadius`. 16px text. `zIndex: 1000`. 5px outline, no offset. Badge at `rect.top`, covering the field rather than sitting above it |
| `highlight-landmarks` | Resolves `aria-label` before `aria-labelledby`, which reverses AccName precedence. 4px outline, 4px badge padding, -28px offset |
| `highlight-aria-labelledby` | 4px outline with no offset, 3px radius, 5px padding. No empty-state message |
| `highlight-aria-table-roles` | 3px radius, 5px padding, 2px left inset on badges |
| `highlight-links` | Sets `whiteSpace` twice, `nowrap` then `normal`. First assignment is dead |
| `highlight-aria-table-roles`, `track-focus-order`, `highlight-landmarks` | Minified in `src/`. No readable source exists |
| All element bookmarklets | Re-run leaves stale outlines and stacks a second `keydown` listener |
