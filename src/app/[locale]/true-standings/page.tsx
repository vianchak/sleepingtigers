import { getTranslations } from 'next-intl/server';
import { getLeagueData } from '@/lib/sleeper-api';
import { calculateAllPlayRecord } from '@/lib/stats-engine';
import TrueStandingsClient from '@/components/TrueStandingsClient';

export const revalidate = 3600;

export default async function TrueStandingsPage() {
  const t = await getTranslations('TrueStandings');
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID;
  if (!leagueId) {
    return <div className="text-red-500">Error: NEXT_PUBLIC_SLEEPER_LEAGUE_ID is not set.</div>;
  }

  const teams = await getLeagueData(leagueId);
  if (!teams || teams.length === 0) {
    return <div className="text-yellow-400">{t('loading')}</div>;
  }

  const allPlayResults = calculateAllPlayRecord(teams);

  // Transform data for Recharts
  // We need an array of { week: 1, TeamA: 100, TeamB: 120, ... }
  const allWeeks = Object.keys(teams[0]?.weeklyScores || {}).map(Number).sort((a, b) => a - b);
  const playedWeeks = allWeeks.filter(w => Math.max(...teams.map(t => t.weeklyScores[w] || 0)) > 0);

  const chartData = playedWeeks.map(week => {
    const dataPoint: any = { week: `Week ${week}` };
    teams.forEach(team => {
      dataPoint[team.displayName] = team.weeklyScores[week] || 0;
    });
    return dataPoint;
  });

  return (
    <TrueStandingsClient 
      allPlayResults={allPlayResults} 
      chartData={chartData} 
    />
  );
}


export const runtime = 'edge';

