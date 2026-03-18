import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Runs tests with coverage report and identifies files that need more test coverage. Supports Jest, Vitest, and other test runners.",
  args: {
    runner: tool.schema
      .enum(["jest", "vitest", "auto"])
      .optional()
      .describe("Test runner to use. Defaults to auto-detect."),
    threshold: tool.schema
      .number()
      .optional()
      .describe("Coverage threshold percentage. Files below this are flagged. Defaults to 80."),
    path: tool.schema
      .string()
      .optional()
      .describe("Specific path or pattern to test. If empty, runs all tests."),
  },
  async execute(args) {
    let runner = args.runner || "auto"
    const threshold = args.threshold || 80
    const testPath = args.path || ""

    if (runner === "auto") {
      try {
        const packageJson = await Bun.file("package.json").text()
        const pkg = JSON.parse(packageJson)
        const deps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        }
        if (deps.vitest) {
          runner = "vitest"
        } else if (deps.jest) {
          runner = "jest"
        } else {
          runner = "vitest"
        }
      } catch {
        runner = "vitest"
      }
    }

    let output = `# Test Coverage Report

**Runner:** ${runner}
**Threshold:** ${threshold}%
**Date:** ${new Date().toISOString()}

---

`

    try {
      let coverageResult = ""
      let command = ""

      if (runner === "vitest") {
        command = testPath
          ? `npx vitest run --coverage ${testPath}`
          : `npx vitest run --coverage`
        coverageResult = await Bun.$`npx vitest run --coverage ${testPath} 2>&1 || true`.text()
      } else {
        command = testPath
          ? `npx jest --coverage ${testPath}`
          : `npx jest --coverage`
        coverageResult = await Bun.$`npx jest --coverage ${testPath} 2>&1 || true`.text()
      }

      output += `## Command\n\`\`\`\n${command}\n\`\`\`\n\n`

      const coverageTableMatch = coverageResult.match(
        /[-]+\|[-]+\|[-]+\|[-]+\|[-]+[\s\S]*?(?=\n\n|\nTest|\n$)/
      )
      
      if (coverageTableMatch) {
        output += `## Coverage Summary\n\`\`\`\n${coverageTableMatch[0]}\n\`\`\`\n\n`
      }

      const testSummaryMatch = coverageResult.match(
        /Tests?:.*(?:passed|failed).*\n/i
      )
      if (testSummaryMatch) {
        output += `## Test Results\n${testSummaryMatch[0]}\n`
      }

      const lowCoverageFiles: string[] = []
      const coverageLines = coverageResult.split("\n")
      for (const line of coverageLines) {
        const percentMatch = line.match(/(\d+(?:\.\d+)?)\s*\|/)
        if (percentMatch) {
          const percent = parseFloat(percentMatch[1])
          if (percent < threshold && !line.includes("All files")) {
            lowCoverageFiles.push(line.trim())
          }
        }
      }

      if (lowCoverageFiles.length > 0) {
        output += `\n## Files Below ${threshold}% Threshold\n\`\`\`\n`
        lowCoverageFiles.forEach((f) => (output += `${f}\n`))
        output += `\`\`\`\n\n`
      } else {
        output += `\n## Coverage Status\nAll files meet the ${threshold}% coverage threshold.\n\n`
      }

      if (coverageResult.includes("FAIL")) {
        output += `\n## Failed Tests\n`
        const failedTests = coverageResult
          .split("\n")
          .filter(
            (l) =>
              l.includes("FAIL") ||
              l.includes("✕") ||
              l.includes("Error:")
          )
          .slice(0, 20)
        output += `\`\`\`\n${failedTests.join("\n")}\n\`\`\`\n\n`
      }

      output += `\n<details>
<summary>Full Output</summary>

\`\`\`
${coverageResult.slice(0, 15000)}${coverageResult.length > 15000 ? "\n... (truncated)" : ""}
\`\`\`

</details>
`
    } catch (error) {
      output += `## Error

\`\`\`
${error}
\`\`\`

**Troubleshooting:**
- Ensure test dependencies are installed
- Check vitest.config.ts or jest.config.js exists
- Verify coverage is configured in your test config
`
    }

    return output
  },
})
