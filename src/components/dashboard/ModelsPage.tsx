import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/metrics';
import { useI18n } from '@/lib/i18n';
import type { ProcessedData } from '@/lib/types';

const COLORS = ['oklch(0.65 0.2 250)', 'oklch(0.72 0.18 160)', 'oklch(0.7 0.18 45)', 'oklch(0.65 0.2 300)', 'oklch(0.7 0.15 200)', 'oklch(0.75 0.15 80)', 'oklch(0.6 0.2 280)', 'oklch(0.68 0.2 30)'];
const tooltipStyle = { backgroundColor: 'oklch(0.2 0.02 260)', border: '1px solid oklch(0.3 0.02 260)', borderRadius: '8px', color: 'oklch(0.95 0 0)' };

export function ModelsPage({ data }: { data: ProcessedData }) {
  const { t } = useI18n();

  const chartData = data.modelBreakdown.slice(0, 10).map(m => ({
    name: m.model,
    userCount: m.userCount,
    codeGen: m.totalCodeGenerations,
    locAdded: m.totalLocAdded,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t('models.title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 border-border/50">
            <CardHeader><CardTitle className="text-base">{t('features.user_count')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="userCount" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/80 border-border/50">
            <CardHeader><CardTitle className="text-base">{t('features.code_gen')} & LOC Added</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                  <XAxis type="number" stroke="oklch(0.5 0 0)" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.5 0 0)" fontSize={10} width={115} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatNumber(v)} />
                  <Bar dataKey="codeGen" fill={COLORS[0]} radius={[0, 4, 4, 0]} name="Code Gen" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
