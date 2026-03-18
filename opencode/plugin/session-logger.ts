import type { Plugin } from "@opencode-ai/plugin"
import { appendFile, mkdir } from "fs/promises"
import { join } from "path"

export const SessionLoggerPlugin: Plugin = async (ctx) => {
  const logDir = join(ctx.directory, ".opencode", "logs")
  const logFile = join(logDir, "sessions.log")

  async function ensureLogDir() {
    try {
      await mkdir(logDir, { recursive: true })
    } catch {}
  }

  async function log(message: string) {
    await ensureLogDir()
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\n`
    try {
      await appendFile(logFile, logEntry)
    } catch (e) {
      console.error("Session logger error:", e)
    }
  }

  return {
    hook: {
      "session:start": async (event) => {
        await log(`SESSION START | ID: ${event.session?.id || "unknown"} | Agent: ${event.agent || "default"}`)
      },
      "session:end": async (event) => {
        await log(`SESSION END | ID: ${event.session?.id || "unknown"} | Duration: ${event.duration || "unknown"}ms`)
      },
      "message:start": async (event) => {
        const preview = event.content?.slice(0, 100).replace(/\n/g, " ") || ""
        await log(`MESSAGE START | Session: ${event.sessionId || "unknown"} | Preview: "${preview}..."`)
      },
      "message:end": async (event) => {
        await log(`MESSAGE END | Session: ${event.sessionId || "unknown"} | Tokens: ${event.tokens || "unknown"}`)
      },
    },
  }
}

export default SessionLoggerPlugin
