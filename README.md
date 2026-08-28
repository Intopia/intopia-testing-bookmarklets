# Intopia testing bookmarklets

## About this project

A set of 35 accessibility testing bookmarklets. Each one highlights a specific HTML or ARIA feature directly on the page, helping teams quickly inspect, test and understand accessibility markup without needing browser DevTools.

Bookmarklets page: https://intopia.github.io/exercise/testing-bookmarklets.html

## The current bookmarklets

1. Highlight headings
2. Highlight image alternatives
3. Highlight lists
4. Highlight landmarks
5. Highlight page language
6. Highlight captions and headers
7. Highlight table IDs and headers
8. Highlight ARIA table roles
9. Track focus order
10. Highlight tabindex
11. Highlight aria-label
12. Highlight aria-labelledby
13. Highlight aria-describedby
14. Highlight name mismatches
15. Highlight name-prohibited roles
16. Highlight form field names
17. Highlight buttons
18. Highlight fieldsets
19. Highlight required fields
20. Highlight readonly fields
21. Highlight aria-invalid
22. Highlight autocomplete
23. Highlight aria-expanded
24. Highlight aria-checked
25. Highlight aria-pressed
26. Highlight aria-roledescription
27. Highlight aria-details
28. Highlight aria-valuetext
29. Highlight aria-valuenow
30. Highlight aria-valuemin and aria-valuemax
31. Highlight aria-setsize and aria-posinset
32. Highlight aria-level
33. Highlight aria-controls
34. Highlight aria-haspopup
35. Highlight shadow DOM

## Design system

A consistent badge system is used across the set:

- Colour palette: dark green (valid), dark blue (informational), amber (caution), red (broken/missing)
- Informational badges — sentence case, source first: `aria-label: Close`
- Diagnostic verdict badges — all caps, verdict first: `NO ACCESSIBLE NAME`, `MISMATCH: Hello`

## Key architectural decisions

- All bookmarklets use an overlay div, not direct DOM badge injection
- All have Esc to clear, re-running removes previous overlay
- Dense bookmarklets (tables, ARIA tables) use keyboard number filters with a fixed legend panel — "progressive enhancement" approach, all on by default
- Number keys isolate a single group; pressing the same key again restores the default view
- `n` key cycles through groups in sequence on table bookmarklets
- Lists use position-by-type: containers badge above, items badge inside at bottom
- Badge wrapping: image alt bookmarklet uses max-width: 400px and white-space: normal for long alt text
- Page language document banner appended directly to body (not overlay) to avoid fixed positioning issues

## Tooling

All minification done with terser via Node. Encoded bookmarklets output as complete `<a>` tags ready to paste.

Key minification gotcha: terser can rename variables to the same single letter causing temporal dead zone errors. Use `mangle: { reserved: ['functionName'] }` for key functions and prefer `var` over `const`/`let` inside forEach callbacks to avoid conflicts.

---

# Bookmarklet badge reference

Colour palette used across the set:
- Dark green `#1b5e20` — valid, present, correctly implemented
- Dark blue `#0a558c` — informational, secondary reference, generic
- Amber `#e65100` — caution, unreliable, unconfirmed, redundant
- Red `#b00020` — missing, broken, prohibited, invalid
- Deep purple `#4a148c` — used in specific bookmarklets (landmarks, ARIA tables)
- Teal `#006064` — used in specific bookmarklets (landmarks, ARIA tables)
- Deep pink `#880e4f` — used in landmarks
- Blue-grey `#37474f` — used in specific bookmarklets (landmarks, ARIA tables)
- Dark `#111111` — used in focus order tracker

Badge text system:
- **Informational** — sentence case, source/element first: `aria-label: Close`
- **Diagnostic verdict** — all caps, verdict first: `NO ACCESSIBLE NAME`, `MISMATCH: Hello`

---

