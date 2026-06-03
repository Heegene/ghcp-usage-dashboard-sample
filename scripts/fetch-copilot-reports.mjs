#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API_VERSION = '2026-03-10';

const args = parseArgs(process.argv.slice(2));
const enterprise = args.enterprise || '';
const from = args.from;
const to = args.to || args.from;
const outDir = args.out || 'reports';

if (args.org) {
  console.error('Organization scope is not supported. Use --enterprise with the Enterprise slug.');
  process.exit(1);
}

if (!enterprise || !from) {
  usage();
  process.exit(1);
}

const days = enumerateDays(from, to);
const usersChunks = [];
const teamsChunks = [];

mkdirSync(outDir, { recursive: true });

for (const day of days) {
  console.log(`Fetching ${day} per-user report...`);
  usersChunks.push(await fetchReport(enterprise, day, 'users-1-day'));

  console.log(`Fetching ${day} user-teams report...`);
  teamsChunks.push(await fetchReport(enterprise, day, 'user-teams-1-day'));
}

const usersPath = join(outDir, 'copilot-users.ndjson');
const teamsPath = join(outDir, 'copilot-user-teams.ndjson');
writeFileSync(usersPath, usersChunks.filter(Boolean).join('\n'));
writeFileSync(teamsPath, teamsChunks.filter(Boolean).join('\n'));

console.log(`Wrote ${usersPath}`);
console.log(`Wrote ${teamsPath}`);

async function fetchReport(enterpriseSlug, day, reportKind) {
  const endpoint = `/enterprises/${encodeURIComponent(enterpriseSlug)}/copilot/metrics/reports/${reportKind}?day=${day}&apiVersion=${API_VERSION}`;
  const rawResponse = execFileSync('gh', [
    'api',
    '-H', `X-GitHub-Api-Version: ${API_VERSION}`,
    '-H', 'Accept: application/vnd.github+json',
    endpoint,
  ], { encoding: 'utf8' });
  if (!rawResponse.trim()) return '';

  const response = JSON.parse(rawResponse);

  const links = response.download_links || [];
  const chunks = [];
  for (const link of links) {
    const download = await fetch(link, { headers: { Accept: 'application/json' } });
    if (!download.ok) {
      throw new Error(`Download failed (${download.status}) for ${reportKind} on ${day}`);
    }
    chunks.push(normalizeReportContent(await download.text(), day));
  }
  return chunks.filter(Boolean).join('\n');
}

function normalizeReportContent(content, day) {
  const trimmed = content.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('[')) {
    return trimmed
      .split('\n')
      .map(line => {
        try {
          return normalizeReportRow(JSON.parse(line), day);
        } catch {
          return line;
        }
      })
      .join('\n');
  }

  const parsed = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) {
    throw new Error('Downloaded report JSON was not an array.');
  }
  return parsed.map(row => normalizeReportRow(row, day)).join('\n');
}

function normalizeReportRow(row, day) {
  if (row && typeof row === 'object' && !Array.isArray(row)) {
    if (typeof row.day !== 'string' || row.day.length === 0) {
      return JSON.stringify({ ...row, day });
    }
  }
  return JSON.stringify(row);
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

Requires: gh auth login with an account that can view Copilot Metrics.
Uses Copilot Metrics API apiVersion=${API_VERSION}.`);
}
