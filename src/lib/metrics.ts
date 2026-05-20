import type {
  UserDayRecord, ProcessedData, DashboardSummary, UserSummary,
  DailyTotal, FeatureBreakdown, LanguageStat, IdeStat, ModelStat,
  UserTeamRecord, TeamProcessedData, TeamSummary, TeamDailyTotal,
} from './types';

export function parseUserNDJSON(content: string): UserDayRecord[] {
  const trimmed = content.trim();
  const records: UserDayRecord[] = [];

  const lines = trimmed.startsWith('[')
    ? (() => { try { const arr = JSON.parse(trimmed); return Array.isArray(arr) ? arr : []; } catch { return []; } })()
    : trimmed.split('\n').map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);

  for (const obj of lines) {
    if (obj && typeof obj === 'object' && (obj.user_login || obj.user_id) && (obj.day || obj.date)) {
      records.push({
        report_start_day: obj.report_start_day || '',
        report_end_day: obj.report_end_day || '',
        day: obj.day || obj.date || '',
        organization_id: String(obj.organization_id || ''),
        enterprise_id: String(obj.enterprise_id || ''),
        user_id: obj.user_id || 0,
        user_login: obj.user_login || `user-${obj.user_id}`,
        user_initiated_interaction_count: obj.user_initiated_interaction_count || 0,
        code_generation_activity_count: obj.code_generation_activity_count || 0,
        code_acceptance_activity_count: obj.code_acceptance_activity_count || 0,
        loc_suggested_to_add_sum: obj.loc_suggested_to_add_sum || 0,
        loc_suggested_to_delete_sum: obj.loc_suggested_to_delete_sum || 0,
        loc_added_sum: obj.loc_added_sum || 0,
        loc_deleted_sum: obj.loc_deleted_sum || 0,
        used_agent: obj.used_agent || false,
        used_chat: obj.used_chat || false,
        totals_by_ide: Array.isArray(obj.totals_by_ide) ? obj.totals_by_ide : [],
        totals_by_feature: Array.isArray(obj.totals_by_feature) ? obj.totals_by_feature : [],
        totals_by_language_feature: Array.isArray(obj.totals_by_language_feature) ? obj.totals_by_language_feature : [],
        totals_by_language_model: Array.isArray(obj.totals_by_language_model) ? obj.totals_by_language_model : [],
        totals_by_model_feature: Array.isArray(obj.totals_by_model_feature) ? obj.totals_by_model_feature : [],
      });
    }
  }
  return records;
}

export function processData(raw: UserDayRecord[]): ProcessedData {
  const dates = [...new Set(raw.map(r => r.day))].sort();
  const users = [...new Set(raw.map(r => r.user_login))].sort();

  const summary = buildSummary(raw, users);
  const userSummaries = buildUserSummaries(raw, users);
  const dailyTotals = buildDailyTotals(raw, dates);
  const featureBreakdown = buildFeatureBreakdown(raw);
  const languageBreakdown = buildLanguageBreakdown(raw);
  const ideBreakdown = buildIdeBreakdown(raw);
  const modelBreakdown = buildModelBreakdown(raw);

  return {
    raw,
    dateRange: { start: dates[0] || '', end: dates[dates.length - 1] || '' },
    allDates: dates,
    allUsers: users,
    summary,
    userSummaries,
    dailyTotals,
    featureBreakdown,
    languageBreakdown,
    ideBreakdown,
    modelBreakdown,
  };
}

