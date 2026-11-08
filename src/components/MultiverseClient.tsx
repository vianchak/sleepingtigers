'use client';

import { useState } from 'react';
import { TeamStats } from '@/types/sleeper';
import { calculateScheduleSwapper } from '@/lib/stats-engine';
import { useTranslation } from '@/lib/i18n/client';
import { ArrowRightLeft, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface MultiverseClientProps {
  teams: TeamStats[];
}

export default function MultiverseClient({ teams }: MultiverseClientProps) {
  const t = useTranslation('MultiverseClient');
  const [myTeamId, setMyTeamId] = useState<number>(teams[0]?.rosterId || 0);
  const [targetScheduleId, setTargetScheduleId] = useState<number>(teams.length > 1 ? teams[1]?.rosterId : teams[0]?.rosterId || 0);

  const myTeam = teams.find(teamOption => teamOption.rosterId === myTeamId);
  const targetTeam = teams.find(teamOption => teamOption.rosterId === targetScheduleId);

  const swapResult = calculateScheduleSwapper(myTeamId, targetScheduleId, teams);

  const handleQuickSwap = () => {
    const temp = myTeamId;
    setMyTeamId(targetScheduleId);
    setTargetScheduleId(temp);
  };

  const winDelta = swapResult ? swapResult.swappedWins - swapResult.actualWins : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Pastel Ledger Header */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-200/15 border border-violet-200/35 text-violet-200 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-violet-200 mb-1">
              <span>SECTION 04 // SCHEDULE SIMULATION MATRIX</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading uppercase tracking-tight text-white">
              {t('title')}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive VS Selector Deck */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* My Team Card */}
          <div className="md:col-span-5 bg-[#111318] border border-sky-200/25 rounded-xl p-4">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-sky-200 mb-2">
              01 // {t('myTeam')}
            </label>
            <div className="flex items-center gap-3">
              {myTeam?.avatarUrl ? (
                <Image src={myTeam.avatarUrl} alt={myTeam.displayName} width={44} height={44} className="rounded-lg border border-sky-200/50 shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-[#171a21] border border-sky-200/50 flex items-center justify-center font-bold text-sm shrink-0 text-sky-200">
                  {myTeam?.displayName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <select
                className="w-full bg-[#171a21] border border-white/10 rounded-lg p-2.5 text-zinc-100 font-mono font-bold text-sm focus:border-sky-200/50 outline-none cursor-pointer"
                value={myTeamId}
                onChange={(e) => setMyTeamId(Number(e.target.value))}
              >
                {teams.map(teamOption => (
                  <option key={teamOption.rosterId} value={teamOption.rosterId}>
                    {teamOption.displayName} ({teamOption.wins}-{teamOption.losses})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleQuickSwap}
              className="w-11 h-11 rounded-xl bg-[#111318] hover:bg-violet-200/15 border border-white/10 hover:border-violet-200/40 text-zinc-300 hover:text-violet-200 flex items-center justify-center transition-all cursor-pointer"
              title="Swap Teams"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Target Schedule Card */}
          <div className="md:col-span-5 bg-[#111318] border border-violet-200/25 rounded-xl p-4">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-violet-200 mb-2">
              02 // {t('targetSchedule')}
            </label>
            <div className="flex items-center gap-3">
              {targetTeam?.avatarUrl ? (
                <Image src={targetTeam.avatarUrl} alt={targetTeam.displayName} width={44} height={44} className="rounded-lg border border-violet-200/50 shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-[#171a21] border border-violet-200/50 flex items-center justify-center font-bold text-sm shrink-0 text-violet-200">
                  {targetTeam?.displayName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <select
                className="w-full bg-[#171a21] border border-white/10 rounded-lg p-2.5 text-zinc-100 font-mono font-bold text-sm focus:border-violet-200/50 outline-none cursor-pointer"
                value={targetScheduleId}
                onChange={(e) => setTargetScheduleId(Number(e.target.value))}
              >
                {teams.map(teamOption => (
                  <option key={teamOption.rosterId} value={teamOption.rosterId}>
                    {teamOption.displayName}{t('sSchedule')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {swapResult && myTeam && targetTeam && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Reality Comparison Arena */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            <div className="glass-card p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-4 my-auto">
                {/* Actual Record Box */}
                <div className="bg-[#111318] border border-white/10 rounded-xl p-5 text-center">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    {t('actualRecord')}
                  </span>
                  <p className="text-4xl sm:text-5xl font-bold font-mono text-zinc-200">
                    {swapResult.actualWins}-{swapResult.actualLosses}{swapResult.actualTies > 0 ? `-${swapResult.actualTies}` : ''}
                  </p>
                  <span className="text-xs font-mono text-zinc-500 mt-2 block">
                    {myTeam.fpts.toFixed(1)} PF
                  </span>
                </div>

                {/* Alternate Reality Box */}
                <div className="bg-[#111318] border border-violet-200/30 rounded-xl p-5 text-center relative overflow-hidden">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-violet-200 block mb-2 truncate">
                    {t('recordWith')}{targetTeam.displayName}
                  </span>
                  <p className="text-4xl sm:text-5xl font-bold font-mono text-violet-200">
                    {swapResult.swappedWins}-{swapResult.swappedLosses}{swapResult.swappedTies > 0 ? `-${swapResult.swappedTies}` : ''}
                  </p>
                  <span className={`inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded mt-2 ${
                    winDelta > 0
                      ? 'bg-emerald-200/15 text-emerald-200 border border-emerald-200/30'
                      : winDelta < 0
                      ? 'bg-rose-200/15 text-rose-200 border border-rose-200/30'
                      : 'bg-white/5 text-zinc-400'
                  }`}>
                    {winDelta > 0 ? `+${winDelta} W` : winDelta < 0 ? `${winDelta} W` : '0 Δ'}
                  </span>
                </div>
              </div>

              {/* Verdict Banner */}
              <div className="mt-6 text-center">
                {swapResult.swappedWins > swapResult.actualWins && (
                  <div className="p-4 rounded-xl bg-emerald-200/10 border border-emerald-200/25 text-emerald-200 font-mono font-bold text-xs flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{t('robbed')}</span>
                  </div>
                )}
                {swapResult.swappedWins < swapResult.actualWins && (
                  <div className="p-4 rounded-xl bg-rose-200/10 border border-rose-200/25 text-rose-200 font-mono font-bold text-xs flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{t('lucky')}</span>
                  </div>
                )}
                {swapResult.swappedWins === swapResult.actualWins && (
                  <div className="p-4 rounded-xl bg-sky-200/10 border border-sky-200/25 text-sky-200 font-mono font-bold text-xs flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{t('didntMatter')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Weekly Breakdown Ledger */}
          <div className="lg:col-span-7 glass-card p-6 relative overflow-hidden">
            <h3 className="text-lg font-bold font-heading uppercase text-white mb-4 border-b border-dashed border-white/10 pb-3">
              {t('weeklyBreakdown')}
            </h3>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {swapResult.weeklyResults.map(w => {
                const opp = w.opponentId ? teams.find(teamOption => teamOption.rosterId === w.opponentId) : null;
                return (
                  <div
                    key={w.week}
                    className={`rounded-xl p-3.5 flex items-center justify-between border transition-colors ${
                      w.won
                        ? 'bg-emerald-200/[0.06] border-emerald-200/20'
                        : opp
                        ? 'bg-rose-200/[0.06] border-rose-200/20'
                        : 'bg-[#111318] border-white/10'
                    }`}
                  >
                    <div className="w-16 font-mono font-bold text-xs uppercase text-zinc-400 shrink-0">
                      {t('wk')}{w.week}
                    </div>

                    <div className="flex-1 flex items-center justify-between gap-2 px-2 min-w-0">
                      <div className="flex items-center gap-2 justify-end flex-1 min-w-0">
                        <span className="text-xs font-heading font-bold uppercase text-zinc-200 truncate hidden sm:inline">
                          {myTeam.displayName}
                        </span>
                        <span className={`font-mono font-bold text-base ${w.won ? 'text-emerald-200' : 'text-zinc-300'}`}>
                          {w.myScore.toFixed(1)}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold px-1.5">
                        {t('vs')}
                      </span>

                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`font-mono font-bold text-base ${!w.won && opp ? 'text-rose-200' : 'text-zinc-400'}`}>
                          {w.opponentScore.toFixed(1)}
                        </span>
                        <span className="text-xs font-heading font-bold uppercase text-zinc-400 truncate">
                          {opp ? opp.displayName : t('bye')}
                        </span>
                      </div>
                    </div>

                    <div className="w-12 text-right shrink-0">
                      {w.won ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-200/15 text-emerald-200 border border-emerald-200/30 px-2.5 py-0.5 rounded text-xs font-mono font-bold">
                          {t('w')}
                        </span>
                      ) : opp ? (
                        <span className="inline-flex items-center gap-1 bg-rose-200/15 text-rose-200 border border-rose-200/30 px-2.5 py-0.5 rounded text-xs font-mono font-bold">
                          {t('l')}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs font-mono font-bold">{t('bye')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