## Highlight headings

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark blue | `#0a558c` | H1: [text] |
| Dark green | `#1b5e20` | H2: [text] |
| Amber | `#e65100` | H3: [text] |
| Teal | `#006064` | H4: [text] |
| Deep purple | `#4a148c` | H5: [text] |
| Blue-grey | `#37474f` | H6: [text] |
| Red | `#b00020` | H1: [text] (avoid more than one H1) |
| Red | `#b00020` | H[N]: (empty heading) |

---

## Highlight image alternatives

Badge allows wrapping (max-width: 400px) for long alt text values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Alt: [text] |
| Dark blue | `#0a558c` | Empty alt |
| Red | `#b00020` | Missing alt |

---

## Highlight lists

Containers (ul, ol, dl, role="list") — badge above element.
Items (li, dt, dd, role="listitem") — badge inside at bottom of element.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | `<ul>` |
| Dark green | `#1b5e20` | `<ol>` |
| Dark green | `#1b5e20` | `<li>` |
| Dark blue | `#0a558c` | `<dl>` |
| Dark blue | `#0a558c` | `<dt>` |
| Dark blue | `#0a558c` | `<dd>` |
| Amber | `#e65100` | role="list" |
| Amber | `#e65100` | role="listitem" |

---

## Highlight landmarks

Nested `<aside>` without accessible name is not flagged (matches HTML-AAM mapping). Nested `<aside>` with accessible name is flagged as complementary.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark blue | `#0a558c` | Banner [: name] |
| Amber | `#e65100` | Navigation [: name] |
| Dark green | `#1b5e20` | Main [: name] |
| Teal | `#006064` | Complementary [: name] |
| Deep purple | `#4a148c` | Contentinfo [: name] |
| Deep pink | `#880e4f` | Search [: name] |
| Blue-grey | `#37474f` | Region [: name] |
| Red | `#b00020` | Form [: name] |

---

## Highlight page language

Document-level banner appended directly to body (position: fixed). Inline lang attributes use standard positioned badges.

Validates against 184 ISO 639-1 codes, common ISO 639-2/3 three-letter codes, and 65 full-word mistake mappings with "did you mean" suggestions.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Document lang: [value] |
| Amber | `#e65100` | Document lang: (empty) — lang attribute is present but has no value |
| Amber | `#e65100` | Document lang: "[value]" — unrecognised language code |
| Red | `#b00020` | Document lang: "[value]" — did you mean "[suggestion]"? |
| Red | `#b00020` | Document lang: "[value]" — invalid format |
| Red | `#b00020` | NO DOCUMENT LANG — lang attribute missing from `<html>` |
| Amber | `#e65100` | Warning: lang="[value]" and xml:lang="[value]" differ |
| Dark blue | `#0a558c` | lang: [value] (inline, valid) |
| Amber | `#e65100` | lang: (empty) (inline) |
| Amber | `#e65100` | lang: "[value]" — unrecognised (inline) |
| Red | `#b00020` | lang: "[value]" — invalid (inline) |

---

## Highlight captions and headers

Keyboard filter: [1] Table  [2] Caption  [3] TH  [4] Scope  [n] Next  [Esc] Clear

Keys 1–3 on by default. Key 4 (scope) is opt-in — dimmed in legend until pressed.
Pressing a key isolates that group. Pressing the same key again restores the default view.
Press `n` to cycle through groups in sequence.

TH badges (key 3) positioned above element — show cell text only, no scope information.
Scope badges (key 4) positioned below element — show scope value or flag missing scope.

| Colour | Hex | Badge text | Key |
|--------|-----|------------|-----|
| Dark blue | `#0a558c` | Table [N] | 1 |
| Dark green | `#1b5e20` | Caption: [text] | 2 |
| Red | `#b00020` | TH: [text] | 3 |
| Amber | `#e65100` | scope: [value] | 4 |
| Red | `#b00020` | no scope | 4 |

---

## Highlight table IDs and headers

Interactive — makes all `<th>` and `<td>` elements focusable. Floating badge follows focused cell. Referenced header cells highlighted in green.

Click to activate, then Tab or `n` to navigate between cells. Esc restores original tabindex values.

