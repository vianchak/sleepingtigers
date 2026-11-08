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

const PASTEL_CHART_COLORS = [
  '#a7f3d0', // pastel sage
  '#bae6fd', // pastel sky
  '#fde68a', // pastel butter
  '#ddd6fe', // pastel lavender
  '#fda4af', // pastel coral
  '#fed7aa', // pastel peach
  '#99f6e4', // pastel teal
  '#fbcfe8', // pastel pink
  '#c7d2fe', // pastel indigo
  '#d9f99d', // pastel lime
  '#e9d5ff', // pastel purple
  '#fecaca', // pastel red
];

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
      {/* Pastel Ledger Page Header */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-200/15 border border-sky-200/35 text-sky-200 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-sky-200 mb-1">
              <span>SECTION 02 // ALL-PLAY TELEMETRY AUDIT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading uppercase tracking-tight text-white">
              {t('title')}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {isUk
                ? 'Якби кожна команда грала проти всіх інших команд ліги щотижня — без впливу календаря.'
                : 'If every team played every other team in the league each week — zero schedule luck.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Spotlight Analytics Pods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {trueLeader && (
          <div className="glass-card p-5 relative overflow-hidden border-sky-200/25">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-sky-200 pb-2.5 mb-3 border-b border-dashed border-white/10">
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                {isUk ? 'Справжній Лідер (#1 All-Play)' : 'True #1 Seed (All-Play)'}
              </span>
              <span className="text-zinc-500">AP-01</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {trueLeader.team.avatarUrl ? (
                  <Image src={trueLeader.team.avatarUrl} alt={trueLeader.team.displayName} width={44} height={44} className="rounded-xl border border-sky-200/50 shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#111318] border border-sky-200/50 flex items-center justify-center font-bold text-sm shrink-0 text-sky-200">
                    {trueLeader.team.displayName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-heading font-bold text-white text-lg truncate uppercase">{trueLeader.team.displayName}</p>
                  <p className="text-xs font-mono text-zinc-400">
                    {trueLeader.wins}-{trueLeader.losses}{trueLeader.ties > 0 ? `-${trueLeader.ties}` : ''}
                  </p>
                </div>
              </div>
              <span className="font-mono font-bold text-2xl text-sky-200 shrink-0">
                {(trueLeader.winPercentage * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {luckiest && (
          <div className="glass-card p-5 relative overflow-hidden border-emerald-200/25">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-200 pb-2.5 mb-3 border-b border-dashed border-white/10">
              <span className="flex items-center gap-1.5">
                <Clover className="w-3.5 h-3.5" />
                {isUk ? 'Щасливчик Розкладу' : 'Schedule Beneficiary'}
              </span>
              <span className="text-zinc-500">LUCK+</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {luckiest.team.avatarUrl ? (
                  <Image src={luckiest.team.avatarUrl} alt={luckiest.team.displayName} width={44} height={44} className="rounded-xl border border-emerald-200/50 shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#111318] border border-emerald-200/50 flex items-center justify-center font-bold text-sm shrink-0 text-emerald-200">
                    {luckiest.team.displayName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-heading font-bold text-white text-lg truncate uppercase">{luckiest.team.displayName}</p>
                  <p className="text-xs font-mono text-zinc-400">
                    {(luckiest.actualWinPct * 100).toFixed(0)}% vs {(luckiest.winPercentage * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <span className="font-mono font-bold text-lg text-emerald-200 bg-emerald-200/10 px-2.5 py-1 rounded-md border border-emerald-200/25 shrink-0">
                +{(luckiest.luckDelta * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {unluckiest && (
          <div className="glass-card p-5 relative overflow-hidden border-rose-200/25">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-rose-200 pb-2.5 mb-3 border-b border-dashed border-white/10">
              <span className="flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5" />
                {isUk ? 'Жертва Розкладу' : 'Robbed by Schedule'}
              </span>
              <span className="text-zinc-500">LUCK-</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {unluckiest.team.avatarUrl ? (
                  <Image src={unluckiest.team.avatarUrl} alt={unluckiest.team.displayName} width={44} height={44} className="rounded-xl border border-rose-200/50 shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#111318] border border-rose-200/50 flex items-center justify-center font-bold text-sm shrink-0 text-rose-200">
                    {unluckiest.team.displayName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-heading font-bold text-white text-lg truncate uppercase">{unluckiest.team.displayName}</p>
                  <p className="text-xs font-mono text-zinc-400">
                    {(unluckiest.actualWinPct * 100).toFixed(0)}% vs {(unluckiest.winPercentage * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <span className="font-mono font-bold text-lg text-rose-200 bg-rose-200/10 px-2.5 py-1 rounded-md border border-rose-200/25 shrink-0">
                {(unluckiest.luckDelta * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* All-Play Standings Ledger Table */}
      <div className="glass-card overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#111318] text-zinc-400 text-[11px] font-mono uppercase tracking-wider border-b border-white/10">
                <th className="px-4 py-3.5 font-bold text-center w-14">{t('rank')}</th>
                <th className="px-4 py-3.5 font-bold">{t('team')}</th>
                <th className="px-4 py-3.5 font-bold text-center">{t('actualRecord')}</th>
                <th className="px-4 py-3.5 font-bold text-center">{t('allPlayRecord')}</th>
                <th className="px-4 py-3.5 font-bold">{t('allPlayWinPct')}</th>
                <th className="px-4 py-3.5 font-bold text-right">{t('pf')}</th>
                <th className="px-4 py-3.5 font-bold text-right">{t('pa')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {enriched.map((result, index) => {
                const isLucky = result.luckDelta > 0.1;
                const isUnlucky = result.luckDelta < -0.1;

                return (
                  <tr key={result.team.rosterId} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex w-7 h-7 rounded-md items-center justify-center font-mono font-bold text-xs ${
                        index === 0 ? 'bg-amber-200/20 text-amber-200 border border-amber-200/40' :
                        index === 1 ? 'bg-zinc-300/15 text-zinc-200 border border-zinc-400/30' :
                        index === 2 ? 'bg-orange-200/15 text-orange-200 border border-orange-300/30' :
                        'bg-[#111318] text-zinc-400 border border-white/10'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {result.team.avatarUrl ? (
                          <Image src={result.team.avatarUrl} alt={result.team.displayName} width={36} height={36} className="rounded-lg border border-white/15 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#111318] border border-white/15 flex items-center justify-center font-bold text-xs shrink-0 text-sky-200">
                            {result.team.displayName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className={`font-heading font-bold uppercase text-base ${index === 0 ? 'text-amber-200' : 'text-zinc-100'}`}>
                          {result.team.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-200">
                          {result.team.wins}-{result.team.losses}{result.team.ties > 0 ? `-${result.team.ties}` : ''}
                        </span>
                        {isLucky && (
                          <span className="text-[10px] font-mono font-bold text-emerald-200 bg-emerald-200/10 border border-emerald-200/25 px-2 py-0.5 rounded">
                            {t('lucky')}
                          </span>
                        )}
                        {isUnlucky && (
                          <span className="text-[10px] font-mono font-bold text-rose-200 bg-rose-200/10 border border-rose-200/25 px-2 py-0.5 rounded">
                            {t('unlucky')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-mono font-bold text-sky-200 bg-sky-200/10 border border-sky-200/20 px-2.5 py-1 rounded-md">
                        {result.wins}-{result.losses}{result.ties > 0 ? `-${result.ties}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[160px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#111318] border border-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-200 to-sky-200 h-full rounded-full"
                            style={{ width: `${Math.min(100, result.winPercentage * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-zinc-200 w-12 text-right">
                          {(result.winPercentage * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-200">
                      {result.team.fpts.toFixed(1)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-zinc-400">
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
        <div className="flex items-center gap-2.5 mb-6 border-b border-dashed border-white/10 pb-3">
          <TrendingUp className="w-5 h-5 text-sky-200" />
          <h3 className="text-xl font-bold font-heading uppercase text-white">{t('leagueScoringDistribution')}</h3>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="week" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
              <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', color: '#f4f4f5' }}
                itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
              {allPlayResults.map((result, i) => {
                const color = PASTEL_CHART_COLORS[i % PASTEL_CHART_COLORS.length];
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