function buildSummary(raw: UserDayRecord[], users: string[]): DashboardSummary {
  const totalUsers = users.length;
  const totalDays = new Set(raw.map(r => r.day)).size;
  let totalInteractions = 0, totalCodeGen = 0, totalCodeAcc = 0;
  let totalLocSuggested = 0, totalLocAdded = 0, totalLocDeleted = 0;
  let agentUsers = 0, chatUsers = 0;

  const userAgentSet = new Set<string>();
  const userChatSet = new Set<string>();

  for (const r of raw) {
    totalInteractions += r.user_initiated_interaction_count;
    totalCodeGen += r.code_generation_activity_count;
    totalCodeAcc += r.code_acceptance_activity_count;
    totalLocSuggested += r.loc_suggested_to_add_sum;
    totalLocAdded += r.loc_added_sum;
    totalLocDeleted += r.loc_deleted_sum;
    if (r.used_agent) userAgentSet.add(r.user_login);
    if (r.used_chat) userChatSet.add(r.user_login);
  }

  agentUsers = userAgentSet.size;
  chatUsers = userChatSet.size;

  return {
    totalUsers,
    totalDays,
    totalInteractions,
    totalCodeGenerations: totalCodeGen,
    totalCodeAcceptances: totalCodeAcc,
    totalLocSuggested,
    totalLocAdded,
    totalLocDeleted,
    acceptanceRate: totalCodeGen > 0 ? (totalCodeAcc / totalCodeGen) * 100 : 0,
    agentAdoptionRate: totalUsers > 0 ? (agentUsers / totalUsers) * 100 : 0,
    chatAdoptionRate: totalUsers > 0 ? (chatUsers / totalUsers) * 100 : 0,
    avgInteractionsPerUser: totalUsers > 0 ? totalInteractions / totalUsers : 0,
    avgCodeGenPerUser: totalUsers > 0 ? totalCodeGen / totalUsers : 0,
    avgLocAddedPerUser: totalUsers > 0 ? totalLocAdded / totalUsers : 0,
  };
}

function buildUserSummaries(raw: UserDayRecord[], users: string[]): UserSummary[] {
  return users.map(login => {
    const records = raw.filter(r => r.user_login === login);
    const daysActive = new Set(records.map(r => r.day)).size;
    let totalInteractions = 0, totalCodeGen = 0, totalCodeAcc = 0;
    let totalLocSuggested = 0, totalLocAdded = 0, totalLocDeleted = 0;
    let usedAgent = false, usedChat = false;
    const featuresSet = new Set<string>();
    const idesSet = new Set<string>();
    const langsSet = new Set<string>();
    const modelsSet = new Set<string>();

    for (const r of records) {
      totalInteractions += r.user_initiated_interaction_count;
      totalCodeGen += r.code_generation_activity_count;
      totalCodeAcc += r.code_acceptance_activity_count;
      totalLocSuggested += r.loc_suggested_to_add_sum;
      totalLocAdded += r.loc_added_sum;
      totalLocDeleted += r.loc_deleted_sum;
      if (r.used_agent) usedAgent = true;
      if (r.used_chat) usedChat = true;
      for (const f of r.totals_by_feature) featuresSet.add(f.feature);
      for (const i of r.totals_by_ide) idesSet.add(i.ide);
      for (const l of r.totals_by_language_feature) {
        if (l.language !== 'others' && l.language !== 'unknown') langsSet.add(l.language);
      }
      for (const m of r.totals_by_language_model) {
        if (m.model && m.model !== 'unknown') modelsSet.add(m.model);
      }
    }

    return {
      userLogin: login,
      userId: records[0]?.user_id || 0,
      daysActive,
      totalInteractions,
      totalCodeGenerations: totalCodeGen,
      totalCodeAcceptances: totalCodeAcc,
      acceptanceRate: totalCodeGen > 0 ? (totalCodeAcc / totalCodeGen) * 100 : 0,
      totalLocSuggested,
      totalLocAdded,
      totalLocDeleted,
      usedAgent,
      usedChat,
      featuresUsed: [...featuresSet],
      idesUsed: [...idesSet],
      languagesUsed: [...langsSet],
      modelsUsed: [...modelsSet],
      featureBreadth: featuresSet.size,
    };
  }).sort((a, b) => b.totalCodeGenerations - a.totalCodeGenerations);
}

