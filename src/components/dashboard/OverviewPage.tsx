import { motion } from 'framer-motion';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber, formatPercent } from '@/lib/metrics';
import { useI18n } from '@/lib/i18n';
import type { ProcessedData } from '@/lib/types';

interface OverviewPageProps {
  data: ProcessedData;
}

function StatCard({ title, value, subtitle, trend = 'neutral', delay = 0 }: {
  title: string; value: string; subtitle?: string; trend?: 'up' | 'down' | 'neutral'; delay?: number;
}) {
  const TrendIcon = trend === 'up' ? TrendUp : trend === 'down' ? TrendDown : Minus;
  const trendColor = trend === 'up' ? 'text-accent' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
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

export function OverviewPage({ data }: OverviewPageProps) {
  const { t } = useI18n();
  const s = data.summary;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('overview.title')}</h2>
        <p className="text-muted-foreground">{data.dateRange.start} — {data.dateRange.end}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('overview.total_users')} value={formatNumber(s.totalUsers)} subtitle={`${s.totalDays} ${t('app.days_of_data')}`} trend="up" delay={0} />
        <StatCard title={t('overview.total_interactions')} value={formatNumber(s.totalInteractions)} subtitle={`${formatNumber(s.avgInteractionsPerUser)} ${t('overview.avg_interactions')}`} trend="up" delay={0.1} />
        <StatCard title={t('overview.code_generations')} value={formatNumber(s.totalCodeGenerations)} subtitle={`${formatNumber(s.avgCodeGenPerUser)} ${t('overview.avg_codegen')}`} trend="up" delay={0.2} />
        <StatCard title={t('overview.acceptance_rate')} value={formatPercent(s.acceptanceRate)} subtitle={`${formatNumber(s.totalCodeAcceptances)} / ${formatNumber(s.totalCodeGenerations)}`} trend={s.acceptanceRate > 20 ? 'up' : 'neutral'} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title={t('overview.loc_added')} value={formatNumber(s.totalLocAdded)} subtitle={`${formatNumber(s.avgLocAddedPerUser)} ${t('overview.avg_loc')}`} trend="up" delay={0.4} />
        <StatCard title={t('overview.agent_adoption')} value={formatPercent(s.agentAdoptionRate)} trend={s.agentAdoptionRate > 50 ? 'up' : 'neutral'} delay={0.5} />
        <StatCard title={t('overview.chat_adoption')} value={formatPercent(s.chatAdoptionRate)} trend={s.chatAdoptionRate > 50 ? 'up' : 'neutral'} delay={0.6} />
      </div>
    </div>
  );
}
