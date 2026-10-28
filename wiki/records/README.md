---
title: Verification records — what they are and where they go
type: concept
verified: 2026-10-26
---

# Verification records

> Boundary: the folder of records written with
> [prompt 6](../../prompts/6-verification-record.md). NOT covered: how measurements are taken
> ([headless runs](../pilot/headless-runs.md), [shot tool](../tools/shot.md)).

A record is a page `records/<topic>-<yyyymmdd>.md` with `type: record`: what was verified, where,
on which commit, with every number in the text, and the scope it holds for. A record is never
edited after the fact: a new measurement is a new record. The page it verifies links to it.
