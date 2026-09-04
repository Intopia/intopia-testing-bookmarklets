# Intopia testing bookmarklets

## About this project

A set of accessibility testing bookmarklets. Each one highlights a specific HTML or ARIA feature directly on the page, helping teams quickly inspect, test and understand accessibility markup without needing browser DevTools.

Bookmarklets main reference page: 
[Intopia's accessibility testing bookmarklets](https://intopia.github.io/exercise/testing-bookmarklets-intopia.html)

## The current bookmarklets

1. Highlight headings
2. Highlight image alternatives
3. Highlight lists
4. Highlight landmarks
5. Highlight page language
6. Highlight document title
7. Highlight page encoding
8. Highlight captions and headers
9. Highlight table IDs and headers
10. Highlight ARIA table roles
11. Track focus order
12. Highlight tabindex
13. Highlight aria-label
14. Highlight aria-labelledby
15. Highlight aria-describedby
16. Highlight name mismatches
17. Highlight name-prohibited roles
18. Highlight form field names
19. Highlight buttons
20. Highlight fieldsets
21. Highlight required fields
22. Highlight readonly fields
23. Highlight aria-invalid
24. Highlight autocomplete
25. Highlight aria-expanded
26. Highlight aria-checked
27. Highlight aria-pressed
28. Highlight aria-roledescription
29. Highlight aria-details
30. Highlight aria-valuetext
31. Highlight aria-valuenow
32. Highlight aria-valuemin and aria-valuemax
33. Highlight aria-setsize and aria-posinset
34. Highlight aria-level
35. Highlight aria-controls
36. Highlight aria-haspopup
37. Highlight shadow DOM
38. Highlight links

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

A heading is only empty when nothing resolves a name. A heading whose only content is an image takes its name from that image's `alt`, and `aria-label` or `aria-labelledby` override the content. Where the name is not the visible text, the badge says where it came from.
Elements that are not rendered are skipped.

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
| — | — | any of the above with a `(from image alt)`, `(from aria-label)` or `(from aria-labelledby)` suffix |

---

## Highlight image alternatives

Badge allows wrapping (max-width: 400px) for long alt text values.

Targets `<img>` and any element with `role="img"` or `role="image"`. `<area>` is not covered because it has no layout box to anchor a badge to. `input[type="image"]` is covered by the buttons bookmarklet.
Names resolve in AccName order, so `aria-labelledby` and `aria-label` override `alt` and the badge says so. `role="presentation"` or `role="none"` removes the image from the accessibility tree, so its alt is never announced.
Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Alt: [text] |
| Dark green | `#1b5e20` | aria-label: [name] |
| Dark green | `#1b5e20` | aria-labelledby: [name] |
| Dark green | `#1b5e20` | aria-label: [name] (overrides alt: "[alt]") |
| Dark green | `#1b5e20` | svg title: [name] |
| Dark blue | `#0a558c` | Empty alt |
| Dark blue | `#0a558c` | Decorative (role="presentation") |
| Dark blue | `#0a558c` | Decorative (role="none") |
| Amber | `#e65100` | title: [text] (no alt — unreliable name source) |
| Red | `#b00020` | Missing alt |
| Red | `#b00020` | NO ACCESSIBLE NAME |
| — | — | non-`<img>` elements carry a `[role="img"]` suffix |

---

## Highlight lists

Containers (ul, ol, menu, dl, role="list") — badge above element.
Items (li, dt, dd, role="listitem") — badge inside at bottom of element.

`<menu>` maps to the list role and is covered alongside `ul` and `ol`.
An explicit `role="presentation"` or `role="none"` removes list semantics, so the element is not a list and its items are not list items.
A list item only counts when its direct parent is a list. A wrapper element between the two breaks the relationship.
Role values are matched case-insensitively. Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | `<ul>` |
| Dark green | `#1b5e20` | `<ol>` |
| Dark green | `#1b5e20` | `<menu>` |
| Dark green | `#1b5e20` | `<li>` |
| Dark blue | `#0a558c` | `<dl>` |
| Dark blue | `#0a558c` | `<dt>` |
| Dark blue | `#0a558c` | `<dd>` |
| Amber | `#e65100` | role="list" |
| Amber | `#e65100` | role="listitem" |
| Red | `#b00020` | `<ul>` role="presentation" (not a list) |
| Red | `#b00020` | `<li>` role="presentation" (not a list item) |
| Red | `#b00020` | `<li>` (not in a list) |
| Red | `#b00020` | role="listitem" (not in a list) |

---

## Highlight landmarks

Nested `<aside>` without accessible name is not flagged (matches HTML-AAM mapping). Nested `<aside>` with accessible name is flagged as complementary.

`<form>` and `<section>` are only flagged when they have an accessible name, matching HTML-AAM. An explicit non-landmark role excludes the element entirely, so `<nav role="presentation">` is not flagged. Role values are matched case-insensitively. Accessible names resolve in AccName order: `aria-labelledby` before `aria-label`. Landmarks that are not rendered are skipped.

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

Document-level banner appended directly to body (position: fixed). Inline lang attributes use standard positioned badges. Where more than one document-level message applies, banners stack vertically.

Two separate checks, deliberately kept apart, because they lead to different advice:

- **NOT WELL-FORMED** (red) — the value breaks the BCP 47 grammar. Always an error. Checked by walking the grammar, so nothing here can drift.
- **Unregistered** (amber) — the syntax is fine, but the primary language subtag is not one the bundled list recognises.

Grandfathered tags and private use only tags are well-formed but flagged amber, since neither names a language a browser can act on in the normal way.

Script, region and variant subtags are checked for well-formedness only. Confirming they are *registered* would need the IANA registry, which a bookmarklet cannot carry, so this tool does not claim to. `en-Latn-UK-nonsense` is well-formed and passes.

The bundled ISO 639-1 and 639-2/3 code lists and the 65 full-word mistake mappings are a convenience snapshot, not authoritative, and will drift as the registry changes.

Case is not significant in BCP 47, so a valid tag in unconventional case stays green with a note giving the conventional form.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Document lang: [value] |
| Dark green | `#1b5e20` | Document lang: [value] (conventional form: [value]) |
| Amber | `#e65100` | Document lang: (empty) |
| Amber | `#e65100` | Document lang: (whitespace only) |
| Amber | `#e65100` | Document lang: "[value]" — well-formed, but "[subtag]" is not a language subtag we recognise |
| Amber | `#e65100` | Document lang: "[value]" — grandfathered tag, well-formed but deprecated |
| Amber | `#e65100` | Document lang: "[value]" — private use only, names no language |
| Red | `#b00020` | Document lang: "[value]" — NOT WELL-FORMED: subtags are separated by a hyphen, not an underscore. Did you mean "[value]"? |
| Red | `#b00020` | Document lang: "[value]" — NOT WELL-FORMED: this is a language name, not a code. Did you mean "[suggestion]"? |
| Red | `#b00020` | Document lang: "[value]" — NOT WELL-FORMED: leading or trailing whitespace |
| Red | `#b00020` | Document lang: "[value]" — NOT WELL-FORMED: [grammar reason] |
| Red | `#b00020` | NO DOCUMENT LANG — lang attribute missing from `<html>` |
| Amber | `#e65100` | Warning: lang="[value]" and xml:lang="[value]" differ |
| Dark blue | `#0a558c` | lang: [value] (inline, valid) |
| — | — | inline badges use the same messages, coloured as above |

---

## Highlight document title

Document-level fixed banner appended directly to body. No overlay or outline — `<title>` is not a visible element. Only one banner is ever shown.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Document title: "[text]" |
| Amber | `#e65100` | Warning: [N] `<title>` elements found — only one is valid. Browsers use: "[text]" |
| Red | `#b00020` | Document title: (empty) — `<title>` element is present but has no content |
| Red | `#b00020` | NO DOCUMENT TITLE — `<title>` element is missing |

---

## Highlight page encoding

Document-level fixed banner appended directly to body. Detects both `<meta charset>` and `http-equiv Content-Type` forms.

Where more than one message applies, banners stack vertically rather than overlapping.
All UTF-8 labels from the Encoding Standard are accepted: `utf-8`, `utf8` and `unicode-1-1-utf-8`.
More than one `<meta charset>` is amber, since the page still works and the first declaration wins.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Charset: "UTF-8" via `<meta charset>` |
| Amber | `#e65100` | Charset: "[value]" via [source] — UTF-8 is recommended |
| Amber | `#e65100` | Warning: [N] `<meta charset>` declarations found ("[value]", "[value]") — browsers use the first. |
| Amber | `#e65100` | Warning: conflicting charset declarations — meta charset: "[value]" and http-equiv: "[value]" |
| Amber | `#e65100` | Warning: charset declaration found outside `<head>` |
| Red | `#b00020` | Charset: (empty) — charset attribute is present but has no value |
| Red | `#b00020` | NO CHARSET DECLARATION — `<meta charset>` is missing |

---

## Highlight captions and headers

Keyboard filter: [1] Table  [2] Caption  [3] TH  [4] Scope  [n] Next  [Esc] Clear

Keys 1–3 on by default. Key 4 (scope) is opt-in — dimmed in legend until pressed.
Pressing a key isolates that group. Pressing the same key again restores the default view.
Press `n` to cycle through groups in sequence.

TH badges (key 3) positioned above element — show cell text only, no scope information.
Scope badges (key 4) positioned below element — show scope value or flag missing scope.

A caption is not required, so a table without one is amber rather than red, annotated on the table badge itself.
Captions and header cells are only attributed to the table that owns them, so nested tables are not double-counted.

| Colour | Hex | Badge text | Key |
|--------|-----|------------|-----|
| Dark blue | `#0a558c` | Table [N] | 1 |
| Amber | `#e65100` | Table [N] (no caption) | 1 |
| Dark green | `#1b5e20` | Caption: [text] | 2 |
| Red | `#b00020` | TH: [text] | 3 |
| Amber | `#e65100` | scope: [value] | 4 |
| Red | `#b00020` | scope: "[value]" INVALID VALUE | 4 |
| Red | `#b00020` | no scope | 4 |

---

## Highlight table IDs and headers

Interactive — makes all `<th>` and `<td>` elements focusable. Floating badge follows focused cell. Referenced header cells are outlined and numbered.

Click to activate, then Tab or `n` to navigate between cells. Esc restores original tabindex values. Re-running the bookmarklet switches it off.

Each referenced header gets a small numbered marker, and the same numbers appear in the badge against the id they came from. This makes the relationship explicit without drawing connector lines, which would drift on tables with sticky headers.

A `headers` value must reference a `<th>` or `<td>`. A reference that resolves to something else is amber and annotated, and a reference that resolves to nothing is annotated inline rather than silently skipped.

| Colour | Hex | Badge / outline text |
|--------|-----|----------------------|
| Dark blue | `#0a558c` | Focused cell outline + badge: TH/TD: [text] \| id: [value] \| headers: [1] [id] [2] [id] |
| Dark green | `#1b5e20` | Referenced header cell outline + numbered marker |
| Amber | `#e65100` | Referenced element that is not a table cell, outline + numbered marker |
| — | — | badge annotation: [N] [id] (missing) |
| — | — | badge annotation: [N] [id] (not a table cell) |
| — | — | badge annotation: headers: (empty) |

---

## Highlight ARIA table roles

Keyboard filter: [1] Table/Grid  [2] Rowgroup  [3] Row  [4] Column header  [5] Row header  [6] Cell  [n] Next  [Esc] Clear

All groups on by default. Pressing a key isolates that group. Pressing the same key again restores all.
Press `n` to cycle through the role hierarchy in sequence.

Container roles (table, grid, treegrid, rowgroup) — badge above element.
Row and cell roles — badge inside at bottom of element.

`columnheader` and `rowheader` badges also show `aria-sort` value where present. Re-run after sorting to refresh values.

| Colour | Hex | Badge text | Key |
|--------|-----|------------|-----|
| Dark blue | `#0a558c` | role="table" [: name] | 1 |
| Dark blue | `#0a558c` | role="grid" [: name] | 1 |
| Dark blue | `#0a558c` | role="treegrid" [: name] | 1 |
| Teal | `#006064` | role="rowgroup" | 2 |
| Amber | `#e65100` | role="row" | 3 |
| Red | `#b00020` | role="columnheader" [(sort: [value])] | 4 |
| Red | `#b00020` | role="columnheader" (sort: "[value]" INVALID VALUE) | 4 |
| Deep purple | `#4a148c` | role="rowheader" [(sort: [value])] | 5 |
| Deep purple | `#4a148c` | role="rowheader" (sort: "[value]" INVALID VALUE) | 5 |
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

Values are parsed with the HTML integer rules, so hex, exponent and decimal forms are rejected. A value the browser cannot parse means the attribute is ignored entirely and the element is not focusable at all, which the badge says rather than reporting a parsed number.

`tabindex="0"` on a natively focusable element is redundant. `tabindex="0"` on an element with no role and no accessible name creates a focus stop that is announced as nothing; the check only fires when there is no role **and** no name from any source, so a focusable container with text content is not flagged.

Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | tabindex="0" |
| Amber | `#e65100` | tabindex="-1" |
| Amber | `#e65100` | tabindex="0" (redundant — `<[tag]>` is already in the tab order) |
| Amber | `#e65100` | tabindex="0" (focusable, but no role and no accessible name) |
| Red | `#b00020` | tabindex="[N]" (AVOID positive values) |
| Red | `#b00020` | tabindex="[value]" (INVALID — use -1 or 0) |
| Red | `#b00020` | tabindex="[value]" (INVALID — not an integer, so the attribute is ignored and the element is not focusable) |

---

## Highlight aria-label

Name-prohibited roles follow the ARIA 1.2 and ARIA 1.3 draft tables: `caption`, `code`, `definition`, `deletion`, `emphasis`, `generic`, `insertion`, `mark`, `none`, `paragraph`, `presentation`, `strong`, `subscript`, `suggestion`, `superscript`, `term`, `time`, `tooltip`.
Elements with a name-prohibited implicit role: `caption`, `code`, `del`, `s`, `em`, `ins`, `p`, `strong`, `sub`, `sup`, `dfn`, `mark`, `time`, and the elements mapping to `generic` (`b`, `bdi`, `bdo`, `data`, `div`, `i`, `pre`, `q`, `samp`, `small`, `span`, `u`).
An explicit role overrides the implicit one, so `<span role="button" aria-label="Close">` is a button and may be named. Role values are matched case-insensitively. Elements that are not rendered are skipped.

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
| Red | `#b00020` | aria-labelledby: (empty) → NO NAME |
| Dark blue | `#0a558c` | ID: [id] (on referenced element) |
| Dark blue | `#0a558c` | ID: [id] (self) (on a self-referencing element) |

---

## Highlight aria-describedby

Source element — green outline, green badge showing resolved description.
Referenced elements — blue outline, blue badge at each element.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-describedby: [ids] → "[resolved description]" |
| Dark green | `#1b5e20` | aria-describedby: [ids] (self annotation inline) → "[resolved description]" |
| Red | `#b00020` | aria-describedby: [id] (missing) → NO DESCRIPTION |
| Red | `#b00020` | aria-describedby: [ids] → EMPTY TEXT STRING = NO DESCRIPTION |
| Red | `#b00020` | aria-describedby: (empty) → NO DESCRIPTION |
| Dark blue | `#0a558c` | ID: [id] (on referenced element) |
| Dark blue | `#0a558c` | ID: [id] (self) (on a self-referencing element) |

---

## Highlight name mismatches

WCAG 2.5.3 Label in Name requires the accessible name to contain the visible label text.
A name that starts with the visible label also satisfies the speech input use case; one that merely contains it passes the SC but does not.
Visible text includes image `alt`, because an image is a visible label. An `<svg><title>` is not rendered, so it counts towards the accessible name but not towards the visible label.
Where there is no visible text label, 2.5.3 does not apply.
Role values are matched case-insensitively. Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | MATCH: [accessible name] |
| Dark blue | `#0a558c` | MODIFIED: [accessible name] |
| Dark blue | `#0a558c` | NO VISIBLE TEXT — 2.5.3 does not apply: [accessible name] |
| Amber | `#e65100` | CONTAINS: [accessible name] (visible label not at start: "[visible]") |
| Red | `#b00020` | MISMATCH: [accessible name] (visible: "[visible]") |
| Red | `#b00020` | NO VISIBLE TEXT AND NO ACCESSIBLE NAME |

---

## Highlight name-prohibited roles

Name-prohibited roles follow the ARIA 1.2 and ARIA 1.3 draft tables: `caption`, `code`, `definition`, `deletion`, `emphasis`, `generic`, `insertion`, `mark`, `none`, `paragraph`, `presentation`, `strong`, `subscript`, `suggestion`, `superscript`, `term`, `time`, `tooltip`.
Elements with a name-prohibited implicit role: `caption`, `code`, `del`, `s`, `em`, `ins`, `p`, `strong`, `sub`, `sup`, `dfn`, `mark`, `time`, and the elements mapping to `generic` (`b`, `bdi`, `bdo`, `data`, `div`, `i`, `pre`, `q`, `samp`, `small`, `span`, `u`).
An explicit role overrides the implicit one, so `<span role="button" aria-label="Close">` is a button and may be named. Role values are matched case-insensitively. Elements that are not rendered are skipped.

Shares its role lists with the aria-label bookmarklet; the two must stay identical.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Red | `#b00020` | NAME PROHIBITED: [role] |

---

## Highlight form field names

Targets `input` (excluding `hidden`, `submit`, `reset`, `button` and `image`), `select` and `textarea`. Button-like inputs are covered by the buttons bookmarklet.
Where a control has more than one associated `<label>`, all of them are joined, matching AccName, and the badge shows the count.
Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-labelledby: [name] |
| Dark green | `#1b5e20` | aria-label: [name] |
| Dark green | `#1b5e20` | label: [name] |
| Dark green | `#1b5e20` | label ×[N]: [joined name] |
| Dark green | `#1b5e20` | implicit label: [name] |
| Amber | `#e65100` | title: [name] |
| Amber | `#e65100` | placeholder: [name] |
| Red | `#b00020` | NO ACCESSIBLE NAME |

---

## Highlight buttons

Targets `<button>`, `input` types `submit`, `reset`, `button` and `image`, and any element with `role="button"`.
Custom buttons carry a `[role="button"]` suffix on the badge so they are distinguishable from native ones.
An image button takes its name from `alt`, not from `value`. Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-labelledby: [name] |
| Dark green | `#1b5e20` | aria-label: [name] |
| Dark green | `#1b5e20` | text content: [name] |
| Dark green | `#1b5e20` | value: [name] |
| Dark green | `#1b5e20` | alt: [name] (image buttons) |
| Dark green | `#1b5e20` | default: Submit / default: Reset |
| Amber | `#e65100` | title: [name] (unreliable — title only) |
| Red | `#b00020` | NO ACCESSIBLE NAME |
| — | — | any of the above with a `[role="button"]` suffix |

---

## Highlight fieldsets

Legend badge positioned below legend element to avoid overlap with fieldset badge.

A `<legend>` only labels its fieldset when it is the first child, so a legend anywhere else, including inside a nested fieldset, does not count.
`aria-label` and `aria-labelledby` override the legend in AccName, so a fieldset named that way is not an error.
`radiogroup` requires an accessible name. `group` does not, so an unnamed group is shown but not flagged as a failure.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Fieldset |
| Dark green | `#1b5e20` | Fieldset (named by aria-label): [name] |
| Dark green | `#1b5e20` | Fieldset (named by aria-labelledby): [name] |
| Red | `#b00020` | Fieldset (no legend) |
| Red | `#b00020` | Fieldset (legend is not the first child) |
| Dark blue | `#0a558c` | Legend: [text] |
| Amber | `#e65100` | Legend: [text] (not the first child of a fieldset) |
| Amber | `#e65100` | role="radiogroup": [name] |
| Red | `#b00020` | role="radiogroup" NO ACCESSIBLE NAME |
| Amber | `#e65100` | role="group": [name] |
| Amber | `#e65100` | role="group" (no accessible name, not required) |

---

## Highlight required fields

Mirrors the readonly bookmarklet: the blue badge for `aria-required="true"` alone is deliberately informational rather than pass/fail, and `aria-required="false"` is amber because it restates the default.

`required` only does something on `<select>`, `<textarea>` and the `input` types `text`, `search`, `url`, `tel`, `email`, `password`, `date`, `month`, `week`, `time`, `datetime-local`, `number`, `checkbox`, `radio` and `file`. On a range, colour picker, button or anything else it has no effect, which is flagged.

Values are trimmed and lowercased before comparison. Whether the element's role supports `aria-required` is **not** checked.
Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | required |
| Dark blue | `#0a558c` | aria-required="true" |
| Amber | `#e65100` | required + aria-required="true" (redundant) |
| Amber | `#e65100` | aria-required="false" (redundant — default value) |
| Red | `#b00020` | required + aria-required="false" (CONFLICTING — native required wins) |
| Red | `#b00020` | INVALID VALUE: aria-required="[value]" |
| Red | `#b00020` | required + INVALID VALUE: aria-required="[value]" |
| Red | `#b00020` | required HAS NO EFFECT: `<[tag]>` does not support required |
| Red | `#b00020` | required HAS NO EFFECT: input type="[type]" does not support required |

---

## Highlight readonly fields

Native `readonly` (`<input>`, `<textarea>`) is browser-enforced and implicitly sets `aria-readonly="true"` in the accessibility tree — no ARIA needed. `aria-readonly="true"` alone only affects the AT announcement; it does not stop the user typing unless the field is also restricted some other way. Teaching bookmarklet — the blue badge is deliberately informational rather than pass/fail.

`readonly` only does something on `<textarea>` and text-like `<input>` types (`text`, `search`, `url`, `tel`, `email`, `password`, `date`, `month`, `week`, `time`, `datetime-local`, `number`). On a `<select>`, a checkbox, a radio or anything else it has no effect, which is flagged.
`aria-readonly` is only supported on `checkbox`, `combobox`, `grid`, `gridcell`, `listbox`, `radiogroup`, `slider`, `spinbutton`, `textbox`, `columnheader`, `rowheader` and `treegrid`, plus the native controls carrying those roles implicitly.
Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | readonly |
| Dark blue | `#0a558c` | aria-readonly="true" |
| Amber | `#e65100` | aria-readonly="false" (redundant — default value) |
| Amber | `#e65100` | readonly + aria-readonly="true" (redundant) |
| Red | `#b00020` | readonly + aria-readonly="false" (CONFLICTING — native readonly wins) |
| Red | `#b00020` | INVALID VALUE: aria-readonly="[value]" |
| Red | `#b00020` | readonly HAS NO EFFECT: `<[tag]>` does not support readonly |
| Red | `#b00020` | readonly HAS NO EFFECT: input type="[type]" does not support readonly |
| Red | `#b00020` | aria-readonly="[value]" HAS NO EFFECT: this role does not support aria-readonly |

---

## Highlight aria-invalid

All recognised values are green. Empty and unrecognised values get red. `aria-invalid` is a token type with a closed list, so `undefined` is not valid here.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-invalid: true |
| Dark green | `#1b5e20` | aria-invalid: false |
| Dark green | `#1b5e20` | aria-invalid: grammar |
| Dark green | `#1b5e20` | aria-invalid: spelling |
| Red | `#b00020` | aria-invalid: (empty) |
| Red | `#b00020` | INVALID VALUE: aria-invalid="[value]" |

---

## Highlight autocomplete

Follows the HTML autofill grammar: `[section-*] [shipping|billing] [home|work|mobile|fax|pager] field-name [webauthn]`.
Exactly one field name is allowed. A contact token (`home`, `work`, `mobile`, `fax`, `pager`) is only valid before a contact field name (`tel*`, `email`, `impp`). `on` and `off` are valid only on their own.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | autocomplete: [value] (valid) |
| Dark blue | `#0a558c` | autocomplete: [value] (generic) |
| Red | `#b00020` | autocomplete: [value] (invalid) |
| Red | `#b00020` | autocomplete: (empty) (invalid) |

---

## Highlight aria-expanded

Re-run after activating a widget to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-expanded="true" |
| Amber | `#e65100` | aria-expanded="false" |
| Dark green | `#1b5e20` | aria-expanded="undefined" |
| Red | `#b00020` | aria-expanded="[value]" (INVALID VALUE) |

---

## Highlight aria-checked

Re-run after interacting with a widget to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-checked="true" |
| Amber | `#e65100` | aria-checked="false" |
| Dark blue | `#0a558c` | aria-checked="mixed" |
| Dark green | `#1b5e20` | aria-checked="undefined" |
| Red | `#b00020` | aria-checked="[value]" (INVALID VALUE) |

---

## Highlight aria-pressed

Intended for toggle buttons — `<button>` or elements with `role="button"`. Re-run after interacting to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-pressed="true" |
| Amber | `#e65100` | aria-pressed="false" |
| Dark blue | `#0a558c` | aria-pressed="mixed" |
| Dark green | `#1b5e20` | aria-pressed="undefined" |
| Red | `#b00020` | aria-pressed="[value]" (INVALID VALUE) |

---

## Highlight aria-roledescription

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-roledescription: "[value]" |
| Amber | `#e65100` | aria-roledescription: "[value]" (no role — possible misuse) |
| Amber | `#e65100` | aria-roledescription: "[value]" (role="[role]" has no semantics — misuse) |
| Amber | `#e65100` | aria-roledescription: (empty) |

Note: elements with meaningful implicit roles (fieldset, button, nav, h1–h6 etc.) are treated as having a role even without an explicit `role` attribute.
An explicit `role` of `generic`, `presentation` or `none` counts as no role, since those roles carry no semantics to describe.
`<section>` is only treated as having a role when it has an accessible name; unnamed it maps to generic.

---

## Highlight aria-details

Source element — green outline and badge. Referenced elements — blue outline and badge.
Missing IDs annotated inline in the source badge.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-details: [ids] |
| Dark green | `#1b5e20` | aria-details: [ids] (self annotation inline) |
| Amber | `#e65100` | aria-details: [id] [id] (missing) |
| Red | `#b00020` | aria-details: [id] (missing) (all missing) |
| Red | `#b00020` | aria-details: (empty) |
| Dark blue | `#0a558c` | ID: [id] (on referenced element) |
| Dark blue | `#0a558c` | ID: [id] (self) (on a self-referencing element) |

---

## Highlight aria-valuetext

ARIA requires `aria-valuenow` wherever `aria-valuetext` is used, so a missing or empty `aria-valuenow` is flagged here. Whether the `aria-valuenow` value itself is a valid number is left to the aria-valuenow bookmarklet.
Re-run after interacting with a widget to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-valuetext: "[value]" |
| Amber | `#e65100` | aria-valuetext: (empty) |
| Amber | `#e65100` | aria-valuetext: "[value]"  \|  aria-valuenow: (missing) |
| Amber | `#e65100` | aria-valuetext: "[value]"  \|  aria-valuenow: (empty) |

---

## Highlight aria-valuenow

ARIA number type, so decimals and exponent notation (`1e2`) are valid. Hex and `Infinity` are not.
Where the element also declares a coherent `aria-valuemin` to `aria-valuemax` range, a value outside that range is flagged. An inverted range is left to the aria-valuemin and aria-valuemax bookmarklet.
Re-run after interacting with a widget to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-valuenow: [N] |
| Amber | `#e65100` | aria-valuenow: (empty) |
| Red | `#b00020` | aria-valuenow: "[value]" (invalid — must be a number) |
| Red | `#b00020` | aria-valuenow: [N] (outside range [min]–[max]) |

---

## Highlight aria-valuemin and aria-valuemax

Shows both attributes together on each element.
Both are ARIA number type, so decimals and exponent notation (`1e2`) are valid. Hex and `Infinity` are not.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-valuemin: [N]  \|  aria-valuemax: [N] |
| Amber | `#e65100` | aria-valuemin: [N]  \|  aria-valuemax: (missing) |
| Amber | `#e65100` | aria-valuemin: (missing)  \|  aria-valuemax: [N] |
| Amber | `#e65100` | aria-valuemin: [N]  \|  aria-valuemax: [N]  \|  empty range (min equals max) |
| Red | `#b00020` | aria-valuemin: "[value]" (invalid)  \|  aria-valuemax: [N] |
| Red | `#b00020` | aria-valuemin: [N]  \|  aria-valuemax: [N]  \|  valuemin exceeds valuemax |

---

## Highlight aria-setsize and aria-posinset

Shows both attributes together on each element. Where `aria-level` is also present, it is shown first.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | [N] of [M]  (posinset: [N]  \|  setsize: [M]) |
| Dark green | `#1b5e20` | level: [N]  \|  [N] of [M]  (posinset: [N]  \|  setsize: [M]) |
| Dark green | `#1b5e20` | level: (empty)  \|  [N] of [M]  (posinset: [N]  \|  setsize: [M]) |
| Amber | `#e65100` | posinset: [N]  \|  setsize: -1 (unknown total) |
| Amber | `#e65100` | posinset: [N]  \|  setsize: (missing) |
| Amber | `#e65100` | posinset: (missing)  \|  setsize: [N] |
| Red | `#b00020` | posinset: "[value]" (invalid)  \|  setsize: [N] |
| Red | `#b00020` | [N] of [M] (posinset exceeds setsize)  (posinset: [N]  \|  setsize: [M]) |

`aria-setsize` accepts `-1` (unknown total) or 1 and above. Zero is flagged, since a set an element belongs to has at least one item.

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

Reconnaissance rather than annotation. The audience is an auditor arriving at an unfamiliar page who needs to know, before running an extension-based tool, whether shadow DOM will hide content from it. The **report panel is the primary output**; the badges are supporting detail.

Walks into open shadow roots recursively, so nested hosts are found. Elements inside shadow roots are counted but not badged — the count is what matters, and badging every node would bury the page.

A registered custom element with no open shadow root may have a closed one. Nothing can tell the difference from outside, including this bookmarklet, so it is reported as unconfirmed rather than guessed at. An **undefined** custom element is different and worse: the script probably did not load, so the content may not be enhanced at all.

Report panel lines:

| Colour | Line |
|--------|------|
| Dark green | No shadow DOM or custom elements found. / Extension-based tools should see the whole page. |
| Dark green | [N] open shadow roots, nested [N] levels deep |
| — | [N] elements inside shadow DOM — many extensions will not see these |
| Amber | [N] custom elements with no open shadow root — may be closed, cannot be confirmed |
| Red | [N] undefined custom elements — script may not have loaded |

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Open shadow root: [tag][#id or .class] |
| Dark green | `#1b5e20` | Open shadow root: [tag] (nested, depth [N]) |
| Amber | `#e65100` | Custom element: [tag][#id or .class] (shadow DOM unconfirmed) |
| Red | `#b00020` | Undefined custom element: [tag] (script may not have loaded) |

---

## Highlight links

Resolves the accessible name of every `<a>` element and any element with `role="link"`, regardless of source (aria-labelledby, aria-label, text content, image alt). Checks for duplicate names pointing to different URLs, title attribute issues, empty and missing href.

A link whose only content is an image takes its name from that image's `alt`.
Duplicate detection compares resolved URLs, so `/page` and `./page` are the same target rather than two.
The `href` checks apply to `<a>` only, since a `role="link"` element is activated by script. Custom links carry a `[role="link"]` suffix on the badge.
Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | "[name]" |
| Amber | `#e65100` | "[name]" (title matches — may double-announce) |
| Amber | `#e65100` | "[name]" (title mismatch: "[title]" — may double-announce differently) |
| Amber | `#e65100` | (no name — title only: "[title]") |
| Red | `#b00020` | "[name]" (duplicate name, different URL) |
| Red | `#b00020` | (empty href) |
| Red | `#b00020` | (no href — not a link in the accessibility tree) |
| Red | `#b00020` | (no accessible name) |
| — | — | any of the above with a `[role="link"]` suffix |

---
