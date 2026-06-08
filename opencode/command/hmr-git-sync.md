---
description: "Sync repository with remote: fetch, prune, fast-forward main branches, show divergence status."
---

# ↻ /hmr-git-sync [--all]

Synchronize local branches with remote tracking branches.

## Workflow

### Step 1: Record current state
```bash
git branch --show-current
git status --porcelain
```
Record current branch name and whether there are uncommitted changes.

### Step 2: Stash if needed
If uncommitted changes exist:
```bash
git stash push -m "git-sync auto-stash"
```
Record whether stash was created (output contains "Saved working directory").

### Step 3: Fetch all remotes
```bash
git fetch --all --prune --tags
```

### Step 4: Fast-forward main branches
For each of `main` and `develop` (if they exist locally):
```bash
git checkout <branch>
git merge --ff-only origin/<branch>
```
Record the result for each: updated (with new HEAD), already up-to-date, or failed (diverged).

If fast-forward fails, record the branch as diverged — do NOT force update.

### Step 5: Return to original branch
```bash
git checkout <original-branch>
```

### Step 6: Check current branch status
```bash
git rev-list --left-right --count origin/<original-branch>...<original-branch>
```
Parse output as `<behind>\t<ahead>`. Determine status:
- `0 0` → up to date
- `0 N` → ahead by N commits
- `N 0` → behind by N commits
- `N M` → diverged (N behind, M ahead)

If no upstream exists, report "no upstream".

### Step 7: Sync all tracking branches (only with --all flag)
```bash
git branch -vv --format='%(refname:short)'
```
For each tracking branch (excluding main branches and current branch):
```bash
git checkout <branch>
git merge --ff-only origin/<branch>
```
Record result for each. Return to original branch when done.

### Step 8: Restore stash
If changes were stashed in Step 2:
```bash
git stash pop
```

### Step 9: Report results
Summarize:
- Main branch sync results (updated/current/diverged)
- Current branch status (ahead/behind/diverged/up-to-date)
- All branch results (if `--all` flag used)
- Whether stash was created and restored

If current branch is behind, offer to rebase:
→ `git pull --rebase origin <branch>`

If branches diverged, explain the situation and suggest resolution.

Ask permission before rebasing.