function buildDailyTotals(raw: UserDayRecord[], dates: string[]): DailyTotal[] {
  return dates.map(date => {
    const dayRecords = raw.filter(r => r.day === date);
    const activeUsers = new Set(dayRecords.map(r => r.user_login)).size;
    let totalInteractions = 0, totalCodeGen = 0, totalCodeAcc = 0;
    let totalLocSuggested = 0, totalLocAdded = 0;
    for (const r of dayRecords) {
      totalInteractions += r.user_initiated_interaction_count;
      totalCodeGen += r.code_generation_activity_count;
      totalCodeAcc += r.code_acceptance_activity_count;
      totalLocSuggested += r.loc_suggested_to_add_sum;
      totalLocAdded += r.loc_added_sum;
    }
    return {
      date,
      activeUsers,
      totalInteractions,
      totalCodeGenerations: totalCodeGen,
      totalCodeAcceptances: totalCodeAcc,
      acceptanceRate: totalCodeGen > 0 ? (totalCodeAcc / totalCodeGen) * 100 : 0,
      totalLocSuggested,
      totalLocAdded,
    };
  });
}

function buildFeatureBreakdown(raw: UserDayRecord[]): FeatureBreakdown[] {
  const map = new Map<string, { users: Set<string>; interactions: number; codeGen: number; codeAcc: number; locAdded: number }>();
  for (const r of raw) {
    for (const f of r.totals_by_feature) {
      const existing = map.get(f.feature) || { users: new Set<string>(), interactions: 0, codeGen: 0, codeAcc: 0, locAdded: 0 };
      existing.users.add(r.user_login);
      existing.interactions += f.user_initiated_interaction_count;
      existing.codeGen += f.code_generation_activity_count;
      existing.codeAcc += f.code_acceptance_activity_count;
      existing.locAdded += f.loc_added_sum;
      map.set(f.feature, existing);
    }
  }
  return [...map.entries()]
    .map(([feature, d]) => ({
      feature,
      userCount: d.users.size,
      totalInteractions: d.interactions,
      totalCodeGenerations: d.codeGen,
      totalCodeAcceptances: d.codeAcc,
      totalLocAdded: d.locAdded,
    }))
    .sort((a, b) => b.totalCodeGenerations - a.totalCodeGenerations);
}

function buildLanguageBreakdown(raw: UserDayRecord[]): LanguageStat[] {
  const map = new Map<string, { codeGen: number; codeAcc: number; locSuggested: number; locAdded: number }>();
  for (const r of raw) {
    for (const l of r.totals_by_language_feature) {
      if (l.language === 'others') continue;
      const existing = map.get(l.language) || { codeGen: 0, codeAcc: 0, locSuggested: 0, locAdded: 0 };
      existing.codeGen += l.code_generation_activity_count;
      existing.codeAcc += l.code_acceptance_activity_count;
      existing.locSuggested += l.loc_suggested_to_add_sum;
      existing.locAdded += l.loc_added_sum;
      map.set(l.language, existing);
    }
  }
  return [...map.entries()]
    .map(([language, d]) => ({
      language,
      totalCodeGenerations: d.codeGen,
      totalCodeAcceptances: d.codeAcc,
      acceptanceRate: d.codeGen > 0 ? (d.codeAcc / d.codeGen) * 100 : 0,
      totalLocSuggested: d.locSuggested,
      totalLocAdded: d.locAdded,
    }))
    .sort((a, b) => b.totalCodeGenerations - a.totalCodeGenerations);
}

function buildIdeBreakdown(raw: UserDayRecord[]): IdeStat[] {
  const map = new Map<string, { users: Set<string>; interactions: number; codeGen: number; codeAcc: number; locAdded: number }>();
  for (const r of raw) {
    for (const i of r.totals_by_ide) {
      const existing = map.get(i.ide) || { users: new Set<string>(), interactions: 0, codeGen: 0, codeAcc: 0, locAdded: 0 };
      existing.users.add(r.user_login);
      existing.interactions += i.user_initiated_interaction_count;
      existing.codeGen += i.code_generation_activity_count;
      existing.codeAcc += i.code_acceptance_activity_count;
      existing.locAdded += i.loc_added_sum;
      map.set(i.ide, existing);
    }
  }
  return [...map.entries()]
    .map(([ide, d]) => ({
      ide,
      userCount: d.users.size,
      totalInteractions: d.interactions,
      totalCodeGenerations: d.codeGen,
      totalCodeAcceptances: d.codeAcc,
      totalLocAdded: d.locAdded,
    }))
    .sort((a, b) => b.totalCodeGenerations - a.totalCodeGenerations);
}

