import { type Plugin, tool } from "@opencode-ai/plugin"
import { readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"

interface ToolStats {
  name: string
  calls: number
  totalDuration: number
  avgDuration: number
  lastUsed: string
  errors: number
}

interface AnalyticsData {
  tools: Record<string, ToolStats>
  sessions: number
  lastUpdated: string
}

export const ToolAnalyticsPlugin: Plugin = async (ctx) => {
  const dataDir = join(ctx.directory, ".opencode", "analytics")
  const dataFile = join(dataDir, "tool-usage.json")

  const pendingCalls: Map<string, { tool: string; startTime: number }> = new Map()

  async function ensureDataDir() {
    try {
      await mkdir(dataDir, { recursive: true })
    } catch {}
  }

  async function loadData(): Promise<AnalyticsData> {
    try {
      const content = await readFile(dataFile, "utf-8")
      return JSON.parse(content)
    } catch {
      return {
        tools: {},
        sessions: 0,
        lastUpdated: new Date().toISOString(),
      }
    }
  }

  async function saveData(data: AnalyticsData) {
    await ensureDataDir()
    data.lastUpdated = new Date().toISOString()
    await writeFile(dataFile, JSON.stringify(data, null, 2))
  }

  return {
    hook: {
      "session:start": async () => {
        const data = await loadData()
        data.sessions++
        await saveData(data)
      },
      "tool:before": async (event) => {
        const callId = `${event.tool}-${Date.now()}-${Math.random()}`
        pendingCalls.set(callId, {
          tool: event.tool || "unknown",
          startTime: Date.now(),
        })
        ;(event as any)._analyticsCallId = callId
      },
      "tool:after": async (event) => {
        const callId = (event as any)._analyticsCallId
        const pending = callId ? pendingCalls.get(callId) : null

        const data = await loadData()
        const toolName = event.tool || "unknown"

        if (!data.tools[toolName]) {
          data.tools[toolName] = {
            name: toolName,
            calls: 0,
            totalDuration: 0,
            avgDuration: 0,
            lastUsed: new Date().toISOString(),
            errors: 0,
          }
        }

        const stats = data.tools[toolName]
        stats.calls++
        stats.lastUsed = new Date().toISOString()

        if (pending) {
          const duration = Date.now() - pending.startTime
          stats.totalDuration += duration
          stats.avgDuration = Math.round(stats.totalDuration / stats.calls)
          pendingCalls.delete(callId)
        }

        if (event.error) {
          stats.errors++
        }

        await saveData(data)
      },
    },
    tool: {
      "view-analytics": tool({
        description: "View tool usage analytics and statistics",
        args: {},
        async execute() {
          const data = await loadData()
          const tools = Object.values(data.tools).sort((a, b) => b.calls - a.calls)

          let output = `# Tool Usage Analytics\n\n`
          output += `**Total Sessions:** ${data.sessions}\n`
          output += `**Last Updated:** ${data.lastUpdated}\n\n`

          if (tools.length === 0) {
            output += "No tool usage data yet.\n"
            return output
          }

          output += `## Tool Statistics\n\n`
          output += `| Tool | Calls | Avg Duration | Errors | Last Used |\n`
          output += `|------|-------|--------------|--------|------------|\n`

          for (const t of tools) {
            output += `| ${t.name} | ${t.calls} | ${t.avgDuration}ms | ${t.errors} | ${t.lastUsed.split("T")[0]} |\n`
          }

          output += `\n## Most Used Tools\n\n`
          tools.slice(0, 5).forEach((t, i) => {
            output += `${i + 1}. **${t.name}** - ${t.calls} calls\n`
          })

          return output
        },
      }),
      "reset-analytics": tool({
        description: "Reset all tool usage analytics",
        args: {},
        async execute() {
          const emptyData: AnalyticsData = {
            tools: {},
            sessions: 0,
            lastUpdated: new Date().toISOString(),
          }
          await saveData(emptyData)
          return "Analytics data has been reset."
        },
      }),
    },
  }
}

export default ToolAnalyticsPlugin
