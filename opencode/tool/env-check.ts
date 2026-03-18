import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Validates that required environment variables are set. Checks a list of env var names and reports which are missing or empty.",
  args: {
    variables: tool.schema
      .string()
      .describe(
        "Comma-separated list of environment variable names to check (e.g., 'DATABASE_URL,API_KEY,NODE_ENV')"
      ),
    file: tool.schema
      .string()
      .optional()
      .describe(
        "Optional path to a .env.example or similar file to extract variable names from"
      ),
  },
  async execute(args) {
    const results: { name: string; status: "set" | "empty" | "missing" }[] = []
    let variablesToCheck: string[] = []

    if (args.file) {
      try {
        const fileContent = await Bun.file(args.file).text()
        const envVarRegex = /^([A-Z][A-Z0-9_]*)\s*=/gm
        let match
        while ((match = envVarRegex.exec(fileContent)) !== null) {
          variablesToCheck.push(match[1])
        }
      } catch (error) {
        return `Error reading file: ${args.file}. ${error}`
      }
    }

    if (args.variables) {
      const additionalVars = args.variables
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
      variablesToCheck = [...new Set([...variablesToCheck, ...additionalVars])]
    }

    if (variablesToCheck.length === 0) {
      return "No environment variables specified to check. Provide either a comma-separated list or a file path."
    }

    for (const varName of variablesToCheck) {
      const value = process.env[varName]
      if (value === undefined) {
        results.push({ name: varName, status: "missing" })
      } else if (value === "") {
        results.push({ name: varName, status: "empty" })
      } else {
        results.push({ name: varName, status: "set" })
      }
    }

    const missing = results.filter((r) => r.status === "missing")
    const empty = results.filter((r) => r.status === "empty")
    const set = results.filter((r) => r.status === "set")

    let output = `# Environment Variable Check\n\n`
    output += `**Total checked:** ${results.length}\n`
    output += `**Set:** ${set.length} | **Empty:** ${empty.length} | **Missing:** ${missing.length}\n\n`

    if (missing.length > 0) {
      output += `## Missing Variables\n`
      missing.forEach((r) => (output += `- \`${r.name}\`\n`))
      output += "\n"
    }

    if (empty.length > 0) {
      output += `## Empty Variables\n`
      empty.forEach((r) => (output += `- \`${r.name}\`\n`))
      output += "\n"
    }

    if (set.length > 0) {
      output += `## Set Variables\n`
      set.forEach((r) => (output += `- \`${r.name}\`\n`))
    }

    return output
  },
})
