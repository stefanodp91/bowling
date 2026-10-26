# 6 · Write a verification record

Instantiated for this repository from procedure 6 of [`original-it.md`](original-it.md).
Placeholders, filled:

| Placeholder | Here |
|---|---|
| `<WHAT>` | what was verified: a model, a behaviour, a set of pilot runs |
| `<DEVICE OR ENVIRONMENT>` | browser, version, machine, headless or not |
| `<PROJECT DOCUMENTATION>` | a page under [`wiki/records/`](../wiki/records/README.md), linked from the page it verifies |

```text
You have verified <what> on <device or environment>. Write the result in a page under
wiki/records/, named <topic>-<yyyymmdd>.md, and link it from the page it verifies:

- The numbers in the text and in tables: counts, thresholds, outcome of every test, starting
  conditions. A summary that points to an external file for the details is incomplete.
- Tie the measurement to the state of the code you measured (commit).
- Declare the scope: where it holds and where it was not tried. An approval in one browser does
  not extend to the others.
- Describe images in words: what they showed and which verdict followed.
- Raw data is not kept. What stays is the number you extracted and its limit.
```
