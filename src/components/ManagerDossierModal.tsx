'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { TeamStats } from '@/types/sleeper';
import { AllPlayResult, Badges, PowerRankingTeam } from '@/lib/stats-engine';
import { useTranslation } from '@/lib/i18n/client';
import { X, TrendingUp, Radar as RadarIcon, Award, Flame, Skull, Sparkles, ChevronRight } from 'lucide-react';

interface ManagerDossierModalProps {
  powerRankings: PowerRankingTeam[];
  allPlay: AllPlayResult[];
  badges: Badges;
  teams: TeamStats[];
}

export default function ManagerDossierModal({
  powerRankings,
  allPlay,
  badges,
  teams
}: ManagerDossierModalProps) {
  const tHome = useTranslation('Home');
  const tDossier = useTranslation('ManagerDossier');
  const [selectedRosterId, setSelectedRosterId] = useState<number | null>(null);

  const maxPF = Math.max(...teams.map(t => t.fpts), 1);
  const maxMoves = Math.max(...teams.map(t => t.totalMoves), 1);

  const selectedPR = powerRankings.find(p => p.team.rosterId === selectedRosterId) || null;
  const selectedAllPlay = allPlay.find(a => a.team.rosterId === selectedRosterId) || null;

  const getManagerMetrics = (team: TeamStats, ap: AllPlayResult | null, pr: PowerRankingTeam | null) => {
    const scores = Object.values(team.weeklyScores).filter(s => s > 0);
    const seasonHigh = scores.length > 0 ? Math.max(...scores) : 0;
    const seasonLow = scores.length > 0 ? Math.min(...scores) : 0;

    let stdDev = 0;
    const mean = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    if (scores.length > 1) {
      const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
      stdDev = Math.sqrt(variance);
    }

    const cv = mean > 0 ? stdDev / mean : 0;
    const consistencyScore = scores.length > 1 ? Math.round(Math.max(20, Math.min(99, (1 - cv * 1.4) * 100))) : 75;

    const firepowerScore = Math.round((team.fpts / maxPF) * 100);
    const dominanceScore = Math.round((ap?.winPercentage || 0) * 100);
    const lineupEfficiency = team.ppts > 0 ? Math.min(1, team.fpts / team.ppts) : 0.85;
    const lineupIqScore = team.ppts > 0
      ? Math.round(Math.max(25, Math.min(99, ((lineupEfficiency - 0.65) / 0.35) * 100)))
      : 80;
    const hustleScore = Math.round(Math.max(15, (team.totalMoves / maxMoves) * 100));

    const totalBenchPoints = Object.values(team.weeklyBenchPoints).reduce((a, b) => a + b, 0);

    let bestWin: { oppName: string; margin: number; myScore: number; oppScore: number } | null = null;
    let worstLoss: { oppName: string; margin: number; myScore: number; oppScore: number } | null = null;

    for (const [wkStr, myScore] of Object.entries(team.weeklyScores)) {
      const wk = Number(wkStr);
      if (myScore <= 0) continue;
      const oppId = team.weeklyOpponentRosterIds[wk];
      if (!oppId) continue;
      const oppTeam = teams.find(t => t.rosterId === oppId);
      if (!oppTeam) continue;
      const oppScore = oppTeam.weeklyScores[wk] || 0;
      if (oppScore <= 0) continue;

      const diff = myScore - oppScore;
      if (diff > 0 && (!bestWin || diff > bestWin.margin)) {
        bestWin = { oppName: oppTeam.displayName, margin: diff, myScore, oppScore };
      } else if (diff < 0 && (!worstLoss || Math.abs(diff) > worstLoss.margin)) {
        worstLoss = { oppName: oppTeam.displayName, margin: Math.abs(diff), myScore, oppScore };
      }
    }

    const totalActualGames = team.wins + team.losses + team.ties;
    const actualWinPct = totalActualGames > 0 ? (team.wins + team.ties * 0.5) / totalActualGames : 0;
    const trueWinPct = ap?.winPercentage || 0;
    const luckDelta = actualWinPct - trueWinPct;

    let archetype = tDossier('archetypeContender');
    if (pr && pr.rank <= 2 && dominanceScore >= 70) {
      archetype = tDossier('archetypeJuggernaut');
    } else if (luckDelta >= 0.15) {
      archetype = tDossier('archetypeFraud');
    } else if (luckDelta <= -0.15 && trueWinPct >= 0.5) {
      archetype = tDossier('archetypeUnlucky');
    } else if (lineupEfficiency < 0.78 && team.ppts > 0) {
      archetype = tDossier('archetypeTinkerer');
    } else if (consistencyScore < 55) {
      archetype = tDossier('archetypeChaos');
    } else if (hustleScore >= 85) {
      archetype = tDossier('archetypeGrinder');
    } else if (dominanceScore < 35) {
      archetype = tDossier('archetypeRebuild');
    }

    const badgeEntries: { title: string; desc: string; reason: string }[] = [];
    const badgeMap: [keyof Badges, string, string][] = [
      ['benchWhisperer', tHome('benchWhisperer'), tHome('benchWhispererDesc')],
      ['cardiacKid', tHome('cardiacKid'), tHome('cardiacKidDesc')],
      ['glassCannon', tHome('glassCannon'), tHome('glassCannonDesc')],
      ['unlucky', tHome('unlucky'), tHome('unluckyDesc')],
      ['tinkerer', tHome('tinkerer'), tHome('tinkererDesc')],
      ['participationTrophy', tHome('participationTrophy'), tHome('participationTrophyDesc')],
      ['backpack', tHome('backpack'), tHome('backpackDesc')],
      ['bestBallChampion', tHome('bestBallChamp'), tHome('bestBallChampDesc')],
      ['oneHitWonder', tHome('oneHitWonder'), tHome('oneHitWonderDesc')],
      ['churnAndBurn', tHome('churnAndBurn'), tHome('churnAndBurnDesc')],
      ['hyroxMoment', tHome('hyroxMoment'), tHome('hyroxMomentDesc')]
    ];

    for (const [key, label, desc] of badgeMap) {
      const b = badges[key];
      if (b && b.team.rosterId === team.rosterId) {
        badgeEntries.push({ title: label, desc, reason: b.reason });
      }
    }

    const radarData = [
      { axis: tDossier('firepower'), value: firepowerScore, fullMark: 100 },
      { axis: tDossier('dominance'), value: dominanceScore, fullMark: 100 },
      { axis: tDossier('lineupIq'), value: lineupIqScore, fullMark: 100 },
      { axis: tDossier('consistency'), value: consistencyScore, fullMark: 100 },
      { axis: tDossier('hustle'), value: hustleScore, fullMark: 100 }
    ];

    return {
      seasonHigh,
      seasonLow,
      lineupEfficiency,
      totalBenchPoints,
      bestWin,
      worstLoss,
      actualWinPct,
      trueWinPct,
      luckDelta,
      archetype,
      badgeEntries,
      radarData
    };
  };

  const activeDetails = selectedPR
    ? getManagerMetrics(selectedPR.team, selectedAllPlay, selectedPR)
    : null;

  return (
    <div className="mt-12 mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-700/50 pb-3 gap-2">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            {tHome('officialPowerRankings')}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">
          <RadarIcon className="w-3.5 h-3.5 animate-pulse" />
          <span>{tDossier('clickHint')}</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-300 text-center w-16">{tHome('rank')}</th>
                <th className="px-6 py-4 font-bold text-slate-300">{tHome('manager')}</th>
                <th className="px-6 py-4 font-bold text-slate-300 text-center hidden sm:table-cell">{tHome('powerScore')}</th>
                <th className="px-6 py-4 font-bold text-slate-300 text-center hidden md:table-cell">{tHome('recentForm')}</th>
                <th className="px-6 py-4 font-bold text-slate-300 text-right w-28"></th>
              </tr>
            </thead>
            <tbody>
              {powerRankings.map((pr, idx) => (
                <tr
                  key={pr.team.rosterId}
                  onClick={() => setSelectedRosterId(pr.team.rosterId)}
                  className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-slate-800 text-slate-300'}`}>
                      {pr.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {pr.team.avatarUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-600 group-hover:border-cyan-400 transition-colors">
                          <Image src={pr.team.avatarUrl} alt={pr.team.displayName} width={40} height={40} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 group-hover:border-cyan-400 transition-colors">
                          <span className="font-bold text-xs">{pr.team.displayName.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className={`font-bold text-base group-hover:text-cyan-300 transition-colors ${idx === 0 ? 'text-yellow-400' : 'text-slate-200'}`}>
                          {pr.team.displayName}
                        </p>
                        <p className="text-xs text-slate-500 md:hidden">Score: {pr.powerScore.toFixed(1)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center hidden sm:table-cell">
                    <div className="w-full bg-slate-800 rounded-full h-2.5 max-w-xs mx-auto">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2.5 rounded-full" style={{ width: `${Math.min(pr.powerScore, 100)}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">{pr.powerScore.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 text-center hidden md:table-cell text-emerald-400 font-mono">
                    {pr.recentForm.toFixed(1)} <span className="text-xs text-slate-500 font-sans block">{tHome('ptsWk')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/80 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-300 border border-slate-700 group-hover:border-cyan-500/40 transition-all"
                    >
                      <RadarIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tDossier('viewDossier')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manager Dossier Modal */}
      {selectedPR && activeDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedRosterId(null)}
        >
          <div
            className="glass-card w-full max-w-5xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] bg-slate-900/95 p-5 sm:p-7 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedRosterId(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
              aria-label={tDossier('close')}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Quick Manager Switcher (Wrapped cleanly, no ugly horizontal scrollbar) */}
            <div className="flex items-center flex-wrap gap-1.5 pr-12 pb-4 mb-6 border-b border-slate-800">
              {powerRankings.map(pr => {
                const isSelected = pr.team.rosterId === selectedPR.team.rosterId;
                return (
                  <button
                    key={pr.team.rosterId}
                    type="button"
                    onClick={() => setSelectedRosterId(pr.team.rosterId)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>#{pr.rank}</span>
                    <span>{pr.team.displayName}</span>
                  </button>
                );
              })}
            </div>

            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {selectedPR.team.avatarUrl ? (
                  <Image
                    src={selectedPR.team.avatarUrl}
                    alt={selectedPR.team.displayName}
                    width={68}
                    height={68}
                    className="rounded-full border-2 border-cyan-400 shadow-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center font-bold text-xl shrink-0">
                    {selectedPR.team.displayName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      #{selectedPR.rank} POWER RANK
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>{activeDetails.archetype}</span>
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 truncate">{selectedPR.team.displayName}</h3>
                </div>
              </div>

              <div className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex flex-col sm:items-end justify-center shrink-0 ${
                activeDetails.luckDelta >= 0.1
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : activeDetails.luckDelta <= -0.1
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-slate-800/70 border-slate-700 text-slate-300'
              }`}>
                <span>
                  {activeDetails.luckDelta >= 0.1
                    ? tDossier('luckVerdictLucky')
                    : activeDetails.luckDelta <= -0.1
                    ? tDossier('luckVerdictUnlucky')
                    : tDossier('luckVerdictFair')}
                </span>
                <span className="font-mono text-[11px] opacity-80 mt-0.5">
                  {tDossier('actualRecord')}: {(activeDetails.actualWinPct * 100).toFixed(0)}% vs All-Play: {(activeDetails.trueWinPct * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Main 2-Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 5-Axis Radar Chart */}
              <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <RadarIcon className="w-4 h-4 text-cyan-400" />
                  {tDossier('skillRadar')}
                </h4>

                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="52%"
                      margin={{ top: 12, right: 40, bottom: 12, left: 40 }}
                      data={activeDetails.radarData}
                    >
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="axis"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '0.5rem',
                          color: '#f8fafc'
                        }}
                      />
                      <Radar
                        name={selectedPR.team.displayName}
                        dataKey="value"
                        stroke="#22d3ee"
                        fill="#06b6d4"
                        fillOpacity={0.35}
                        strokeWidth={2.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Full-text Radar Stat Pills (No truncation) */}
                <div className="flex flex-wrap justify-center gap-2 w-full mt-2 pt-3 border-t border-slate-800/80">
                  {activeDetails.radarData.map(stat => (
                    <div key={stat.axis} className="bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                      <span className="text-xs text-slate-300 font-medium whitespace-nowrap">{stat.axis}</span>
                      <span className="font-mono font-bold text-xs text-cyan-300 bg-cyan-500/15 px-1.5 py-0.5 rounded">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Season Analytics & Badges */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    {tDossier('seasonProfile')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                      <span className="text-xs text-slate-400 block">{tDossier('actualRecord')}</span>
                      <span className="font-mono font-bold text-lg text-white">
                        {selectedPR.team.wins}-{selectedPR.team.losses}{selectedPR.team.ties > 0 ? `-${selectedPR.team.ties}` : ''}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{selectedPR.team.fpts.toFixed(1)} PF</span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                      <span className="text-xs text-slate-400 block">{tDossier('trueRecord')}</span>
                      <span className="font-mono font-bold text-lg text-cyan-400">
                        {selectedAllPlay ? `${selectedAllPlay.wins}-${selectedAllPlay.losses}` : 'N/A'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {(activeDetails.trueWinPct * 100).toFixed(1)}% Win Rate
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                      <span className="text-xs text-slate-400 block">{tDossier('lineupEfficiency')}</span>
                      <span className="font-mono font-bold text-lg text-emerald-400">
                        {(activeDetails.lineupEfficiency * 100).toFixed(1)}%
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {activeDetails.totalBenchPoints.toFixed(1)} {tDossier('pointsOnBench')}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                      <span className="text-xs text-slate-400 block">{tDossier('seasonHigh')}</span>
                      <span className="font-mono font-bold text-lg text-amber-400">
                        {activeDetails.seasonHigh.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                      <span className="text-xs text-slate-400 block">{tDossier('seasonLow')}</span>
                      <span className="font-mono font-bold text-lg text-rose-400">
                        {activeDetails.seasonLow.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                      <span className="text-xs text-slate-400 block">{tHome('recentForm')}</span>
                      <span className="font-mono font-bold text-lg text-indigo-400">
                        {selectedPR.recentForm.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{tHome('ptsWk')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                      <Flame className="w-3.5 h-3.5 shrink-0" />
                      <span>{tDossier('bestWin')}</span>
                    </div>
                    {activeDetails.bestWin ? (
                      <div>
                        <p className="font-bold text-sm text-white">
                          +{activeDetails.bestWin.margin.toFixed(2)} vs {activeDetails.bestWin.oppName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {activeDetails.bestWin.myScore.toFixed(1)} - {activeDetails.bestWin.oppScore.toFixed(1)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">—</p>
                    )}
                  </div>

                  <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-1">
                      <Skull className="w-3.5 h-3.5 shrink-0" />
                      <span>{tDossier('worstLoss')}</span>
                    </div>
                    {activeDetails.worstLoss ? (
                      <div>
                        <p className="font-bold text-sm text-white">
                          -{activeDetails.worstLoss.margin.toFixed(2)} vs {activeDetails.worstLoss.oppName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {activeDetails.worstLoss.myScore.toFixed(1)} - {activeDetails.worstLoss.oppScore.toFixed(1)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">—</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-400" />
                    {tDossier('badgesEarned')}
                  </h4>
                  {activeDetails.badgeEntries.length > 0 ? (
                    <div className="space-y-2">
                      {activeDetails.badgeEntries.map((b, idx) => (
                        <div key={idx} className="bg-slate-950/70 border border-yellow-500/30 rounded-xl p-3">
                          <span className="text-xs font-bold text-yellow-400 block mb-0.5">{b.title}</span>
                          <span className="text-xs text-slate-300 block">{b.desc}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-500">
                      {tDossier('noBadges')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
