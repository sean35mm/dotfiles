import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Analyzes cyclomatic complexity of functions in TypeScript/JavaScript files. Identifies functions that may need refactoring based on complexity thresholds.",
  args: {
    path: tool.schema
      .string()
      .optional()
      .describe("File or directory to analyze. Defaults to current directory."),
    threshold: tool.schema
      .number()
      .optional()
      .describe("Complexity threshold. Functions above this are flagged. Defaults to 10."),
    include: tool.schema
      .string()
      .optional()
      .describe("File extensions to include. Comma-separated. Defaults to ts,tsx,js,jsx."),
  },
  async execute(args) {
    const targetPath = args.path || "."
    const threshold = args.threshold || 10
    const extensions = args.include
      ? args.include.split(",").map((e) => e.trim())
      : ["ts", "tsx", "js", "jsx"]

    let output = `# Code Complexity Analysis

**Path:** ${targetPath}
**Threshold:** ${threshold}
**Extensions:** ${extensions.join(", ")}
**Date:** ${new Date().toISOString()}

---

`

    const complexityKeywords = [
      { pattern: /\bif\s*\(/g, weight: 1, name: "if" },
      { pattern: /\belse\s+if\s*\(/g, weight: 1, name: "else if" },
      { pattern: /\bfor\s*\(/g, weight: 1, name: "for" },
      { pattern: /\bwhile\s*\(/g, weight: 1, name: "while" },
      { pattern: /\bdo\s*\{/g, weight: 1, name: "do-while" },
      { pattern: /\bswitch\s*\(/g, weight: 1, name: "switch" },
      { pattern: /\bcase\s+[^:]+:/g, weight: 1, name: "case" },
      { pattern: /\bcatch\s*\(/g, weight: 1, name: "catch" },
      { pattern: /\?\s*[^:]+\s*:/g, weight: 1, name: "ternary" },
      { pattern: /&&/g, weight: 1, name: "&&" },
      { pattern: /\|\|/g, weight: 1, name: "||" },
      { pattern: /\?\?/g, weight: 1, name: "??" },
    ]

    function calculateComplexity(code: string): number {
      let complexity = 1
      for (const { pattern } of complexityKeywords) {
        const matches = code.match(pattern)
        if (matches) {
          complexity += matches.length
        }
      }
      return complexity
    }

    function extractFunctions(
      content: string,
      filename: string
    ): { name: string; code: string; line: number; complexity: number }[] {
      const functions: { name: string; code: string; line: number; complexity: number }[] = []
      const lines = content.split("\n")

      const functionPatterns = [
        /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g,
        /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*\{/g,
        /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g,
        /(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g,
      ]

      for (const pattern of functionPatterns) {
        let match
        pattern.lastIndex = 0
        while ((match = pattern.exec(content)) !== null) {
          const name = match[1]
          const startPos = match.index
          const lineNumber = content.slice(0, startPos).split("\n").length

          let braceCount = 0
          let inString = false
          let stringChar = ""
          let endPos = startPos

          for (let i = content.indexOf("{", startPos); i < content.length; i++) {
            const char = content[i]
            const prevChar = content[i - 1]

            if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
              if (!inString) {
                inString = true
                stringChar = char
              } else if (char === stringChar) {
                inString = false
              }
            }

            if (!inString) {
              if (char === "{") braceCount++
              if (char === "}") braceCount--
              if (braceCount === 0) {
                endPos = i + 1
                break
              }
            }
          }

          const code = content.slice(startPos, endPos)
          const complexity = calculateComplexity(code)

          if (name && !functions.find((f) => f.name === name && f.line === lineNumber)) {
            functions.push({ name, code, line: lineNumber, complexity })
          }
        }
      }

      return functions
    }

    try {
      const extPattern = extensions.map((e) => `-name "*.${e}"`).join(" -o ")
      const files =
        await Bun.$`find ${targetPath} -type f \( ${extPattern.split(" ")} \) 2>/dev/null | grep -v node_modules | grep -v .next | grep -v dist | head -200`.text()

      const fileList = files.trim().split("\n").filter((f) => f.length > 0)

      if (fileList.length === 0) {
        return output + "No files found matching the criteria.\n"
      }

      const allFunctions: {
        file: string
        name: string
        line: number
        complexity: number
      }[] = []

      for (const file of fileList) {
        try {
          const content = await Bun.file(file).text()
          const functions = extractFunctions(content, file)

          for (const fn of functions) {
            allFunctions.push({
              file: file.replace(targetPath === "." ? "./" : targetPath + "/", ""),
              name: fn.name,
              line: fn.line,
              complexity: fn.complexity,
            })
          }
        } catch {}
      }

      allFunctions.sort((a, b) => b.complexity - a.complexity)

      const highComplexity = allFunctions.filter((f) => f.complexity > threshold)
      const moderateComplexity = allFunctions.filter(
        (f) => f.complexity > threshold / 2 && f.complexity <= threshold
      )

      output += `## Summary

- **Files analyzed:** ${fileList.length}
- **Functions found:** ${allFunctions.length}
- **High complexity (>${threshold}):** ${highComplexity.length}
- **Moderate complexity (>${threshold / 2}):** ${moderateComplexity.length}

---

`

      if (highComplexity.length > 0) {
        output += `## High Complexity Functions (>${threshold})\n\n`
        output += `| Complexity | Function | File | Line |\n`
        output += `|------------|----------|------|------|\n`
        highComplexity.slice(0, 30).forEach((f) => {
          output += `| **${f.complexity}** | \`${f.name}\` | \`${f.file}\` | ${f.line} |\n`
        })
        output += `\n`
      }

      if (moderateComplexity.length > 0) {
        output += `## Moderate Complexity Functions (>${threshold / 2})\n\n`
        output += `| Complexity | Function | File | Line |\n`
        output += `|------------|----------|------|------|\n`
        moderateComplexity.slice(0, 20).forEach((f) => {
          output += `| ${f.complexity} | \`${f.name}\` | \`${f.file}\` | ${f.line} |\n`
        })
        output += `\n`
      }

      output += `---

## Recommendations

**High complexity functions should be refactored by:**
1. Extracting helper functions
2. Using early returns to reduce nesting
3. Replacing conditionals with polymorphism
4. Using lookup tables instead of switch statements
5. Breaking down into smaller, focused functions

**Complexity scoring:**
- 1-5: Low (simple function)
- 6-10: Moderate (acceptable)
- 11-20: High (consider refactoring)
- 21+: Very high (refactor immediately)
`
    } catch (error) {
      output += `## Error\n\n\`\`\`\n${error}\n\`\`\`\n`
    }

    return output
  },
})
