'use client';

import { useState } from 'react';
import { TeamStats } from '@/types/sleeper';
import { calculateScheduleSwapper } from '@/lib/stats-engine';
import { useTranslation } from '@/lib/i18n/client';

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gradient">{t('title')}</h2>
        <p className="text-slate-400">{t('subtitle')}</p>
      </div>

      <div className="glass-panel p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('myTeam')}</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              value={myTeamId}
              onChange={(e) => setMyTeamId(Number(e.target.value))}
            >
              {teams.map(teamOption => (
                <option key={teamOption.rosterId} value={teamOption.rosterId}>{teamOption.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('targetSchedule')}</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
              value={targetScheduleId}
              onChange={(e) => setTargetScheduleId(Number(e.target.value))}
            >
              {teams.map(teamOption => (
                <option key={teamOption.rosterId} value={teamOption.rosterId}>{teamOption.displayName}{t('sSchedule')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {swapResult && myTeam && targetTeam && (
        <div className="glass-panel p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Summary */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="text-center">
                <h3 className="text-xl text-slate-400 mb-2">{t('actualRecord')}</h3>
                <p className="text-5xl font-bold text-slate-200">
                  {swapResult.actualWins}-{swapResult.actualLosses}{swapResult.actualTies > 0 ? `-${swapResult.actualTies}` : ''}
                </p>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-px h-12 bg-slate-700"></div>
              </div>

              <div className="text-center">
                <h3 className="text-xl text-slate-400 mb-2">
                  {t('recordWith')}<span className="text-purple-400">{targetTeam.displayName}</span>{t('sSchedule')}
                </h3>
                <p className="text-6xl font-bold text-gradient">
                  {swapResult.swappedWins}-{swapResult.swappedLosses}{swapResult.swappedTies > 0 ? `-${swapResult.swappedTies}` : ''}
                </p>
                
                {swapResult.swappedWins > swapResult.actualWins && (
                  <p className="mt-4 text-emerald-400 font-semibold bg-emerald-400/10 inline-block px-4 py-2 rounded-full">
                    {t('robbed')}
                  </p>
                )}
                {swapResult.swappedWins < swapResult.actualWins && (
                  <p className="mt-4 text-rose-400 font-semibold bg-rose-400/10 inline-block px-4 py-2 rounded-full">
                    {t('lucky')}
                  </p>
                )}
                {swapResult.swappedWins === swapResult.actualWins && (
                  <p className="mt-4 text-blue-400 font-semibold bg-blue-400/10 inline-block px-4 py-2 rounded-full">
                    {t('didntMatter')}
                  </p>
                )}
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div>
              <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">{t('weeklyBreakdown')}</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {swapResult.weeklyResults.map(w => {
                  const opp = w.opponentId ? teams.find(teamOption => teamOption.rosterId === w.opponentId) : null;
                  return (
                    <div key={w.week} className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between border border-white/5">
                      <div className="w-16 text-slate-400 font-bold uppercase text-sm">{t('wk')}{w.week}</div>
                      
                      <div className="flex-1 flex justify-between items-center px-4">
                        <div className="text-right flex-1">
                          <span className={w.won ? "text-emerald-400 font-bold" : "text-slate-300"}>
                            {w.myScore.toFixed(1)}
                          </span>
                        </div>
                        <div className="mx-4 text-slate-600 font-bold">{t('vs')}</div>
                        <div className="text-left flex-1">
                          <span className={!w.won && opp ? "text-rose-400 font-bold" : "text-slate-300"}>
                            {w.opponentScore.toFixed(1)}
                          </span>
                          <span className="text-slate-500 text-sm ml-2">
                            ({opp ? opp.displayName : t('bye')})
                          </span>
                        </div>
                      </div>

                      <div className="w-16 text-right">
                        {w.won ? (
                          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-sm font-bold">{t('w')}</span>
                        ) : opp ? (
                          <span className="bg-rose-500/20 text-rose-400 px-2 py-1 rounded text-sm font-bold">{t('l')}</span>
                        ) : (
                          <span className="text-slate-500 text-sm font-bold">{t('bye')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