function buildModelBreakdown(raw: UserDayRecord[]): ModelStat[] {
  const map = new Map<string, { users: Set<string>; codeGen: number; codeAcc: number; locAdded: number }>();
  for (const r of raw) {
    for (const m of r.totals_by_language_model) {
      if (!m.model || m.model === 'unknown') continue;
      const existing = map.get(m.model) || { users: new Set<string>(), codeGen: 0, codeAcc: 0, locAdded: 0 };
      existing.users.add(r.user_login);
      existing.codeGen += m.code_generation_activity_count;
      existing.codeAcc += m.code_acceptance_activity_count;
      existing.locAdded += m.loc_added_sum;
      map.set(m.model, existing);
    }
  }
  return [...map.entries()]
    .map(([model, d]) => ({
      model,
      userCount: d.users.size,
      totalCodeGenerations: d.codeGen,
      totalCodeAcceptances: d.codeAcc,
      totalLocAdded: d.locAdded,
    }))
    .sort((a, b) => b.totalCodeGenerations - a.totalCodeGenerations);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.round(num).toLocaleString();
}

export function formatPercent(num: number): string {
  return num.toFixed(1) + '%';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================
// Team-level metrics (user-teams-1-day API, apiVersion=2026-03-10)
// ============================================================

export function parseUserTeamsNDJSON(content: string): UserTeamRecord[] {
  const trimmed = content.trim();
  const records: UserTeamRecord[] = [];

  const lines = trimmed.startsWith('[')
    ? (() => { try { const arr = JSON.parse(trimmed); return Array.isArray(arr) ? arr : []; } catch { return []; } })()
    : trimmed.split('\n').map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);

  for (const obj of lines) {
    if (obj && typeof obj === 'object' && obj.team_id !== undefined && (obj.user_id || obj.user_login)) {
      records.push({
        user_id: obj.user_id || 0,
        user_login: obj.user_login || `user-${obj.user_id}`,
        day: obj.day || '',
        organization_id: obj.organization_id ? String(obj.organization_id) : undefined,
        enterprise_id: obj.enterprise_id ? String(obj.enterprise_id) : undefined,
        team_id: Number(obj.team_id),
        slug: obj.slug || `team-${obj.team_id}`,
      });
    }
  }
  return records;
}

