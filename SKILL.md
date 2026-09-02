---
name: bookmarklet-generation
description: Generate or update accessibility testing bookmarklets for the Intopia testing-bookmarklets library. Use when asked to create, add, fix, or update a bookmarklet that highlights an HTML or ARIA feature directly on a page.
---

# Bookmarklet generation

## When to use this skill

Trigger on requests like "create a bookmarklet for aria-X", "add a bookmarklet that highlights Y", "fix the [name] bookmarklet", or "update [name] to also flag Z".

Not for: test or exercise page creation (separate skill), README or descriptions edits made in isolation without a code change, or general accessibility Q&A unrelated to this repo.

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

Use the core four (green, blue, amber, red) for anything with a clear valid / informational / caution / invalid structure. Only reach for the extended five when a bookmarklet needs more than four visually distinct categories at once (landmarks, ARIA table role hierarchy).

Blue is not a lesser green. It carries two distinct jobs: the referenced element in a relationship bookmarklet, and a deliberately non-verdict informational state where a pass or fail judgement would be misleading (see `highlight-readonly-fields`). Do not substitute blue for green as a softer pass.

### Badge text conventions

- **Informational**: sentence case, source first. `aria-label: Close`
- **Diagnostic verdict**: all caps, verdict first. `NO ACCESSIBLE NAME`, `MISMATCH: Hello`

---

## Architectural rules (apply to every bookmarklet)

- Use an overlay div for all badges, never inject directly into the DOM.
- Esc clears the overlay. Re-running removes the previous overlay before drawing the new one.
- **Exception:** document-level banners append directly to `document.body`, not the overlay div, to avoid `position: fixed` being affected by CSS transforms on ancestor elements. This applies to page language, document title and page encoding. Any future document-level bookmarklet follows the same rule, and gets no element outline, because there is no visible element to outline.
- Dense and table bookmarklets use keyboard number filters with a fixed legend panel, progressive enhancement style. All groups on by default unless a specific group is explicitly opt-in (for example `scope` on the captions and headers bookmarklet).
- A number key isolates its group. Pressing the same key again restores the default view. `n` cycles through groups in sequence.
- **Relationship bookmarklets** (labelledby, describedby, details, controls): source element gets a green badge and outline, referenced elements get blue. Missing IDs are annotated inline on the source badge, not as a separate error. Hidden referenced elements (for example a collapsed panel) are valid and noted silently, with no floating badge at 0,0.
- **State bookmarklets** (expanded, checked, pressed): badges reflect DOM state at the moment the bookmarklet runs, not live. Always note "re-run after interacting with the widget to see updated values" in both the JS comment header and the description.
- **Dynamically inserted targets** (for example `aria-controls` pointing at an element not yet in the DOM): flag as missing on first run. This is correct behaviour reflecting what AT sees at that moment, not a bug. Note it explicitly rather than trying to "fix" it.
- **Duplicate document-level elements** (more than one `<title>`, conflicting charset declarations) are amber, not red. The page still works and one declaration wins, so this is a caution rather than a failure.

---

## Minification (terser via Node)

Gotcha: terser can rename variables to the same single letter, causing temporal dead zone errors.

Fix: use `mangle: { reserved: ['functionName'] }` for key functions, and prefer `var` over `const` / `let` inside `forEach` callbacks.

---

## Repo structure

```
intopia-testing-bookmarklets/
├── README.md              ← full badge reference, one section per bookmarklet
├── src/
│   └── [name].js          ← readable source, comment header
└── dist/
    ├── testing-bookmarklets.html
    └── hrefs/
        └── [name].txt     ← ready-to-paste <a> tag
```

The exercise repo (`intopia.github.io/exercise/`) is the published product. It holds the live `testing-bookmarklets-intopia.html` and `bookmarklet-descriptions.md`. This repo is source and build artefacts.

---

## Building a new bookmarklet

1. Confirm the aim: which ARIA attribute or HTML feature, and which states and edge cases it needs to flag. Ask if the badge states are not already obvious from a similar existing bookmarklet.
2. Check `README.md` for the closest existing bookmarklet in the same category (relationship, state, table, document-level) and follow its badge pattern rather than inventing a new one.
3. Write readable JS source with a comment header, to `src/[name].js`.
4. Minify with terser, encode, and produce the ready-to-paste tag: `<a class="bookmarklet" href="javascript:...">`. Save to `dist/hrefs/[name].txt`.
5. Add a new section to the README badge reference, matching the existing table format (colour, hex, badge text), and close it with a `---` separator like every other section.
6. Add the bookmarklet to the numbered list at the top of the README, in the same position it occupies in the badge reference.
7. Add a numbered plain-language entry to `bookmarklet-descriptions.md`, matching the tone and length of existing entries. Include activation instructions (click to activate, keys, Esc) if the bookmarklet is interactive.

Pushing the href into `testing-bookmarklets-intopia.html` in the exercise repo, and building a matching test page, are separate steps outside this skill.

---

## Updating an existing bookmarklet

1. Edit `src/[name].js`.
2. Re-minify and re-encode, update `dist/hrefs/[name].txt`.
3. Update the README badge reference and the `bookmarklet-descriptions.md` entry if badges or behaviour changed.
4. Copy the updated href into `testing-bookmarklets-intopia.html` in the exercise repo.

---

## Keeping the three lists in sync

Three files hold a full list, and they must always agree: the numbered list at the top of `README.md`, the badge reference sections below it, and `bookmarklet-descriptions.md`. The `dist/hrefs/` directory is the fourth check.

Before editing any of them, re-read the file rather than working from an earlier read in the same session. When adding or removing a bookmarklet, update all three lists in the same pass and confirm the counts match. Do not state a total in prose anywhere. The numbered list is the only place a total should be derivable.

---

## Reference, not duplicated here

Full badge specs for all 37 existing bookmarklets live in `README.md`. Always check it before building a new one, both to match colour and text conventions for the relevant category, and to avoid re-describing a pattern that already has an established form.
