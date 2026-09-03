# Intopia testing bookmarklets — handoff document

*Verified against README.md, bookmarklet-descriptions.md and the `dist/hrefs/` file list. All three agree on 37 bookmarklets.*

---

## Project overview

A set of accessibility testing bookmarklets that highlight specific HTML and ARIA features directly on a page. Each one uses a consistent colour system and badge format, so testers and developers can inspect accessibility markup without opening browser DevTools.

The audience is designers, developers and testers. Several bookmarklets are deliberately educational rather than pass/fail (see `highlight-readonly-fields`).

---

## Key links

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/Intopia/intopia-testing-bookmarklets |
| README (badge reference) | https://github.com/Intopia/intopia-testing-bookmarklets/blob/main/README.md |
| How it works | https://github.com/Intopia/intopia-testing-bookmarklets/blob/main/how-it-works.md |
| Public bookmarklets page | https://intopia.github.io/exercise/testing-bookmarklets-intopia.html |
| Test pages index | https://intopia.github.io/exercise/testing.html |

---

## Design system

### Colour palette

| Colour | Hex | Meaning |
|--------|-----|---------|
| Dark green | `#1b5e20` | Valid, present, correctly implemented |
| Dark blue | `#0a558c` | Informational, secondary reference, generic |
| Amber | `#e65100` | Caution, unreliable, unconfirmed, redundant |
| Red | `#b00020` | Missing, broken, prohibited, invalid |
| Deep purple | `#4a148c` | Extended set: landmarks, ARIA tables |
| Teal | `#006064` | Extended set: landmarks, ARIA tables |
| Deep pink | `#880e4f` | Extended set: landmarks |
| Blue-grey | `#37474f` | Extended set: landmarks, ARIA tables |
| Dark | `#111111` | Focus order tracker only |

Use the core four for anything with a clear valid / informational / caution / invalid structure. Only reach for the extended five when a bookmarklet needs more than four visually distinct categories at once.

### Badge text conventions

- **Informational**: sentence case, source first. `aria-label: Close`
- **Diagnostic verdict**: all caps, verdict first. `NO ACCESSIBLE NAME`, `MISMATCH: Hello`

### Architectural rules

- All badges render into an overlay div, never injected directly into the DOM.
- Esc clears the overlay. Re-running removes the previous overlay before drawing the new one.
- Exception: document-level banners (page language, document title, page encoding) append directly to `document.body`, to avoid `position: fixed` being affected by CSS transforms on ancestor elements.
- Table and dense bookmarklets use keyboard number filters with a fixed legend panel. A number key isolates its group, pressing the same key again restores the default view, `n` cycles through groups in sequence.
- All groups on by default unless a group is explicitly opt-in (key 4, `scope`, on captions and headers).
- Relationship bookmarklets (labelledby, describedby, details, controls): source element green, referenced elements blue, missing IDs annotated inline on the source badge rather than as a separate error.
- Hidden referenced elements are valid and noted silently, with no floating badge at 0,0.
- State bookmarklets (expanded, checked, pressed) reflect DOM state at the moment of running, not live. The re-run note goes in both the JS comment header and the description.

---

## Minification

All bookmarklets are minified with terser via Node.

Known gotcha: terser can rename variables to the same single letter, causing temporal dead zone errors. Use `mangle: { reserved: ['functionName'] }` for key functions and prefer `var` over `const` / `let` inside `forEach` callbacks.

---

## Repo structure

```
intopia-testing-bookmarklets/
├── README.md              ← full badge reference, one section per bookmarklet
├── LICENSE
├── src/
│   └── [name].js          ← readable source with comment header
└── dist/
    ├── testing-bookmarklets.html
    └── hrefs/
        └── [name].txt     ← ready-to-paste <a> tag
```

The exercise repo (`intopia.github.io/exercise/`) is the published product. It holds the live `testing-bookmarklets-intopia.html` and `bookmarklet-descriptions.md`. This repo is source and build artefacts.

### Workflow for updates

1. Edit `src/[name].js`.
2. Minify and re-encode, update `dist/hrefs/[name].txt`.
3. Update the README badge reference and the `bookmarklet-descriptions.md` entry if badges or behaviour changed.
4. Copy the encoded href into `testing-bookmarklets-intopia.html` in the exercise repo.

### Decision process for new bookmarklets

