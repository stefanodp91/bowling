# 5 · Turn a paid error into an automatic check

Instantiated for this repository from procedure 5 of [`generic-prompts.it.md`](generic-prompts.it.md).
Placeholders, filled:

| Placeholder | Here |
|---|---|
| `<ERROR>` | the error just fixed |
| `<PLACE WHERE IT ALWAYS RUNS>` | `npm run check` (and therefore the git pre-commit hook) |
| `<PROJECT DOCUMENTATION>` | [`wiki/method/gates.md`](../wiki/method/gates.md) |

```text
We have just fixed <error>. Make sure it cannot come back without anybody noticing.

1. Write an automatic check that fails if the error comes back, as scripts/check-<name>.mjs, and
   add it to npm run check.
2. Give it a --selftest option that builds a wrong case and verifies that the check rejects it.
   A check that has never failed proves nothing.
3. If the check uses a threshold, derive it from the code or from a measurement, and write where
   it comes from. Do not hand-write numbers that depend on something else: import them.
4. Run it on the current code and report what it finds: the first run often finds other cases of
   the same error.
5. Document in wiki/method/gates.md what it checks, why it exists and how to read it when it
   fails.
```
