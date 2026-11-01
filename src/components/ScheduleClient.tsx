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
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 mb-4 shadow-[0_0_25px_rgba(59,130,246,0.2)]">
          <CalendarDays className="w-7 h-7" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-gradient mb-2">
          {t('title')}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          {t('description')}
        </p>
      </div>

      {/* Week Filter Pill Bar */}
      <div className="glass-panel p-3 flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => setSelectedWeek('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedWeek === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 shadow-md'
              : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1 ${
                active
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-6 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400"></span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                  {t('week')}{week.week}
                </h3>
              </div>
              {week.isCompleted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
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
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : hasScores
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-65'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {matchup.teamA.avatarUrl ? (
                          <Image
                            src={matchup.teamA.avatarUrl}
                            alt={matchup.teamA.name}
                            width={36}
                            height={36}
                            className={`rounded-full border-2 shrink-0 ${teamAWon ? 'border-emerald-400' : 'border-slate-700'}`}
                          />
                        ) : (
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 bg-slate-800 shrink-0 ${teamAWon ? 'border-emerald-400' : 'border-slate-700'}`}>
                            <span className="font-bold text-xs">{matchup.teamA.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-sm font-bold truncate ${teamAWon ? 'text-white' : 'text-slate-300'}`}>
                              {matchup.teamA.name}
                            </p>
                            {teamAWon && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </div>
                        </div>
                      </div>
                      {hasScores && (
                        <span className={`text-lg font-mono font-extrabold shrink-0 ml-2 ${teamAWon ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {matchup.teamA.points.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Center VS / Margin Divider */}
                    <div className="flex items-center justify-between px-2 text-[11px] font-mono text-slate-500">
                      <span className="uppercase tracking-widest font-bold">{t('vs')}</span>
                      {hasScores && margin > 0 && (
                        <span className="text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                          +{margin.toFixed(2)} pts
                        </span>
                      )}
                    </div>

                    {/* Team B Row */}
                    <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      teamBWon
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : hasScores
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-65'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {matchup.teamB.avatarUrl ? (
                          <Image
                            src={matchup.teamB.avatarUrl}
                            alt={matchup.teamB.name}
                            width={36}
                            height={36}
                            className={`rounded-full border-2 shrink-0 ${teamBWon ? 'border-emerald-400' : 'border-slate-700'}`}
                          />
                        ) : (
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 bg-slate-800 shrink-0 ${teamBWon ? 'border-emerald-400' : 'border-slate-700'}`}>
                            <span className="font-bold text-xs">{matchup.teamB.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-sm font-bold truncate ${teamBWon ? 'text-white' : 'text-slate-300'}`}>
                              {matchup.teamB.name}
                            </p>
                            {teamBWon && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </div>
                        </div>
                      </div>
                      {hasScores && (
                        <span className={`text-lg font-mono font-extrabold shrink-0 ml-2 ${teamBWon ? 'text-emerald-300' : 'text-slate-400'}`}>
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