1. Confirm the aim: which ARIA attribute or HTML feature, and which states and edge cases it needs to flag.
2. Check README for the closest existing bookmarklet in the same category (relationship, state, table) and follow its badge pattern rather than inventing a new one.
3. Produce three outputs: the href version for the public page, the readable JS source for `src/`, and the README badge reference section.
4. Add a numbered plain-language entry to `bookmarklet-descriptions.md`, matching the tone and length of existing entries, including activation instructions if interactive.

Pushing the href into the exercise repo and building a matching test page are separate steps.

---

## Full bookmarklet list

Ordered as in README. Repo filenames confirmed against `dist/hrefs/`.

| # | Name | File | Notes |
|---|------|------|-------|
| 1 | Highlight headings | `highlight-headings` | H1 to H6 in six colours. Flags empty headings and duplicate H1 |
| 2 | Highlight image alternatives | `highlight-image-alternatives` | Three states: alt text, empty alt, missing alt |
| 3 | Highlight lists | `highlight-lists` | Native and ARIA list roles. Badge position differs for containers vs items |
| 4 | Highlight landmarks | `highlight-landmarks` | Eight landmark roles, shows accessible name where present. Nested aside handling matches HTML-AAM |
| 5 | Highlight page language | `highlight-page-language` | BCP 47 validation, 184 ISO 639-1 codes, "did you mean" suggestions. Also highlights inline `lang` attributes |
| 6 | Highlight document title | `highlight-document-title` | Document-level fixed banner, no overlay or outline. Green for title text, red for empty and for missing, amber warning for more than one `<title>` |
| 7 | Highlight page encoding | `highlight-page-encoding` | Document-level fixed banner. Detects `<meta charset>` and `http-equiv`. Amber for non-UTF-8, conflicting declarations, charset outside `<head>`. Red for empty and missing |
| 8 | Highlight captions and headers | `highlight-captions-and-headers` | Keys 1 to 3 on by default, key 4 (scope) opt-in, `n` cycles |
| 9 | Highlight table IDs and headers | `highlight-table-id-and-headers` | Interactive. Makes cells focusable, Tab or `n` to navigate, referenced headers highlighted green |
| 10 | Highlight ARIA table roles | `highlight-aria-table-roles` | Six groups, all on by default, keys 1 to 6 plus `n` cycling. Shows `aria-sort` value, re-run after sorting |
| 11 | Track focus order | `track-focus-order` | Active listener, Tab to navigate, Shift+Tab decrements, Esc to stop |
| 12 | Highlight tabindex | `highlight-tabindex` | Green 0, amber -1, red positive or invalid |
| 13 | Highlight aria-label | `highlight-aria-label` | Flags empty values and use on name-prohibited roles |
| 14 | Highlight aria-labelledby | `highlight-aria-labelledby` | Source badge shows resolved name with arrow, referenced elements blue. Missing IDs inline. Hidden elements resolve per AccName |
| 15 | Highlight aria-describedby | `highlight-aria-describedby` | Same pattern as labelledby, for descriptions. NO DESCRIPTION error state |
| 16 | Highlight name mismatches | `highlight-name-mismatches` | MATCH / MODIFIED / MISMATCH states |
| 17 | Highlight name-prohibited roles | `highlight-name-prohibited-roles` | ARIA 1.2 and 1.3 draft roles. NAME PROHIBITED: [role] |
| 18 | Highlight form field names | `highlight-form-field-names` | Six name sources, amber for unreliable (placeholder, title) |
| 19 | Highlight buttons | `highlight-buttons` | Targets `<button>`, `input[type="submit"]`, `input[type="reset"]` only |
| 20 | Highlight fieldsets | `highlight-fieldsets` | Fieldset, legend, radiogroup. Flags fieldset missing a legend |
| 21 | Highlight required fields | `highlight-required-fields` | Native `required`, `aria-required`, redundant combinations |
| 22 | Highlight readonly fields | `highlight-readonly-fields` | Teaching bookmarklet. Green native `readonly`, blue `aria-readonly="true"` as deliberately informational not pass/fail, amber redundant, red conflicting and invalid |
| 23 | Highlight aria-invalid | `highlight-aria-invalid` | All four recognised values green, only unrecognised values red |
| 24 | Highlight autocomplete | `highlight-autocomplete` | Valid / generic / invalid states |
| 25 | Highlight aria-expanded | `highlight-aria-expanded` | true / false / invalid. Re-run after interaction |
| 26 | Highlight aria-checked | `highlight-aria-checked` | true / false / mixed / invalid. Re-run after interaction |
| 27 | Highlight aria-pressed | `highlight-aria-pressed` | true / false / mixed / invalid. Re-run after interaction |
| 28 | Highlight aria-roledescription | `highlight-aria-roledescription` | Checks for underlying role, explicit or meaningful implicit. Flags misuse on generic elements |
| 29 | Highlight aria-details | `highlight-aria-details` | Relationship bookmarklet. Missing IDs annotated inline |
| 30 | Highlight aria-valuetext | `highlight-aria-valuetext` | Green for value, amber for empty |
| 31 | Highlight aria-valuenow | `highlight-aria-valuenow` | Green for numeric value, amber for empty, red for non-numeric |
| 32 | Highlight aria-valuemin and aria-valuemax | `highlight-aria-valuemin-max` | Combined badge. Flags incomplete pairs and non-numeric values |
| 33 | Highlight aria-setsize and aria-posinset | `highlight-aria-setsize-posinset` | Shows "N of M" plus raw values. `setsize="-1"` (unknown total) is amber. Shows level first where `aria-level` is also present |
| 34 | Highlight aria-level | `highlight-aria-level` | Green 1 to 6, amber above 6 and empty, red zero / negative / non-integer |
| 35 | Highlight aria-controls | `highlight-aria-controls` | Relationship bookmarklet. Hidden referenced elements valid. Dynamic insertion flagged missing until element exists, re-run after triggering |
| 36 | Highlight aria-haspopup | `highlight-aria-haspopup` | All seven recognised values green. Red for invalid and empty |
| 37 | Highlight shadow DOM | `highlight-shadow-dom` | Green for open shadow DOM hosts, amber for custom elements. Fixed banner at bottom shows counts |

