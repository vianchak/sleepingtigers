import { getTranslations } from 'next-intl/server';
import { getSchedule } from '@/lib/sleeper-api';
import { CalendarDays, Swords, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';



export default async function SchedulePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Schedule'});
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

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-4 flex items-center justify-center gap-3">
          <CalendarDays className="w-8 h-8 text-blue-400" /> {t('title')}
        </h2>
        <p className="text-slate-400">
          {t('description')}
        </p>
      </div>

      <div className="space-y-16">
        {schedule.map((week) => (
          <div key={week.week} className="relative">
            <h3 className="text-2xl font-bold text-center mb-6 text-slate-200 border-b border-slate-700/50 pb-4 flex items-center justify-center gap-2">
              {t('week')}{week.week}
              {week.isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {week.matchups.map((matchup) => {
                // Determine winner if completed
                let teamAWon = false;
                let teamBWon = false;
                const hasScores = matchup.teamA.points > 0 || matchup.teamB.points > 0;
                
                if (hasScores) {
                  if (matchup.teamA.points > matchup.teamB.points) teamAWon = true;
                  else if (matchup.teamB.points > matchup.teamA.points) teamBWon = true;
                }

                return (
                  <div key={matchup.matchupId} className="glass-card p-4 relative overflow-hidden group hover:border-slate-500/50 transition-colors">
                    <div className="flex items-center justify-between h-full">
                      
                      {/* Team A */}
                      <div className={`flex flex-col items-center flex-1 ${teamAWon ? 'opacity-100' : (hasScores ? 'opacity-50' : 'opacity-100')}`}>
                        {matchup.teamA.avatarUrl ? (
                          <div className={`w-12 h-12 rounded-full overflow-hidden mb-2 border-2 ${teamAWon ? 'border-emerald-500' : 'border-slate-600'}`}>
                            <Image src={matchup.teamA.avatarUrl} alt={matchup.teamA.name} width={48} height={48} />
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 bg-slate-800 ${teamAWon ? 'border-emerald-500' : 'border-slate-600'}`}>
                            <span className="font-bold text-sm">{matchup.teamA.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <p className={`text-xs font-bold text-center truncate w-full px-1 ${teamAWon ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {matchup.teamA.name}
                        </p>
                        {hasScores && (
                          <p className={`text-lg font-mono font-bold mt-1 ${teamAWon ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {matchup.teamA.points.toFixed(1)}
                          </p>
                        )}
                      </div>

                      {/* VS Divider */}
                      <div className="flex flex-col items-center justify-center px-4">
                        <Swords className="w-5 h-5 text-slate-500 mb-1" />
                        {!hasScores && <span className="text-xs font-bold text-slate-600">{t('vs')}</span>}
                      </div>

                      {/* Team B */}
                      <div className={`flex flex-col items-center flex-1 ${teamBWon ? 'opacity-100' : (hasScores ? 'opacity-50' : 'opacity-100')}`}>
                        {matchup.teamB.avatarUrl ? (
                          <div className={`w-12 h-12 rounded-full overflow-hidden mb-2 border-2 ${teamBWon ? 'border-emerald-500' : 'border-slate-600'}`}>
                            <Image src={matchup.teamB.avatarUrl} alt={matchup.teamB.name} width={48} height={48} />
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 bg-slate-800 ${teamBWon ? 'border-emerald-500' : 'border-slate-600'}`}>
                            <span className="font-bold text-sm">{matchup.teamB.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <p className={`text-xs font-bold text-center truncate w-full px-1 ${teamBWon ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {matchup.teamB.name}
                        </p>
                        {hasScores && (
                          <p className={`text-lg font-mono font-bold mt-1 ${teamBWon ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {matchup.teamB.points.toFixed(1)}
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export const runtime = 'edge';

