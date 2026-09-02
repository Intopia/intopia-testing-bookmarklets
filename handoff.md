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

Note: the previous handoff said the `.js` and `.txt` files remain in the repo for reference, but `render-markdown.txt` is not in the current `dist/hrefs/` list. Worth confirming whether it was deleted or the note is stale.

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

---

## Gaps for the old conversation to fill

These are the things no current file holds. Ask about them one at a time, with the relevant file in view, and check each answer against the repo before accepting it.

1. **Test page mapping.** Which test page belongs to which bookmarklet. Only the index is recorded here.
2. **Exact build commands.** The terser invocation, the encoding step, and how `dist/hrefs/[name].txt` is produced. Currently described but not written down.
3. **Rejected alternatives.** Particularly the relationship badge system. Green source, blue referenced was settled on after something else. What, and why it was dropped.
4. **In-flight work.** What was half-finished when the thread got long. The aria-readonly article was being outlined.
5. **Document title correction.** What the badge error was and what fixed it, in case the rule behind it is not fully captured by the README table.
6. **Render markdown files.** Whether they still exist in the repo.
7. **Article to bookmarklet mapping.** Which published articles pair with which bookmarklet and test page.

---

## Housekeeping found during this review

- README pointed at `testing-bookmarklets.html`. The live page is `testing-bookmarklets-intopia.html`. Fixed here, still needs fixing in README.
- SKILL.md referred to 34 existing bookmarklets. Now 37. Fixed in the clean SKILL.md.
- README is missing the `---` separator after the aria-invalid section and after the aria-valuenow section. Every other section has one.
