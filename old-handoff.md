# Intopia testing bookmarklets — handoff document

## Project overview

A growing set of accessibility testing bookmarklets that highlight specific HTML and ARIA features directly on a page. Each bookmarklet uses a consistent colour system and badge format, allowing testers and developers to quickly inspect accessibility markup without needing browser DevTools.

These bookmarklets are designed to help designers, developers and testers understand aspects of accessibility.

---

## Key links

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/Intopia/intopia-testing-bookmarklets |
| README (main documentation) | https://github.com/Intopia/intopia-testing-bookmarklets/blob/main/README.md |
| How it works | https://github.com/Intopia/intopia-testing-bookmarklets/blob/main/how-it-works.md |
| Public bookmarklets page | https://intopia.github.io/exercise/testing-bookmarklets-intopia.html |

---

## Design system

### Colour palette

| Colour | Hex | Meaning |
|--------|-----|---------|
| Dark green | `#1b5e20` | Valid, present, correctly implemented |
| Dark blue | `#0a558c` | Informational, secondary reference |
| Amber | `#e65100` | Caution, unreliable, unconfirmed |
| Red | `#b00020` | Missing, broken, prohibited, invalid |
| Deep purple | `#4a148c` | Landmarks, ARIA tables |
| Teal | `#006064` | Landmarks, ARIA tables |
| Deep pink | `#880e4f` | Landmarks |
| Blue-grey | `#37474f` | Landmarks, ARIA tables |
| Dark | `#111111` | Focus order tracker |

### Badge text conventions

- **Informational** — sentence case, source first: `aria-label: Close`
- **Diagnostic verdict** — all caps, verdict first: `NO ACCESSIBLE NAME`, `MISMATCH: Hello`

### Key architectural decisions

- All bookmarklets use an overlay div, not direct DOM badge injection
- All have Esc to clear; re-running removes the previous overlay
- Table bookmarklets use keyboard number filters with a fixed legend panel
- Number keys isolate a single group; pressing the same key again restores the default view
- `n` key cycles through groups in sequence on table bookmarklets
- Page language document banner appended directly to body (not overlay) to avoid fixed positioning issues
- `aria-labelledby` and `aria-describedby` resolve names from hidden elements by design (per AccName spec)

### Minification

All bookmarklets are minified with terser via Node.

Key gotcha: terser can rename variables to the same single letter, causing temporal dead zone errors. Always use `mangle: { reserved: ['functionName'] }` for key functions and prefer `var` over `const`/`let` inside forEach callbacks.

---

## Decision process for new bookmarklets

1. Discuss the aim — what ARIA attribute or HTML feature are we surfacing?
2. Discuss how it will behave when fired on a page — badge states, colours, edge cases
3. Claude builds three outputs:
   - **href version** — full `<a class="bookmarklet" href="javascript:...">` tag for the public bookmarklets page
   - **JS source file** — readable source with comment header, for the repo `src/` folder
   - **README update** — new entry in the bookmarklet list and badge reference section
4. A short plain-language description is written for the public bookmarklets page

---

## Repo file structure

```
intopia-testing-bookmarklets/
├── README.md
├── LICENSE
├── src/
│   └── [.js files — readable source with comment headers]
└── dist/
    ├── testing-bookmarklets.html
    └── hrefs/
        └── [.txt files — ready-to-paste <a> tags]
```

### Workflow for updates

When a bookmarklet changes:
1. Edit `src/[name].js` in the bookmarklets repo
2. Minify and re-encode → update `dist/hrefs/[name].txt`
3. Copy the encoded href → paste into `testing-bookmarklets.html` in the exercise repo

The exercise repo (`https://intopia.github.io/exercise/`) is the published product. The bookmarklets repo is source and build artefacts.

---

## Full bookmarklet list

