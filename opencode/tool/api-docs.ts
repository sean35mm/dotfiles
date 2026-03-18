import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Scans code for API routes and endpoints, generating documentation in markdown format. Supports Express, Fastify, Next.js, Hono, and similar frameworks.",
  args: {
    directory: tool.schema
      .string()
      .optional()
      .describe("Directory to scan for API routes. Defaults to current directory."),
    patterns: tool.schema
      .string()
      .optional()
      .describe("Glob patterns to match API files. Comma-separated. Defaults to common patterns."),
    output: tool.schema
      .string()
      .optional()
      .describe("Output file path. If not provided, returns documentation as text."),
  },
  async execute(args) {
    const directory = args.directory || "."
    const defaultPatterns = [
      "**/routes/**/*.ts",
      "**/routes/**/*.js",
      "**/api/**/*.ts",
      "**/api/**/*.js",
      "**/app/**/route.ts",
      "**/app/**/route.js",
      "**/pages/api/**/*.ts",
      "**/pages/api/**/*.js",
    ]
    const patterns = args.patterns
      ? args.patterns.split(",").map((p) => p.trim())
      : defaultPatterns

    let output = `# API Documentation

**Generated:** ${new Date().toISOString()}
**Directory:** ${directory}

---

`

    try {
      const findCommand = patterns
        .map((p) => `-name "${p.split("/").pop()}"`)
        .join(" -o ")

      const files =
        await Bun.$`find ${directory} -type f \( ${findCommand.split(" ")} \) 2>/dev/null | grep -v node_modules | head -100`.text()

      const fileList = files.trim().split("\n").filter((f) => f.length > 0)

      if (fileList.length === 0) {
        output += `No API files found matching the patterns.\n\n`
        output += `**Patterns searched:**\n`
        patterns.forEach((p) => (output += `- \`${p}\`\n`))
        return output
      }

      output += `## Found ${fileList.length} API File(s)\n\n`

      const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
      const routePatterns = [
        /(?:app|router)\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)/gi,
        /export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*=/gi,
        /\.route\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gi,
      ]

      const endpoints: { file: string; method: string; path: string; line?: number }[] = []

      for (const file of fileList) {
        try {
          const content = await Bun.file(file).text()
          const lines = content.split("\n")

          for (const pattern of routePatterns) {
            let match
            pattern.lastIndex = 0
            while ((match = pattern.exec(content)) !== null) {
              const method = match[1]?.toUpperCase() || "ROUTE"
              const path = match[2] || file.replace(directory, "").replace(/\.(ts|js)$/, "")
              
              const position = match.index
              const lineNumber = content.slice(0, position).split("\n").length

              endpoints.push({
                file: file.replace(directory + "/", ""),
                method,
                path,
                line: lineNumber,
              })
            }
          }

          if (file.includes("/app/") && file.includes("route.")) {
            const routePath = file
              .replace(directory, "")
              .replace(/\/app/, "")
              .replace(/\/route\.(ts|js)$/, "")
              .replace(/\[([^\]]+)\]/g, ":$1")
              .replace(/\/\(.*?\)/g, "")

            for (const method of httpMethods) {
              if (content.includes(`export async function ${method}`) ||
                  content.includes(`export function ${method}`) ||
                  content.includes(`export const ${method}`)) {
                endpoints.push({
                  file: file.replace(directory + "/", ""),
                  method,
                  path: routePath || "/",
                })
              }
            }
          }
        } catch (e) {
          output += `<!-- Error reading ${file}: ${e} -->\n`
        }
      }

      const uniqueEndpoints = endpoints.filter(
        (e, i, arr) =>
          arr.findIndex(
            (x) => x.method === e.method && x.path === e.path && x.file === e.file
          ) === i
      )

      if (uniqueEndpoints.length > 0) {
        output += `## Endpoints\n\n`
        output += `| Method | Path | File | Line |\n`
        output += `|--------|------|------|------|\n`

        uniqueEndpoints
          .sort((a, b) => a.path.localeCompare(b.path))
          .forEach((e) => {
            output += `| \`${e.method}\` | \`${e.path}\` | \`${e.file}\` | ${e.line || "-"} |\n`
          })

        output += `\n---\n\n`
        output += `## Endpoint Details\n\n`

        const groupedByPath = uniqueEndpoints.reduce(
          (acc, e) => {
            if (!acc[e.path]) acc[e.path] = []
            acc[e.path].push(e)
            return acc
          },
          {} as Record<string, typeof uniqueEndpoints>
        )

        for (const [path, methods] of Object.entries(groupedByPath)) {
          output += `### \`${path}\`\n\n`
          methods.forEach((m) => {
            output += `- **${m.method}** - \`${m.file}\`${m.line ? `:${m.line}` : ""}\n`
          })
          output += `\n`
        }
      } else {
        output += `No endpoints detected in the scanned files.\n\n`
        output += `**Files scanned:**\n`
        fileList.slice(0, 10).forEach((f) => (output += `- \`${f}\`\n`))
        if (fileList.length > 10) {
          output += `- ... and ${fileList.length - 10} more\n`
        }
      }
    } catch (error) {
      output += `## Error\n\n\`\`\`\n${error}\n\`\`\`\n`
    }

    if (args.output) {
      try {
        await Bun.write(args.output, output)
        return `Documentation written to: ${args.output}\n\n${output}`
      } catch (e) {
        return `Error writing to file: ${e}\n\n${output}`
      }
    }

    return output
  },
})
