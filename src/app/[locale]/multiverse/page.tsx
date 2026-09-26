import { getTranslations } from 'next-intl/server';
import { getLeagueData } from '@/lib/sleeper-api';
import MultiverseClient from '@/components/MultiverseClient';



export default async function MultiversePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Multiverse'});
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID;
  if (!leagueId) {
    return <div className="text-red-500">Error: NEXT_PUBLIC_SLEEPER_LEAGUE_ID is not set.</div>;
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

