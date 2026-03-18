import { type Plugin, tool } from "@opencode-ai/plugin"

interface ConventionalCommit {
  type: string
  scope?: string
  breaking: boolean
  description: string
  body?: string
  footer?: string
}

const VALID_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
]

const TYPE_DESCRIPTIONS: Record<string, string> = {
  feat: "A new feature",
  fix: "A bug fix",
  docs: "Documentation only changes",
  style: "Changes that do not affect the meaning of the code",
  refactor: "A code change that neither fixes a bug nor adds a feature",
  perf: "A code change that improves performance",
  test: "Adding missing tests or correcting existing tests",
  build: "Changes that affect the build system or external dependencies",
  ci: "Changes to CI configuration files and scripts",
  chore: "Other changes that don't modify src or test files",
  revert: "Reverts a previous commit",
}

function parseConventionalCommit(message: string): ConventionalCommit | null {
  const lines = message.trim().split("\n")
  const headerLine = lines[0]

  const headerRegex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/
  const match = headerLine.match(headerRegex)

  if (!match) {
    return null
  }

  const [, type, scope, breaking, description] = match

  return {
    type,
    scope: scope || undefined,
    breaking: breaking === "!",
    description,
    body: lines.slice(2).join("\n").trim() || undefined,
  }
}

function validateCommitMessage(message: string): {
  valid: boolean
  errors: string[]
  warnings: string[]
  parsed: ConventionalCommit | null
} {
  const errors: string[] = []
  const warnings: string[] = []

  const parsed = parseConventionalCommit(message)

  if (!parsed) {
    errors.push("Invalid conventional commit format. Expected: <type>(<scope>): <description>")
    return { valid: false, errors, warnings, parsed: null }
  }

  if (!VALID_TYPES.includes(parsed.type)) {
    errors.push(`Invalid type "${parsed.type}". Valid types: ${VALID_TYPES.join(", ")}`)
  }

  if (parsed.description.length < 3) {
    errors.push("Description is too short (minimum 3 characters)")
  }

  if (parsed.description.length > 72) {
    warnings.push(`Description is ${parsed.description.length} characters (recommended max: 72)`)
  }

  if (parsed.description[0] === parsed.description[0].toUpperCase()) {
    warnings.push("Description should start with lowercase")
  }

  if (parsed.description.endsWith(".")) {
    warnings.push("Description should not end with a period")
  }

  const imperativeWords = ["add", "fix", "update", "remove", "change", "improve", "implement", "refactor"]
  const firstWord = parsed.description.split(" ")[0].toLowerCase()
  if (!imperativeWords.some((w) => firstWord.startsWith(w))) {
    warnings.push("Consider using imperative mood (e.g., 'add', 'fix', 'update')")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parsed,
  }
}

export const CommitValidatorPlugin: Plugin = async () => {
  return {
    hook: {
      "tool:before": async (event) => {
        if (event.tool !== "bash") return

        const command = (event as any).args?.command || ""
        
        if (!command.includes("git commit")) return

        const messageMatch = command.match(/-m\s+["']([^"']+)["']/)
        if (!messageMatch) return

        const message = messageMatch[1]
        const validation = validateCommitMessage(message)

        if (!validation.valid) {
          console.warn("\n[commit-validator] Invalid commit message:")
          validation.errors.forEach((e) => console.warn(`  - ${e}`))
          if (validation.warnings.length > 0) {
            console.warn("Warnings:")
            validation.warnings.forEach((w) => console.warn(`  - ${w}`))
          }
        } else if (validation.warnings.length > 0) {
          console.warn("\n[commit-validator] Commit message warnings:")
          validation.warnings.forEach((w) => console.warn(`  - ${w}`))
        }
      },
    },
    tool: {
      "validate-commit": tool({
        description: "Validate a commit message against conventional commit standards",
        args: {
          message: tool.schema.string().describe("The commit message to validate"),
        },
        async execute(args) {
          const validation = validateCommitMessage(args.message)

          let output = `# Commit Message Validation\n\n`
          output += `**Message:** \`${args.message}\`\n\n`

          if (validation.valid) {
            output += `**Status:** Valid\n\n`
          } else {
            output += `**Status:** Invalid\n\n`
          }

          if (validation.parsed) {
            output += `## Parsed Components\n\n`
            output += `- **Type:** ${validation.parsed.type} (${TYPE_DESCRIPTIONS[validation.parsed.type] || "Unknown"})\n`
            if (validation.parsed.scope) {
              output += `- **Scope:** ${validation.parsed.scope}\n`
            }
            output += `- **Breaking:** ${validation.parsed.breaking ? "Yes" : "No"}\n`
            output += `- **Description:** ${validation.parsed.description}\n\n`
          }

          if (validation.errors.length > 0) {
            output += `## Errors\n\n`
            validation.errors.forEach((e) => (output += `- ${e}\n`))
            output += "\n"
          }

          if (validation.warnings.length > 0) {
            output += `## Warnings\n\n`
            validation.warnings.forEach((w) => (output += `- ${w}\n`))
            output += "\n"
          }

          output += `## Valid Types\n\n`
          output += `| Type | Description |\n`
          output += `|------|-------------|\n`
          for (const [type, desc] of Object.entries(TYPE_DESCRIPTIONS)) {
            output += `| \`${type}\` | ${desc} |\n`
          }

          return output
        },
      }),
      "suggest-commit": tool({
        description: "Generate a conventional commit message based on staged changes",
        args: {},
        async execute() {
          try {
            const diff = await Bun.$`git diff --staged --stat`.text()
            
            if (!diff.trim()) {
              return "No staged changes found. Stage files with `git add` first."
            }

            let output = `# Commit Message Suggestions\n\n`
            output += `## Staged Changes\n\`\`\`\n${diff}\`\`\`\n\n`

            output += `## Suggested Messages\n\n`
            output += `Based on your changes, consider one of these formats:\n\n`
            output += `- \`feat(<scope>): add <feature description>\`\n`
            output += `- \`fix(<scope>): resolve <bug description>\`\n`
            output += `- \`refactor(<scope>): <refactoring description>\`\n`
            output += `- \`docs: update <documentation description>\`\n`
            output += `- \`chore: <maintenance description>\`\n\n`

            output += `## Tips\n\n`
            output += `1. Use imperative mood: "add" not "added"\n`
            output += `2. Keep subject line under 72 characters\n`
            output += `3. Don't end with a period\n`
            output += `4. Start with lowercase\n`
            output += `5. Reference issues: "fix: resolve login bug (#123)"\n`

            return output
          } catch (error) {
            return `Error getting staged changes: ${error}`
          }
        },
      }),
    },
  }
}

export default CommitValidatorPlugin
