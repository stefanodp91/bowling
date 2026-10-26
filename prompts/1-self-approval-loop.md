# 1 · The self-approval loop

Instantiated for this repository from procedure 1 of [`original-it.md`](original-it.md).
Placeholders, filled:

| Placeholder | Here |
|---|---|
| `<LIST OF ITEMS TO PRODUCE>` | the wiki pages with `status: planned`, in the order given by `depends_on` ([`wiki/index.md`](../wiki/index.md)) |
| `<PROJECT DOCUMENTATION>` | [`wiki/`](../wiki/index.md) and [`AGENTS.md`](../AGENTS.md) |
| `<VERIFICATION COMMANDS>` | `npm run check`, plus every command named in the page's acceptance criteria |
| `<HOW TO LOOK>` | `npm run shot -- <target>`: a Storybook story for a model, the running game at a given metre for scene work; then open the image |
| `<REVIEW FILE>` | [`wiki/review.md`](../wiki/review.md) |

```text
Work through the wiki pages with status: planned, one page at a time, in the order of their
depends_on, without stopping until none is left.

For every page repeat this loop:

1. READ THE DOCUMENTATION AND PAST REJECTIONS
   Read AGENTS.md, the page, the pages it depends on, and the notes left by earlier rounds:
   the page's «Rounds» section and wiki/review.md, including rejections and why they happened.

2. LOOK FOR REFERENCES WITH WEB SEARCH
   Search for real sources about the item (regulation measures, photographs, how the real object
   behaves) and write what you found in the page's «References» section, as links and facts,
   before you start building. Never download images, models, fonts or sounds.

3. BUILD
   Build the item following the page's rules and AGENTS.md. Logic test-first.

4. AUTOMATIC CHECKS
   Run npm run check and every command named in the page's acceptance criteria. If they fail,
   go back to step 3.

5. LOOK AT THE RESULT AND JUDGE YOURSELF
   Look at the result as it really is (npm run shot -- <target>, then open the image; for
   behaviour, npm run pilot) and compare it with the references of step 2. Be strict: do not
   deliver anything in which you have already noticed a weakness.
   - If it does not hold: write in the page's «Rounds» section what was wrong and why, fix it
     and go back to step 3.
   - If after 3 rounds it still does not hold, or it needs a decision that is not yours (for
     example an acceptance criterion that looks wrong): do not close. Write cause, attempts and
     what is left in the «To judge» section of wiki/review.md and go to step 6.

6. CLOSE, WRITE, MOVE ON
   Set the page to status: built only if every automatic acceptance criterion passes. Update the
   wiki with what you learned (prompts/3-update-docs-after-change.md), commit, and start again
   from step 1 with the next page.

At the end of the session write in wiki/review.md where to resume, for whoever did not see this
conversation. The final approval of every page stays human: never write status: approved.
```
