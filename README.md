# HTML email accessibility tester

A free, single-page tool for checking the accessibility of HTML email markup. Paste your email's HTML, or upload an `.html` file, and get a plain-language accessibility report back instantly.

Built to replace [accessible-email.org](https://www.accessible-email.org/) for use in Intopia's accessibility training, which was prone to downtime and had a dated, hard-to-use interface.

## Try it

Open `index.html` in any browser. That's it, no install, no build step, no server.

*(If hosting via GitHub Pages, link goes here.)*

## How it works

- Paste HTML, or upload a `.html` file (read locally in the browser via the File API)
- Click **Run accessibility tests**
- Get a summary of 10 tests, each with a Pass / Fail / Needs review / Not tested badge, plus a detailed breakdown underneath

**Nothing you paste or upload is sent anywhere.** The whole tool is a single HTML file with inline CSS and JavaScript, everything runs client-side in your own browser.

## What it tests

1. Document title
2. Document language
3. Document encoding
4. Headings (present, and no skipped levels)
5. Links (accessible name present and unique)
6. Images (alt attribute present; empty alt treated as valid decorative)
7. Tables (either a marked-up layout table, or a real data table with a caption and header cells)
8. Landmarks (banner/main/contentinfo used correctly, no invalid nesting or duplication)
9. Duplicate IDs
10. Colour contrast (real WCAG contrast ratio maths against inline colours)

Each test is a concrete, deterministic check, not a subjective quality score, so results are consistent and explainable.

## Test files

The `test-files/` and `landmark-test-files/` folders contain small, single-purpose HTML files, each one built to trigger exactly one pass or fail state. Useful for demoing the tool, or for verifying a change hasn't broken a specific test.

## Tech

Vanilla HTML, CSS and JavaScript. No frameworks, no dependencies, no build tooling.

Curious exactly how each test decides pass or fail, and what happens step by step when you click Run? See [how-it-works.md](how-it-works.md).

## Feedback

This is an early, public release. Issues and suggestions welcome, this tool exists to be genuinely useful in real training and real audits, so practical feedback is especially appreciated.

## Author

Built by [Russ Weakley](https://maxdesign.com.au) / [Intopia](https://intopia.digital) for the "Testing web accessibility for teams" course.
