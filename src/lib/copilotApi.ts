export const COPILOT_METRICS_API_VERSION = '2026-03-10';

export type CopilotReportScope = 'enterprise' | 'organization';

export interface FetchCopilotReportsOptions {
  token: string;
  scope: CopilotReportScope;
  slug: string;
  from: string;
  to: string;
  onProgress?: (message: string) => void;
}

export interface FetchedCopilotReports {
  userContent: string;
  teamContent: string;
  days: string[];
}

type ReportKind = 'users-1-day' | 'user-teams-1-day';

interface DownloadLinksResponse {
  download_links?: string[];
  report_day?: string;
  message?: string;
}

export function enumerateDays(from: string, to: string): string[] {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid date range.');
  }
  if (start > end) {
    throw new Error('Start date must be before or equal to end date.');
  }

  const days: string[] = [];
  for (let d = start; d <= end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export async function fetchCopilotReports({
  token,
  scope,
  slug,
  from,
  to,
  onProgress,
}: FetchCopilotReportsOptions): Promise<FetchedCopilotReports> {
  const trimmedToken = token.trim();
  const trimmedSlug = slug.trim();
  if (!trimmedToken) throw new Error('GitHub token is required.');
  if (!trimmedSlug) throw new Error('Enterprise or organization slug is required.');

  const days = enumerateDays(from, to);
  const userChunks: string[] = [];
  const teamChunks: string[] = [];

  for (const day of days) {
    onProgress?.(`Fetching ${day} per-user report...`);
    userChunks.push(await fetchReportForDay(trimmedToken, scope, trimmedSlug, day, 'users-1-day'));

    onProgress?.(`Fetching ${day} user-teams report...`);
    teamChunks.push(await fetchReportForDay(trimmedToken, scope, trimmedSlug, day, 'user-teams-1-day'));
  }

  onProgress?.(`Fetched ${days.length} day(s).`);
  return {
    userContent: userChunks.filter(Boolean).join('\n'),
    teamContent: teamChunks.filter(Boolean).join('\n'),
    days,
  };
}

async function fetchReportForDay(
  token: string,
  scope: CopilotReportScope,
  slug: string,
  day: string,
  kind: ReportKind
): Promise<string> {
  const endpoint = buildReportEndpoint(scope, slug, day, kind);
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': COPILOT_METRICS_API_VERSION,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API request failed (${response.status}) for ${kind} on ${day}: ${text}`);
  }

  const payload = await response.json() as DownloadLinksResponse;
  const links = payload.download_links || [];
  if (links.length === 0) return '';

  const chunks = await Promise.all(links.map(downloadReportLink));
  return chunks.filter(Boolean).join('\n');
}

function buildReportEndpoint(scope: CopilotReportScope, slug: string, day: string, kind: ReportKind): string {
  const encodedSlug = encodeURIComponent(slug);
  const entityPath = scope === 'enterprise' ? `enterprises/${encodedSlug}` : `orgs/${encodedSlug}`;
  const query = new URLSearchParams({ day, apiVersion: COPILOT_METRICS_API_VERSION });
  return `https://api.github.com/${entityPath}/copilot/metrics/reports/${kind}?${query.toString()}`;
}

async function downloadReportLink(url: string): Promise<string> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Report download failed (${response.status}) from signed URL.`);
  }
  return normalizeReportContent(await response.text());
}

function normalizeReportContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('[')) return trimmed;

  const parsed = JSON.parse(trimmed) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('Downloaded report JSON was not an array.');
  }
  return parsed.map(row => JSON.stringify(row)).join('\n');
}
