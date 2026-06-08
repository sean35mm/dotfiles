---
description: "Capture repository context and correlate with Linear/GitHub issues. Shows git state, open issues, and Linear integration."
---

# ⧉ /hmr-session-context [--git] [--github] [--linear] [--suggest "description"]

Capture unified repository context: git state, GitHub issues, and Linear correlation.

## Flags

| Flag | Description |
|------|-------------|
| (none) | Full context display (git + github + linear) |
| `--git` | Git state only |
| `--github` | GitHub issues only |
| `--linear` | Linear context only |
| `--suggest "desc"` | Suggest branch name for new work |

## Workflow

### Step 1: Gather git state (unless --github or --linear only)
```bash
git remote get-url origin
git branch --show-current
git status --porcelain
git branch --format='%(refname:short)' --sort=-committerdate | head -20
git log --oneline -10
```

Record:
- Repository name (from remote URL)
- Current branch and dirty status
- Active branches (sorted by recent activity)
- Recent commits

Extract Linear keys from branch names and commit messages (pattern: `[A-Z]+-\d+`).
Identify unique Linear team prefixes (e.g., ENG, CORE).

### Step 2: Gather GitHub context (unless --git or --linear only)
```bash
gh issue list --state open --limit 20 --json number,title,labels,assignees
gh pr list --state open --limit 10 --json number,title,headRefName,state
```

Report:
- Open issues count, assigned to current user
- Open PRs with branch associations
- Your assigned issues listed

### Step 3: Gather Linear context (unless --git or --github only)
Report git-detected Linear references without requiring Linear MCP:

1. Detect team prefixes and issue keys from branch names and commit messages.
2. If Linear MCP is explicitly enabled in this OpenCode session, you may fetch matching issue details.
3. Otherwise, do not call Linear tools; report detected keys only.

Report:
- Detected Linear teams
- Branch-to-Linear key mapping
- Current branch issue key, if available

### Step 4: Branch suggestion mode (--suggest "description")
Sanitize description to branch-safe format (lowercase, hyphens, max 50 chars).

If Linear teams detected in repo:
- Suggest: `feature/<TEAM>-XXX-<sanitized-description>` for each detected team (up to 3)
- Note: Replace XXX with Linear issue number

If no Linear teams:
- Suggest: `feature/<sanitized-description>`
- Recommend linking to Linear issue for tracking

### Step 5: Report and suggest actions
Format all gathered context into a clear report.

Suggest relevant next actions:
- → `/hmr-linear-work <KEY>` to continue current issue
- → `/hmr-linear-search` to find related work
- → `/hmr-git-feature --push` if ready for PR
