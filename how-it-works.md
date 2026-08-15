# How the tester works

Background notes on what actually happens when someone runs a test, and how each of the 10 tests decides pass or fail. Written for anyone curious about the mechanics, not required reading to use the tool.

The whole tool is a single HTML file, plain JavaScript, no framework, no external testing library. Everything below happens entirely in the browser, nothing is sent anywhere.

## The process, from submit to results screen

**Getting content into the textarea (two paths, either works)**

1. **Paste path** — the person types or pastes directly into the textarea. No JavaScript runs at this point, it's just a normal form field until the button is clicked.
2. **File path** — selecting a file fires a `change` event. A `FileReader` reads the file's contents as text, and once read, that text is written into the *same* textarea Option 1 uses. Any earlier error state is cleared. Nothing else happens yet, no parsing, no tests, it's just sitting in the box exactly as if it had been pasted.

**On clicking "Run accessibility tests"**

3. **Validate** — is the textarea empty (after trimming whitespace)? If so: show the inline error message, mark the textarea invalid, move focus to the textarea, and stop. Nothing past this point runs.
4. **Clear error state** — if there was content, any previous error message or invalid state is cleared.
5. **Parse** — the raw HTML string is turned into an actual DOM document using the browser's built-in `DOMParser`. This document is detached, never inserted into the live page, so nothing in the pasted markup can execute, no scripts run, no styles apply to the real page.
6. **Run all checks** — that parsed document is handed to one function that runs all 10 tests against it in turn. Each test is independent, walks the DOM looking for whatever it's specifically checking, and returns structured findings (for example: "these are the headings, and this one skips a level" or "these are the links, and this one has no accessible name").
7. **Compute statuses** — each test's raw findings are turned into one verdict: Pass, Fail, Needs review, or Not tested, based on that test's own rules.
8. **Render the report** — using those findings and verdicts, the results screen is built: the 10-item summary list of badges, then each detailed test section underneath.
9. **Swap screens** — the paste screen is hidden, the results screen is revealed.
10. **Move focus** — focus is sent to the visible "Results" heading, so both keyboard and screen reader users land somewhere meaningful rather than focus staying stuck on the button or resetting to the top of the page.

## How each test works

None of the tests involve judgment or interpretation. Each one asks a specific, factual question about the HTML structure, counts something, compares strings, checks DOM ancestry, or runs a fixed formula, and the pass/fail result falls directly out of the answer.

**1. Document title** — is there a `<title>` element in the `<head>`, and does it contain actual text once whitespace is trimmed?

**2. Document language** — does the `<html>` element carry a non-empty `lang` attribute?

**3. Document encoding** — is there a `<meta charset>` tag, or a `<meta http-equiv="Content-Type">` tag whose `content` value includes a charset?

**4. Headings** — walk through every heading in document order, tracking the previous heading's level. If the current heading jumps down more than one level from the last one (h2 straight to h4, for example), it's flagged. Going back up any number of levels is fine. No headings at all is a fail, not just "not tested."

**5. Links** — for each link, its accessible name is computed by checking, in order: `aria-labelledby`, then `aria-label`, then the link's own visible text (including any image `alt` text inside it), then `title`, stopping at the first one that has content. This is the same priority order a screen reader uses. Once every link has a computed name, a second pass checks whether that name is empty, and whether the exact same name is used by more than one link on the page.

**6. Images** — does every `<img>` have an `alt` attribute at all? Present but empty is treated as valid (a decorative image), missing entirely is a fail.

**7. Tables** — every table is expected to be one of two things: a layout table (`role="presentation"` or `role="none"`), or a real data table (has both a `<caption>` and at least one `<th>`). A table that's neither is flagged, with the flag naming both possible fixes.

**8. Landmarks** — detects both native elements (`header`, `footer`, `main`, `nav`, `aside`, named `form`/`section`) and explicit `role` attributes. Checks are structural: does `.contains()` show a banner or contentinfo landmark sitting inside another landmark? Is there more than one banner, main, or contentinfo? Are there multiple landmarks of the same repeatable role (like `nav`) without unique names to tell them apart? No landmarks present at all returns "Not tested" rather than a fail.

**9. Duplicate IDs** — every element with an `id` is collected, and any `id` value that appears more than once is flagged. Zero ids present is a genuine Pass (zero ids means zero duplicates), not "Not tested."

**10. Colour contrast** — the one test doing real maths rather than structural checks. For text with an inline `color` set, the nearest background colour is found by walking up the DOM until an ancestor with an explicit `background-color` (or legacy `bgcolor`) is found, defaulting to white if none exists. Both colours are converted to the WCAG relative luminance formula, and the contrast ratio between them is calculated. That ratio is compared against 4.5:1 for normal text or 3:1 for large or bold text, per the actual WCAG success criteria, not an approximation of them.
