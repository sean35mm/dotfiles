import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Analyzes git diff and commit history to generate a structured PR description. Includes summary, changes, and testing notes.",
  args: {
    base_branch: tool.schema
      .string()
      .optional()
      .describe("Base branch to compare against. Defaults to 'main'."),
    include_commits: tool.schema
      .boolean()
      .optional()
      .describe("Include commit history in the PR description. Defaults to true."),
    include_files: tool.schema
      .boolean()
      .optional()
      .describe("Include list of changed files. Defaults to true."),
  },
  async execute(args) {
    const baseBranch = args.base_branch || "main"
    const includeCommits = args.include_commits !== false
    const includeFiles = args.include_files !== false

    try {
      const currentBranch = (
        await Bun.$`git rev-parse --abbrev-ref HEAD`.text()
      ).trim()

      const diffStats = await Bun.$`git diff --stat ${baseBranch}...HEAD`.text()

      const diffSummary =
        await Bun.$`git diff --shortstat ${baseBranch}...HEAD`.text()

      let commits = ""
      if (includeCommits) {
        commits =
          await Bun.$`git log --oneline ${baseBranch}...HEAD`.text()
      }

      let changedFiles = ""
      if (includeFiles) {
        changedFiles =
          await Bun.$`git diff --name-status ${baseBranch}...HEAD`.text()
      }

      const diffContent =
        await Bun.$`git diff ${baseBranch}...HEAD --no-color`.text()

      const addedFiles = changedFiles
        .split("\n")
        .filter((l) => l.startsWith("A"))
        .map((l) => l.split("\t")[1])
      const modifiedFiles = changedFiles
        .split("\n")
        .filter((l) => l.startsWith("M"))
        .map((l) => l.split("\t")[1])
      const deletedFiles = changedFiles
        .split("\n")
        .filter((l) => l.startsWith("D"))
        .map((l) => l.split("\t")[1])

      let output = `# PR Description Template

## Branch Info
- **Current branch:** \`${currentBranch}\`
- **Base branch:** \`${baseBranch}\`
- **Stats:** ${diffSummary.trim()}

---

## Summary
<!-- Write a brief summary of what this PR does -->

## Changes

### Files Changed
`

      if (addedFiles.length > 0) {
        output += `\n**Added (${addedFiles.length}):**\n`
        addedFiles.forEach((f) => (output += `- \`${f}\`\n`))
      }

      if (modifiedFiles.length > 0) {
        output += `\n**Modified (${modifiedFiles.length}):**\n`
        modifiedFiles.forEach((f) => (output += `- \`${f}\`\n`))
      }

      if (deletedFiles.length > 0) {
        output += `\n**Deleted (${deletedFiles.length}):**\n`
        deletedFiles.forEach((f) => (output += `- \`${f}\`\n`))
      }

      if (includeCommits && commits.trim()) {
        output += `\n### Commits\n\`\`\`\n${commits}\`\`\`\n`
      }

      output += `
---

## Testing
<!-- Describe how you tested these changes -->
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
<!-- Add screenshots if applicable -->

## Related Issues
<!-- Link related issues: Fixes #123, Relates to #456 -->

---

## Diff Stats
\`\`\`
${diffStats}
\`\`\`

## Raw Diff (for analysis)
<details>
<summary>Click to expand full diff</summary>

\`\`\`diff
${diffContent.slice(0, 10000)}${diffContent.length > 10000 ? "\n... (truncated)" : ""}
\`\`\`

</details>
`

      return output
    } catch (error) {
      return `# Error Generating PR Template

**Error:** ${error}

**Troubleshooting:**
- Ensure you're in a git repository
- Verify the base branch exists: \`git branch -a\`
- Check if there are commits to compare`
    }
  },
})
