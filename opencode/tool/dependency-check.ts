import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Scans project dependencies for security vulnerabilities and outdated packages. Supports npm, yarn, pnpm, and bun.",
  args: {
    check_outdated: tool.schema
      .boolean()
      .optional()
      .describe("Check for outdated packages. Defaults to true."),
    check_security: tool.schema
      .boolean()
      .optional()
      .describe("Run security audit. Defaults to true."),
    package_manager: tool.schema
      .enum(["npm", "yarn", "pnpm", "bun", "auto"])
      .optional()
      .describe("Package manager to use. Defaults to auto-detect."),
  },
  async execute(args) {
    const checkOutdated = args.check_outdated !== false
    const checkSecurity = args.check_security !== false
    let pm = args.package_manager || "auto"

    if (pm === "auto") {
      try {
        const files = await Bun.$`ls -la`.text()
        if (files.includes("bun.lock") || files.includes("bun.lockb")) {
          pm = "bun"
        } else if (files.includes("pnpm-lock.yaml")) {
          pm = "pnpm"
        } else if (files.includes("yarn.lock")) {
          pm = "yarn"
        } else {
          pm = "npm"
        }
      } catch {
        pm = "npm"
      }
    }

    let output = `# Dependency Check Report

**Package Manager:** ${pm}
**Date:** ${new Date().toISOString()}

---

`

    if (checkSecurity) {
      output += `## Security Audit\n\n`
      try {
        let auditResult = ""
        if (pm === "bun") {
          auditResult =
            await Bun.$`bun pm audit 2>&1 || true`.text()
        } else if (pm === "pnpm") {
          auditResult = await Bun.$`pnpm audit 2>&1 || true`.text()
        } else if (pm === "yarn") {
          auditResult = await Bun.$`yarn audit 2>&1 || true`.text()
        } else {
          auditResult = await Bun.$`npm audit 2>&1 || true`.text()
        }

        if (
          auditResult.toLowerCase().includes("no vulnerabilities") ||
          auditResult.toLowerCase().includes("no issues") ||
          auditResult.trim() === ""
        ) {
          output += `No security vulnerabilities found.\n\n`
        } else {
          output += `\`\`\`\n${auditResult.slice(0, 5000)}${auditResult.length > 5000 ? "\n... (truncated)" : ""}\n\`\`\`\n\n`
        }
      } catch (error) {
        output += `Error running security audit: ${error}\n\n`
      }
    }

    if (checkOutdated) {
      output += `## Outdated Packages\n\n`
      try {
        let outdatedResult = ""
        if (pm === "bun") {
          outdatedResult =
            await Bun.$`bun outdated 2>&1 || true`.text()
        } else if (pm === "pnpm") {
          outdatedResult =
            await Bun.$`pnpm outdated 2>&1 || true`.text()
        } else if (pm === "yarn") {
          outdatedResult =
            await Bun.$`yarn outdated 2>&1 || true`.text()
        } else {
          outdatedResult =
            await Bun.$`npm outdated 2>&1 || true`.text()
        }

        if (outdatedResult.trim() === "" || outdatedResult.includes("All packages are up to date")) {
          output += `All packages are up to date.\n\n`
        } else {
          output += `\`\`\`\n${outdatedResult.slice(0, 5000)}${outdatedResult.length > 5000 ? "\n... (truncated)" : ""}\n\`\`\`\n\n`
        }
      } catch (error) {
        output += `Error checking outdated packages: ${error}\n\n`
      }
    }

    output += `---

## Recommendations

1. **Critical/High vulnerabilities**: Update immediately
2. **Moderate vulnerabilities**: Plan update within sprint
3. **Low vulnerabilities**: Add to backlog
4. **Outdated packages**: Consider updating if no breaking changes

### Update Commands
- **npm:** \`npm update\` or \`npm update <package>\`
- **yarn:** \`yarn upgrade\` or \`yarn upgrade <package>\`
- **pnpm:** \`pnpm update\` or \`pnpm update <package>\`
- **bun:** \`bun update\` or \`bun update <package>\`
`

    return output
  },
})
