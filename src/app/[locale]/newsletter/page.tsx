import NewsletterClient from './NewsletterClient';
import { getNflState, getCompletedWeek } from '@/lib/sleeper-api';
import { getNewsletterArchives } from './storage-actions';

export default async function NewsletterPage({params}: {params: Promise<{locale: string}>}) {
  const state = await getNflState();
  const completedWeek = getCompletedWeek(state) || 1;
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID || '1125211995400511488'; // fallback if not in env
  
  const archivedWeeks = await getNewsletterArchives(leagueId);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <NewsletterClient leagueId={leagueId} currentWeek={completedWeek} initialArchives={archivedWeeks} />
    </div>
  );
}


export const runtime = 'edge';