---

## Removed bookmarklets

**Render markdown.** Removed from the set. Originally a convenience tool to render raw `.md` files in Chrome, replaced by the Markdown Viewer browser extension, which handles the edge cases reliably. The bookmarklet had a fragile hand-rolled parser that failed on inline HTML such as `<title>` in text.

The `.js` and `.txt` source files were removed from the repo when the bookmarklet was retired. The `dist/hrefs/` list confirms `render-markdown.txt` is not present.

---

## Notable technical decisions and edge cases

**aria-labelledby and aria-describedby, hidden elements.** Both resolve text from hidden elements (`display: none`, `aria-hidden`) by design, per the AccName spec. The bookmarklets exclude the badge and outline on hidden referenced elements, to avoid floating badges at 0,0, but still include their text in the resolved name.

**aria-controls and dynamic insertion.** If a controlled element is inserted into the DOM on first activation, the bookmarklet flags it as a missing ID on first run. This is correct behaviour, since it reflects what AT sees at that moment. Re-running after the element exists confirms the reference resolves. Do not "fix" this.

**aria-roledescription implicit roles.** Elements with meaningful implicit roles (`<fieldset>`, `<button>`, `<nav>`, `<h1>` to `<h6>`) are not flagged as missing a role, even without an explicit `role`. Only truly generic elements like `<div>` and `<span>` trigger the misuse warning.

**Document-level banners.** Page language, document title and page encoding all append directly to `document.body` rather than the overlay div, to avoid `position: fixed` being affected by CSS transforms on ancestors.

**Document title, multiple titles.** More than one `<title>` element is amber, not red. The page is still usable and the first title wins, so this is a caution rather than a failure.

**readonly is a teaching bookmarklet.** The blue `aria-readonly="true"` badge is deliberately informational rather than a pass or fail verdict. `aria-readonly="true"` alone changes the AT announcement but does not prevent typing unless the field is functionally restricted some other way.

**Table bookmarklet default state.** Captions and headers: keys 1 to 3 on by default, key 4 (scope) opt-in. ARIA table roles: all six on by default.

---

## Bookmarklet to test page mapping

Extracted directly from `testing-bookmarklets-intopia.html`. Verified September 2026.