export function detectFileType(content: string): 'user' | 'team' | 'unknown' {
  const trimmed = content.trim();
  const firstLine = trimmed.startsWith('[') ? null : trimmed.split('\n')[0];
  try {
    const sample = firstLine ? JSON.parse(firstLine) : JSON.parse(trimmed)[0];
    if (!sample || typeof sample !== 'object') return 'unknown';
    if ('team_id' in sample && 'slug' in sample) return 'team';
    if (('user_login' in sample || 'user_id' in sample) && ('code_generation_activity_count' in sample || 'totals_by_feature' in sample)) return 'user';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export function processTeamData(
  userRecords: UserDayRecord[],
  teamRecords: UserTeamRecord[]
): TeamProcessedData {
  const userRecordKeys = (record: UserDayRecord) => {
    const keys = [`${record.user_id}:${record.day}`];
    if (record.enterprise_id) keys.push(`${record.user_id}:${record.day}:enterprise:${record.enterprise_id}`);
    if (record.organization_id) keys.push(`${record.user_id}:${record.day}:organization:${record.organization_id}`);
    return keys;
  };

  const teamRecordKey = (record: UserTeamRecord) => {
    if (record.enterprise_id) return `${record.user_id}:${record.day}:enterprise:${record.enterprise_id}`;
    if (record.organization_id) return `${record.user_id}:${record.day}:organization:${record.organization_id}`;
    return `${record.user_id}:${record.day}`;
  };

  // Build lookup for the required join keys: user_id, day, and enterprise/org id.
  const userMap = new Map<string, UserDayRecord>();
  for (const r of userRecords) {
    for (const key of userRecordKeys(r)) {
      userMap.set(key, r);
    }
  }

  // Group team records by team_id
  const teamGroups = new Map<number, { slug: string; records: { teamRecord: UserTeamRecord; userRecord: UserDayRecord }[] }>();

  for (const tr of teamRecords) {
    const key = teamRecordKey(tr);
    const userRecord = userMap.get(key);
    if (!userRecord) continue; // no matching user activity

    if (!teamGroups.has(tr.team_id)) {
      teamGroups.set(tr.team_id, { slug: tr.slug, records: [] });
    }
    teamGroups.get(tr.team_id)!.records.push({ teamRecord: tr, userRecord });
  }

  // Build team summaries
  const teamSummaries: TeamSummary[] = [];
  const teamDailyTotals: TeamDailyTotal[] = [];

  for (const [teamId, group] of teamGroups) {
    const userSet = new Set<string>();
    const agentUserSet = new Set<string>();
    const chatUserSet = new Set<string>();
    let totalInteractions = 0, totalCodeGen = 0, totalCodeAcc = 0;
    let totalLocSuggested = 0, totalLocAdded = 0, totalLocDeleted = 0;

    // Daily aggregation
    const dailyMap = new Map<string, { users: Set<string>; interactions: number; codeGen: number; codeAcc: number; locAdded: number }>();

    for (const { teamRecord, userRecord } of group.records) {
      userSet.add(userRecord.user_login);
      totalInteractions += userRecord.user_initiated_interaction_count;
      totalCodeGen += userRecord.code_generation_activity_count;
      totalCodeAcc += userRecord.code_acceptance_activity_count;
      totalLocSuggested += userRecord.loc_suggested_to_add_sum;
      totalLocAdded += userRecord.loc_added_sum;
      totalLocDeleted += userRecord.loc_deleted_sum;
      if (userRecord.used_agent) agentUserSet.add(userRecord.user_login);
      if (userRecord.used_chat) chatUserSet.add(userRecord.user_login);

      const day = teamRecord.day;
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { users: new Set(), interactions: 0, codeGen: 0, codeAcc: 0, locAdded: 0 });
      }
      const daily = dailyMap.get(day)!;
      daily.users.add(userRecord.user_login);
      daily.interactions += userRecord.user_initiated_interaction_count;
      daily.codeGen += userRecord.code_generation_activity_count;
      daily.codeAcc += userRecord.code_acceptance_activity_count;
      daily.locAdded += userRecord.loc_added_sum;
    }

    const activeUsers = userSet.size;
    teamSummaries.push({
      teamId,
      slug: group.slug,
      activeUsers,
      totalInteractions,
      totalCodeGenerations: totalCodeGen,
      totalCodeAcceptances: totalCodeAcc,
      acceptanceRate: totalCodeGen > 0 ? (totalCodeAcc / totalCodeGen) * 100 : 0,
      totalLocSuggested,
      totalLocAdded,
      totalLocDeleted,
      agentUsers: agentUserSet.size,
      chatUsers: chatUserSet.size,
      agentAdoptionRate: activeUsers > 0 ? (agentUserSet.size / activeUsers) * 100 : 0,
      chatAdoptionRate: activeUsers > 0 ? (chatUserSet.size / activeUsers) * 100 : 0,
      members: [...userSet].sort(),
    });

    for (const [date, daily] of dailyMap) {
      teamDailyTotals.push({
        date,
        teamId,
        slug: group.slug,
        activeUsers: daily.users.size,
        totalInteractions: daily.interactions,
        totalCodeGenerations: daily.codeGen,
        totalCodeAcceptances: daily.codeAcc,
        acceptanceRate: daily.codeGen > 0 ? (daily.codeAcc / daily.codeGen) * 100 : 0,
        totalLocAdded: daily.locAdded,
      });
    }
  }

  teamSummaries.sort((a, b) => b.totalCodeGenerations - a.totalCodeGenerations);
  teamDailyTotals.sort((a, b) => a.date.localeCompare(b.date));

  const allTeams = teamSummaries.map(t => ({ teamId: t.teamId, slug: t.slug }));
  const totalTeams = allTeams.length;
  const avgTeamSize = totalTeams > 0 ? teamSummaries.reduce((sum, t) => sum + t.activeUsers, 0) / totalTeams : 0;

  return {
    teamSummaries,
    teamDailyTotals,
    allTeams,
    totalTeams,
    avgTeamSize,
  };
}
