import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GithubLogo, ChartLineUp, X, House, UsersThree, Puzzle, Code, Brain, Lightbulb, TrendUp, Globe } from '@phosphor-icons/react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { OverviewPage } from '@/components/dashboard/OverviewPage';
import { UsersPage } from '@/components/dashboard/UsersPage';
import { FeaturesPage } from '@/components/dashboard/FeaturesPage';
import { LanguagesPage } from '@/components/dashboard/LanguagesPage';
import { ModelsPage } from '@/components/dashboard/ModelsPage';
import { EsspPage } from '@/components/dashboard/EsspPage';
import { TrendPage } from '@/components/dashboard/TrendPage';
import { parseUserNDJSON, processData } from '@/lib/metrics';
import { useI18n } from '@/lib/i18n';
import type { ProcessedData, PageId, UserDayRecord } from '@/lib/types';

const NAV_ITEMS: { id: PageId; icon: typeof House; labelKey: string }[] = [
  { id: 'overview', icon: House, labelKey: 'nav.overview' },
  { id: 'users', icon: UsersThree, labelKey: 'nav.users' },
  { id: 'features', icon: Puzzle, labelKey: 'nav.features' },
  { id: 'languages', icon: Code, labelKey: 'nav.languages' },
  { id: 'models', icon: Brain, labelKey: 'nav.models' },
  { id: 'essp', icon: Lightbulb, labelKey: 'nav.essp' },
  { id: 'trend', icon: TrendUp, labelKey: 'nav.trend' },
];

function App() {
  const { t, lang, setLang } = useI18n();
  const [rawRecords, setRawRecords] = useState<UserDayRecord[] | null>(null);
  const [page, setPage] = useState<PageId>('overview');
  const [licenseCount, setLicenseCount] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredRecords = useMemo(() => {
    if (!rawRecords) return null;
    let records = rawRecords;
    if (dateFrom) records = records.filter(r => r.day >= dateFrom);
    if (dateTo) records = records.filter(r => r.day <= dateTo);
    return records;
  }, [rawRecords, dateFrom, dateTo]);

  const data = useMemo<ProcessedData | null>(() => {
    if (!filteredRecords || filteredRecords.length === 0) return null;
    return processData(filteredRecords);
  }, [filteredRecords]);

  const handleFileLoad = useCallback((content: string) => {
    try {
      const parsed = parseUserNDJSON(content);
      if (parsed.length === 0) {
        toast.error(t('upload.no_data'));
        return;
      }
      setRawRecords(parsed);
      const dates = [...new Set(parsed.map(r => r.day))].sort();
      setDateFrom(dates[0] || '');
      setDateTo(dates[dates.length - 1] || '');
      toast.success(t('upload.success'));
    } catch {
      toast.error(t('upload.error'));
    }
  }, [t]);

  const handleClear = useCallback(() => {
    setRawRecords(null);
    setDateFrom('');
    setDateTo('');
    setPage('overview');
    toast.info(t('app.cleared'));
  }, [t]);

  const renderPage = () => {
    if (!data) return null;
    switch (page) {
      case 'overview': return <OverviewPage data={data} />;
      case 'users': return <UsersPage data={data} />;
      case 'features': return <FeaturesPage data={data} />;
      case 'languages': return <LanguagesPage data={data} />;
      case 'models': return <ModelsPage data={data} />;
      case 'essp': return <EsspPage data={data} licenseCount={licenseCount} onLicenseChange={setLicenseCount} />;
      case 'trend': return <TrendPage data={data} />;
      default: return <OverviewPage data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <GithubLogo className="w-5 h-5 text-white" weight="fill" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">{t('app.title')}</h1>
                <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {data && (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <ChartLineUp className="w-4 h-4" />
                    <span>{data.allDates.length} {t('app.days_of_data')} · {data.allUsers.length} {t('app.users')}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5">
                    <X className="w-3.5 h-3.5" />
                    {t('app.clear')}
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
                className="gap-1.5 text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                {lang === 'ko' ? 'EN' : 'KO'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!data ? (
          <motion.main
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">{t('upload.title')}</h2>
              <p className="text-muted-foreground text-lg">{t('upload.desc')}</p>
            </div>
            <FileUpload onFileLoad={handleFileLoad} />
            <div className="mt-8 p-4 rounded-lg bg-card/50 border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-2">{t('upload.how')}</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>{t('upload.step1')}</li>
                <li>{t('upload.step2')}</li>
                <li>{t('upload.step3')}</li>
                <li>{t('upload.step4')}</li>
              </ol>
            </div>
          </motion.main>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex"
          >
            {/* Sidebar */}
            <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-border/50 bg-background/60 backdrop-blur">
              <ScrollArea className="h-full">
                <nav className="p-3 space-y-1">
                  {NAV_ITEMS.map(item => {
                    const Icon = item.icon;
                    const active = page === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setPage(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          active
                            ? 'bg-primary/15 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" weight={active ? 'fill' : 'regular'} />
                        {t(item.labelKey as any)}
                      </button>
                    );
                  })}
                </nav>

                {/* Date range filter */}
                <div className="p-3 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t('filter.date_range')}</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">{t('filter.from')}</label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t('filter.to')}</label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    {rawRecords && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          const dates = [...new Set(rawRecords.map(r => r.day))].sort();
                          setDateFrom(dates[0] || '');
                          setDateTo(dates[dates.length - 1] || '');
                        }}
                      >
                        {t('filter.all')}
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;