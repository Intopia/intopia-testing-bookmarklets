# Bookmarklet descriptions

The following are short descriptions for each bookmarklet for this page:
https://intopia.github.io/exercise/testing-bookmarklets-intopia.html

## 1. Highlight headings
Highlights all heading levels (H1–H6) with distinct colours. Flags empty headings and duplicate <h1> elements.

## 2. Highlight image alternatives
Highlights `<img>` elements and elements with `role="img"`. Distinguishes between meaningful `alt` text, empty `alt` and missing `alt`, and shows where `aria-label` or `aria-labelledby` override the `alt` attribute. Flags images made decorative by `role="presentation"`, and names that come from `title` alone.

## 3. Highlight lists
Highlights native list elements and ARIA list roles with distinct colours per type. Flags lists made non-lists by `role="presentation"`, and list items that sit outside a list they can belong to.

## 4. Highlight landmarks
Highlights all landmark regions with distinct colours per role. Shows accessible name where present.

## 5. Highlight page language
Highlights the page language defined on the `<html>` element. Validates the lang value against the BCP 47 grammar and flags missing, empty and not well-formed values, separately from values that are well-formed but use an unrecognised language subtag. Also flags grandfathered and private use tags, and highlights inline `lang` attributes on page elements.

## 6. Highlight document title
Displays the document title from the `<title>` element as a fixed banner at the top of the page. Flags missing titles, empty titles, and pages with more than one `<title>` element. Click to activate, Esc to clear.

## 7. Highlight page encoding
Displays the character encoding declaration as a fixed banner at the top of the page. Detects both `<meta charset>` and `http-equiv Content-Type` forms. Flags missing, empty and non-UTF-8 declarations, duplicate and conflicting declarations, and charset outside `<head>`. Where more than one message applies, banners stack. Click to activate, Esc to clear.

## 8. Highlight captions and headers
Highlights accessibility features within tables. Shows header cells with and without `scope`, and flags invalid `scope` values and tables missing a `<caption>`. `scope` is not required in simple tables, so a header cell without it is shown rather than flagged.
Click to activate, then press 1 through 3 in order to step through `<table>`, `<caption>` and `<th>` elements individually. Press `n` to step through each element type in sequence.

## 9. Highlight table IDs and headers
Highlights the relationship between `headers` and ids within complex tables.
Click to activate, then press `TAB` or `n` to move through each cell. Related header cells are outlined and numbered, and the same numbers appear on the focused cell's badge. Flags header references that are missing or point at something that is not a table cell. Re-run the bookmarklet to switch it off.

## 10. Highlight ARIA table roles
Highlights ARIA roles relating to tables.
Click to activate, then press `1` through `6` in order to step through the `role` hierarchy from container to cell. Press `n` to step through each role type in sequence. Note: re-run the bookmarklet after sorting to see updated `aria-sort` values.

## 11. Track focus order
Tracks each focusable element on the page. Click to activate, then `TAB` through the page. Each element is numbered in order and keeps its number, so the whole sequence stays visible as a trail. Flags focus stops on elements that are not rendered. `ESC` to stop.

## 12. Highlight tabindex
Highlights all tabindex attributes. Distinguishes between `tabindex="0"` (in natural tab order), `tabindex="-1"` (removed from tab order) and positive values (avoid — overrides natural tab order). Flags values the browser cannot parse, which make the element not focusable at all, `tabindex="0"` where it is redundant, and focus stops on elements with no role and no accessible name.

## 13. Highlight aria-label
Highlights all elements with `aria-label`. Flags empty values and use on roles where author-provided names are prohibited, following the ARIA 1.2 and 1.3 tables. An explicit role overrides the implicit one, so a `<span role="button">` may be named.

## 14. Highlight aria-labelledby
Highlights elements with `aria-labelledby` and their targets. Shows the accessible name resolved from the referenced IDs. Flags missing IDs, self-references and an empty attribute value. Hidden referenced elements still contribute their text, and are outlined only where they are visible on the page.

## 15. Highlight aria-describedby
Highlights elements with `aria-describedby` and their targets. Shows the description resolved from the referenced IDs. Flags missing IDs, self-references and an empty attribute value. Hidden referenced elements still contribute their text, and are outlined only where they are visible on the page.

## 16. Highlight name mismatches
Highlights links and buttons where the visible label and accessible name don’t match, following WCAG 2.5.3 Label in Name. Distinguishes a name that extends the visible label from one that merely contains it, and from a genuine mismatch. Visible text includes image `alt`. Where there is no visible text label, 2.5.3 does not apply and the badge says so.

## 17. Highlight name-prohibited roles
Highlights elements with `aria-label` or `aria-labelledby` on roles that must not have an author-provided name, following the ARIA 1.2 and 1.3 tables. Covers both explicit roles and elements whose implicit role is name-prohibited.

## 18. Highlight form field names
Highlights form fields and their accessible names. Flags fields with no name, and fields where the name comes from an unreliable source such as `placeholder` or `title`.

## 19. Highlight buttons
Highlights native buttons and elements with `role="button"`, and their accessible names. Covers `<button>` and `input` types `submit`, `reset`, `button` and `image`. Custom buttons are marked with a `[role="button"]` suffix. Flags buttons with no accessible name, and names that come from `title` alone.

