import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber, formatPercent } from '@/lib/metrics';
import { useI18n } from '@/lib/i18n';
import type { ProcessedData } from '@/lib/types';

interface UsersPageProps {
  data: ProcessedData;
}

type SortKey = 'totalCodeGenerations' | 'totalInteractions' | 'totalLocAdded' | 'acceptanceRate' | 'daysActive' | 'featureBreadth';
type SortDir = 'asc' | 'desc';

export function UsersPage({ data }: UsersPageProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('totalCodeGenerations');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.userSummaries
      .filter(u => u.userLogin.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortBy] as number, bv = b[sortBy] as number;
        return sortDir === 'desc' ? bv - av : av - bv;
      });
  }, [data.userSummaries, search, sortBy, sortDir]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t('users.title')}</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder={t('users.search')} value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-48"><SelectValue placeholder={t('users.sort_by')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="totalCodeGenerations">{t('users.code_gen')}</SelectItem>
            <SelectItem value="totalInteractions">{t('users.interactions')}</SelectItem>
            <SelectItem value="totalLocAdded">{t('users.loc_added')}</SelectItem>
            <SelectItem value="acceptanceRate">{t('users.acceptance_rate')}</SelectItem>
            <SelectItem value="daysActive">{t('users.days_active')}</SelectItem>
            <SelectItem value="featureBreadth">{t('users.features')}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="gap-1.5 shrink-0"
        >
          {sortDir === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
          {sortDir === 'desc' ? 'DESC' : 'ASC'}
        </Button>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} {t('app.users')}</span>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        {filtered.map((u, i) => (
          <Card key={u.userLogin} className="bg-card/80 border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">#{i + 1}</span>
                  {u.userLogin}
                </CardTitle>
                <div className="flex gap-1.5">
                  {u.usedAgent && <Badge variant="secondary" className="text-xs">Agent</Badge>}
                  {u.usedChat && <Badge variant="secondary" className="text-xs">Chat</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">{t('users.days_active')}</p>
                  <p className="font-mono font-medium">{u.daysActive}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t('users.interactions')}</p>
                  <p className="font-mono font-medium">{formatNumber(u.totalInteractions)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t('users.code_gen')}</p>
                  <p className="font-mono font-medium">{formatNumber(u.totalCodeGenerations)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t('users.acceptance_rate')}</p>
                  <p className="font-mono font-medium">{formatPercent(u.acceptanceRate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t('users.loc_added')}</p>
                  <p className="font-mono font-medium">{formatNumber(u.totalLocAdded)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t('users.features')}</p>
                  <p className="font-mono font-medium">{u.featureBreadth}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">IDE</p>
                  <p className="font-mono font-medium text-xs">{u.idesUsed.join(', ')}</p>
                </div>
              </div>
              {u.languagesUsed.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {u.languagesUsed.slice(0, 8).map(l => (
                    <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                  ))}
                  {u.languagesUsed.length > 8 && <Badge variant="outline" className="text-xs">+{u.languagesUsed.length - 8}</Badge>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
