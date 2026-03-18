import { type Plugin, tool } from "@opencode-ai/plugin"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export const AutoFormatterPlugin: Plugin = async (ctx) => {
  const formatterConfig = {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".scss", ".md"],
    formatters: {
      prettier: ["ts", "tsx", "js", "jsx", "json", "css", "scss", "md", "mdx"],
      biome: ["ts", "tsx", "js", "jsx", "json"],
    },
    enabled: true,
  }

  async function detectFormatter(): Promise<"prettier" | "biome" | null> {
    try {
      await execAsync("npx prettier --version", { cwd: ctx.directory })
      return "prettier"
    } catch {
      try {
        await execAsync("npx biome --version", { cwd: ctx.directory })
        return "biome"
      } catch {
        return null
      }
    }
  }

  async function formatFile(filePath: string): Promise<{ success: boolean; message: string }> {
    const ext = filePath.split(".").pop() || ""
    
    if (!formatterConfig.extensions.some((e) => filePath.endsWith(e))) {
      return { success: true, message: "Skipped (unsupported extension)" }
    }

    const formatter = await detectFormatter()
    
    if (!formatter) {
      return { success: false, message: "No formatter found (prettier or biome)" }
    }

    try {
      if (formatter === "prettier") {
        await execAsync(`npx prettier --write "${filePath}"`, { cwd: ctx.directory })
      } else if (formatter === "biome") {
        await execAsync(`npx biome format --write "${filePath}"`, { cwd: ctx.directory })
      }
      return { success: true, message: `Formatted with ${formatter}` }
    } catch (error) {
      return { success: false, message: `Format error: ${error}` }
    }
  }

  return {
    hook: {
      "tool:after": async (event) => {
        if (!formatterConfig.enabled) return

        const toolName = event.tool
        if (toolName !== "edit" && toolName !== "write") return

        const filePath = (event as any).args?.filePath || (event as any).args?.file
        if (!filePath) return

        if (typeof filePath === "string") {
          const result = await formatFile(filePath)
          if (result.success) {
            console.log(`[auto-formatter] ${filePath}: ${result.message}`)
          }
        }
      },
    },
    tool: {
      "format-file": tool({
        description: "Manually format a file using the project's formatter (prettier or biome)",
        args: {
          file: tool.schema.string().describe("Path to the file to format"),
        },
        async execute(args) {
          const result = await formatFile(args.file)
          return result.success
            ? `Formatted: ${args.file}\n${result.message}`
            : `Failed to format: ${args.file}\n${result.message}`
        },
      }),
      "format-all": tool({
        description: "Format all supported files in the project",
        args: {
          path: tool.schema.string().optional().describe("Path to format (defaults to current directory)"),
        },
        async execute(args) {
          const targetPath = args.path || "."
          const formatter = await detectFormatter()

          if (!formatter) {
            return "No formatter found. Install prettier or biome."
          }

          try {
            if (formatter === "prettier") {
              const { stdout } = await execAsync(
                `npx prettier --write "${targetPath}/**/*.{ts,tsx,js,jsx,json,css,scss,md}"`,
                { cwd: ctx.directory }
              )
              return `Formatted with prettier:\n${stdout}`
            } else {
              const { stdout } = await execAsync(
                `npx biome format --write "${targetPath}"`,
                { cwd: ctx.directory }
              )
              return `Formatted with biome:\n${stdout}`
            }
          } catch (error) {
            return `Format error: ${error}`
          }
        },
      }),
      "toggle-auto-format": tool({
        description: "Toggle automatic formatting on/off",
        args: {},
        async execute() {
          formatterConfig.enabled = !formatterConfig.enabled
          return `Auto-formatting is now ${formatterConfig.enabled ? "enabled" : "disabled"}`
        },
      }),
    },
  }
}

export default AutoFormatterPlugin
