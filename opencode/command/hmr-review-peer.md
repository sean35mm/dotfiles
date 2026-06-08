---
description: "Multi-CLI peer review of the current diff. Detects installed AI CLIs (cursor-agent, codex, gemini, ollama, opencode, claude), runs each in parallel, and aggregates findings — local-only."
---

# /hmr-review-peer

Run `audit review --peer` against the current branch's diff with the base branch (default: `origin/main`).

## What it does

1. Detects which peer-review CLIs are installed on `$PATH`.
2. Skips `claude` automatically when running inside an active Claude Code session.
3. Builds a uniform JSON-output prompt from `git diff <base>...HEAD`.
4. Runs each detected CLI in parallel with worktree isolation.
5. Aggregates findings, deduping by `(file, line, severity, title-prefix)`.
6. Records `agreedBy` (which CLIs corroborated each finding).
7. Outputs JSON (default) or table (`--output table`).

## Usage

```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" review                              # all detected CLIs
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" review peer --base-ref origin/develop # against develop
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" review peer --clis cursor-agent,codex # restrict to two CLIs
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" review peer --output table           # human-readable
```

## After running

Treat aggregated findings as candidates, not verified review output. Verify findings before posting any comment.

## Related

- CLI: `audit review --peer` (or `audit review peer`)
- Commands: `/hmr-review`
