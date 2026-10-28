# 2 · Read before acting

Instantiated for this repository from procedure 2 of [`generic-prompts.it.md`](generic-prompts.it.md).
Placeholders, filled:

| Placeholder | Here |
|---|---|
| `<PROJECT DOCUMENTATION>` | [`wiki/`](../wiki/index.md) |
| `<COMMAND OR INDEX TO FIND THEM>` | `npm run wiki:context -- <files>`; until it exists, [`wiki/index.md`](../wiki/index.md) |

A `UserPromptSubmit` hook prints a short form of this procedure on every request
(`scripts/agents/read-first-reminder.txt`).

```text
Before changing a file or explaining how something in the project works:

1. Find the wiki pages that cover the files you will touch and the topic of the work
   (npm run wiki:context -- <files>, or wiki/index.md).
2. Read in full the pages that contain rules about those files, and of the others read only the
   part you need. Then always open the code the page points to (its canonical: list): the page
   says where to look, but the code decides.
3. If the code contradicts the page, say so: updating the page is part of the work. If the page is
   status: planned, the page is the specification and the code is what must change — unless the
   acceptance criteria are what is wrong, which goes to wiki/review.md «To judge».
4. Write which pages you read before starting and again in the final report. If no page covers
   the work, say so.

Not needed for pure operations: a commit of work already done, a known command, git.
```
