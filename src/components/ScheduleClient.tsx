'use client';

import { useState } from 'react';
import { WeeklySchedule } from '@/types/sleeper';
import { CalendarDays, CheckCircle2, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n/client';

export default function ScheduleClient({ schedule }: { schedule: WeeklySchedule[] }) {
  const t = useTranslation('Schedule');
  const latestWeek = schedule.length > 0 ? schedule[schedule.length - 1].week : 1;
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>(latestWeek);

  const visibleWeeks = selectedWeek === 'all'
    ? [...schedule].reverse()
    : schedule.filter(w => w.week === selectedWeek);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Pastel Ledger Header */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-200/15 border border-indigo-200/35 text-indigo-200 flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-200 mb-1">
              <span>SECTION 03 // OFFICIAL MATCHUP LEDGER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading uppercase tracking-tight text-white">
              {t('title')}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {t('description')}
            </p>
          </div>
        </div>
      </div>

      {/* Week Filter Pill Bar */}
      <div className="glass-panel p-3 flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => setSelectedWeek('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
            selectedWeek === 'all'
              ? 'bg-indigo-200/15 text-indigo-200 border-indigo-200/40'
              : 'bg-[#111318] text-zinc-400 hover:text-white border-white/5'
          }`}
        >
          {t('allWeeks') === 'allWeeks' ? 'All Weeks' : t('allWeeks')}
        </button>
        {schedule.map((w) => {
          const active = selectedWeek === w.week;
          return (
            <button
              key={w.week}
              type="button"
              onClick={() => setSelectedWeek(w.week)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 border ${
                active
                  ? 'bg-indigo-200/15 text-indigo-200 border-indigo-200/40'
                  : 'bg-[#111318] text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              <span>{t('week')}{w.week}</span>
            </button>
          );
        })}
      </div>

      {/* Matchup Scoreboards */}
      <div className="space-y-12">
        {visibleWeeks.map((week) => (
          <section key={week.week} className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-indigo-200/15 text-indigo-200 border border-indigo-200/30 font-mono text-xs font-bold">
                  WK {String(week.week).padStart(2, '0')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading uppercase text-white">
                  {t('week')}{week.week}
                </h3>
              </div>
              {week.isCompleted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-200/10 text-emerald-200 border border-emerald-200/25">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('completed') === 'completed' ? 'FINAL' : t('completed')}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {week.matchups.map((matchup) => {
                const hasScores = matchup.teamA.points > 0 || matchup.teamB.points > 0;
                const teamAWon = hasScores && matchup.teamA.points > matchup.teamB.points;
                const teamBWon = hasScores && matchup.teamB.points > matchup.teamA.points;
                const margin = hasScores ? Math.abs(matchup.teamA.points - matchup.teamB.points) : 0;

                return (
                  <div
                    key={matchup.matchupId}
                    className="glass-card p-4 relative overflow-hidden flex flex-col justify-between gap-2.5 group"
                  >
                    {/* Team A Row */}
                    <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      teamAWon
                        ? 'bg-emerald-200/10 border-emerald-200/30'
                        : hasScores
                        ? 'bg-[#111318]/60 border-white/5 opacity-70'
                        : 'bg-[#111318] border-white/10'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {matchup.teamA.avatarUrl ? (
                          <Image
                            src={matchup.teamA.avatarUrl}
                            alt={matchup.teamA.name}
                            width={36}
                            height={36}
                            className={`rounded-lg border shrink-0 ${teamAWon ? 'border-emerald-200/60' : 'border-white/15'}`}
                          />
                        ) : (
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border bg-[#171a21] shrink-0 ${teamAWon ? 'border-emerald-200/60 text-emerald-200' : 'border-white/15'}`}>
                            <span className="font-bold text-xs">{matchup.teamA.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-sm font-heading font-bold uppercase truncate ${teamAWon ? 'text-white' : 'text-zinc-300'}`}>
                              {matchup.teamA.name}
                            </p>
                            {teamAWon && <Trophy className="w-3.5 h-3.5 text-amber-200 shrink-0" />}
                          </div>
                        </div>
                      </div>
                      {hasScores && (
                        <span className={`text-lg font-mono font-bold shrink-0 ml-2 ${teamAWon ? 'text-emerald-200' : 'text-zinc-400'}`}>
                          {matchup.teamA.points.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Center VS / Margin Divider */}
                    <div className="flex items-center justify-between px-2 text-[11px] font-mono text-zinc-500">
                      <span className="uppercase tracking-widest font-bold">{t('vs')}</span>
                      {hasScores && margin > 0 && (
                        <span className="text-indigo-200 bg-indigo-200/10 border border-indigo-200/20 px-2 py-0.5 rounded font-bold">
                          +{margin.toFixed(2)} pts
                        </span>
                      )}
                    </div>

                    {/* Team B Row */}
                    <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      teamBWon
                        ? 'bg-emerald-200/10 border-emerald-200/30'
                        : hasScores
                        ? 'bg-[#111318]/60 border-white/5 opacity-70'
                        : 'bg-[#111318] border-white/10'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {matchup.teamB.avatarUrl ? (
                          <Image
                            src={matchup.teamB.avatarUrl}
                            alt={matchup.teamB.name}
                            width={36}
                            height={36}
                            className={`rounded-lg border shrink-0 ${teamBWon ? 'border-emerald-200/60' : 'border-white/15'}`}
                          />
                        ) : (
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border bg-[#171a21] shrink-0 ${teamBWon ? 'border-emerald-200/60 text-emerald-200' : 'border-white/15'}`}>
                            <span className="font-bold text-xs">{matchup.teamB.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-sm font-heading font-bold uppercase truncate ${teamBWon ? 'text-white' : 'text-zinc-300'}`}>
                              {matchup.teamB.name}
                            </p>
                            {teamBWon && <Trophy className="w-3.5 h-3.5 text-amber-200 shrink-0" />}
                          </div>
                        </div>
                      </div>
                      {hasScores && (
                        <span className={`text-lg font-mono font-bold shrink-0 ml-2 ${teamBWon ? 'text-emerald-200' : 'text-zinc-400'}`}>
                          {matchup.teamB.points.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