| Colour | Hex | Badge / outline text |
|--------|-----|----------------------|
| Dark blue | `#0a558c` | Focused cell outline + badge: TH/TD: [text] \| id: [value] \| headers: [value] |
| Dark green | `#1b5e20` | Referenced header cell outline |

---

## Highlight ARIA table roles

Keyboard filter: [1] Table/Grid  [2] Rowgroup  [3] Row  [4] Column header  [5] Row header  [6] Cell  [n] Next  [Esc] Clear

All groups on by default. Pressing a key isolates that group. Pressing the same key again restores all.
Press `n` to cycle through the role hierarchy in sequence.

Container roles (table, grid, treegrid, rowgroup) — badge above element.
Row and cell roles — badge inside at bottom of element.

`columnheader` badges also show `aria-sort` value where present. Re-run after sorting to refresh values.

| Colour | Hex | Badge text | Key |
|--------|-----|------------|-----|
| Dark blue | `#0a558c` | role="table" [: name] | 1 |
| Dark blue | `#0a558c` | role="grid" [: name] | 1 |
| Dark blue | `#0a558c` | role="treegrid" [: name] | 1 |
| Teal | `#006064` | role="rowgroup" | 2 |
| Amber | `#e65100` | role="row" | 3 |
| Red | `#b00020` | role="columnheader" [(sort: [value])] | 4 |
| Red | `#b00020` | role="columnheader" (sort: INVALID VALUE) | 4 |
| Deep purple | `#4a148c` | role="rowheader" | 5 |
| Dark green | `#1b5e20` | role="cell" | 6 |
| Dark green | `#1b5e20` | role="gridcell" | 6 |

---

## Track focus order