## 20. Highlight fieldsets
Highlights `<fieldset>`, `<legend>`, `radiogroup` and `group` elements. Flags fieldsets with no accessible name, and legends that are not the first child of their fieldset and so do not label it. A fieldset named by `aria-label` or `aria-labelledby` is not flagged. An unnamed `radiogroup` is flagged, since that role requires a name; an unnamed `group` is not.

## 21. Highlight required fields
Highlights required form fields. Distinguishes between native `required`, `aria-required`, and redundant, conflicting and invalid combinations. Flags cases where `required` has no effect at all, such as on a range input or a button.

## 22. Highlight readonly fields
Highlights native `readonly` and `aria-readonly` for teaching purposes. Native `readonly` is browser-enforced and automatically announced correctly to AT, no ARIA needed. `aria-readonly="true"` alone only affects the AT announcement — it does not stop the user typing unless the field is functionally restricted some other way. Flags the redundant and conflicting combinations, invalid values, and cases where the attribute has no effect at all, such as `readonly` on a `<select>` or a checkbox, or `aria-readonly` on a role that does not support it.

## 23. Highlight aria-invalid
Highlights all `aria-invalid` states: `true`, `grammar`, `spelling` and `false`. Flags empty and unrecognised values.

## 24. Highlight autocomplete
Highlights `autocomplete` attributes. Flags valid, generic and invalid values with distinct colours. Follows the HTML autofill grammar, including section, shipping and billing, contact tokens and `webauthn`.

## 25. Highlight aria-expanded
Highlights all `aria-expanded` attributes. Distinguishes between `true` (expanded) and `false` (collapsed) states. `undefined` is also a valid value. Re-run after activating a widget to see updated values.

## 26. Highlight aria-checked
Highlights all `aria-checked` attributes on custom widgets. Distinguishes between `true`, `false` and `mixed` states. `undefined` is also a valid value. Re-run after interacting with a widget to see updated values.

## 27. Highlight aria-pressed
Highlights all `aria-pressed` attributes on custom toggle buttons. Distinguishes between `true` (pressed), `false` (not pressed) and `mixed` states. `undefined` is also a valid value. Re-run after interacting with a widget to see updated values.

## 28. Highlight aria-roledescription
Highlights all elements with `aria-roledescription`. Shows the custom role description value. Flags empty values, elements with no underlying role, and elements whose role has no semantics of its own (`generic`, `presentation`, `none`). Both are a misuse of the attribute.

## 29. Highlight aria-details
Highlights all elements with `aria-details` and their referenced targets. Shows whether each referenced element exists in the page. Flags missing IDs, self-references and an empty attribute value. Where only some IDs are missing the badge is amber; where all are missing it is red.

## 30. Highlight aria-valuetext
Highlights all elements with `aria-valuetext`. Shows the text alternative value that assistive technologies announce instead of the numeric `aria-valuenow`. Flags empty values, and a missing or empty `aria-valuenow`, which ARIA requires wherever `aria-valuetext` is used. Re-run after interacting with a widget to see updated values.

## 31. Highlight aria-valuenow
Highlights all elements with `aria-valuenow`. Shows the current numeric value of a range widget such as a slider or spinbutton. Flags empty and non-numeric values, and a value that falls outside a declared `aria-valuemin` to `aria-valuemax` range. Re-run after interacting with a widget to see updated values.

## 32. Highlight aria-valuemin and aria-valuemax
Highlights all elements with `aria-valuemin` and/or `aria-valuemax`. Shows both values together on each element. Flags incomplete pairs where only one attribute is present, non-numeric values, an inverted range where the minimum exceeds the maximum, and an empty range where the two are equal.

## 33. Highlight aria-setsize and aria-posinset
Highlights all elements with `aria-setsize` and `aria-posinset`. Shows the position of each item within its sibling group. Where aria-level is also present, shows the level alongside the position. Flags incomplete pairs, non-integer values, and a position that exceeds the size of the set.

## 34. Highlight aria-level
Highlights all elements with `aria-level`. Shows the level value on each element. Flags values above 6 where browser support is inconsistent, and invalid values such as zero, negative numbers and non-integers.

## 35. Highlight aria-controls
Highlights elements with `aria-controls` and their referenced targets. Shows whether each referenced element exists in the page. Flags missing IDs, self-references and empty values. Where only some IDs are missing the badge is amber; where all are missing it is red. If the controlled element is initially hidden, re-run the bookmarklet after activating the trigger to see the highlighted relationship. Note: if the controlled element is inserted into the DOM dynamically on first activation, the bookmarklet will flag it as a missing ID until the element exists. Re-run after triggering to confirm the reference resolves correctly.

## 36. Highlight aria-haspopup
Highlights all elements with `aria-haspopup`. All seven recognised values are displayed: `false`, `true`, `menu`, `listbox`, `tree`, `grid` and `dialog`. Flags empty and unrecognised values.

## 37. Highlight shadow DOM
Reports whether shadow DOM on this page will hide content from extension-based testing tools. Walks into open shadow roots recursively and counts how many elements sit inside them. Highlights open shadow hosts, custom elements whose shadow DOM cannot be confirmed because a closed root is undetectable, and undefined custom elements whose script may not have loaded. The summary panel is the main output.

## 38. Highlight links
Highlights `<a>` elements and elements with `role="link"`. Resolves the accessible name from any source (text content, image alt, aria-label, aria-labelledby). Flags duplicate names pointing to different URLs, links named by title only, title attribute mismatches, empty href and missing href. Click to activate, Esc to clear.
