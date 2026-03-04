import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercent } from '@/lib/metrics';
import { useI18n } from '@/lib/i18n';
import type { ProcessedData } from '@/lib/types';

interface EsspPageProps {
  data: ProcessedData;
  licenseCount: number | null;
  onLicenseChange: (count: number | null) => void;
}

interface EsspMetric {
  zone: string;
  zoneKey: string;
  nameKey: string;
  value: string;
  descKey: string;
  rationaleKey: string;
  formula: string;
}

export function EsspPage({ data, licenseCount, onLicenseChange }: EsspPageProps) {
  const { t } = useI18n();
  const [licenseInput, setLicenseInput] = useState(licenseCount?.toString() || '');
  const s = data.summary;

  const handleLicenseSubmit = () => {
    const n = parseInt(licenseInput, 10);
    onLicenseChange(n > 0 ? n : null);
  };

  const activationRate = licenseCount ? (s.totalUsers / licenseCount) * 100 : null;

  const engagedUsers = data.userSummaries.filter(u => u.totalCodeGenerations > 0 || u.totalCodeAcceptances > 0).length;
  const engagementRate = s.totalUsers > 0 ? (engagedUsers / s.totalUsers) * 100 : 0;

  const avgFeatureBreadth = data.userSummaries.length > 0
    ? data.userSummaries.reduce((sum, u) => sum + u.featureBreadth, 0) / data.userSummaries.length
    : 0;

  const codeVelocity = s.totalUsers > 0 && s.totalDays > 0
    ? s.totalLocAdded / s.totalUsers / s.totalDays
    : 0;

  const sortedByActivity = [...data.userSummaries].sort((a, b) => b.totalCodeGenerations - a.totalCodeGenerations);
  const top20Count = Math.max(1, Math.ceil(sortedByActivity.length * 0.2));
  const top20Total = sortedByActivity.slice(0, top20Count).reduce((s, u) => s + u.totalCodeGenerations, 0);
  const powerUserShare = s.totalCodeGenerations > 0 ? (top20Total / s.totalCodeGenerations) * 100 : 0;

  const interactionIntensity = s.totalUsers > 0 && s.totalDays > 0
    ? s.totalInteractions / s.totalUsers / s.totalDays
    : 0;

  const metrics: EsspMetric[] = [
    {
      zone: t('essp.business_outcome'),
      zoneKey: 'business',
      nameKey: 'essp.engagement_rate',
      value: formatPercent(engagementRate),
      descKey: 'essp.engagement_desc',
      rationaleKey: 'essp.engagement_rationale',
      formula: `(code_generation > 0 || code_acceptance > 0 유저 ${engagedUsers}명) / 전체 활동 유저 ${s.totalUsers}명 × 100`,
    },
    {
      zone: t('essp.business_outcome'),
      zoneKey: 'business',
      nameKey: 'essp.feature_breadth',
      value: avgFeatureBreadth.toFixed(1),
      descKey: 'essp.feature_breadth_desc',
      rationaleKey: 'essp.feature_breadth_rationale',
      formula: `Σ(유저별 totals_by_feature 고유 feature 수) / 전체 유저 ${data.userSummaries.length}명`,
    },
    {
      zone: t('essp.velocity'),
      zoneKey: 'velocity',
      nameKey: 'essp.code_velocity',
      value: `${codeVelocity.toFixed(1)} LOC`,
      descKey: 'essp.code_velocity_desc',
      rationaleKey: 'essp.code_velocity_rationale',
      formula: `총 loc_added_sum ${formatNumber(s.totalLocAdded)} / 유저 ${s.totalUsers}명 / 일수 ${s.totalDays}일`,
    },
    {
      zone: t('essp.velocity'),
      zoneKey: 'velocity',
      nameKey: 'essp.interaction_intensity',
      value: interactionIntensity.toFixed(1),
      descKey: 'essp.interaction_desc',
      rationaleKey: 'essp.interaction_rationale',
      formula: `총 user_initiated_interaction_count ${formatNumber(s.totalInteractions)} / 유저 ${s.totalUsers}명 / 일수 ${s.totalDays}일`,
    },
    {
      zone: t('essp.quality'),
      zoneKey: 'quality',
      nameKey: 'essp.acceptance_efficiency',
      value: formatPercent(s.acceptanceRate),
      descKey: 'essp.acceptance_desc',
      rationaleKey: 'essp.acceptance_rationale',
      formula: `총 code_acceptance_activity_count ${formatNumber(s.totalCodeAcceptances)} / 총 code_generation_activity_count ${formatNumber(s.totalCodeGenerations)} × 100`,
    },
    {
      zone: t('essp.dev_happiness'),
      zoneKey: 'happiness',
      nameKey: 'essp.agent_adoption',
      value: formatPercent(s.agentAdoptionRate),
      descKey: 'essp.agent_desc',
      rationaleKey: 'essp.agent_rationale',
      formula: `used_agent=true 고유 유저 수 / 전체 유저 ${s.totalUsers}명 × 100`,
    },
    {
      zone: t('essp.dev_happiness'),
      zoneKey: 'happiness',
      nameKey: 'essp.chat_usage',
      value: formatPercent(s.chatAdoptionRate),
      descKey: 'essp.chat_desc',
      rationaleKey: 'essp.chat_rationale',
      formula: `used_chat=true 고유 유저 수 / 전체 유저 ${s.totalUsers}명 × 100`,
    },
    {
      zone: t('essp.dev_happiness'),
      zoneKey: 'happiness',
      nameKey: 'essp.power_users',
      value: formatPercent(powerUserShare),
      descKey: 'essp.power_desc',
      rationaleKey: 'essp.power_rationale',
      formula: `상위 20% 유저(${top20Count}명)의 code_generation 합산 ${formatNumber(top20Total)} / 전체 code_generation ${formatNumber(s.totalCodeGenerations)} × 100`,
    },
  ];

  const zoneColors: Record<string, string> = {
    business: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
    velocity: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
    quality: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
    happiness: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('essp.title')}</h2>
        <p className="text-muted-foreground">{t('essp.subtitle')}</p>
      </div>

      {/* Activation Rate - optional */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {t('essp.activation_rate')}
            <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <Input
              type="number"
              placeholder={t('essp.license_placeholder')}
              value={licenseInput}
              onChange={e => setLicenseInput(e.target.value)}
              onBlur={handleLicenseSubmit}
              onKeyDown={e => e.key === 'Enter' && handleLicenseSubmit()}
              className="w-48"
              min={1}
            />
            {activationRate !== null && (
              <span className="text-2xl font-mono font-bold text-primary">{formatPercent(activationRate)}</span>
            )}
            {activationRate === null && (
              <span className="text-sm text-muted-foreground">{t('essp.not_configured')}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t('essp.activation_desc')}</p>
          <p className="text-xs text-muted-foreground mt-1 italic">{t('essp.activation_rationale')}</p>
        </CardContent>
      </Card>

      {/* ESSP Metrics */}
      <div className="space-y-3">
        {metrics.map((m, i) => (
          <motion.div key={m.nameKey} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/80 border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <Badge className={`shrink-0 ${zoneColors[m.zoneKey] || ''}`}>{m.zone}</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-medium text-foreground">{t(m.nameKey as any)}</h3>
                      <span className="text-2xl font-mono font-bold text-primary shrink-0">{m.value}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{t(m.descKey as any)}</p>
                    <div className="mt-2 p-2 rounded bg-muted/30 border border-border/30">
                      <p className="text-xs font-mono text-muted-foreground">📐 {m.formula}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 italic">{t(m.rationaleKey as any)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
