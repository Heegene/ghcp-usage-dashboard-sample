import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber } from '@/lib/metrics';
import { useI18n } from '@/lib/i18n';
import type { ProcessedData } from '@/lib/types';

const COLORS = ['oklch(0.65 0.2 250)', 'oklch(0.72 0.18 160)', 'oklch(0.7 0.18 45)', 'oklch(0.65 0.2 300)', 'oklch(0.7 0.15 200)', 'oklch(0.75 0.15 80)', 'oklch(0.6 0.2 280)', 'oklch(0.68 0.2 30)'];
const tooltipStyle = { backgroundColor: 'oklch(0.2 0.02 260)', border: '1px solid oklch(0.3 0.02 260)', borderRadius: '8px', color: 'oklch(0.95 0 0)' };

export function LanguagesPage({ data }: { data: ProcessedData }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<'lang' | 'ide'>('lang');

  const langData = data.languageBreakdown.slice(0, 15).map(l => ({
    name: l.language.length > 14 ? l.language.slice(0, 14) + '…' : l.language,
    fullName: l.language,
    codeGen: l.totalCodeGenerations,
    locAdded: l.totalLocAdded,
  }));

  const ideData = data.ideBreakdown.map(i => ({
    name: i.ide,
    userCount: i.userCount,
    codeGen: i.totalCodeGenerations,
    locAdded: i.totalLocAdded,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t('languages.title')}</h2>
      <Tabs value={tab} onValueChange={v => setTab(v as 'lang' | 'ide')}>
        <TabsList><TabsTrigger value="lang">{t('languages.tab_lang')}</TabsTrigger><TabsTrigger value="ide">{t('languages.tab_ide')}</TabsTrigger></TabsList>
      </Tabs>

      {tab === 'lang' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-card/80 border-border/50">
              <CardHeader><CardTitle className="text-base">{t('features.code_gen')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={langData} layout="vertical" margin={{ left: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                    <XAxis type="number" stroke="oklch(0.5 0 0)" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="oklch(0.5 0 0)" fontSize={11} width={85} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatNumber(v)} />
                    <Bar dataKey="codeGen" radius={[0, 4, 4, 0]}>
                      {langData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      <LabelList dataKey="codeGen" position="right" fill="oklch(0.8 0 0)" fontSize={11} formatter={(v: number) => formatNumber(v)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/80 border-border/50">
              <CardHeader><CardTitle className="text-base">LOC Added</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={langData} layout="vertical" margin={{ left: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                    <XAxis type="number" stroke="oklch(0.5 0 0)" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="oklch(0.5 0 0)" fontSize={11} width={85} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatNumber(v)} />
                    <Bar dataKey="locAdded" radius={[0, 4, 4, 0]}>
                      {langData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      <LabelList dataKey="locAdded" position="right" fill="oklch(0.8 0 0)" fontSize={11} formatter={(v: number) => formatNumber(v)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {tab === 'ide' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-card/80 border-border/50">
              <CardHeader><CardTitle className="text-base">{t('features.user_count')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={ideData} cx="50%" cy="50%" outerRadius={100} dataKey="userCount" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {ideData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/80 border-border/50">
              <CardHeader><CardTitle className="text-base">{t('features.code_gen')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ideData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                    <XAxis dataKey="name" stroke="oklch(0.5 0 0)" fontSize={12} />
                    <YAxis stroke="oklch(0.5 0 0)" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatNumber(v)} />
                    <Bar dataKey="codeGen" fill={COLORS[0]} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="codeGen" position="top" fill="oklch(0.8 0 0)" fontSize={11} formatter={(v: number) => formatNumber(v)} />
                    </Bar>
                    <Bar dataKey="locAdded" fill={COLORS[1]} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="locAdded" position="top" fill="oklch(0.8 0 0)" fontSize={11} formatter={(v: number) => formatNumber(v)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
