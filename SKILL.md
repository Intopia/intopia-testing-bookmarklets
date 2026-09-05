---
name: bookmarklet-generation
description: Generate or update accessibility testing bookmarklets for the Intopia testing-bookmarklets library. Use when asked to create, add, fix, or update a bookmarklet that highlights an HTML or ARIA feature directly on a page.
---

# Bookmarklet generation

## When to use this skill

Trigger on requests like "create a bookmarklet for aria-X", "add a bookmarklet that highlights Y", "fix the [name] bookmarklet", or "update [name] to also flag Z".

Not for: test or exercise page creation (separate skill), README or descriptions edits made in isolation without a code change, or general accessibility Q&A unrelated to this repo.

---

## Design system

There are **two palettes**, and the difference between them matters more than any individual colour.

A colour is either a **verdict** or a **category**, never both. Most bookmarklets judge something: is this name resolving, is this value valid. A few only identify what an element is: this is a banner, this is a rowgroup, this is a `<th>`. Those two jobs need separate vocabularies, or correct markup gets marked as broken.

### Verdict palette

Used by any bookmarklet that judges.

| Colour | Hex | Meaning |
|--------|-----|---------|
| Dark green | `#1b5e20` | Valid, present, correctly implemented |
| Dark blue | `#0a558c` | Informational, secondary reference, non-verdict |
| Amber | `#e65100` | Caution, unreliable, unconfirmed, redundant |
| Red | `#b00020` | Missing, broken, prohibited, invalid |

Blue is not a lesser green. It carries two distinct jobs: the referenced element in a relationship bookmarklet, and a deliberately non-verdict state where a pass or fail judgement would be misleading (`aria-readonly="true"` alone, `tabindex="-1"`, an unnamed `role="group"`). Do not substitute blue for green as a softer pass.

Where blue carries a lesson, **the badge text must state it**. Blue plus a bare attribute name reads as "fine", which is usually the opposite of the point. `aria-readonly="true" (announced only — does not prevent typing)`, not `aria-readonly="true"`.

### Category palette

Used by bookmarklets that identify rather than judge: landmarks, ARIA table roles, and the table, caption and TH groups in captions and headers.

| Colour | Hex |
|--------|-----|
| Dark blue | `#0a558c` |
| Deep purple | `#4a148c` |
| Teal | `#006064` |
| Deep pink | `#880e4f` |
| Blue-grey | `#37474f` |
| Brown | `#4e342e` |
| Indigo | `#1a237e` |
| Slate | `#455a64` |
| Dark | `#111111` (focus order tracker only) |

**Green, amber and red never appear in a category palette.** All eight category colours pass AA with white text.

This is not an overflow set for when four colours run out. That framing is how a valid `<form aria-label="Search">` ended up outlined in red and every cell of a valid ARIA grid ended up green. If a bookmarklet needs more distinct colours than the category palette provides, add one rather than borrowing a verdict colour.

A bookmarklet may use both palettes: captions and headers uses category colours for table, caption, TH and scope, and reserves amber and red for the two things that are actually verdicts (a missing caption, an invalid scope value).

### Convention versus rule

Where something is a widely followed convention rather than a specification requirement, say so in the badge and use amber, not red. `H1: [text] (additional H1 — valid HTML, but one per page is the convention)`. Red states a preference as a rule, and in a teaching tool that is what a student takes away.

Likewise, do not let a colour imply that ARIA is worse than native. A correctly named `role="radiogroup"` is green, exactly like a `<fieldset>` with a `<legend>`.

### Badge text conventions

- **Informational**: sentence case, source first. `aria-label: Close`
- **Diagnostic verdict**: all caps, verdict first. `NO ACCESSIBLE NAME`, `MISMATCH: Hello`

---

## Architectural rules (apply to every bookmarklet)

- Use an overlay div for all badges, never inject directly into the DOM.
- Esc clears the overlay. Re-running removes the previous overlay before drawing the new one.
- **Exception:** document-level banners append directly to `document.body`, not the overlay div, to avoid `position: fixed` being affected by CSS transforms on ancestor elements. This applies to page language, document title and page encoding. Any future document-level bookmarklet follows the same rule, and gets no element outline, because there is no visible element to outline.
- Dense and table bookmarklets use keyboard number filters with a fixed legend panel, progressive enhancement style. All groups on by default unless a specific group is explicitly opt-in (for example `scope` on the captions and headers bookmarklet).
- A number key isolates its group. Pressing the same key again restores the default view. `n` cycles through groups in sequence.
- **Relationship bookmarklets** (labelledby, describedby, details, controls): source element gets a green badge and outline, referenced elements get blue. Missing IDs are annotated inline on the source badge, not as a separate error. Hidden referenced elements (for example a collapsed panel) are valid and noted silently, with no floating badge at 0,0.
- **State bookmarklets** (expanded, checked, pressed): badges reflect DOM state at the moment the bookmarklet runs, not live. Always note "re-run after interacting with the widget to see updated values" in both the JS comment header and the description.
- **Dynamically inserted targets** (for example `aria-controls` pointing at an element not yet in the DOM): flag as missing on first run. This is correct behaviour reflecting what AT sees at that moment, not a bug. Note it explicitly rather than trying to "fix" it.
- **Duplicate document-level elements** (more than one `<title>`, conflicting charset declarations) are amber, not red. The page still works and one declaration wins, so this is a caution rather than a failure.
- **Document-level banners stack.** Where more than one message applies, offset each banner vertically (`20 + index * 56` px). Two `position: fixed` banners at the same coordinates hide each other completely.
- **Skip elements that are not rendered.** Use a shared helper rather than a width/height test alone: `display:none` gives a zero-size rect, but `visibility:hidden` still occupies layout, so it needs `getComputedStyle`. Without this, hidden elements produce floating badges at the top of the page.

