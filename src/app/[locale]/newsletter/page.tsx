import NewsletterClient from './NewsletterClient';
import { getNflState, getCompletedWeek } from '@/lib/sleeper-api';
import { getNewsletterArchives } from './storage-actions';
import { getSiteConfig } from '@/lib/site-config';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import LeagueNotConfigured from '@/components/LeagueNotConfigured';

export default async function NewsletterPage({params}: {params: Promise<{locale: string}>}) {
  const { locale } = await params;
  const [state, config, isAdmin] = await Promise.all([
    getNflState(),
    getSiteConfig(),
    isAdminAuthenticated(),
  ]);

  if (!config.leagueId) {
    return <LeagueNotConfigured locale={locale} />;
  }

  const completedWeek = getCompletedWeek(state) || 1;
  const archivedWeeks = await getNewsletterArchives(config.leagueId);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <NewsletterClient
        leagueId={config.leagueId}
        currentWeek={completedWeek}
        initialArchives={archivedWeeks}
        readOnly={false}
        isAdmin={isAdmin}
        customTitle={config.newsletterTitle}
        customSubtitle={config.newsletterSubtitle}
      />
    </div>
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
