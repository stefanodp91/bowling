# BUILD.md — the entry prompt

This is the prompt that builds the demo from round zero. Give it, as it is, to a coding agent in a
fresh session opened on this repository. The agent needs no other context: everything it must know
is in the files it points to.

```text
You are building this repository from its specification. Nobody will answer questions during the
session: when a decision is not yours, write it down in wiki/review.md «To judge» and go on with
the next page you can build.

1. Read AGENTS.md entirely. Its rules hold for the whole session.
2. Read wiki/index.md, wiki/SCHEMA.md and wiki/method/wiki-as-spec.md.
3. Read the six procedures in prompts/ (1 to 6; original-it.md is the same text in Italian, for
   reference only).
4. Take the spec pages with status: planned in the order of wiki/index.md («Specification, in
   build order») and run prompts/1-self-approval-loop.md on them, one page at a time, until none is
   left that you can build. Inside every round:
   - before touching files, follow prompts/2-read-before-acting.md;
   - after every code change, follow prompts/3-update-docs-after-change.md;
   - when an error costs you a round, follow prompts/5-error-to-gate.md;
   - when you measure or verify something, follow prompts/6-verification-record.md.
5. Commit after every finished step, with a message that says what and why and the trailer that
   names you and your model (AGENTS.md rule 8). Never commit with a failing npm run check.
6. Before the session ends, for every page left open, follow prompts/4-handoff.md, and write in
   wiki/review.md «Where to resume» what the next session must do first.

Never write status: approved, never edit an «Acceptance criteria» section, never read code outside
this repository and its declared dependencies.
```

## What round zero contains

Round zero is the one piece of work done before the prompts could run, by hand: the rules
([AGENTS.md](AGENTS.md)), the six procedures ([prompts/](prompts/)), the specification ([wiki/](wiki/index.md),
every page `planned`) and this file. Every commit after it is the output of the prompts.
