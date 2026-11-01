'use client';

import { AllPlayResult } from '@/lib/stats-engine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/lib/i18n/client';
import { Activity, Crown, Clover, Skull, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface TrueStandingsClientProps {
  allPlayResults: AllPlayResult[];
  chartData: any[];
  locale?: string;
}

export default function TrueStandingsClient({ allPlayResults, chartData, locale = 'en' }: TrueStandingsClientProps) {
  const t = useTranslation('TrueStandingsClient');
  const isUk = locale === 'uk';

  // Calculate luck deltas (Actual Win % - All-Play Win %)
  const enriched = allPlayResults.map((result, idx) => {
    const actualWins = result.team.wins;
    const actualTotal = result.team.wins + result.team.losses + result.team.ties;
    const actualWinPct = actualTotal > 0 ? (actualWins + result.team.ties * 0.5) / actualTotal : 0;
    const luckDelta = actualWinPct - result.winPercentage;
    return {
      ...result,
      trueRank: idx + 1,
      actualWinPct,
      luckDelta
    };
  });

  const trueLeader = enriched[0] || null;
  const luckiest = [...enriched].sort((a, b) => b.luckDelta - a.luckDelta)[0] || null;
  const unluckiest = [...enriched].sort((a, b) => a.luckDelta - b.luckDelta)[0] || null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Broadcast Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mb-4 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
          <Activity className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gradient mb-2">
          {t('title')}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          {isUk
            ? 'Якби кожна команда грала проти всіх інших команд ліги щотижня — без впливу календаря.'
            : 'If every team played every other team in the league each week — zero schedule luck.'}
        </p>
      </div>

      {/* 3 Spotlight Analytics Pods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {trueLeader && (
          <div className="glass-card p-5 relative overflow-hidden border-cyan-500/30">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-emerald-400"></div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-cyan-400 mb-3">
              <Crown className="w-4 h-4" />
              <span>{isUk ? 'Справжній Лідер (#1 Всі-З-Усіма)' : 'True #1 Seed (All-Play Leader)'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {trueLeader.team.avatarUrl ? (
                  <Image src={trueLeader.team.avatarUrl} alt={trueLeader.team.displayName} width={44} height={44} className="rounded-full border-2 border-cyan-400 shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {trueLeader.team.displayName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-white text-lg truncate">{trueLeader.team.displayName}</p>
                  <p className="text-xs font-mono text-slate-400">
                    {trueLeader.wins}-{trueLeader.losses}{trueLeader.ties > 0 ? `-${trueLeader.ties}` : ''}
                  </p>
                </div>
              </div>
              <span className="font-mono font-black text-2xl text-cyan-300 shrink-0">
                {(trueLeader.winPercentage * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {luckiest && (
          <div className="glass-card p-5 relative overflow-hidden border-emerald-500/30">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400"></div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-3">
              <Clover className="w-4 h-4" />
              <span>{isUk ? 'Головний Щасливчик Розкладу' : 'Biggest Schedule Beneficiary'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {luckiest.team.avatarUrl ? (
                  <Image src={luckiest.team.avatarUrl} alt={luckiest.team.displayName} width={44} height={44} className="rounded-full border-2 border-emerald-400 shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {luckiest.team.displayName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-white text-lg truncate">{luckiest.team.displayName}</p>
                  <p className="text-xs font-mono text-slate-400">
                    {(luckiest.actualWinPct * 100).toFixed(0)}% vs {(luckiest.winPercentage * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <span className="font-mono font-black text-xl text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30 shrink-0">
                +{(luckiest.luckDelta * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {unluckiest && (
          <div className="glass-card p-5 relative overflow-hidden border-rose-500/30">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-400 mb-3">
              <Skull className="w-4 h-4" />
              <span>{isUk ? 'Найбільша Жертва Розкладу' : 'Most Robbed by Schedule'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {unluckiest.team.avatarUrl ? (
                  <Image src={unluckiest.team.avatarUrl} alt={unluckiest.team.displayName} width={44} height={44} className="rounded-full border-2 border-rose-400 shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-rose-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {unluckiest.team.displayName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-white text-lg truncate">{unluckiest.team.displayName}</p>
                  <p className="text-xs font-mono text-slate-400">
                    {(unluckiest.actualWinPct * 100).toFixed(0)}% vs {(unluckiest.winPercentage * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <span className="font-mono font-black text-xl text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-lg border border-rose-500/30 shrink-0">
                {(unluckiest.luckDelta * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast All-Play Standings Table */}
      <div className="glass-card overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-blue-500"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/70 text-slate-300 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="px-4 py-4 font-bold text-center w-14">{t('rank')}</th>
                <th className="px-4 py-4 font-bold">{t('team')}</th>
                <th className="px-4 py-4 font-bold text-center">{t('actualRecord')}</th>
                <th className="px-4 py-4 font-bold text-center">{t('allPlayRecord')}</th>
                <th className="px-4 py-4 font-bold">{t('allPlayWinPct')}</th>
                <th className="px-4 py-4 font-bold text-right">{t('pf')}</th>
                <th className="px-4 py-4 font-bold text-right">{t('pa')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {enriched.map((result, index) => {
                const isLucky = result.luckDelta > 0.1;
                const isUnlucky = result.luckDelta < -0.1;

                return (
                  <tr key={result.team.rosterId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center font-mono font-bold text-xs ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        index === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-400/50' :
                        index === 2 ? 'bg-amber-700/20 text-amber-400 border border-amber-600/50' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {result.team.avatarUrl ? (
                          <Image src={result.team.avatarUrl} alt={result.team.displayName} width={36} height={36} className="rounded-full border border-slate-600 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {result.team.displayName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className={`font-bold text-base ${index === 0 ? 'text-yellow-400' : 'text-slate-100'}`}>
                          {result.team.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">
                          {result.team.wins}-{result.team.losses}{result.team.ties > 0 ? `-${result.team.ties}` : ''}
                        </span>
                        {isLucky && (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            {t('lucky')}
                          </span>
                        )}
                        {isUnlucky && (
                          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
                            {t('unlucky')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                        {result.wins}-{result.losses}{result.ties > 0 ? `-${result.ties}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[160px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, result.winPercentage * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200 w-12 text-right">
                          {(result.winPercentage * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-300">
                      {result.team.fpts.toFixed(1)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                      {result.team.fptsAgainst.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Distribution Chart */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-800 pb-3">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold font-heading text-white">{t('leagueScoringDistribution')}</h3>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0b1120', border: '1px solid #334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
              {allPlayResults.map((result, i) => {
                const hue = (i * 137.508) % 360;
                const color = `hsl(${hue}, 75%, 60%)`;
                return (
                  <Line 
                    key={result.team.rosterId}
                    type="monotone"
                    dataKey={result.team.displayName}
                    stroke={color}
                    strokeWidth={2.2}
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