| Bookmarklet | Test page(s) |
|-------------|-------------|
| Highlight headings | `testing-headings.html` |
| Highlight image alternatives | `testing-images.html` |
| Highlight lists | `reviewing-lists.html` |
| Highlight landmarks | `reviewing-landmarks.html` |
| Highlight page language | `testing-lang-good.html`, `testing-lang-invalid.html`, `testing-lang-missing.html` |
| Highlight document title | `testing-title-correct.html`, `testing-title-missing.html`, `testing-title-empty.html`, `testing-title-multiple.html` |
| Highlight page encoding | `testing-charset-correct.html`, `testing-charset-missing.html`, `testing-charset-non-utf8.html`, `testing-charset-empty.html`, `testing-charset-conflicting.html` |
| Highlight captions and headers | `testing-tables.html` |
| Highlight table IDs and headers | `testing-tables-complex.html` |
| Highlight ARIA table roles | `testing-tables-aria.html` |
| Track focus order | `testing-focus-order.html` |
| Highlight tabindex | `reviewing-tabindex.html` |
| Highlight aria-label | `testing-aria-label.html` |
| Highlight aria-labelledby | `reviewing-aria-labelledby.html` |
| Highlight aria-describedby | `testing-aria-describedby.html` |
| Highlight name mismatches | `testing-name-mismatches.html` |
| Highlight name-prohibited roles | `testing-name-prohibited-roles.html` |
| Highlight form field names | `testing-form-labels.html` |
| Highlight buttons | `testing-buttons.html` |
| Highlight fieldsets | `testing-fieldsets.html` |
| Highlight required fields | `testing-required-fields.html` |
| Highlight aria-invalid | `testing-aria-invalid.html` |
| Highlight autocomplete | `testing-autocomplete.html` |
| Highlight aria-expanded | `testing-aria-expanded.html` |
| Highlight aria-checked | `testing-aria-checked.html` |
| Highlight aria-roledescription | `testing-aria-roledescription.html` |
| Highlight aria-details | `testing-aria-details.html` |
| Highlight aria-valuenow | `testing-aria-valuenow.html` |
| Highlight aria-valuetext | `testing-aria-valuetext.html` |
| Highlight aria-valuemin and aria-valuemax | `testing-aria-valuetext.html` (shares with aria-valuetext — may need dedicated page) |
| Highlight aria-pressed | `testing-aria-pressed.html` |
| Highlight aria-level | `testing-aria-level.html` |
| Highlight aria-setsize and aria-posinset | `testing-aria-setsize-posinset.html` |
| Highlight aria-haspopup | `testing-aria-setsize-posinset.html` (shares with setsize/posinset — may need dedicated page) |
| Highlight aria-controls | `testing-aria-controls.html` |
| Highlight readonly fields | `testing-aria-readonly.html` |
| Highlight shadow DOM | `testing-shadow-dom.html` |

### Notes

- `aria-valuemin` and `aria-valuemax` currently share `testing-aria-valuetext.html` with `aria-valuetext`. A dedicated test page may be worth adding.
- `aria-haspopup` currently shares `testing-aria-setsize-posinset.html`. A dedicated test page may be worth adding.
- `aria-labelledby` uses a "reviewing" page (`reviewing-aria-labelledby.html`) rather than a "testing" page, consistent with landmarks and tabindex which also use the `reviewing-` prefix.

---

## Related resources

**Test pages.** Approximately 125 pages covering every badge state each bookmarklet can produce: https://intopia.github.io/exercise/testing.html

**Explainer pages.** Videos and transcripts covering page structure, tables, focus and navigation, names and descriptions, forms, and states:

- https://intopia.github.io/exercise/bookmarklets-01-page-structure.html
- https://intopia.github.io/exercise/bookmarklets-02-tables.html
- https://intopia.github.io/exercise/bookmarklets-03-focus-navigation.html
- https://intopia.github.io/exercise/bookmarklets-04-names-descriptions.html
- https://intopia.github.io/exercise/bookmarklets-05-forms.html
- https://intopia.github.io/exercise/bookmarklets-06-states.html

**ARIA attribute articles** on maxdesign.com.au:

