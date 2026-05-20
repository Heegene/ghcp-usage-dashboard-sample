#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API_VERSION = '2026-03-10';

const args = parseArgs(process.argv.slice(2));
const scope = args.enterprise ? 'enterprise' : args.org ? 'organization' : '';
const slug = args.enterprise || args.org || '';
const from = args.from;
const to = args.to || args.from;
const outDir = args.out || 'reports';

if (!scope || !slug || !from) {
  usage();
  process.exit(1);
}

const days = enumerateDays(from, to);
const usersChunks = [];
const teamsChunks = [];

mkdirSync(outDir, { recursive: true });

for (const day of days) {
  console.log(`Fetching ${day} per-user report...`);
  usersChunks.push(await fetchReport(scope, slug, day, 'users-1-day'));

  console.log(`Fetching ${day} user-teams report...`);
  teamsChunks.push(await fetchReport(scope, slug, day, 'user-teams-1-day'));
}

const usersPath = join(outDir, 'copilot-users.ndjson');
const teamsPath = join(outDir, 'copilot-user-teams.ndjson');
writeFileSync(usersPath, usersChunks.filter(Boolean).join('\n'));
writeFileSync(teamsPath, teamsChunks.filter(Boolean).join('\n'));

console.log(`Wrote ${usersPath}`);
console.log(`Wrote ${teamsPath}`);

async function fetchReport(reportScope, reportSlug, day, reportKind) {
  const entityPath = reportScope === 'enterprise'
    ? `enterprises/${encodeURIComponent(reportSlug)}`
    : `orgs/${encodeURIComponent(reportSlug)}`;
  const endpoint = `/${entityPath}/copilot/metrics/reports/${reportKind}?day=${day}&apiVersion=${API_VERSION}`;
  const response = JSON.parse(execFileSync('gh', [
    'api',
    '-H', `X-GitHub-Api-Version: ${API_VERSION}`,
    '-H', 'Accept: application/vnd.github+json',
    endpoint,
  ], { encoding: 'utf8' }));

  const links = response.download_links || [];
  const chunks = [];
  for (const link of links) {
    const download = await fetch(link, { headers: { Accept: 'application/json' } });
    if (!download.ok) {
      throw new Error(`Download failed (${download.status}) for ${reportKind} on ${day}`);
    }
    chunks.push(normalizeReportContent(await download.text()));
  }
  return chunks.filter(Boolean).join('\n');
}

function normalizeReportContent(content) {
  const trimmed = content.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('[')) return trimmed;

  const parsed = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) {
    throw new Error('Downloaded report JSON was not an array.');
  }
  return parsed.map(row => JSON.stringify(row)).join('\n');
}

function enumerateDays(fromDate, toDate) {
  const start = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid date range. Use YYYY-MM-DD.');
  }
  if (start > end) {
    throw new Error('--from must be before or equal to --to.');
  }

  const result = [];
  for (let d = start; d <= end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    parsed[key] = value;
  }
  return parsed;
}

function usage() {
  console.error(`Usage:
  npm run fetch:reports -- --enterprise <slug> --from YYYY-MM-DD [--to YYYY-MM-DD] [--out reports]
  npm run fetch:reports -- --org <org> --from YYYY-MM-DD [--to YYYY-MM-DD] [--out reports]

Requires: gh auth login with an account that can view Copilot Metrics.
Uses Copilot Metrics API apiVersion=${API_VERSION}.`);
}
