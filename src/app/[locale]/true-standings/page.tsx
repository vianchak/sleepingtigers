import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getLeagueData } from '@/lib/sleeper-api';
import { calculateAllPlayRecord } from '@/lib/stats-engine';
import TrueStandingsClient from '@/components/TrueStandingsClient';
import { getSiteConfig } from '@/lib/site-config';
import LeagueNotConfigured from '@/components/LeagueNotConfigured';

export default async function TrueStandingsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, "TrueStandings");
  const { leagueId } = await getSiteConfig();
  if (!leagueId) {
    return <LeagueNotConfigured locale={locale} />;
  }

  const teams = await getLeagueData(leagueId);
  if (!teams || teams.length === 0) {
    return <div className="text-yellow-400">{t('loading')}</div>;
  }

  const allPlayResults = calculateAllPlayRecord(teams);

  const allWeeks = Object.keys(teams[0]?.weeklyScores || {}).map(Number).sort((a, b) => a - b);
  const playedWeeks = allWeeks.filter(w => Math.max(...teams.map(t => t.weeklyScores[w] || 0)) > 0);
  const weekPrefix = locale === 'uk' ? 'Тиж ' : 'Wk ';

  const chartData = playedWeeks.map(week => {
    const dataPoint: any = { week: `${weekPrefix}${week}` };
    teams.forEach(team => {
      dataPoint[team.displayName] = team.weeklyScores[week] || 0;
    });
    return dataPoint;
  });

  return (
    <TrueStandingsClient 
      allPlayResults={allPlayResults} 
      chartData={chartData}
      locale={locale}
    />
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
