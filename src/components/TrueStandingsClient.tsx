'use client';

import { AllPlayResult } from '@/lib/stats-engine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';

interface TrueStandingsClientProps {
  allPlayResults: AllPlayResult[];
  chartData: any[];
}

export default function TrueStandingsClient({ allPlayResults, chartData }: TrueStandingsClientProps) {
  const t = useTranslations('TrueStandingsClient');
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gradient">{t('title')}</h2>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">{t('rank')}</th>
                <th className="p-4 font-semibold">{t('team')}</th>
                <th className="p-4 font-semibold">{t('actualRecord')}</th>
                <th className="p-4 font-semibold">{t('allPlayRecord')}</th>
                <th className="p-4 font-semibold">{t('allPlayWinPct')}</th>
                <th className="p-4 font-semibold text-right">{t('pf')}</th>
                <th className="p-4 font-semibold text-right">{t('pa')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allPlayResults.map((result, index) => {
                const actualWins = result.team.wins;
                const actualTotal = result.team.wins + result.team.losses + result.team.ties;
                const actualWinPct = actualTotal > 0 ? actualWins / actualTotal : 0;
                
                // Compare ranks (just for fun, we'll see if they are overperforming)
                const isLucky = actualWinPct > result.winPercentage + 0.1;
                const isUnlucky = actualWinPct < result.winPercentage - 0.1;

                return (
                  <tr key={result.team.rosterId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400 font-bold">#{index + 1}</td>
                    <td className="p-4 font-semibold flex items-center space-x-3">
                      {result.team.avatarUrl && (
                        <img src={result.team.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-slate-600" />
                      )}
                      <span>{result.team.displayName}</span>
                    </td>
                    <td className="p-4">
                      {result.team.wins}-{result.team.losses}{result.team.ties > 0 ? `-${result.team.ties}` : ''}
                      {isLucky && <span className="ml-2 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{t('lucky')}</span>}
                      {isUnlucky && <span className="ml-2 text-xs text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full">{t('unlucky')}</span>}
                    </td>
                    <td className="p-4 text-blue-300">
                      {result.wins}-{result.losses}{result.ties > 0 ? `-${result.ties}` : ''}
                    </td>
                    <td className="p-4">{(result.winPercentage * 100).toFixed(1)}%</td>
                    <td className="p-4 text-right font-mono text-slate-300">{result.team.fpts.toFixed(1)}</td>
                    <td className="p-4 text-right font-mono text-slate-400">{result.team.fptsAgainst.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold mb-6 text-slate-200">{t('leagueScoringDistribution')}</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {allPlayResults.map((result, i) => {
                // Generate some distinct colors for lines
                const hue = (i * 137.508) % 360;
                const color = `hsl(${hue}, 70%, 60%)`;
                return (
                  <Line 
                    key={result.team.rosterId}
                    type="monotone"
                    dataKey={result.team.displayName}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5 }}
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
