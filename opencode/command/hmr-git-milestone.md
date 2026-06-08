---
description: "Create development checkpoint commit with auto-generated message and optional Linear integration."
---

# ↻ /hmr-git-milestone [description] [--git] [--linear] [--push]

Create a development checkpoint (WIP commit) with automatic staging and optional Linear progress tracking.

## Flags

| Flag | Effect |
|------|--------|
| (none) | Both git commit AND Linear guidance (default) |
| --git | Git commit only, skip Linear output |
| --linear | Linear guidance only, skip git commit (uses last commit) |
| --push | Push to remote after commit |

## Workflow

### Step 1: Determine mode and description
Parse arguments:
- If `--linear` only (without `--git`): skip to Linear-only mode (Step 8)
- If description provided: use it
- If no description: auto-generate from changes (Step 2)

### Step 2: Auto-generate description (if none provided)
```bash
git status --porcelain
```
Parse the output to categorize files:
- `A` or `??` → added files
- `D` → deleted files
- Other → modified files

Build a concise description like: `add FileName1, FileName2; update FileName3; remove FileName4`
- Use just the filename without extension for readability
- Limit to 2 items per category, with `+N more` suffix
- Truncate total to 72 characters

If no changes: report "No changes to commit" and stop.

### Step 3: Check for uncommitted changes
```bash
git diff --stat HEAD
git status --porcelain
```
If no uncommitted changes exist, report "No changes to commit" and stop.

### Step 4: Get file statistics
Count added, modified, deleted files from `git status --porcelain` output.

### Step 5: Stage all changes
```bash
git add -A
```

### Step 6: Create WIP commit
Get current branch and generate ISO timestamp.

Build commit message:
```
WIP(unstable): <description>

State snapshot <timestamp>
Branch: <branch>
Files: <total> changed (+<added> ~<modified> -<deleted>)

DO NOT DEPLOY - Development checkpoint
```

```bash
git commit -m "<message>"
```

### Step 7: Push (if --push flag)
```bash
git push origin <branch>
```
If push fails due to divergence, check if only documentation/diagram files were amended. If safe files only, use `--force-with-lease`. If non-documentation files diverged, warn and require manual review.

### Step 8: Linear-only mode (--linear without --git)
Get last commit info:
```bash
git rev-parse --short HEAD
git log -1 --format="%B"
git log -1 --format="%an"
git diff HEAD~1 --stat
git diff HEAD~1 --name-status
```
Skip to Linear output in Step 9.

### Step 9: Report results

**Git results:**
- Branch, commit hash, file statistics
- Push status (if applicable)
- Recovery command: `git reset --hard <commit>`
- Pre-PR reminder: squash milestone commits with `git rebase -i develop`

**Linear integration (unless --git only):**
Extract Linear key from branch name (e.g., `feature/ENG-150-desc` → `ENG-150`).

If a Linear key is found, summarize the issue key and prepare a progress-comment draft with: commit hash, description, file stats, and diff summary. Do not call Linear tools unless Linear MCP is explicitly enabled in this OpenCode session.

If no Linear key in branch name, note that branch should use `feature/ENG-KEY-description` format.

## Examples

```bash
/hmr-git-milestone "implement token service"     # Git + Linear-key summary
/hmr-git-milestone "checkpoint" --git            # Git only
/hmr-git-milestone --linear                      # Linear-key summary only
/hmr-git-milestone "feature complete" --push     # Git + summary + push
```
