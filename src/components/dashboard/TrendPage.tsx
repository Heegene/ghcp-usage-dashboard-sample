import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatNumber, formatPercent } from '@/lib/metrics';
import { useI18n } from '@/lib/i18n';
import type { ProcessedData } from '@/lib/types';

const tooltipStyle = { backgroundColor: 'oklch(0.2 0.02 260)', border: '1px solid oklch(0.3 0.02 260)', borderRadius: '8px', color: 'oklch(0.95 0 0)' };

type TrendMetric = 'activeUsers' | 'totalInteractions' | 'totalCodeGenerations' | 'acceptanceRate' | 'totalLocAdded';

export function TrendPage({ data }: { data: ProcessedData }) {
  const { t } = useI18n();
  const [metric, setMetric] = useState<TrendMetric>('activeUsers');

  const chartData = data.dailyTotals.map(d => ({
    ...d,
    name: formatDate(d.date),
  }));

  const metricOptions: { value: TrendMetric; label: string }[] = [
    { value: 'activeUsers', label: t('trend.active_users') },
    { value: 'totalInteractions', label: t('trend.interactions') },
    { value: 'totalCodeGenerations', label: t('trend.code_gen') },
    { value: 'acceptanceRate', label: t('trend.acceptance_rate') },
    { value: 'totalLocAdded', label: t('trend.loc_added') },
  ];

  const formatter = metric === 'acceptanceRate'
    ? (v: number) => formatPercent(v)
    : (v: number) => formatNumber(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t('trend.title')}</h2>
        <Select value={metric} onValueChange={v => setMetric(v as TrendMetric)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {metricOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                <XAxis dataKey="name" stroke="oklch(0.5 0 0)" fontSize={11} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="oklch(0.5 0 0)" fontSize={12} tickFormatter={formatter} />
                <Tooltip contentStyle={tooltipStyle} formatter={formatter} />
                <Area type="monotone" dataKey={metric} stroke="oklch(0.65 0.2 250)" fill="url(#gradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Secondary chart: line */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card/80 border-border/50">
          <CardHeader><CardTitle className="text-base">{t('trend.active_users')} vs {t('trend.interactions')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                <XAxis dataKey="name" stroke="oklch(0.5 0 0)" fontSize={11} angle={-45} textAnchor="end" height={60} />
                <YAxis yAxisId="left" stroke="oklch(0.65 0.2 250)" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="oklch(0.72 0.18 160)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line yAxisId="left" type="monotone" dataKey="activeUsers" stroke="oklch(0.65 0.2 250)" strokeWidth={2} dot={false} name={t('trend.active_users')} />
                <Line yAxisId="right" type="monotone" dataKey="totalInteractions" stroke="oklch(0.72 0.18 160)" strokeWidth={2} dot={false} name={t('trend.interactions')} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
