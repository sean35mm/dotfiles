import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Generates comprehensive project statistics including lines of code, file counts, languages, git statistics, and dependency counts.",
  args: {
    include_git: tool.schema
      .boolean()
      .optional()
      .describe("Include git statistics (commits, contributors). Defaults to true."),
    include_deps: tool.schema
      .boolean()
      .optional()
      .describe("Include dependency counts. Defaults to true."),
    path: tool.schema
      .string()
      .optional()
      .describe("Path to analyze. Defaults to current directory."),
  },
  async execute(args) {
    const includeGit = args.include_git !== false
    const includeDeps = args.include_deps !== false
    const targetPath = args.path || "."

    let output = `# Project Statistics

**Path:** ${targetPath}
**Generated:** ${new Date().toISOString()}

---

`

    try {
      output += `## File Statistics\n\n`

      const extensions = [
        { ext: "ts", name: "TypeScript" },
        { ext: "tsx", name: "TypeScript React" },
        { ext: "js", name: "JavaScript" },
        { ext: "jsx", name: "JavaScript React" },
        { ext: "py", name: "Python" },
        { ext: "go", name: "Go" },
        { ext: "rs", name: "Rust" },
        { ext: "java", name: "Java" },
        { ext: "rb", name: "Ruby" },
        { ext: "php", name: "PHP" },
        { ext: "css", name: "CSS" },
        { ext: "scss", name: "SCSS" },
        { ext: "html", name: "HTML" },
        { ext: "json", name: "JSON" },
        { ext: "yaml", name: "YAML" },
        { ext: "yml", name: "YAML" },
        { ext: "md", name: "Markdown" },
        { ext: "sql", name: "SQL" },
      ]

      const stats: { name: string; files: number; lines: number }[] = []
      let totalFiles = 0
      let totalLines = 0

      for (const { ext, name } of extensions) {
        try {
          const fileCount =
            await Bun.$`find ${targetPath} -name "*.${ext}" -type f 2>/dev/null | grep -v node_modules | grep -v .next | grep -v dist | grep -v .git | wc -l`.text()
          const count = parseInt(fileCount.trim()) || 0

          if (count > 0) {
            const lineCount =
              await Bun.$`find ${targetPath} -name "*.${ext}" -type f 2>/dev/null | grep -v node_modules | grep -v .next | grep -v dist | grep -v .git | xargs wc -l 2>/dev/null | tail -1`.text()
            const lines = parseInt(lineCount.trim().split(/\s+/)[0]) || 0

            stats.push({ name, files: count, lines })
            totalFiles += count
            totalLines += lines
          }
        } catch {}
      }

      stats.sort((a, b) => b.lines - a.lines)

      output += `| Language | Files | Lines of Code |\n`
      output += `|----------|-------|---------------|\n`
      stats.forEach((s) => {
        const percentage = totalLines > 0 ? ((s.lines / totalLines) * 100).toFixed(1) : "0"
        output += `| ${s.name} | ${s.files} | ${s.lines.toLocaleString()} (${percentage}%) |\n`
      })
      output += `| **Total** | **${totalFiles}** | **${totalLines.toLocaleString()}** |\n`
      output += `\n`

      if (includeGit) {
        output += `## Git Statistics\n\n`
        try {
          const isGitRepo = await Bun.$`git rev-parse --is-inside-work-tree 2>/dev/null`.text()
          
          if (isGitRepo.trim() === "true") {
            const totalCommits = await Bun.$`git rev-list --count HEAD 2>/dev/null`.text()
            const firstCommit = await Bun.$`git log --reverse --format="%ai" | head -1 2>/dev/null`.text()
            const lastCommit = await Bun.$`git log -1 --format="%ai" 2>/dev/null`.text()
            const contributors = await Bun.$`git shortlog -sn --all 2>/dev/null | wc -l`.text()
            const branches = await Bun.$`git branch -a 2>/dev/null | wc -l`.text()
            const tags = await Bun.$`git tag 2>/dev/null | wc -l`.text()

            output += `| Metric | Value |\n`
            output += `|--------|-------|\n`
            output += `| Total Commits | ${totalCommits.trim()} |\n`
            output += `| Contributors | ${contributors.trim()} |\n`
            output += `| Branches | ${branches.trim()} |\n`
            output += `| Tags | ${tags.trim()} |\n`
            output += `| First Commit | ${firstCommit.trim().split(" ")[0] || "N/A"} |\n`
            output += `| Last Commit | ${lastCommit.trim().split(" ")[0] || "N/A"} |\n`
            output += `\n`

            output += `### Top Contributors\n\n`
            const topContributors = await Bun.$`git shortlog -sn --all 2>/dev/null | head -10`.text()
            output += `\`\`\`\n${topContributors}\`\`\`\n\n`

            output += `### Recent Activity (Last 30 days)\n\n`
            const recentCommits = await Bun.$`git log --oneline --since="30 days ago" 2>/dev/null | wc -l`.text()
            output += `- Commits in last 30 days: ${recentCommits.trim()}\n\n`
          } else {
            output += `Not a git repository.\n\n`
          }
        } catch (e) {
          output += `Error getting git stats: ${e}\n\n`
        }
      }

      if (includeDeps) {
        output += `## Dependencies\n\n`
        try {
          const packageJson = await Bun.file(`${targetPath}/package.json`).text()
          const pkg = JSON.parse(packageJson)

          const deps = Object.keys(pkg.dependencies || {}).length
          const devDeps = Object.keys(pkg.devDependencies || {}).length
          const peerDeps = Object.keys(pkg.peerDependencies || {}).length
          const optionalDeps = Object.keys(pkg.optionalDependencies || {}).length

          output += `| Type | Count |\n`
          output += `|------|-------|\n`
          output += `| Dependencies | ${deps} |\n`
          output += `| Dev Dependencies | ${devDeps} |\n`
          if (peerDeps > 0) output += `| Peer Dependencies | ${peerDeps} |\n`
          if (optionalDeps > 0) output += `| Optional Dependencies | ${optionalDeps} |\n`
          output += `| **Total** | **${deps + devDeps + peerDeps + optionalDeps}** |\n`
          output += `\n`

          if (pkg.name) output += `**Package Name:** ${pkg.name}\n`
          if (pkg.version) output += `**Version:** ${pkg.version}\n`
          if (pkg.license) output += `**License:** ${pkg.license}\n`
          output += `\n`
        } catch {
          output += `No package.json found or error parsing.\n\n`
        }
      }

      output += `## Directory Structure\n\n`
      try {
        const structure = await Bun.$`find ${targetPath} -type d -maxdepth 2 2>/dev/null | grep -v node_modules | grep -v .git | grep -v .next | grep -v dist | head -30`.text()
        output += `\`\`\`\n${structure}\`\`\`\n`
      } catch {}
    } catch (error) {
      output += `## Error\n\n\`\`\`\n${error}\n\`\`\`\n`
    }

    return output
  },
})
