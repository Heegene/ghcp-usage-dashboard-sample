import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendUp, Minus, UsersThree, WarningCircle } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercent, formatDate } from '@/lib/metrics';
import { useI18n } from '@/lib/i18n';
import type { TeamProcessedData, TeamSummary } from '@/lib/types';

const tooltipStyle = { backgroundColor: 'oklch(0.2 0.02 260)', border: '1px solid oklch(0.3 0.02 260)', borderRadius: '8px', color: 'oklch(0.95 0 0)' };

const CHART_COLORS = [
  'oklch(0.65 0.2 250)',  // blue
  'oklch(0.72 0.18 160)', // green
  'oklch(0.7 0.18 50)',   // orange
  'oklch(0.65 0.2 310)',  // purple
  'oklch(0.7 0.18 20)',   // red
  'oklch(0.7 0.15 200)',  // teal
  'oklch(0.7 0.18 80)',   // yellow
  'oklch(0.65 0.2 280)',  // indigo
];

function StatCard({ title, value, subtitle, trend = 'neutral', delay = 0 }: {
  title: string; value: string; subtitle?: string; trend?: 'up' | 'neutral'; delay?: number;
}) {
  const TrendIcon = trend === 'up' ? TrendUp : Minus;
  const trendColor = trend === 'up' ? 'text-accent' : 'text-muted-foreground';
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <Card className="bg-card/80 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-3xl font-mono font-semibold text-foreground">{value}</p>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <TrendIcon className={`w-5 h-5 ${trendColor}`} weight="bold" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface TeamsPageProps {
  teamData: TeamProcessedData;
}

export function TeamsPage({ teamData }: TeamsPageProps) {
  const { t } = useI18n();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [comparisonMetric, setComparisonMetric] = useState<string>('activeUsers');

  const { teamSummaries, teamDailyTotals, totalTeams, avgTeamSize } = teamData;

  const mostActive = teamSummaries[0];

  const selectedTeam = useMemo<TeamSummary | null>(() => {
    if (selectedTeamId === 'all') return null;
    return teamSummaries.find(t => String(t.teamId) === selectedTeamId) || null;
  }, [selectedTeamId, teamSummaries]);

  const comparisonData = useMemo(() => {
    return teamSummaries.slice(0, 15).map(team => ({
      name: team.slug,
      activeUsers: team.activeUsers,
      codeGen: team.totalCodeGenerations,
      acceptanceRate: Math.round(team.acceptanceRate * 10) / 10,
      locAdded: team.totalLocAdded,
      interactions: team.totalInteractions,
    }));
  }, [teamSummaries]);

  const radarData = useMemo(() => {
    const top5 = teamSummaries.slice(0, 5);
    if (top5.length === 0) return [];
    const maxValues = {
      activeUsers: Math.max(...top5.map(t => t.activeUsers), 1),
      interactions: Math.max(...top5.map(t => t.totalInteractions), 1),
      codeGen: Math.max(...top5.map(t => t.totalCodeGenerations), 1),
      locAdded: Math.max(...top5.map(t => t.totalLocAdded), 1),
      agentAdoption: 100,
      chatAdoption: 100,
    };

    const dimensions = [
      { key: 'activeUsers', label: t('teams.active_users') },
      { key: 'interactions', label: t('teams.interactions') },
      { key: 'codeGen', label: t('teams.code_gen') },
      { key: 'locAdded', label: t('teams.loc_added') },
      { key: 'agentAdoption', label: t('teams.agent_adoption') },
      { key: 'chatAdoption', label: t('teams.chat_adoption') },
    ];

    return dimensions.map(dim => {
      const row: Record<string, string | number> = { dimension: dim.label };
      for (const team of top5) {
        const rawVal = dim.key === 'activeUsers' ? team.activeUsers
          : dim.key === 'interactions' ? team.totalInteractions
          : dim.key === 'codeGen' ? team.totalCodeGenerations
          : dim.key === 'locAdded' ? team.totalLocAdded
          : dim.key === 'agentAdoption' ? team.agentAdoptionRate
          : team.chatAdoptionRate;
        row[team.slug] = Math.round((rawVal / maxValues[dim.key as keyof typeof maxValues]) * 100);
      }
      return row;
    });
  }, [teamSummaries, t]);

  const selectedTeamDailyData = useMemo(() => {
    if (!selectedTeam) return [];
    return teamDailyTotals
      .filter(d => d.teamId === selectedTeam.teamId)
      .map(d => ({ ...d, name: formatDate(d.date) }));
  }, [selectedTeam, teamDailyTotals]);

  const comparisonMetricOptions = [
    { value: 'activeUsers', label: t('teams.active_users') },
    { value: 'codeGen', label: t('teams.code_gen') },
    { value: 'interactions', label: t('teams.interactions') },
    { value: 'locAdded', label: t('teams.loc_added') },
    { value: 'acceptanceRate', label: t('teams.acceptance_rate') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('teams.title')}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t('teams.subtitle')}</p>
      </div>

      {/* Caveats */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
          <WarningCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" weight="fill" />
          <span>{t('teams.caveat_min_users')}</span>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
          <WarningCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" weight="fill" />
          <span>{t('teams.caveat_multi_team')}</span>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t('teams.total_teams')}
          value={formatNumber(totalTeams)}
          trend="up"
          delay={0}
        />
        <StatCard
          title={t('teams.avg_team_size')}
          value={avgTeamSize.toFixed(1)}
          subtitle={t('teams.active_users')}
          trend="neutral"
          delay={0.1}
        />
        {mostActive && (
          <StatCard
            title={t('teams.most_active')}
            value={mostActive.slug}
            subtitle={`${formatNumber(mostActive.totalCodeGenerations)} ${t('teams.code_gen')}`}
            trend="up"
            delay={0.2}
          />
        )}
      </div>

      {/* Tabs: Comparison / Detail */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">{t('teams.comparison')}</TabsTrigger>
          <TabsTrigger value="detail">{t('teams.detail')}</TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {/* Bar chart comparison */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t('teams.comparison')}</CardTitle>
                <Select value={comparisonMetric} onValueChange={setComparisonMetric}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {comparisonMetricOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(300, comparisonData.length * 40)}>
                  <BarChart data={comparisonData} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                    <XAxis type="number" stroke="oklch(0.5 0 0)" fontSize={12}
                      tickFormatter={comparisonMetric === 'acceptanceRate' ? (v: number) => formatPercent(v) : (v: number) => formatNumber(v)} />
                    <YAxis type="category" dataKey="name" stroke="oklch(0.5 0 0)" fontSize={11} width={80} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={comparisonMetric === 'acceptanceRate' ? (v: number) => formatPercent(v) : (v: number) => formatNumber(v)} />
                    <Bar dataKey={comparisonMetric} fill="oklch(0.65 0.2 250)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Radar chart for top 5 teams */}
          {radarData.length > 0 && teamSummaries.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Top {Math.min(5, teamSummaries.length)} Teams — Multi-Dimension</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="oklch(0.3 0.02 260)" />
                      <PolarAngleAxis dataKey="dimension" stroke="oklch(0.6 0 0)" fontSize={11} />
                      <PolarRadiusAxis stroke="oklch(0.4 0 0)" fontSize={10} />
                      {teamSummaries.slice(0, 5).map((team, i) => (
                        <Radar key={team.teamId} name={team.slug} dataKey={team.slug}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                          fillOpacity={0.1} strokeWidth={2} />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Teams table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card/80 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">{t('teams.overview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Team</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t('teams.active_users')}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t('teams.interactions')}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t('teams.code_gen')}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t('teams.acceptance_rate')}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t('teams.loc_added')}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t('teams.agent_adoption')}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t('teams.chat_adoption')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamSummaries.map((team, idx) => (
                        <tr key={team.teamId}
                          className="border-b border-border/30 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => { setSelectedTeamId(String(team.teamId)); }}
                        >
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-2">
                              <UsersThree className="w-4 h-4 text-primary" weight="fill" />
                              <span className="font-medium text-foreground">{team.slug}</span>
                              {idx === 0 && <Badge variant="outline" className="text-xs">🏆</Badge>}
                            </div>
                          </td>
                          <td className="text-right py-2.5 px-2 font-mono">{team.activeUsers}</td>
                          <td className="text-right py-2.5 px-2 font-mono">{formatNumber(team.totalInteractions)}</td>
                          <td className="text-right py-2.5 px-2 font-mono">{formatNumber(team.totalCodeGenerations)}</td>
                          <td className="text-right py-2.5 px-2 font-mono">{formatPercent(team.acceptanceRate)}</td>
                          <td className="text-right py-2.5 px-2 font-mono">{formatNumber(team.totalLocAdded)}</td>
                          <td className="text-right py-2.5 px-2 font-mono">{formatPercent(team.agentAdoptionRate)}</td>
                          <td className="text-right py-2.5 px-2 font-mono">{formatPercent(team.chatAdoptionRate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Detail Tab */}
        <TabsContent value="detail" className="space-y-6">
          <div className="flex items-center gap-4">
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-60"><SelectValue placeholder={t('teams.select_team')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('teams.all_teams')}</SelectItem>
                {teamData.allTeams.map(team => (
                  <SelectItem key={team.teamId} value={String(team.teamId)}>{team.slug}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTeam ? (
            <>
              {/* Team summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title={t('teams.active_users')} value={String(selectedTeam.activeUsers)} delay={0} trend="up" />
                <StatCard title={t('teams.code_gen')} value={formatNumber(selectedTeam.totalCodeGenerations)} delay={0.1} trend="up" />
                <StatCard title={t('teams.acceptance_rate')} value={formatPercent(selectedTeam.acceptanceRate)} delay={0.2} trend={selectedTeam.acceptanceRate > 20 ? 'up' : 'neutral'} />
                <StatCard title={t('teams.loc_added')} value={formatNumber(selectedTeam.totalLocAdded)} delay={0.3} trend="up" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title={t('teams.agent_adoption')} value={formatPercent(selectedTeam.agentAdoptionRate)} subtitle={`${selectedTeam.agentUsers} / ${selectedTeam.activeUsers}`} delay={0.4} trend={selectedTeam.agentAdoptionRate > 50 ? 'up' : 'neutral'} />
                <StatCard title={t('teams.chat_adoption')} value={formatPercent(selectedTeam.chatAdoptionRate)} subtitle={`${selectedTeam.chatUsers} / ${selectedTeam.activeUsers}`} delay={0.5} trend={selectedTeam.chatAdoptionRate > 50 ? 'up' : 'neutral'} />
              </div>

              {/* Daily trend */}
              {selectedTeamDailyData.length > 1 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-card/80 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">{t('teams.daily_trend')} — {selectedTeam.slug}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={selectedTeamDailyData}>
                          <defs>
                            <linearGradient id="teamGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                          <XAxis dataKey="name" stroke="oklch(0.5 0 0)" fontSize={11} angle={-45} textAnchor="end" height={60} />
                          <YAxis stroke="oklch(0.5 0 0)" fontSize={12} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Area type="monotone" dataKey="totalCodeGenerations" stroke="oklch(0.65 0.2 250)" fill="url(#teamGradient)" strokeWidth={2} name={t('teams.code_gen')} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Members */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-card/80 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base">{t('teams.members')} ({selectedTeam.members.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeam.members.map(member => (
                        <Badge key={member} variant="secondary" className="font-mono text-xs">
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <UsersThree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('teams.select_team')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
