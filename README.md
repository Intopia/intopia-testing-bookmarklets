# Intopia testing bookmarklets

## About this project

A set of accessibility testing bookmarklets. Each one highlights a specific HTML or ARIA feature directly on the page, helping teams quickly inspect, test and understand accessibility markup without needing browser DevTools.

Bookmarklets main reference page: 
[Intopia's accessibility testing bookmarklets](https://intopia.github.io/exercise/testing-bookmarklets-intopia.html)

ContrastChecker was built by Ani Chiang and is maintained separately from the rest of the set. Everything else here follows the shared conventions described below.

## Colour meaning

Two palettes, and the difference matters more than any individual colour.

A colour is either a **verdict** or a **category**, never both. Most bookmarklets judge something — is this name resolving, is this value valid — and use the verdict palette:

| Colour | Hex | Meaning |
|--------|-----|---------|
| Dark green | `#1b5e20` | Valid, present, correctly implemented |
| Dark blue | `#0a558c` | Informational, secondary reference, non-verdict |
| Amber | `#e65100` | Caution, unreliable, unconfirmed, redundant |
| Red | `#b00020` | Missing, broken, prohibited, invalid |

A few bookmarklets only identify what an element is — this is a banner, this is a rowgroup, this is a `<th>` — and use the category palette: dark blue, deep purple, teal, deep pink, blue-grey, brown `#4e342e`, indigo `#1a237e` and slate `#455a64`. **Green, amber and red never appear there**, so a correctly marked-up element is never mistaken for a pass or a failure.

Landmarks and ARIA table roles use category colours throughout. Captions and headers uses both: category colours for table, caption, TH and scope, with amber and red reserved for the two things that really are verdicts.

Three bookmarklets report rather than judge, and use neither palette: Track focus order, Inspect text styles and Inspect box model all use the neutral dark panel `#111111`, because a focus number, a font size and a margin are observations, not findings.

Where blue marks a deliberate non-verdict, the badge text says why. Where something is a convention rather than a specification requirement, the badge says that too.

---

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
13. Highlight target size
14. Inspect text styles
15. Inspect box model
16. Highlight accessible names
17. Highlight aria-label
18. Highlight aria-labelledby
19. Highlight aria-describedby
20. Highlight name mismatches
21. Highlight name-prohibited roles
22. Highlight form field names
23. Highlight buttons
24. Highlight fieldsets
25. Highlight required fields
26. Highlight readonly fields
27. Highlight aria-invalid
28. Highlight autocomplete
29. Highlight aria-expanded
30. Highlight aria-checked
31. Highlight aria-pressed
32. Highlight aria-roledescription
33. Highlight aria-details
34. Highlight aria-valuetext
35. Highlight aria-valuenow
36. Highlight aria-valuemin and aria-valuemax
37. Highlight aria-setsize and aria-posinset
38. Highlight aria-level
39. Highlight aria-controls
40. Highlight aria-haspopup
41. Highlight shadow DOM
42. Highlight links
43. ContrastChecker

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
- Dark `#111111` — neutral panel surface: focus order tracker, text styles panel, box model panel

Badge text system:
- **Informational** — sentence case, source/element first: `aria-label: Close`
- **Diagnostic verdict** — all caps, verdict first: `NO ACCESSIBLE NAME`, `MISMATCH: Hello`

---

## Highlight headings

More than one `<h1>` is valid HTML. One per page is a widely followed convention, not a rule, so an additional H1 is amber rather than red.

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
| Amber | `#e65100` | H1: [text] (additional H1 — valid HTML, but one per page is the convention) |
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

These are **category colours, not verdicts**. This bookmarklet says what each landmark is, never whether it is right or wrong, so green, amber and red are deliberately excluded. Reusing them made correct markup look broken: a valid `<form aria-label="Search">` was outlined in red.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark blue | `#0a558c` | Banner [: name] |
| Deep purple | `#4a148c` | Navigation [: name] |
| Teal | `#006064` | Main [: name] |
| Deep pink | `#880e4f` | Complementary [: name] |
| Blue-grey | `#37474f` | Contentinfo [: name] |
| Brown | `#4e342e` | Search [: name] |
| Indigo | `#1a237e` | Region [: name] |
| Slate | `#455a64` | Form [: name] |

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

Table, caption, TH and scope colours are **categories, not verdicts** — they say what an element is, not whether it is correct. Only two things here are verdicts: a missing caption (amber) and an invalid scope value (red).

`scope` is **not required**. Browsers and assistive technology infer header association in simple tables, so a `<th>` without scope is shown in its own category colour and labelled as such, not flagged as a failure. Previously it was red, which taught that scope is mandatory.

A caption is not required either, so a table without one is amber rather than red, annotated on the table badge itself.
Captions and header cells are only attributed to the table that owns them, so nested tables are not double-counted.

| Colour | Hex | Badge text | Key |
|--------|-----|------------|-----|
| Dark blue | `#0a558c` | Table [N] | 1 |
| Amber | `#e65100` | Table [N] (no caption) | 1 |
| Teal | `#006064` | Caption: [text] | 2 |
| Deep purple | `#4a148c` | TH: [text] | 3 |
| Blue-grey | `#37474f` | scope: [value] | 4 |
| Brown | `#4e342e` | no scope (not required in simple tables) | 4 |
| Red | `#b00020` | scope: "[value]" INVALID VALUE | 4 |

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

These are **category colours, not verdicts**. This bookmarklet says what role each element has, never whether it is right or wrong, so green, amber and red are deliberately excluded. Reusing them meant every cell of a valid grid was outlined green and every column header red.

| Colour | Hex | Badge text | Key |
|--------|-----|------------|-----|
| Dark blue | `#0a558c` | role="table" [: name] | 1 |
| Dark blue | `#0a558c` | role="grid" [: name] | 1 |
| Dark blue | `#0a558c` | role="treegrid" [: name] | 1 |
| Teal | `#006064` | role="rowgroup" | 2 |
| Brown | `#4e342e` | role="row" | 3 |
| Deep pink | `#880e4f` | role="columnheader" [(sort: [value])] | 4 |
| Deep pink | `#880e4f` | role="columnheader" (sort: "[value]" INVALID VALUE) | 4 |
| Deep purple | `#4a148c` | role="rowheader" [(sort: [value])] | 5 |
| Deep purple | `#4a148c` | role="rowheader" (sort: "[value]" INVALID VALUE) | 5 |
| Blue-grey | `#37474f` | role="cell" | 6 |
| Blue-grey | `#37474f` | role="gridcell" | 6 |

---

## Track focus order

Active listener — click to start, Tab through the page, Esc to stop. Re-running switches it off.

Every element keeps the badge it was given, so the whole sequence stays on the page and can be read as a trail rather than one element at a time.

Numbers are assigned on **first focus only**. Returning to an element by clicking, by shift-tabbing, or through scripted focus shows the number it already had, rather than incrementing. The old counter counted focus events, which drifted on any page that manages focus.

A focus stop on an element that is not rendered is red and annotated: focus moving somewhere invisible is a focus order bug in itself.

Names resolve from `aria-label`, then content including image `alt`, then `value`, so an icon button is not reported as unnamed.

Badges reposition on scroll and resize.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark | `#111111` | [N]. [tag][#id][role="…"]["name"] |
| Red | `#b00020` | [N]. [tag][#id][role="…"]["name"] (NOT RENDERED) |

---

## Highlight tabindex

Values are parsed with the HTML integer rules, so hex, exponent and decimal forms are rejected. A value the browser cannot parse means the attribute is ignored entirely and the element is not focusable at all, which the badge says rather than reporting a parsed number.

`tabindex="-1"` is blue, not amber. Removing an element from the tab order is the correct roving tabindex pattern for tabs, menus and grids, so the badge reports what the value does rather than implying something is wrong. Amber previously made a correctly built composite widget look like a page of cautions.

`tabindex="0"` on a natively focusable element is redundant. `tabindex="0"` on an element with no role and no accessible name creates a focus stop that is announced as nothing; the check only fires when there is no role **and** no name from any source, so a focusable container with text content is not flagged.

Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | tabindex="0" |
| Dark blue | `#0a558c` | tabindex="-1" (focusable by script only, not in the tab order) |
| Amber | `#e65100` | tabindex="0" (redundant — `<[tag]>` is already in the tab order) |
| Amber | `#e65100` | tabindex="0" (focusable, but no role and no accessible name) |
| Red | `#b00020` | tabindex="[N]" (AVOID positive values) |
| Red | `#b00020` | tabindex="[value]" (INVALID — use -1 or 0) |
| Red | `#b00020` | tabindex="[value]" (INVALID — not an integer, so the attribute is ignored and the element is not focusable) |

---

## Highlight target size

Flags pointer targets smaller than 24 × 24 CSS pixels, for WCAG 2.2 **2.5.8 Target Size (Minimum)**, Level AA.

**Warnings only.** Targets that already meet 24 × 24 are not badged, because badging every link and button would bury the page. The summary panel reports how many targets were measured, so nothing is silently skipped.

**Nothing here is a pass or a fail.** 2.5.8 has exceptions that need human judgement and this tool cannot evaluate any of them:

- inline links inside a sentence or block of text
- the same function available through another control that is large enough
- controls whose size is set by the browser and not modified by the author

Where the first two look likely, the badge says so as a prompt, not a verdict.

**What is measured.** The clickable region, not the visible icon, so a small icon inside a padded button measures the padded box. Where a control has an adjacent `<label>`, the label is included, since clicking it activates the control. Without that, almost every labelled checkbox would warn on width when the real finding is its height.

**The spacing test is drawn.** Each undersized target gets a dashed 24 px circle centred on it. Amber when the circle is clear, red when it overlaps another target. Two undersized targets are compared circle to circle. This covers horizontal and vertical neighbours in one pass.

**Excluded from measurement**, and counted out of the total rather than dropped silently: disabled controls, since they do not accept a pointer action, and elements that are not rendered.

**The real hit area is measured, not inferred.** Undersized targets inside the viewport are then probed with `document.elementFromPoint`, binary searching outward from each edge. A 16 × 16 button with a `::before` overlay stretching 8px past every edge is genuinely 32 × 32 to a pointer, and no amount of reading the CSS will tell you that.

Probing beats reading the pseudo-element's geometry in two ways. `pointer-events: none` on the overlay is handled for free, correctly reporting no extension. And any *other* way of extending a hit area is caught too: transparent padding, a padded wrapper, an overlapping sibling. It measures what a pointer would actually reach.

Three details that took a few attempts to get right:

- **Probes are at whole pixels.** Hit testing snaps to device pixels, so a point a fraction outside an element still lands on it. Fractional probing gave every target about a pixel of phantom reach and marked it as extended.
- **The probe hits the far edge of each pixel, not its middle.** Rounding bleeds outward by up to a pixel on the top and left edges. Probing the middle over-reported and could have cleared a 23px target as 24px. This way the measurement is short by up to a pixel instead, which at worst leaves a warning on something that passes. For a warnings-only tool that is the safe direction.
- **A target whose centre does not hit test to itself is not probed.** Something is covering it, and any result would describe that something instead.

**Targets outside the viewport cannot be probed**, because hit testing uses viewport coordinates. Those keep their CSS measurement, their badge says `Hit area not verified: scroll it into view and re-run`, and the summary panel counts them separately. Scrolling and re-running measures them.

**Other limits.** Controls that appear dynamically (menus, dialogs, toolbars, popovers) must be open when the bookmarklet runs, so re-run with them open.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Amber | `#e65100` | [W] × [H] — under 24 × 24. Spacing clear |
| Red | `#b00020` | [W] × [H] — under 24 × 24. 24px circle overlaps [N] other targets |
| — | — | either of the above with `. Inline text link, exception may apply` |
| — | — | either of the above with `. Native control, check whether the author changed its size` |
| — | — | either of the above with `. Hit area measured, larger than the visible box` |
| — | — | either of the above with `. Hit area not verified: scroll it into view and re-run` |

Summary panel lines:

| Colour | Line |
|--------|------|
| — | [N] pointer targets measured |
| — | [N] reached 24 × 24 once the real hit area was measured, so they are not flagged |
| — | None under 24 × 24 |
| Amber | [N] under 24 × 24, of which [N] have clear spacing |
| Red | [N] with a 24px circle overlapping another target |
| — | [N] could not be hit tested, measured from CSS only. Scroll them into view and re-run. |

---

## Inspect text styles

Interactive — click to activate, then click any element on the page. A fixed panel reports the text styles that actually apply to it. Esc to stop, or re-run the bookmarklet to switch it off.

**The page is in test mode while this is on.** Pointer activation is suppressed on `mousedown`, `mouseup`, `click` and `dblclick` in the capture phase, so clicking a link or button inspects it rather than following or pressing it. The panel itself is exempt. Everything is restored on teardown.

**No verdicts.** This is a snapshot, so the panel is neutral dark `#111111` with a single blue outline on the inspected element. Green, amber and red are deliberately absent: nothing here passes or fails, and judging a line height or a letter spacing needs the context the tool cannot see.

**Line height, letter spacing and word spacing are shown twice.** Line height in px and as a multiple of the font size; letter and word spacing in px and in `em`. Those derived forms are what WCAG 2.2 **1.4.12 Text Spacing** is written in, so a student can read the relevant number straight off the panel instead of dividing.

**The font row reports what is rendering, not what was asked for.** `getComputedStyle().fontFamily` returns the whole stack even when the first choice is not installed, and `document.fonts.check()` does not help — it returns `true` for a missing family because it accounts for fallback. The only reliable test is measuring a probe string on a canvas against the generic fallbacks, which is what this does. Where the rendering family is not the author's first choice, a note lists the ones that were skipped.

**Style is reported, not judged.** Italic is often applied in CSS rather than with `<em>` or `<i>`, so the slant a sighted reader sees may carry no emphasis in the accessibility tree at all. The panel shows the computed value and leaves the comparison with the markup to the person.

**Colour is reported as hex with the full `rgb()` underneath**, rather than alongside, so a long `rgba()` value does not wrap the row. The swatch is composited over white so a semi-transparent colour looks the way it would on a page rather than against the dark panel, and carries a light border so a dark colour stays visible. Where alpha is below 1 the panel says so, since the hex alone is then misleading. Alpha is read as the fourth component where there is one, so `rgb(0, 0, 0)` is opaque black rather than a transparent colour. A colour computed in a newer colour space, such as `oklch()`, displays as its raw computed value rather than a converted hex.

Background colour is out of scope. This is a snapshot of the text, not a contrast check — use ContrastChecker for that.

| Row | Value shown |
|-----|-------------|
| Font | resolved family, with `(generic)` where that family is a generic keyword |
| — | note: `Not available: [families]` where earlier stack entries were skipped |
| — | note: `No family in the stack is available: [families]` where nothing resolves |
| Size | `[N]px` |
| Weight | `[N] ([name])` — thin, extra light, light, normal, medium, semibold, bold, extra bold, black |
| Style | `normal`, `italic`, or `oblique [N]deg` |
| Line height | `[N]px ([N]× size)`, or `normal` |
| Letter sp. | `[N]px ([N]em)`, or `normal (0em)` |
| Word sp. | `[N]px ([N]em)`, or `normal (0em)` |
| Colour | swatch + `#RRGGBB`, with `rgb(...)` as a note underneath |
| — | note: `Alpha [N], so the rendered colour depends on the background.` |

| Colour | Hex | Use |
|--------|-----|-----|
| Dark | `#111111` | panel surface |
| Dark blue | `#0a558c` | outline on the inspected element |

---

## Inspect box model

Interactive — click to activate, then click any element. A fixed panel reports how its box is put together. Esc to stop, or re-run the bookmarklet to switch it off.

The companion to Inspect text styles. That one reports what the text inside the box looks like; this one reports the box itself. Same interaction, same panel, same no-verdicts stance, so green, amber and red are deliberately absent.

**The page is in test mode while this is on**, exactly as in Inspect text styles: pointer activation is suppressed in the capture phase so clicking a control inspects it rather than using it.

**The highlight is a box-shadow, not an outline.** Outline is one of the properties this tool measures, so drawing one would sit on top of the page's own and leave no way to tell which ring belongs to the page. A shadow takes no space either, so the numbers are unaffected.

**Rows read from the inside out**, matching the order the box is built: content area, padding, scrollbar gutter, border, outline, margin. Four-sided values collapse to CSS shorthand, so `18px 24px` when the sides pair up and `1px 2px 3px 4px` when they do not.

### The scrollbar gutter

No CSS property reports it, so it is measured by subtraction: `offsetWidth − clientWidth − left border − right border`, because `clientWidth` includes padding but excludes border and scrollbar.

The gutter sits between the inner border edge and the outer padding edge, so a scrollbar takes space from the **content area**, not from the padding. Most people assume the opposite.

Three cases are reported differently, because they mean different things:

| Condition | What the panel says |
|---|---|
| Space reserved, overflow allows a scrollbar | The gutter, with a note on where it sits |
| Scrolls, no space reserved, overflow allows a scrollbar | Overlay scrollbar. Expect a reserved gutter on Windows, and on macOS when "Show scroll bars" is set to Always |
| Scrolls, overflow is `clip` or `hidden` | No scrollbar can appear, so nothing is reserved. This is how a text input behaves |
| Space reserved, but overflow is `clip` or `hidden` | Reserved space, explicitly **not** called a scrollbar gutter, since no scrollbar can appear there |

That last row is not hypothetical. On macOS with "Show scroll bars" set to Always, Chrome reserves 16px inside every single-line text input, because its inner editor is a horizontal scroll container, and then `overflow: clip` stops the bar ever being painted. The field has 16px less usable width than its CSS says. A `<textarea>` reserves only once its content overflows, and a `<select>` reserves nothing, having no scrolling inner editor.

The same page can therefore report different numbers on different machines. That is a real platform difference, not a fault in the tool.

### The gap rows

A declared margin is often not the distance you get, so the panel measures the real gap to the nearest rendered sibling in each of the four directions, in CSS shorthand order: `Gap above`, `Gap right`, `Gap below`, `Gap left`. A direction with no sibling gets no row.

It explains any difference between the measurement and the declared margins:

- In block layout, adjacent vertical margins collapse to the larger of the two
- In flex and grid, margins do not collapse and the parent's `gap` is added on top

That second case is the one the panel could previously not see at all. Three buttons in a `display: flex` row with `gap: 16px` have no margins whatsoever, so the old panel reported `Margin: none` while 16px of real space sat either side of each button, accounted for nowhere.

**An only child borrows from its nearest ancestor.** A nav link wrapped in its own `<li>` has no siblings at all, so there is nothing to measure against, yet there is obviously space either side. In that case the panel walks up to the nearest ancestor that has siblings **and still fills the same box on the axis being measured**, and says which element it used.

That guard matters. A nav link and its `<li>` occupy an identical box, so the `li`'s 16px margin really is the space beside the link. A `<span>` inside a full-width `<p>` does not, so it gets no gap rows rather than the paragraph's gap reported as its own.

The walk only applies to a true only child. An element that has siblings but none in a particular direction is simply at the end of its row or column, and gets no row that way.

**Otherwise the gaps are sibling-based, and the panel says so.** A neighbour in a different container is a neighbour on screen but not in the tree, so it is not measured. For the 2.5.8 spacing question use Highlight target size instead, which does full circle-to-circle geometry across every target on the page regardless of nesting.

A candidate must also overlap on the perpendicular axis, so a sibling sitting in another row or column is not mistaken for a neighbour. In a two-column grid, the top-left cell correctly reports the column gap to its right and the row gap below, and nothing above or to the left.

The panel element itself is excluded from the search. It is appended to `document.body`, so without that it becomes a sibling of every top-level element and, being fixed to the top right, frequently the nearest one.

### Other notes

`Total` is the border box from `getBoundingClientRect`: content, padding and border, with margin and outline excluded.

An inline box is flagged, since vertical padding and margin are drawn but do not push the surrounding lines apart. Inline boxes report no gutter, because they have no client box for one.

Deliberately out of scope: `border-radius`, `box-shadow`, `gap` between children, position offsets and `transform`.

| Row | Value shown |
|-----|-------------|
| box-sizing | `content-box` or `border-box` |
| Content | `[W]px × [H]px`, the inner box |
| Padding | CSS shorthand, or `none` |
| Scrollbar gutter | `[N]px vertical`, `[N]px horizontal`, or `none` |
| Border | shorthand widths plus style, or `none` |
| Outline | `[N]px [style], offset [N]px`, or `none` |
| Margin | CSS shorthand, or `none` |
| Total | `[W]px × [H]px`, border box |
| Gap above / right / below / left | measured distance to the nearest rendered sibling in that direction, omitted where there is none |

| Colour | Hex | Use |
|--------|-----|-----|
| Dark | `#111111` | panel surface |
| Dark blue | `#0a558c` | box-shadow highlight on the inspected element |

---

## Highlight accessible names

Interactive — click to activate, then Tab through the page. One badge at a time, on the element that has focus. Esc to stop, or re-run the bookmarklet to switch it off.

The general counterpart to the links, buttons and form field names bookmarklets. Those three cover one element type each in detail; this one follows the name wherever focus goes, so a student can see the precedence chain applied across a whole form or page in one pass.

Source precedence, highest first: `aria-labelledby`, `aria-label`, `label` / implicit label, content, `value`, `alt`, default (Submit / Reset), `title`, `placeholder`.

`title` and `placeholder` are amber. Both are unreliable name sources: `title` is not shown on touch and is inconsistently announced, and `placeholder` disappears as soon as the field has content.

Content includes image `alt`, so an icon button or a logo link resolves rather than reporting no name. The badge carries the tag name, since precedence differs by element type.

**This is a simplified name computation.** The browser's accessibility tree is not exposed to JavaScript, so this is a teaching aid rather than an authority. Check anything surprising in a real screen reader.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | `<tag>` aria-labelledby: [name] |
| Dark green | `#1b5e20` | `<tag>` aria-label: [name] |
| Dark green | `#1b5e20` | `<tag>` label: [name] |
| Dark green | `#1b5e20` | `<tag>` label ×[N]: [joined name] |
| Dark green | `#1b5e20` | `<tag>` implicit label: [name] |
| Dark green | `#1b5e20` | `<tag>` content: [name] |
| Dark green | `#1b5e20` | `<tag>` value: [name] |
| Dark green | `#1b5e20` | `<tag>` alt: [name] |
| Dark green | `#1b5e20` | `<tag>` default: Submit / default: Reset |
| Amber | `#e65100` | `<tag>` title: [name] (unreliable name source) |
| Amber | `#e65100` | `<tag>` placeholder: [name] (unreliable name source) |
| Red | `#b00020` | `<tag>` NO ACCESSIBLE NAME |

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
`radiogroup` requires an accessible name. `group` does not, so an unnamed group is blue: information, not a caution.

A correctly named group is green whether it is a native `<fieldset>` with a `<legend>` or an ARIA role. Amber on the ARIA versions implied they were worse than the native equivalent, which is not what this bookmarklet is saying.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | Fieldset |
| Dark green | `#1b5e20` | Fieldset (named by aria-label): [name] |
| Dark green | `#1b5e20` | Fieldset (named by aria-labelledby): [name] |
| Red | `#b00020` | Fieldset (no legend) |
| Red | `#b00020` | Fieldset (legend is not the first child) |
| Dark blue | `#0a558c` | Legend: [text] |
| Amber | `#e65100` | Legend: [text] (not the first child of a fieldset) |
| Dark green | `#1b5e20` | role="radiogroup": [name] |
| Red | `#b00020` | role="radiogroup" NO ACCESSIBLE NAME |
| Dark green | `#1b5e20` | role="group": [name] |
| Dark blue | `#0a558c` | role="group" (no accessible name, not required) |

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

Native `readonly` (`<input>`, `<textarea>`) is browser-enforced and implicitly sets `aria-readonly="true"` in the accessibility tree — no ARIA needed. `aria-readonly="true"` alone only affects the AT announcement; it does not stop the user typing unless the field is also restricted some other way. Teaching bookmarklet — the blue badge is deliberately informational rather than pass/fail, and the badge text carries the lesson rather than leaving it to the colour. Blue on its own reads as "fine", which is the opposite of the point: `aria-readonly="true"` changes what assistive technology announces and does nothing to stop the user typing.

`readonly` only does something on `<textarea>` and text-like `<input>` types (`text`, `search`, `url`, `tel`, `email`, `password`, `date`, `month`, `week`, `time`, `datetime-local`, `number`). On a `<select>`, a checkbox, a radio or anything else it has no effect, which is flagged.
`aria-readonly` is only supported on `checkbox`, `combobox`, `grid`, `gridcell`, `listbox`, `radiogroup`, `slider`, `spinbutton`, `textbox`, `columnheader`, `rowheader` and `treegrid`, plus the native controls carrying those roles implicitly.
Elements that are not rendered are skipped.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | readonly (enforced by the browser and announced) |
| Dark blue | `#0a558c` | aria-readonly="true" (announced only — does not prevent typing) |
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
| Dark green | `#1b5e20` | aria-expanded="undefined" (same as omitting the attribute) |
| Red | `#b00020` | aria-expanded="[value]" (INVALID VALUE) |

---

## Highlight aria-checked

Re-run after interacting with a widget to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-checked="true" |
| Amber | `#e65100` | aria-checked="false" |
| Dark blue | `#0a558c` | aria-checked="mixed" |
| Dark green | `#1b5e20` | aria-checked="undefined" (same as omitting the attribute) |
| Red | `#b00020` | aria-checked="[value]" (INVALID VALUE) |

---

## Highlight aria-pressed

Intended for toggle buttons — `<button>` or elements with `role="button"`. Re-run after interacting to see updated values.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-pressed="true" |
| Amber | `#e65100` | aria-pressed="false" |
| Dark blue | `#0a558c` | aria-pressed="mixed" |
| Dark green | `#1b5e20` | aria-pressed="undefined" (same as omitting the attribute) |
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
Missing IDs annotated inline in the source badge. Referenced elements that are not rendered are valid (e.g. a collapsed panel) and noted silently without a badge.

Where only some IDs are missing the badge is amber; where all are missing it is red. One stale reference is not the same as a relationship that resolves to nothing. This matches the aria-details bookmarklet, and it reads better for the documented dynamic-insertion case, where a panel inserted on first activation is legitimately missing until it exists.

| Colour | Hex | Badge text |
|--------|-----|------------|
| Dark green | `#1b5e20` | aria-controls: [id] |
| Dark green | `#1b5e20` | aria-controls: [id1] [id2] |
| Dark green | `#1b5e20` | aria-controls: [id] (self) |
| Amber | `#e65100` | aria-controls: [id] [id] (missing) |
| Red | `#b00020` | aria-controls: [id] (missing) (all missing) |
| Red | `#b00020` | aria-controls: (empty) |
| Dark blue | `#0a558c` | ID: [id] (on referenced element) |
| Dark blue | `#0a558c` | ID: [id] (self) (on a self-referencing element) |

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

## ContrastChecker

Built by Ani Chiang. This is the one bookmarklet in the set that is not single-purpose: it is a full tool with panels, eyedroppers, keyboard shortcuts and a copy function, rather than a one-concept teaching aid. Its source is maintained separately, so the files here are overwritten from Ani's master rather than edited in place, and it does not follow the colour or badge conventions described above.

This bookmarklet allows you to check the contrast between two colours by either sampling the colours with an eyedropper or directly inputting values. The checker will automatically calculate the contrast ratio and give a pass or fail status for 3:1, 4.5:1 and 7:1. Created for and works best on Windows/Chrome.

Features:

* Accepts HEX, HEXA, RGB, RGBA values
* Has a 'HEX:left_right_arrow:RGB' convert toggle for quick conversion
* Supports keyboard shortcuts for Eyedroppers, Reset, Convert, Copy, Toggle panel and Close
* With eyedropper keyboard shortcut, allows capture of elusive focus style and on hover elements
* Has a ‘Reset’ button to quickly reset the colour values
* Has a ‘Copy’ button to copy the colour values and contrast details onto the clipboard
* Has an expandable 'Explanation' section with links to the WCAG understanding docs
* Able to toggle between top and side panels
* Panel edges are resizable by dragging, keyboard, and onscreen buttons
* Multiple ways to close the bookmarklet (toggle off, click the ‘X' button or press ‘Esc’)
* Accessibility tested


---
