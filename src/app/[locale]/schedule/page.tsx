import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getSchedule } from '@/lib/sleeper-api';
import { CalendarDays } from 'lucide-react';
import ScheduleClient from '@/components/ScheduleClient';

export default async function SchedulePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, "Schedule");
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID;
  if (!leagueId) {
    return <div className="text-red-500">Error: NEXT_PUBLIC_SLEEPER_LEAGUE_ID is not set.</div>;
  }

  const schedule = await getSchedule(leagueId);

  if (!schedule || schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <CalendarDays className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-300">{t('noSchedule')}</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          {t('noScheduleDesc')}
        </p>
      </div>
    );
  }

  return <ScheduleClient schedule={schedule} />;
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
