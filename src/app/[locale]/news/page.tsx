import NewsletterClient from '../newsletter/NewsletterClient';
import { getTranslations } from 'next-intl/server';
import { getNflState, getCompletedWeek } from '@/lib/sleeper-api';
import { getNewsletterArchives } from '../newsletter/storage-actions';

export default async function NewsPage({params}: {params: Promise<{locale: string}>}) {
  const t = await getTranslations("News");
  const state = await getNflState();
  const completedWeek = getCompletedWeek(state) || 1;
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID || '1125211995400511488';
  
  const archivedWeeks = await getNewsletterArchives(leagueId);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <NewsletterClient 
        leagueId={leagueId} 
        currentWeek={completedWeek} 
        initialArchives={archivedWeeks} 
        readOnly={true} 
      />
    </div>
  );
}

export const runtime = 'edge';