| File | Notes |
|------|-------|
| `highlight-headings` | H1–H6 six colours, flags empty and duplicate H1 |
| `highlight-image-alternatives` | Three states: alt text, empty alt, missing alt |
| `highlight-lists` | Native and ARIA list roles, badge position differs for containers vs items |
| `highlight-landmarks` | Eight landmark roles, shows accessible name where present. Nested aside handling matches HTML-AAM |
| `highlight-page-language` | BCP 47 validation, 184 ISO 639-1 codes, "did you mean" suggestions for full-word mistakes |
| `highlight-captions-and-headers` | Keys 1–3 on by default, key 4 (scope) opt-in. `n` key cycles |
| `highlight-table-id-and-headers` | Interactive — makes cells focusable, Tab/n to navigate, referenced headers highlighted green |
| `highlight-aria-table-roles` | Six groups, all on by default, keys 1–6 plus `n` key cycling. Shows aria-sort value |
| `track-focus-order` | Active listener, Tab/n to navigate, Shift+Tab decrements, Esc to stop |
| `highlight-tabindex` | Green=0, amber=-1, red=positive or invalid |
| `highlight-aria-label` | Flags empty values and use on name-prohibited roles |
| `highlight-aria-labelledby` | Source badge shows resolved name with arrow. Referenced elements get blue badges. Missing IDs annotated inline. Hidden elements resolve correctly per AccName spec |
| `highlight-aria-describedby` | Same pattern as labelledby but for descriptions. NO DESCRIPTION error states |
| `highlight-name-mismatches` | MATCH / MODIFIED / MISMATCH states |
| `highlight-name-prohibited-roles` | ARIA 1.2 and 1.3 draft roles. NAME PROHIBITED: [role] |
| `highlight-form-field-names` | Six name sources, amber for unreliable (placeholder, title) |
| `highlight-buttons` | Targets `<button>`, `input[type="submit"]`, `input[type="reset"]` only |
| `highlight-fieldsets` | Fieldset, legend, radiogroup |
| `highlight-required-fields` | Native required, aria-required, redundant combinations |
| `highlight-aria-invalid` | All four valid values green, only unrecognised values red |
| `highlight-autocomplete` | Valid / generic / invalid states |
| `highlight-aria-expanded` | true / false / invalid. Re-run after interaction |
| `highlight-aria-checked` | true / false / mixed / invalid. Re-run after interaction |
| `highlight-aria-pressed` | true / false / mixed / invalid. Re-run after interaction |
| `highlight-aria-roledescription` | Checks for underlying role (explicit or meaningful implicit). Flags misuse on generic elements |
| `highlight-aria-details` | Relationship bookmarklet. Missing IDs annotated inline |
| `highlight-aria-valuetext` | Simple value display. Flags empty |
| `highlight-aria-valuemin-max` | Combined badge. Flags incomplete pairs and non-numeric values |
| `highlight-aria-setsize-posinset` | Shows "N of M" shorthand plus raw values. setsize=-1 (unknown total) treated as amber. Shows level where aria-level also present |
| `highlight-aria-level` | Green 1–6, amber above 6 (inconsistent support), red zero/negative/non-integer |
| `highlight-aria-controls` | Relationship bookmarklet. Hidden referenced elements valid (e.g. collapsed panels). Dynamic insertion flagged as missing until element exists in DOM — re-run after triggering |
| `highlight-aria-haspopup` | All seven recognised values green. Red for invalid/empty |
| `highlight-shadow-dom` | Open shadow DOM hosts and custom elements. Fixed banner shows element counts |

---

## Removed bookmarklets

**Render markdown** — removed from the set. Originally built as a convenience tool to render raw `.md` files in Chrome. Replaced by a proper browser extension (Markdown Viewer) which handles all edge cases reliably. The bookmarklet had a fragile hand-rolled parser that failed on inline HTML such as `<title>` in text. The `.js` and `.txt` files remain in the repo for reference but the bookmarklet is no longer listed on the public page.

---

## Notable technical decisions and edge cases

**aria-labelledby / aria-describedby hidden elements**
Both attributes resolve text from hidden elements (`display: none`, `aria-hidden`) by design per the AccName spec. The bookmarklets correctly exclude the badge/outline on hidden referenced elements (to avoid floating badges at 0,0) but still include their text in the resolved name.

**aria-controls and dynamic insertion**
If a controlled element is inserted into the DOM dynamically on first activation, the bookmarklet will flag it as a missing ID on first run. Re-running after the element exists confirms the reference resolves correctly. This is not a bookmarklet limitation — it accurately reflects what AT sees at that moment.

**aria-roledescription implicit roles**
Elements with meaningful implicit roles (`<fieldset>`, `<button>`, `<nav>`, `<h1>`–`<h6>` etc.) are not flagged as missing a role, even without an explicit `role` attribute. Only truly generic elements like `<div>` and `<span>` trigger the misuse warning.

**Page language banner**
Appended directly to `document.body` rather than the overlay div, to avoid `position: fixed` being affected by CSS transforms on ancestor elements.

**Table bookmarklet default state**
Captions and headers: keys 1–3 on by default, key 4 (scope) opt-in. ARIA table roles: all six keys on by default. Pressing a key isolates that group; pressing the same key again restores the default view.

---

## Related resources

**Test pages**
Approximately 125 test pages covering every badge state each bookmarklet can produce:
- https://intopia.github.io/exercise/testing.html

**Explainer pages**
A set of pages with videos and transcripts covering page structure, tables, focus and navigation, names and descriptions, forms, and states:
- https://intopia.github.io/exercise/bookmarklets-01-page-structure.html
- https://intopia.github.io/exercise/bookmarklets-02-tables.html
- https://intopia.github.io/exercise/bookmarklets-03-focus-navigation.html
- https://intopia.github.io/exercise/bookmarklets-04-names-descriptions.html
- https://intopia.github.io/exercise/bookmarklets-05-forms.html
- https://intopia.github.io/exercise/bookmarklets-06-states.html

**ARIA attribute articles**
A set of in-depth ARIA articles published on maxdesign.com.au:
- https://www.maxdesign.com.au/articles/aria-activedescendant-explained.html
- https://www.maxdesign.com.au/articles/aria-roledescription-explained.html
- https://www.maxdesign.com.au/articles/aria-details-explained.html
- https://www.maxdesign.com.au/articles/aria-valuenow-explained.html
- https://www.maxdesign.com.au/articles/aria-valuetext-explained.html
- https://www.maxdesign.com.au/articles/aria-valuemin-valuemax-explained.html
- https://www.maxdesign.com.au/articles/aria-pressed-explained.html
- https://www.maxdesign.com.au/articles/aria-level-explained.html
- https://www.maxdesign.com.au/articles/aria-posinset-aria-setsize-explained.html
- https://www.maxdesign.com.au/articles/aria-current-explained.html
- https://www.maxdesign.com.au/articles/aria-haspopup-explained.html
