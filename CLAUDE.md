# CLAUDE.md

The instructions for this repository live in [`AGENTS.md`](AGENTS.md), shared with every coding
agent. **Edit that file, not this one**: this file only imports it and adds what is specific to
Claude Code.

@AGENTS.md

## Claude Code only

- The «read before acting» reminder reaches you on every request through the `UserPromptSubmit`
  hook in `.claude/settings.json`, which prints `scripts/agents/read-first-reminder.txt`.