```js
function isRendered(el, rect) {
  if (rect.width === 0 && rect.height === 0) return false;
  return window.getComputedStyle(el).visibility !== 'hidden';
}
```

- **Match role selectors case-insensitively.** `[role="banner" i]`, not `[role="banner"]`. Lowercase the value and take the first token before looking it up, since `role` may be a token list. An explicit role overrides the implicit one: if the explicit role is not the one being tested for, the element is out, and the implicit mapping must not be consulted as a fallback.
- **An accessible name includes image alt.** `textContent` alone misses a heading, link or button named by an image, which is common for logos and icons. Clone the element, swap `img`, `area` and `input[type=image]` for their alt text, then read the text. An `<svg><title>` counts towards the accessible name but not towards *visible* text, which matters for WCAG 2.5.3.
- **Validate values against the attribute's ARIA value type, not against what JavaScript will parse.** `Number()` accepts hex, exponential notation, a leading plus, decimals and `Infinity`, then reports the converted value rather than what the author wrote. This produced badges saying `aria-level: 16` for `aria-level="0x10"` and a working `tabindex="-1"` for `tabindex="-1.0"`, which is not focusable at all.

```js
// integer types: aria-level, aria-setsize, aria-posinset, tabindex
var isInteger = /^[-+]?\d+$/.test(trimmed);

// number types: aria-valuenow, aria-valuemin, aria-valuemax
var isNumber = /^[-+]?(\d+(\.\d+)?|\.\d+)([eE][-+]?\d+)?$/.test(trimmed);
```

- **`undefined` is valid only where the value type includes it.** Valid for `tristate` (aria-checked, aria-pressed) and `true/false/undefined` (aria-expanded). Not valid for plain `true/false` or token types (aria-haspopup, aria-invalid, aria-readonly, aria-required). Where it is valid, say `(same as omitting the attribute)` so nobody learns to write it.
- **Flag an attribute that has no effect on this element.** `readonly` on a `<select>` or a checkbox, `required` on a range input, `aria-roledescription` on a `role="presentation"` element. These are red with the reason named, because the author believes something is happening and nothing is.

---

## Minification (terser via Node)

Gotcha: terser can rename variables to the same single letter, causing temporal dead zone errors.

Fix: use `mangle: { reserved: ['functionName'] }` for key functions, and prefer `var` over `const` / `let` inside `forEach` callbacks.

---

## Repo structure

```
intopia-testing-bookmarklets/
├── README.md                      ← full badge reference, one section per bookmarklet
├── bookmarklet-descriptions.md    ← plain-language description per bookmarklet
├── src/
│   └── [name].js                  ← readable source, comment header
└── dist/
    ├── testing-bookmarklets.html
    └── hrefs/
        └── [name].txt             ← ready-to-paste <a> tag
```

The exercise repo (`intopia.github.io/exercise/`) is the published product. It holds the live `testing-bookmarklets-intopia.html`. This repo is source and build artefacts. `bookmarklet-descriptions.md` lives here, not in the exercise repo, and its entries are copied into the published page alongside each bookmarklet link.

---

## Building a new bookmarklet

1. Confirm the aim: which ARIA attribute or HTML feature, and which states and edge cases it needs to flag. Ask if the badge states are not already obvious from a similar existing bookmarklet.
2. Check `README.md` for the closest existing bookmarklet in the same category (relationship, state, table, document-level) and follow its badge pattern rather than inventing a new one.
3. Write readable JS source with a comment header, to `src/[name].js`.
4. Minify with terser, encode, and produce the ready-to-paste tag: `<a class="bookmarklet" href="javascript:...">`. Save to `dist/hrefs/[name].txt`.
5. Add a new section to the README badge reference, matching the existing table format (colour, hex, badge text), and close it with a `---` separator like every other section.
6. Add the bookmarklet to the numbered list at the top of the README, in the same position it occupies in the badge reference.
7. Add a numbered plain-language entry to `bookmarklet-descriptions.md`, matching the tone and length of existing entries. Include activation instructions (click to activate, keys, Esc) if the bookmarklet is interactive.

Pushing the href into `testing-bookmarklets-intopia.html` in the exercise repo, and building a matching test page, are separate steps outside this skill.

---

## Updating an existing bookmarklet

1. Edit `src/[name].js`.
2. Re-minify and re-encode, update `dist/hrefs/[name].txt`.
3. Update the README badge reference and the `bookmarklet-descriptions.md` entry if badges or behaviour changed.
4. Copy the updated href into `testing-bookmarklets-intopia.html` in the exercise repo.

---

## Keeping the three lists in sync

Three files hold a full list, and they must always agree: the numbered list at the top of `README.md`, the badge reference sections below it, and `bookmarklet-descriptions.md`. The `dist/hrefs/` directory is the fourth check.

Before editing any of them, re-read the file rather than working from an earlier read in the same session. When adding or removing a bookmarklet, update all three lists in the same pass and confirm the counts match. Do not state a total in prose anywhere. The numbered list is the only place a total should be derivable.

---

## Reference, not duplicated here

Full badge specs for every existing bookmarklet live in `README.md`. Always check it before building a new one, both to match colour and text conventions for the relevant category, and to avoid re-describing a pattern that already has an established form.
