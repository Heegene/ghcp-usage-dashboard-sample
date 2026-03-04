import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/metrics';
import { useI18n } from '@/lib/i18n';
import type { ProcessedData } from '@/lib/types';

const COLORS = ['oklch(0.65 0.2 250)', 'oklch(0.72 0.18 160)', 'oklch(0.7 0.18 45)', 'oklch(0.65 0.2 300)', 'oklch(0.7 0.15 200)', 'oklch(0.75 0.15 80)', 'oklch(0.6 0.2 280)', 'oklch(0.68 0.2 30)'];
const tooltipStyle = { backgroundColor: 'oklch(0.2 0.02 260)', border: '1px solid oklch(0.3 0.02 260)', borderRadius: '8px', color: 'oklch(0.95 0 0)' };

function featureDisplayName(f: string): string {
  const map: Record<string, string> = {
    code_completion: 'Code Completion',
    chat_panel_agent_mode: 'Chat (Agent)',
    chat_panel_ask_mode: 'Chat (Ask)',
    chat_panel_edit_mode: 'Chat (Edit)',
    chat_panel_custom_mode: 'Chat (Custom)',
    chat_panel_plan_mode: 'Chat (Plan)',
    chat_panel_unknown_mode: 'Chat (Other)',
    agent_edit: 'Agent Edit',
    chat_inline: 'Inline Chat',
  };
  return map[f] || f;
}

export function FeaturesPage({ data }: { data: ProcessedData }) {
  const { t } = useI18n();

  const chartData = data.featureBreakdown.map(f => ({
    name: featureDisplayName(f.feature),
    userCount: f.userCount,
    codeGen: f.totalCodeGenerations,
    locAdded: f.totalLocAdded,
    interactions: f.totalInteractions,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t('features.title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 border-border/50">
            <CardHeader><CardTitle className="text-base">{t('features.user_count')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                  <XAxis type="number" stroke="oklch(0.5 0 0)" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.5 0 0)" fontSize={11} width={95} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="userCount" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/80 border-border/50">
            <CardHeader><CardTitle className="text-base">{t('features.code_gen')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                  <XAxis type="number" stroke="oklch(0.5 0 0)" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.5 0 0)" fontSize={11} width={95} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatNumber(v)} />
                  <Bar dataKey="codeGen" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-card/80 border-border/50">
          <CardHeader><CardTitle className="text-base">LOC Added</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                <XAxis type="number" stroke="oklch(0.5 0 0)" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="oklch(0.5 0 0)" fontSize={11} width={95} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatNumber(v)} />
                <Bar dataKey="locAdded" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
