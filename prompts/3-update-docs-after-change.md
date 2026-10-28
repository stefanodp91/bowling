# 3 · Update the documentation after a change

Instantiated for this repository from procedure 3 of [`generic-prompts.it.md`](generic-prompts.it.md).
Placeholders, filled:

| Placeholder | Here |
|---|---|
| `<PROJECT DOCUMENTATION>` | [`wiki/`](../wiki/index.md) |
| `<COMMAND THAT CROSSES THE DIFF WITH THE PAGES>` | `npm run wiki:touched` |
| `<DOCUMENTATION CHECKS: lint, links, indexes>` | `npm run wiki:lint` (front matter, links, index freshness, `check-acceptance`) |

```text
You have just changed the code. Before closing:

1. Find the wiki pages that describe the changed files (npm run wiki:touched, or by hand). List
   also the important files that no page describes.
2. Compare every page with the new code. Update it only after checking it, and set its
   verified: date. Never edit an «Acceptance criteria» section: if the code cannot meet a
   criterion, that goes to wiki/review.md «To judge».
3. If establishing a fact required reading more than two files, and that fact is written
   nowhere, write it. Write the conclusion in the present tense, not the story of the
   investigation: the story goes in the log.
4. Add one line to wiki/log.md.
5. Run npm run wiki:lint and do not close until it is green.
```
