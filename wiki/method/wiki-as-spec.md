---
title: The wiki is the specification
type: concept
verified: 2026-10-26
---

# The wiki is the specification

> Boundary: how a page states what must be built, who may change it, and how it moves from
> `planned` to `approved`. NOT covered: the format of a page ([schema](../SCHEMA.md)), the scripts
> that check it ([wiki tooling](wiki-tooling.md)).

## One source of truth per topic

The wiki comes before the code. A page is first an intention (`planned`), then the description of
what the code does (`built`), then a description a human has confirmed (`approved`). It is the same
file through its whole life: there is no separate specification to keep in sync with the
documentation.

If the code and a page disagree:

- the page is `planned` → the code is what must change;
- the page is `built` or `approved` → read both, decide which is right, and if it is not obvious
  write the case in [`review.md`](../review.md) «To judge». Agent and human decide together.

## The states

| From → to | Who | When |
|---|---|---|
| (new) → `planned` | a human, or an agent asked by a human | the page describes something to build |
| `planned` → `built` | the agent | every `[auto]` acceptance criterion passes and the agent's own judgement (prompt 1, step 5) holds |
| `built` → `approved` | **a human only** | they looked at it; they write `approved_on` and move the entry in `review.md` to «Approved» |
| `built`/`approved` → `planned` | a human | the page was rejected or its criteria changed |

An agent that cannot close a page in three rounds leaves it `planned` and writes cause, attempts and
what is left in `review.md` «To judge».

## Why the acceptance criteria are locked

When the same page is both specification and documentation, an agent that finds code failing a
criterion can be tempted to rewrite the criterion instead of the code: the bar lowers silently. So
the `## Acceptance criteria` section belongs to the human. `check-acceptance` compares every
section with the hashes stored in `wiki/acceptance.lock.json` and fails on any difference;
`npm run acceptance:lock -- <page>` updates a hash and is run only by a human, after deciding the
change.

## Why «approved» is human

An agent that judges itself is a useful first filter and an unreliable last one: it can declare many
items finished that nobody has looked at. «Built» counts what the agent believes; «approved» counts
what a human checked. `npm run stats` reports both numbers side by side.
