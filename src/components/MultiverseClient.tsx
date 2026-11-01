'use client';

import { useState } from 'react';
import { TeamStats } from '@/types/sleeper';
import { calculateScheduleSwapper } from '@/lib/stats-engine';
import { useTranslation } from '@/lib/i18n/client';
import { ArrowRightLeft, Sparkles, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
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
      {/* Broadcast Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 mb-4 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
          <ArrowRightLeft className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gradient mb-2">
          {t('title')}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          {t('subtitle')}
        </p>
      </div>

      {/* Interactive VS Selector Deck */}
      <div className="glass-panel p-6 relative overflow-hidden border border-purple-500/20">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* My Team Card */}
          <div className="md:col-span-5 bg-slate-950/70 border border-cyan-500/25 rounded-2xl p-4">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-cyan-400 mb-2">
              {t('myTeam')}
            </label>
            <div className="flex items-center gap-3">
              {myTeam?.avatarUrl ? (
                <Image src={myTeam.avatarUrl} alt={myTeam.displayName} width={44} height={44} className="rounded-full border-2 border-cyan-400 shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {myTeam?.displayName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
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
              className="w-11 h-11 rounded-full bg-slate-900 hover:bg-purple-500/20 border border-slate-700 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 flex items-center justify-center transition-all shadow-lg cursor-pointer"
              title="Swap Teams"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Target Schedule Card */}
          <div className="md:col-span-5 bg-slate-950/70 border border-purple-500/25 rounded-2xl p-4">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-400 mb-2">
              {t('targetSchedule')}
            </label>
            <div className="flex items-center gap-3">
              {targetTeam?.avatarUrl ? (
                <Image src={targetTeam.avatarUrl} alt={targetTeam.displayName} width={44} height={44} className="rounded-full border-2 border-purple-400 shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {targetTeam?.displayName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
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
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>

              <div className="grid grid-cols-2 gap-4 my-auto">
                {/* Actual Record Box */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    {t('actualRecord')}
                  </span>
                  <p className="text-4xl sm:text-5xl font-black font-mono text-slate-200">
                    {swapResult.actualWins}-{swapResult.actualLosses}{swapResult.actualTies > 0 ? `-${swapResult.actualTies}` : ''}
                  </p>
                  <span className="text-xs font-mono text-slate-500 mt-2 block">
                    {myTeam.fpts.toFixed(1)} PF
                  </span>
                </div>

                {/* Alternate Reality Box */}
                <div className="bg-purple-950/25 border border-purple-500/35 rounded-2xl p-5 text-center relative overflow-hidden">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-2 truncate">
                    {t('recordWith')}{targetTeam.displayName}
                  </span>
                  <p className="text-4xl sm:text-5xl font-black font-mono text-gradient">
                    {swapResult.swappedWins}-{swapResult.swappedLosses}{swapResult.swappedTies > 0 ? `-${swapResult.swappedTies}` : ''}
                  </p>
                  <span className={`inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full mt-2 ${
                    winDelta > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : winDelta < 0
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {winDelta > 0 ? `+${winDelta} W` : winDelta < 0 ? `${winDelta} W` : '0 Δ'}
                  </span>
                </div>
              </div>

              {/* Verdict Banner */}
              <div className="mt-6 text-center">
                {swapResult.swappedWins > swapResult.actualWins && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{t('robbed')}</span>
                  </div>
                )}
                {swapResult.swappedWins < swapResult.actualWins && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-sm flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{t('lucky')}</span>
                  </div>
                )}
                {swapResult.swappedWins === swapResult.actualWins && (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-sm flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{t('didntMatter')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Broadcast Weekly Breakdown */}
          <div className="lg:col-span-7 glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-400"></div>
            <h3 className="text-xl font-bold font-heading text-white mb-4 border-b border-slate-800 pb-3">
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
                        ? 'bg-emerald-950/15 border-emerald-500/25'
                        : opp
                        ? 'bg-rose-950/15 border-rose-500/20'
                        : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    <div className="w-16 font-mono font-bold text-xs uppercase text-slate-400 shrink-0">
                      {t('wk')}{w.week}
                    </div>

                    <div className="flex-1 flex items-center justify-between gap-2 px-2 min-w-0">
                      <div className="flex items-center gap-2 justify-end flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-300 truncate hidden sm:inline">
                          {myTeam.displayName}
                        </span>
                        <span className={`font-mono font-extrabold text-base ${w.won ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {w.myScore.toFixed(1)}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold px-1.5">
                        {t('vs')}
                      </span>

                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`font-mono font-extrabold text-base ${!w.won && opp ? 'text-rose-400' : 'text-slate-400'}`}>
                          {w.opponentScore.toFixed(1)}
                        </span>
                        <span className="text-xs font-medium text-slate-400 truncate">
                          {opp ? opp.displayName : t('bye')}
                        </span>
                      </div>
                    </div>

                    <div className="w-12 text-right shrink-0">
                      {w.won ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                          {t('w')}
                        </span>
                      ) : opp ? (
                        <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                          {t('l')}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs font-mono font-bold">{t('bye')}</span>
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
