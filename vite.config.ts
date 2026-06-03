import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'
import type { IncomingMessage, ServerResponse } from 'node:http'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const COPILOT_METRICS_API_VERSION = '2026-03-10'
type ReportKind = 'users-1-day' | 'user-teams-1-day'

// https://vite.dev/config/
export default defineConfig({
  base: '/ghcp-usage-dashboard-sample/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copilot-reports-local-proxy',
      configureServer(server) {
        server.middlewares.use(handleCopilotReportsProxy)
      },
      configurePreviewServer(server) {
        server.middlewares.use(handleCopilotReportsProxy)
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});

async function handleCopilotReportsProxy(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (req.method !== 'POST' || req.url !== '/api/copilot-reports') {
    next()
    return
  }

  try {
    const body = JSON.parse(await readRequestBody(req)) as {
      token?: string
      enterprise?: string
      from?: string
      to?: string
    }
    const token = body.token?.trim() || ''
    const enterprise = body.enterprise?.trim() || ''
    const from = body.from || ''
    const to = body.to || from
    if (!token || !enterprise || !from) {
      sendJson(res, 400, { error: 'GitHub token, Enterprise slug, and start date are required.' })
      return
    }

    const days = enumerateDays(from, to)
    const userChunks: string[] = []
    const teamChunks: string[] = []
    for (const day of days) {
      userChunks.push(await fetchReportForDay(token, enterprise, day, 'users-1-day'))
      teamChunks.push(await fetchReportForDay(token, enterprise, day, 'user-teams-1-day'))
    }

    sendJson(res, 200, {
      userContent: userChunks.filter(Boolean).join('\n'),
      teamContent: teamChunks.filter(Boolean).join('\n'),
      days,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    sendJson(res, 500, { error: message })
  }
}

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString('utf8')
    })
    req.on('end', () => resolveBody(body))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function enumerateDays(from: string, to: string): string[] {
  const start = new Date(`${from}T00:00:00Z`)
  const end = new Date(`${to}T00:00:00Z`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid date range.')
  }
  if (start > end) {
    throw new Error('Start date must be before or equal to end date.')
  }

  const days: string[] = []
  for (let d = start; d <= end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

async function fetchReportForDay(
  token: string,
  enterprise: string,
  day: string,
  kind: ReportKind
): Promise<string> {
  const endpoint = `https://api.github.com/enterprises/${encodeURIComponent(enterprise)}/copilot/metrics/reports/${kind}?${new URLSearchParams({ day, apiVersion: COPILOT_METRICS_API_VERSION })}`
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': COPILOT_METRICS_API_VERSION,
    },
  })
  if (response.status === 204) return ''
  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}) for ${kind} on ${day}: ${await response.text()}`)
  }

  const payload = await response.json() as { download_links?: string[] }
  const chunks = await Promise.all((payload.download_links || []).map(link => downloadReportLink(link, day)))
  return chunks.filter(Boolean).join('\n')
}

async function downloadReportLink(url: string, day: string): Promise<string> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Report download failed (${response.status}) from signed URL.`)
  }
  return normalizeReportContent(await response.text(), day)
}

function normalizeReportContent(content: string, day: string): string {
  const trimmed = content.trim()
  if (!trimmed) return ''
  if (!trimmed.startsWith('[')) {
    return trimmed
      .split('\n')
      .map(line => {
        try {
          return normalizeReportRow(JSON.parse(line), day)
        } catch {
          return line
        }
      })
      .join('\n')
  }

  const parsed = JSON.parse(trimmed) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error('Downloaded report JSON was not an array.')
  }
  return parsed.map(row => normalizeReportRow(row, day)).join('\n')
}

function normalizeReportRow(row: unknown, day: string): string {
  if (row && typeof row === 'object' && !Array.isArray(row)) {
    const record = row as Record<string, unknown>
    if (typeof record.day !== 'string' || record.day.length === 0) {
      return JSON.stringify({ ...record, day })
    }
  }
  return JSON.stringify(row)
}
