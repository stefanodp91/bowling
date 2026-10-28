# Prompts for working with AI agents

Six procedures for working with AI agents, written as prompts you can reuse in any project.
Replace the placeholders between `< >` with the things of your project.

> This file keeps the six prompts in their original, generic form, translated into English from
> [`generic-prompts.it.md`](generic-prompts.it.md). The versions instantiated for this repository,
> with the placeholders filled in, are the other files of this folder.

---

## 1. The self-approval loop

```text
Work through the list <LIST OF ITEMS TO PRODUCE>, one item at a time, without stopping until the
list is empty.

For every item repeat this loop:

1. READ THE DOCUMENTATION AND PAST REJECTIONS
   Read <PROJECT DOCUMENTATION> and the notes left by earlier rounds, including the rejections
   and why they happened.

2. LOOK FOR REFERENCES WITH WEB SEARCH
   Search for real sources about the item and write down in the documentation what you found
   before you start building.

3. BUILD
   Build the item following the rules of <PROJECT DOCUMENTATION>.

4. AUTOMATIC CHECKS
   Run <VERIFICATION COMMANDS: tests, lint, build>. If they fail, go back to step 3.

5. LOOK AT THE RESULT AND JUDGE YOURSELF
   Look at the result as it really is (<HOW: screenshot, preview, output>) and compare it with the
   references of step 2. Be strict: do not deliver anything in which you have already noticed a
   weakness.
   - If it does not hold: write what was wrong and why, fix it and go back to step 3.
   - If after 3 rounds it still does not hold, or it needs a decision that is not yours: do not
     close. Write cause, attempts and what is left in the «To judge» section of <REVIEW FILE> and
     go to step 6.

6. CLOSE, WRITE, MOVE ON
   Update the documentation with what you learned, save the work (commit), and start again from
   step 1 with the next item.

At the end of the session write in <REVIEW FILE> where to resume, for whoever did not see this
conversation. The final approval of every item stays human.
```

---

## 2. Read before acting

```text
Before changing a file or explaining how something in the project works:

1. Find the pages of <PROJECT DOCUMENTATION> that cover the files you will touch and the subject
   of the work (<COMMAND OR INDEX TO FIND THEM>).
2. Read in full the pages that hold rules about those files, and of the others read only the part
   you need. Then always open the code the page points to: the page says where to look, but the
   code decides.
3. If the code contradicts the page, say so: updating the page is part of the work.
4. Say which pages you read before you start and again in your final report. If no page covers
   the work, say so.

It is not needed for pure operations: a commit of work already done, a known command, git.
```

---

## 3. Update the documentation after a change

```text
You have just changed the code. Before closing:

1. Find the pages of <PROJECT DOCUMENTATION> that describe the changed files
   (<COMMAND THAT MATCHES THE DIFF AGAINST THE PAGES>, or by hand). Also list the important files
   that no page describes.
2. Compare every page with the new code. Update it only after you have verified it, and record
   the date of the verification.
3. If you had to read more than two files to establish a fact, and that fact is written nowhere,
   write it down. Write the conclusion in the present tense, not the story of the investigation:
   the story goes in the log.
4. Add a line to the documentation's log.
5. Run <DOCUMENTATION CHECKS: lint, links, indexes> and do not close until they are green.
```

---

## 4. Write a handoff for whoever resumes without the chat

```text
The work on <SUBJECT> stops here. Write or update <HANDOFF FILE> for an agent or a person who
did not see this conversation.

- At the top, «Where to resume — <date>»: the state in two lines, what is verified and how, what
  is open and the first concrete step to take.
- The rules for resuming: what must not be touched, which commands are forbidden, who decides
  what.
- The traps found on the field, with the symptom that reveals them.
- For every statement give the evidence: commit, measurement, file and line. Nothing generic like
  «it should work».

When the work is closed, split the handoff in two:
- move the conclusions that stay true into <PROJECT DOCUMENTATION> and list where;
- the story of what was done goes in the changelog.
Do not close the handoff if the list of moved conclusions is empty.
```

---

## 5. Turn a paid error into an automatic check

```text
We have just fixed <ERROR>. Make sure it never comes back without anyone noticing.

1. Write an automatic check that fails if the error comes back, and add it to
   <PLACE WHERE IT ALWAYS RUNS: prebuild, CI, pre-commit>.
2. Give it a --selftest option that builds a wrong case and verifies that the check rejects it.
   A check that has never failed proves nothing.
3. If the check uses a threshold, derive it from the code or from a measurement, and write where
   it comes from. Do not hand-write numbers that depend on something else.
4. Run it on the current code and report what it finds: the first run often finds other cases of
   the same error.
5. Document in <PROJECT DOCUMENTATION> what it checks, why it exists and how to read it when it
   fails.
```

---

## 6. Write a verification record

```text
You have verified <WHAT> on <DEVICE OR ENVIRONMENT>. Write the result in a page of
<PROJECT DOCUMENTATION>:

- The numbers in the text and in the tables: counts, thresholds, the outcome of every test, the
  starting conditions. A summary that points to an external file for the details is incomplete.
- Tie the measurement to the state of the code you measured (commit or file hashes).
- State the scope: where it holds and where it was not tried. An approval on one device does not
  extend to the others.
- Describe images in words: what they showed and which verdict followed.
- Raw data is not kept. What stays is the number you extracted from it and its limit.
```
