import NewsletterClient from '../newsletter/NewsletterClient';
import { getNflState, getCompletedWeek } from '@/lib/sleeper-api';
import { getNewsletterArchives } from '../newsletter/storage-actions';
import { getSiteConfig } from '@/lib/site-config';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import LeagueNotConfigured from '@/components/LeagueNotConfigured';
import Link from 'next/link';
import { Newspaper, Settings } from 'lucide-react';

export default async function NewsPage({params}: {params: Promise<{locale: string}>}) {
  const { locale } = await params;
  const isUk = locale === 'uk';

  const [state, config, isAdmin] = await Promise.all([
    getNflState(),
    getSiteConfig(),
    isAdminAuthenticated(),
  ]);

  if (!config.leagueId) {
    return <LeagueNotConfigured locale={locale} />;
  }

  if (!config.newsletterEnabled) {
    return (
      <div className="max-w-lg mx-auto my-16 glass-panel p-8 border border-slate-700 text-center space-y-4">
        <Newspaper className="w-10 h-10 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">
          {isUk ? 'Розділ Газети Вимкнено' : 'Newsletter Feature Disabled'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isUk
            ? 'Адміністратор сайту вимкнув генерацію щотижневої газети для цієї ліги.'
            : 'The site administrator has disabled the newsletter feature for this league.'}
        </p>
        {isAdmin && (
          <Link
            href={`/${locale}/admin`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300"
          >
            <Settings className="w-4 h-4" />
            <span>{isUk ? 'Увімкнути в Панелі Адміна' : 'Enable in Admin Settings'}</span>
          </Link>
        )}
      </div>
    );
  }

  const completedWeek = getCompletedWeek(state) || 1;
  const archivedWeeks = await getNewsletterArchives(config.leagueId);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <NewsletterClient
        leagueId={config.leagueId}
        currentWeek={completedWeek}
        initialArchives={archivedWeeks}
        readOnly={true}
        isAdmin={isAdmin}
        customTitle={config.newsletterTitle}
        customSubtitle={config.newsletterSubtitle}
      />
    </div>
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
