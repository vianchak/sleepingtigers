import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getLeagueData } from '@/lib/sleeper-api';
import MultiverseClient from '@/components/MultiverseClient';
import { getSiteConfig } from '@/lib/site-config';
import LeagueNotConfigured from '@/components/LeagueNotConfigured';

export default async function MultiversePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, 'Multiverse');
  const { leagueId } = await getSiteConfig();
  if (!leagueId) {
    return <LeagueNotConfigured locale={locale} />;
  }

  const teams = await getLeagueData(leagueId);
  if (!teams || teams.length === 0) {
    return <div className="text-yellow-400">{t('loading')}</div>;
  }

  // Sort teams alphabetically for the dropdowns
  teams.sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <MultiverseClient teams={teams} />
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
