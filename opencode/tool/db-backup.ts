import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Creates a timestamped database backup. Supports PostgreSQL (via pg_dump) and generates SQL dump files.",
  args: {
    database_url: tool.schema
      .string()
      .optional()
      .describe(
        "Database connection URL. If not provided, uses DATABASE_URL env var."
      ),
    output_dir: tool.schema
      .string()
      .optional()
      .describe("Directory to save backup. Defaults to ./backups"),
    format: tool.schema
      .enum(["sql", "custom", "directory"])
      .optional()
      .describe("Backup format: sql (plain text), custom (compressed), or directory. Defaults to sql."),
    tables: tool.schema
      .string()
      .optional()
      .describe("Comma-separated list of specific tables to backup. If empty, backs up entire database."),
    schema_only: tool.schema
      .boolean()
      .optional()
      .describe("If true, only backup schema without data. Defaults to false."),
  },
  async execute(args) {
    const dbUrl = args.database_url || process.env.DATABASE_URL
    if (!dbUrl) {
      return "Error: No database URL provided and DATABASE_URL environment variable is not set."
    }

    const outputDir = args.output_dir || "./backups"
    const format = args.format || "sql"
    const schemaOnly = args.schema_only || false

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
    
    let extension = ".sql"
    let formatFlag = "--format=plain"
    if (format === "custom") {
      extension = ".dump"
      formatFlag = "--format=custom"
    } else if (format === "directory") {
      extension = ""
      formatFlag = "--format=directory"
    }

    const filename = `backup_${timestamp}${extension}`
    const outputPath = `${outputDir}/${filename}`

    try {
      await Bun.$`mkdir -p ${outputDir}`.quiet()
    } catch (error) {
      return `Error creating backup directory: ${error}`
    }

    let pgDumpArgs = [formatFlag, `--file=${outputPath}`]
    
    if (schemaOnly) {
      pgDumpArgs.push("--schema-only")
    }

    if (args.tables) {
      const tables = args.tables.split(",").map((t) => t.trim())
      tables.forEach((table) => {
        pgDumpArgs.push(`--table=${table}`)
      })
    }

    try {
      const result = await Bun.$`pg_dump ${dbUrl} ${pgDumpArgs}`.text()
      
      let fileSize = "unknown"
      try {
        if (format !== "directory") {
          const stats = await Bun.$`ls -lh ${outputPath}`.text()
          const sizeMatch = stats.match(/\s+(\d+(?:\.\d+)?[KMGT]?)\s+/)
          if (sizeMatch) fileSize = sizeMatch[1]
        } else {
          const stats = await Bun.$`du -sh ${outputPath}`.text()
          fileSize = stats.split("\t")[0]
        }
      } catch {}

      return `# Database Backup Complete

**File:** \`${outputPath}\`
**Format:** ${format}
**Size:** ${fileSize}
**Timestamp:** ${timestamp}
**Schema only:** ${schemaOnly}
${args.tables ? `**Tables:** ${args.tables}` : "**Tables:** All tables"}

${result ? `**Output:**\n\`\`\`\n${result}\n\`\`\`` : ""}`
    } catch (error) {
      return `# Backup Failed

**Error:** ${error}

**Troubleshooting:**
- Ensure pg_dump is installed and in PATH
- Verify the database URL is correct
- Check database connectivity
- Ensure you have sufficient permissions`
    }
  },
})