Active listener — click to start, Tab or `n` to navigate, Esc to stop.
Badge follows current focused element. Visited elements retain dark outline until Esc is pressed.
Shift+Tab decrements the counter.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark | `#111111` | [N]. [tag][#id][role="…"]["name"] |

---

## Highlight tabindex

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | tabindex="0" |
| Amber | `#e65100` | tabindex="-1" |
| Red | `#b00020` | tabindex="[N]" (AVOID positive values) |
| Red | `#b00020` | tabindex="[value]" (INVALID — use -1 or 0) |
| Red | `#b00020` | tabindex="[value]" (INVALID VALUE) |

---

## Highlight aria-label

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-label: [value] |
| Amber | `#e65100` | aria-label: (empty) |
| Red | `#b00020` | aria-label on prohibited role: [role] |

---

## Highlight aria-labelledby

Source element — green outline, green badge showing resolved name.
Referenced elements — blue outline, blue badge at each element.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-labelledby: [ids] → "[resolved name]" |
| Dark green | `#1b5e20` | aria-labelledby: [ids] (self annotation inline) → "[resolved name]" |
| Red | `#b00020` | aria-labelledby: [id] (missing) → NO NAME |
| Red | `#b00020` | aria-labelledby: [ids] → EMPTY TEXT STRING = NO NAME |
| Dark blue | `#0a558c` | ID: [id] (on referenced element) |

---

## Highlight aria-describedby

Source element — green outline, green badge showing resolved description.
Referenced elements — blue outline, blue badge at each element.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-describedby: [ids] → "[resolved description]" |
| Red | `#b00020` | aria-describedby: [id] (missing) → NO DESCRIPTION |
| Red | `#b00020` | aria-describedby: [ids] → EMPTY TEXT STRING = NO DESCRIPTION |
| Dark blue | `#0a558c` | ID: [id] (on referenced element) |

---

## Highlight name mismatches

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | MATCH: [accessible name] |
| Dark blue | `#0a558c` | MODIFIED: [accessible name] |
| Red | `#b00020` | MISMATCH: [accessible name] |

---

## Highlight name-prohibited roles

| Colour | Hex | Badge text |
|--------|-----|------------|
| Red | `#b00020` | NAME PROHIBITED: [role] |

---

## Highlight form field names

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-labelledby: [name] |
| Dark green | `#1b5e20` | aria-label: [name] |
| Dark green | `#1b5e20` | label: [name] |
| Dark green | `#1b5e20` | implicit label: [name] |
| Amber | `#e65100` | title: [name] |
| Amber | `#e65100` | placeholder: [name] |
| Red | `#b00020` | NO ACCESSIBLE NAME |

---

## Highlight buttons

Targets `<button>`, `input[type="submit"]` and `input[type="reset"]`.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-labelledby: [name] |
| Dark green | `#1b5e20` | aria-label: [name] |
| Dark green | `#1b5e20` | text content: [name] |
| Dark green | `#1b5e20` | value: [name] |
| Dark green | `#1b5e20` | title: [name] |
| Dark green | `#1b5e20` | default: Submit / default: Reset |
| Red | `#b00020` | NO ACCESSIBLE NAME |

---

## Highlight fieldsets

Legend badge positioned below legend element to avoid overlap with fieldset badge.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Fieldset |
| Red | `#b00020` | Fieldset (no legend) |
| Dark blue | `#0a558c` | Legend: [text] |
| Amber | `#e65100` | role="radiogroup" [: name] |

---

## Highlight required fields

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | required |
| Dark blue | `#0a558c` | aria-required="true" |
| Amber | `#e65100` | required + aria-required="true" (redundant) |
| Dark green | `#1b5e20` | aria-required="false" |

---

## Highlight readonly fields

Native `readonly` (`<input>`, `<textarea>`) is browser-enforced and implicitly sets `aria-readonly="true"` in the accessibility tree — no ARIA needed. `aria-readonly="true"` alone only affects the AT announcement; it does not stop the user typing unless the field is also restricted some other way. Teaching bookmarklet — the blue badge is deliberately informational rather than pass/fail.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | readonly |
| Dark blue | `#0a558c` | aria-readonly="true" |
| Amber | `#e65100` | aria-readonly="false" (redundant — default value) |
| Amber | `#e65100` | readonly + aria-readonly="true" (redundant) |
| Red | `#b00020` | readonly + aria-readonly="false" (CONFLICTING — native readonly wins) |
| Red | `#b00020` | INVALID VALUE: aria-readonly="[value]" |

---

## Highlight aria-invalid

All recognised values are green. Only unrecognised values get red.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-invalid: true |
| Dark green | `#1b5e20` | aria-invalid: false |
| Dark green | `#1b5e20` | aria-invalid: grammar |
| Dark green | `#1b5e20` | aria-invalid: spelling |
| Red | `#b00020` | INVALID VALUE: aria-invalid="[value]" |

---

## Highlight autocomplete

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | autocomplete: [value] (valid) |
| Dark blue | `#0a558c` | autocomplete: [value] (generic) |
| Red | `#b00020` | autocomplete: [value] (invalid) |

---

## Highlight aria-expanded

Re-run after activating a widget to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-expanded="true" |
| Amber | `#e65100` | aria-expanded="false" |
| Red | `#b00020` | aria-expanded="[value]" (INVALID VALUE) |

---

## Highlight aria-checked

Re-run after interacting with a widget to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-checked="true" |
| Amber | `#e65100` | aria-checked="false" |
| Dark blue | `#0a558c` | aria-checked="mixed" |
| Red | `#b00020` | aria-checked="[value]" (INVALID VALUE) |

---

## Highlight aria-pressed

Intended for toggle buttons — `<button>` or elements with `role="button"`. Re-run after interacting to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-pressed="true" |
| Amber | `#e65100` | aria-pressed="false" |
| Dark blue | `#0a558c` | aria-pressed="mixed" |
| Red | `#b00020` | aria-pressed="[value]" (INVALID VALUE) |

---

## Highlight aria-roledescription

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-roledescription: "[value]" |
| Amber | `#e65100` | aria-roledescription: "[value]" (no role — possible misuse) |
| Amber | `#e65100` | aria-roledescription: (empty) |

Note: elements with meaningful implicit roles (fieldset, button, nav, h1–h6 etc.) are treated as having a role even without an explicit `role` attribute.

---

## Highlight aria-details

Source element — green outline and badge. Referenced elements — blue outline and badge.
Missing IDs annotated inline in the source badge.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-details: [ids] |
| Amber | `#e65100` | aria-details: [id] [id] (missing) |
| Red | `#b00020` | aria-details: [id] (missing) (all missing) |
| Dark blue | `#0a558c` | ID: [id] (on referenced element) |

---

## Highlight aria-valuetext

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-valuetext: "[value]" |
| Amber | `#e65100` | aria-valuetext: (empty) |

---

## Highlight aria-valuenow

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-valuenow: [N] |
| Amber | `#e65100` | aria-valuenow: (empty) |
| Red | `#b00020` | aria-valuenow: "[value]" (invalid — must be a number) |

## Highlight aria-valuemin and aria-valuemax

Shows both attributes together on each element.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-valuemin: [N]  \|  aria-valuemax: [N] |
| Amber | `#e65100` | aria-valuemin: [N]  \|  aria-valuemax: (missing) |
| Amber | `#e65100` | aria-valuemin: (missing)  \|  aria-valuemax: [N] |
| Red | `#b00020` | aria-valuemin: "[value]" (invalid)  \|  aria-valuemax: [N] |

---

## Highlight aria-setsize and aria-posinset

Shows both attributes together on each element. Where `aria-level` is also present, it is shown first.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | [N] of [M]  (posinset: [N]  \|  setsize: [M]) |
| Dark green | `#1b5e20` | level: [N]  \|  [N] of [M]  (posinset: [N]  \|  setsize: [M]) |
| Amber | `#e65100` | posinset: [N]  \|  setsize: -1 (unknown total) |
| Amber | `#e65100` | posinset: [N]  \|  setsize: (missing) |
| Amber | `#e65100` | posinset: (missing)  \|  setsize: [N] |
| Red | `#b00020` | posinset: "[value]" (invalid)  \|  setsize: [N] |

---

## Highlight aria-level

Values of 1–6 are green. Values above 6 are amber (valid per spec but inconsistent browser support). Zero, negative and non-integer values are red.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-level: [N] (1–6) |
| Amber | `#e65100` | aria-level: [N] (valid per spec, inconsistent browser support above 6) |
| Amber | `#e65100` | aria-level: (empty) |
| Red | `#b00020` | aria-level: [N] (invalid — must be 1 or greater) |
| Red | `#b00020` | aria-level: "[value]" (invalid — must be an integer) |

---

## Highlight aria-controls

Source element — green outline and badge. Referenced elements — blue outline and badge.
Missing IDs annotated inline in the source badge. Hidden referenced elements are valid (e.g. a collapsed panel) and noted silently without a badge.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-controls: [id] |
| Dark green | `#1b5e20` | aria-controls: [id1] [id2] |
| Red | `#b00020` | aria-controls: [id] (missing) |
| Red | `#b00020` | aria-controls: (empty) |
| Dark blue | `#0a558c` | ID: [id] (on referenced element) |

---

## Highlight aria-haspopup

All seven recognised values are green. Unrecognised and empty values are red.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-haspopup: "false" |
| Dark green | `#1b5e20` | aria-haspopup: "true" |
| Dark green | `#1b5e20` | aria-haspopup: "menu" |
| Dark green | `#1b5e20` | aria-haspopup: "listbox" |
| Dark green | `#1b5e20` | aria-haspopup: "tree" |
| Dark green | `#1b5e20` | aria-haspopup: "grid" |
| Dark green | `#1b5e20` | aria-haspopup: "dialog" |
| Red | `#b00020` | aria-haspopup: "[value]" (INVALID VALUE) |
| Red | `#b00020` | aria-haspopup: (empty) |

---

## Highlight shadow DOM

Fixed summary banner at bottom of page shows element counts.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Open shadow DOM: [tag][#id or .class] |
| Amber | `#e65100` | Custom element: [tag][#id or .class] |
