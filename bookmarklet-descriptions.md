# Bookmarklet descriptions

The following are short descriptions for each bookmarklet for this page:
https://intopia.github.io/exercise/testing-bookmarklets-intopia.html

## 1. Highlight headings
Highlights all heading levels (H1–H6) with distinct colours. Flags empty headings and duplicate <h1> elements.

## 2. Highlight image alternatives
Highlights all images. Distinguishes between meaningful `alt` text, empty `alt` and missing `alt`.

## 3. Highlight lists
Highlights native list elements and ARIA list roles with distinct colours per type.

## 4. Highlight landmarks
Highlights all landmark regions with distinct colours per role. Shows accessible name where present.

## 5. Highlight page language
Highlights the page language defined on the `<html>` element. Validates the lang value against BCP 47 and flags missing, empty or unrecognised language codes. Also highlights inline `lang` attributes on page elements.

## 6. Highlight document title
Displays the document title from the `<title>` element as a fixed banner at the top of the page. Flags missing titles, empty titles, and pages with more than one `<title>` element. Click to activate, Esc to clear.

## 7. Highlight page encoding
Displays the character encoding declaration as a fixed banner at the top of the page. Detects both `<meta charset>` and `http-equiv Content-Type` forms. Flags missing, empty and non-UTF-8 declarations, conflicting declarations and charset outside `<head>`. Click to activate, Esc to clear.

## 8. Highlight captions and headers
Highlights accessibility features within tables. Flags header cells with and without `scope`, and tables missing a `<caption>`.
Click to activate, then press 1 through 3 in order to step through `<table>`, `<caption>` and `<th>` elements individually. Press `n` to step through each element type in sequence.

## 9. Highlight table IDs and headers
Highlights the relationship between `headers` and ids within complex tables.
Click to activate, then press `TAB` or `n` to move through each cell. Related Headers and IDs are highlited.

## 10. Highlight ARIA table roles
Highlights ARIA roles relating to tables.
Click to activate, then press `1` through `6` in order to step through the `role` hierarchy from container to cell. Press `n` to step through each role type in sequence. Note: re-run the bookmarklet after sorting to see updated `aria-sort` values.

## 11. Track focus order
Tracks each focusable element on the page. Click to activate, then `TAB` through the page. Each element is numbered in order. `ESC` to stop.

## 12. Highlight tabindex
Highlights all tabindex attributes. Distinguishes between `tabindex="0"` (in natural tab order), `tabindex="-1"` (removed from tab order) and positive values (avoid — overrides natural tab order).

## 13. Highlight aria-label
Highlights all elements with `aria-label`. Flags empty values and use on roles where author-provided names are prohibited.

## 14. Highlight aria-labelledby
Highlights elements with `aria-labelledby` and their targets. Flags missing, hidden and self-referencing IDs.

## 15. Highlight aria-describedby
Highlights elements with `aria-describedby` and their targets. Flags missing, hidden and self-referencing IDs.

## 16. Highlight name mismatches
Highlights links and buttons where the visible label and accessible name don’t match.

## 17. Highlight name-prohibited roles
Highlights elements with `aria-label` or `aria-labelledby` on roles that must not have an author-provided name.

## 18. Highlight form field names
Highlights form fields and their accessible names. Flags fields with no name, and fields where the name comes from an unreliable source such as `placeholder` or `title`.

## 19. Highlight buttons
Highlights all buttons and their accessible names. Flags buttons with no accessible name.

## 20. Highlight fieldsets
Highlights `<fieldset>`, `<legend>` and `radiogroup` elements. Flags `<fieldset>` elements missing a `<legend>`.

## 21. Highlight required fields
Highlights required form fields. Distinguishes between native `required`, `aria-required`, and redundant combinations.

## 22. Highlight readonly fields
Highlights native `readonly` and `aria-readonly` for teaching purposes. Native `readonly` is browser-enforced and automatically announced correctly to AT, no ARIA needed. `aria-readonly="true"` alone only affects the AT announcement — it does not stop the user typing unless the field is functionally restricted some other way. Flags the redundant and conflicting combinations, and invalid values.

## 23. Highlight aria-invalid
Highlights all `aria-invalid` states: `true`, `grammar`, `spelling` and `false`.

## 24. Highlight autocomplete
Highlights `autocomplete` attributes. Flags valid, generic and invalid values with distinct colours.

## 25. Highlight aria-expanded
Highlights all `aria-expanded` attributes. Distinguishes between `true` (expanded) and `false` (collapsed) states. Re-run after activating a widget to see updated values.

## 26. Highlight aria-checked
Highlights all `aria-checked` attributes on custom widgets. Distinguishes between `true`, `false` and `mixed` states. Re-run after interacting with a widget to see updated values.

## 27. Highlight aria-pressed
Highlights all `aria-pressed` attributes on custom toggle buttons. Distinguishes between `true` (pressed), `false` (not pressed) and `mixed` states. Re-run after interacting with a widget to see updated values.

## 28. Highlight aria-roledescription
Highlights all elements with `aria-roledescription`. Shows the custom role description value. Flags empty values and elements where `aria-roledescription` has been applied without an underlying role, which is a misuse of the attribute.

## 29. Highlight aria-details
Highlights all elements with `aria-details` and their referenced targets. Shows whether each referenced element exists in the page. Flags missing IDs.

## 30. Highlight aria-valuetext
Highlights all elements with `aria-valuetext`. Shows the text alternative value that assistive technologies announce instead of the numeric `aria-valuenow`. Flags empty values.

## 31. Highlight aria-valuenow
Highlights all elements with `aria-valuenow`. Shows the current numeric value of a range widget such as a slider or spinbutton. Flags empty and non-numeric values.

## 32. Highlight aria-valuemin and aria-valuemax
Highlights all elements with `aria-valuemin` and/or `aria-valuemax`. Shows both values together on each element. Flags incomplete pairs where only one attribute is present, and non-numeric values.

## 33. Highlight aria-setsize and aria-posinset
Highlights all elements with `aria-setsize` and `aria-posinset`. Shows the position of each item within its sibling group. Where aria-level is also present, shows the level alongside the position. Flags incomplete pairs and non-numeric values.

## 34. Highlight aria-level
Highlights all elements with `aria-level`. Shows the level value on each element. Flags values above 6 where browser support is inconsistent, and invalid values such as zero, negative numbers and non-integers.

## 35. Highlight aria-controls
Highlights elements with `aria-controls` and their referenced targets. Shows whether each referenced element exists in the page. Flags missing and empty values. If the controlled element is initially hidden, re-run the bookmarklet after activating the trigger to see the highlighted relationship. Note: if the controlled element is inserted into the DOM dynamically on first activation, the bookmarklet will flag it as a missing ID until the element exists. Re-run after triggering to confirm the reference resolves correctly.

## 36. Highlight aria-haspopup
Highlights all elements with `aria-haspopup`. All seven recognised values are displayed: `false`, `true`, `menu`, `listbox`, `tree`, `grid` and `dialog`. Flags empty and unrecognised values.

## 37. Highlight shadow DOM
Highlights open shadow DOM hosts and custom elements. Flags where shadow DOM cannot be confirmed.

## 38. Highlight links
Highlights all links on the page. Resolves the accessible name from any source (text content, aria-label, aria-labelledby). Flags duplicate names pointing to different URLs, links named by title only, title attribute mismatches, empty href and missing href. Click to activate, Esc to clear.