- [Understanding readonly and aria-readonly](https://www.maxdesign.com.au/articles/aria-readonly-readonly-explained.htm)
- [Understanding aria-controls](https://www.maxdesign.com.au/articles/aria-controls-explained.html)
- [Understanding aria-haspopup](https://www.maxdesign.com.au/articles/aria-haspopup-explained.html)
- [Understanding aria-current](https://www.maxdesign.com.au/articles/aria-current-explained.html)
- [Understanding aria-posinset and aria-setsize](https://www.maxdesign.com.au/articles/aria-posinset-aria-setsize-explained.html)
- [Understanding aria-level](https://www.maxdesign.com.au/articles/aria-level-explained.html)
- [Understanding aria-pressed](https://www.maxdesign.com.au/articles/aria-pressed-explained.html)
- [Understanding aria-valuemin and aria-valuemax](https://www.maxdesign.com.au/articles/aria-valuemin-valuemax-explained.html)
- [Understanding aria-valuetext](https://www.maxdesign.com.au/articles/aria-valuetext-explained.html)
- [Understanding aria-valuenow](https://www.maxdesign.com.au/articles/aria-valuenow-explained.html)
- [Understanding aria-details](https://www.maxdesign.com.au/articles/aria-details-explained.html)
- [Understanding aria-roledescription](https://www.maxdesign.com.au/articles/aria-roledescription-explained.html)
- [Understanding aria-activedescendant](https://www.maxdesign.com.au/articles/aria-activedescendant-explained.html)

All 13 articles are published and complete.

---

## Exact build commands

The exact terser invocation used throughout:

```
Node
node -e "
const terser = require('/tmp/node_modules/terser');
const fs = require('fs');
const code = fs.readFileSync('/tmp/bm/[name].js', 'utf8');
terser.minify(code, {
  mangle: { reserved: ['functionName', 'onKey'] }
}).then(result => {
  if (result.error) { console.error(JSON.stringify(result.error)); process.exit(1); }
  const encoded = encodeURIComponent(result.code);
  fs.writeFileSync('/tmp/[name]-href.txt',
    '<a class=\"bookmarklet\" href=\"javascript:' + encoded + '\">[Label]</a>');
  console.log('Done. Length:', encoded.length);
});
"
```

The encoding step is JavaScript's `encodeURIComponent()` — no custom encoding, no selective escaping. The minified JS goes straight into `encodeURIComponent` and the result is placed directly in the href attribute after `javascript:`.

The `dist/hrefs/[name].txt` file contains the complete ready-to-paste `<a>` tag — not just the encoded JS, not just the href, but the full element including class and label text.

Key dependencies: terser installed at `/tmp/node_modules/terser` in the build environment. In a fresh environment you would run `npm install terser --prefix /tmp` first.

The `mangle: { reserved: [...] }` list varies per bookmarklet — any named function that could collide under minification goes here. onKey is always reserved. Other common ones: `makeBadge`, `makeBanner`, `isNumeric`, `getName`.


---

## Rejected alternatives — relationship badge system

- **Source element** (the element with `aria-labelledby` or `aria-describedby`) — green outline, green badge showing the resolved name: `aria-labelledby: cheetah zebra → "Buy Lawn Mower On special"`
- **Referenced elements** — blue outline, blue badge at their own position: `ID: cheetah`, `ID: zebra`

What was tried first:

### Version 1: Source-only stacking

The first version put all badges on the source element, stacked vertically:

- `aria-labelledby: cheetah zebra` (blue badge, at top of source)
- `ID: cheetah` (green badge, stacked below)
- `ID: zebra` (green badge, stacked below)

Referenced elements got a green outline but no badge of their own. The problem: the stack of badges obscured the source element on complex pages, and the ID badges floating below the source gave no visual indication of which element on the page each ID referred to.

### Version 2: Source blue, referenced green

The second version moved ID badges onto the referenced elements themselves (better), but had the colours reversed from the final design:

- Source element: blue outline and badge `aria-labelledby: cheetah zebra`
- Referenced elements: green outline and badge `ID: cheetah`, `ID: zebra`

This was dropped because the colour logic was backwards. Green means "valid, correctly implemented" in the design system — but the referenced elements aren't the ones being named, they're the sources. The element that has been correctly named is the source element. Putting green on the referenced elements implied they were the "result" when they're actually the "input".

### Version 3: No resolved name shown

Throughout versions 1 and 2, the badge showed only the mechanism — which IDs were referenced — not the computed accessible name itself. A colleague using the bookmarklet pointed out that what they actually wanted to see was the concatenated name that AT would announce, not just the raw ID values. An experienced developer could infer "cheetah + zebra = Buy Lawn Mower On special" but a tester or learner could not.

### Why the final design was settled on

Three decisions came together:

1. **Source = green** because the source element is the one receiving the name. Green means "this element has been correctly named."
2. **Referenced = blue** because the referenced elements are informational signposts. Blue means "secondary reference."
3. **Resolved name in the source badge** because that is the actual output AT users hear. The IDs are the mechanism; the resolved text is the result. Both appear in the source badge: `aria-labelledby: cheetah zebra → "Buy Lawn Mower On special"`.

The same green/blue logic was then applied consistently to `aria-describedby`, `aria-details` and `aria-controls`.

### Note on confidence

This is from memory of the conversation in which these decisions were made. The final design is correct and verified in the current bookmarklet code. The intermediate versions are described from memory and may not be in exactly the order stated above.
