import { useState, type FormEvent } from 'react';
import { DownloadSimple, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchCopilotReports } from '@/lib/copilotApi';
import { useI18n } from '@/lib/i18n';

interface ApiImportProps {
  onReportsLoaded: (userContent: string, teamContent: string) => void;
}

export function ApiImport({ onReportsLoaded }: ApiImportProps) {
  const { t } = useI18n();
  const [enterprise, setEnterprise] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setProgress('');

    try {
      const reports = await fetchCopilotReports({
        token,
        enterprise,
        from,
        to,
        onProgress: setProgress,
      });
      onReportsLoaded(reports.userContent, reports.teamContent);
      setToken('');
      setProgress('');
      toast.success(t('api_import.success'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('api_import.error');
      toast.error(message);
      setProgress(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <DownloadSimple className="w-5 h-5 text-primary" />
          {t('api_import.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">{t('api_import.slug')}</label>
            <Input
              value={enterprise}
              onChange={event => setEnterprise(event.target.value)}
              placeholder="my-enterprise"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">{t('api_import.enterprise_only')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">{t('filter.from')}</label>
              <Input type="date" value={from} onChange={event => setFrom(event.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t('filter.to')}</label>
              <Input type="date" value={to} onChange={event => setTo(event.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">{t('api_import.token')}</label>
            <Input
              type="password"
              value={token}
              onChange={event => setToken(event.target.value)}
              placeholder="github_pat_..."
              autoComplete="off"
              required
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-accent" weight="fill" />
            <span>{t('api_import.privacy')} {t('api_import.fallback')}</span>
          </div>

          {progress && <p className="text-xs text-muted-foreground font-mono">{progress}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('api_import.loading') : t('api_import.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
