# 4 · Write a handoff for whoever resumes without the chat

Instantiated for this repository from procedure 4 of [`generic-prompts.it.md`](generic-prompts.it.md).
Placeholders, filled:

| Placeholder | Here |
|---|---|
| `<TOPIC>` | the piece of work being interrupted (usually one wiki page or a group of them) |
| `<HANDOFF FILE>` | `handoffs/<topic>.md` |
| `<PROJECT DOCUMENTATION>` | [`wiki/`](../wiki/index.md) |

```text
Work on <topic> stops here. Write or update handoffs/<topic>.md for an agent or a person who
has not seen this conversation.

- At the top, «Where to resume — <date>»: the state in two lines, what is verified and how,
  what is open, and the first concrete step to take.
- The rules for resuming: what must not be touched, which commands are forbidden, who decides
  what.
- The traps found on the field, with the symptom by which they show up.
- For every statement give the evidence: commit, measurement, file and line. Nothing generic
  like «it should work».

When the work closes, split the handoff in two:
- move the conclusions that stay true into the wiki and list where;
- the story of what was done goes into CHANGELOG.md.
Do not close the handoff if the list of moved conclusions is empty.
```
