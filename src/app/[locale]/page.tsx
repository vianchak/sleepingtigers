import { getLeagueData } from '@/lib/sleeper-api';
import { calculateBadges, calculateAllPlayRecord, calculatePowerRankings } from '@/lib/stats-engine';
import { Award, Zap, HeartPulse, ShieldAlert, Skull, Wrench, Medal, Backpack, RefreshCw, Trash2, AlertTriangle, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';



export default async function DashboardHome({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  let t; try { t = await getTranslations({locale, namespace: "Home"}); } catch(e: any) { return <div className="text-red-500 text-center mt-20">Translation Error: {e.message}</div>; }
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID;
  if (!leagueId) {
    return <div className="text-red-500">Error: NEXT_PUBLIC_SLEEPER_LEAGUE_ID is not set.</div>;
  }

  let teams; try { teams = await getLeagueData(leagueId); } catch(e: any) { return <div className="text-red-500 text-center mt-20">API Error: {e.message}</div>; }
  if (!teams || teams.length === 0) {
    return <div className="text-yellow-400">Loading league data...</div>;
  }

  // {t('currentLeader')} by wins, then points
  const sortedTeams = [...teams].sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);
  const leader = sortedTeams[0];

  const badges = calculateBadges(teams);
  const allPlay = calculateAllPlayRecord(teams);
  const powerRankings = calculatePowerRankings(teams);

  // Parasha (Bottom teams by All-Play)
  const parashaResident = allPlay.length > 0 ? allPlay[allPlay.length - 1] : null;
  const parashaCandidates = allPlay.length > 3 ? allPlay.slice(allPlay.length - 4, allPlay.length - 1).reverse() : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Hero Section */}
      <section className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Award className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h2 className="text-sm uppercase tracking-wider text-emerald-400 font-semibold mb-2">{t('currentLeader')}</h2>
          <div className="flex items-center space-x-6">
            {leader.avatarUrl ? (
              <Image src={leader.avatarUrl} alt="Avatar" width={80} height={80} className="rounded-full border-4 border-emerald-500 shadow-xl" />
            ) : (
              <div className="w-20 h-20 bg-slate-700 rounded-full border-4 border-emerald-500 flex items-center justify-center shadow-xl">
                <span className="text-2xl font-bold">{leader.displayName.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h3 className="text-4xl font-bold">{leader.displayName}</h3>
              <p className="text-slate-300 mt-2 text-lg">
                {t('record')}: {leader.wins}-{leader.losses}{leader.ties > 0 ? `-${leader.ties}` : ''} | {leader.fpts.toFixed(1)} {t('pf')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Grid */}
      <h2 className="text-2xl font-bold text-gradient inline-block mb-4">{t('dynamicBadges')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Bench Whisperer */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.benchWhisperer?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('benchWhisperer')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('benchWhispererDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-blue-300">{badges.benchWhisperer?.team.displayName || 'N/A'}</p>
          </div>
        </div>

        {/* Cardiac Kid */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.cardiacKid?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('cardiacKid')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('cardiacKidDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-rose-300">{badges.cardiacKid?.team.displayName || 'N/A'}</p>
          </div>
        </div>

        {/* Glass Cannon */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.glassCannon?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('glassCannon')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('glassCannonDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-amber-300">{badges.glassCannon?.team.displayName || 'N/A'}</p>
          </div>
        </div>

        {/* Unlucky */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.unlucky?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Skull className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('unlucky')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('unluckyDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-purple-300">{badges.unlucky?.team.displayName || 'N/A'}</p>
            <p className="text-xs text-slate-500 mt-1">{badges.unlucky?.team.fptsAgainst.toFixed(1)} PA</p>
          </div>
        </div>

        {/* The Tinkerer (Hindsight 20/20) */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.tinkerer?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Wrench className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('tinkerer')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('tinkererDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-indigo-300">{badges.tinkerer?.team.displayName || 'N/A'}</p>
          </div>
        </div>

        {/* Participation Trophy */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.participationTrophy?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Medal className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('participationTrophy')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('participationTrophyDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-green-300">{badges.participationTrophy?.team.displayName || 'N/A'}</p>
          </div>
        </div>

        {/* The Backpack */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.backpack?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Backpack className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('backpack')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('backpackDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-orange-300">{badges.backpack?.team.displayName || 'N/A'}</p>
            <p className="text-xs text-slate-500 mt-1">{badges.backpack ? `${(badges.backpack.team.maxPlayerPercentage * 100).toFixed(1)}% of points` : ''}</p>
          </div>
        </div>

        {/* Best Ball Champion */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Crown className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('bestBallChamp')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('bestBallChampDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-yellow-300">{badges.bestBallChampion?.team.displayName || 'N/A'}</p>
          </div>
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.bestBallChampion?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
        </div>

        {/* One-Hit Wonder */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('oneHitWonder')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('oneHitWonderDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-cyan-300">{badges.oneHitWonder?.team.displayName || 'N/A'}</p>
          </div>
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.oneHitWonder?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
        </div>

        {/* Churn and Burn */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.churnAndBurn?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">{t('churnAndBurn')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('churnAndBurnDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-teal-300">{badges.churnAndBurn?.team.displayName || 'N/A'}</p>
            <p className="text-xs text-slate-500 mt-1">{badges.churnAndBurn?.team.totalMoves} moves</p>
          </div>
        </div>

        {/* Hyrox Moment */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.hyroxMoment?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl">💩</span>
          </div>
          <h4 className="font-bold text-lg mb-1">{t('hyroxMoment')}</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">{t('hyroxMomentDesc')}</p>
          <div className="mt-auto">
            <p className="font-bold text-pink-300">{badges.hyroxMoment?.team.displayName || 'N/A'}</p>
          </div>
        </div>

      </div>


      {/* {t('officialPowerRankings')} */}
      <div className="mt-12 mb-12">
        <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-2">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              {t('officialPowerRankings')}
            </h2>
          </div>
          <p className="text-sm text-slate-400 hidden sm:block">{t('algorithm')}</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-300 text-center w-16">{t('rank')}</th>
                  <th className="px-6 py-4 font-bold text-slate-300">{t('manager')}</th>
                  <th className="px-6 py-4 font-bold text-slate-300 text-center hidden sm:table-cell">{t('powerScore')}</th>
                  <th className="px-6 py-4 font-bold text-slate-300 text-center hidden md:table-cell">{t('recentForm')}</th>
                </tr>
              </thead>
              <tbody>
                {powerRankings.map((pr, idx) => (
                  <tr key={pr.team.rosterId} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-slate-800 text-slate-300'}`}>
                        {pr.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {pr.team.avatarUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-600">
                            <Image src={pr.team.avatarUrl} alt={pr.team.displayName} width={40} height={40} />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                            <span className="font-bold text-xs">{pr.team.displayName.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className={`font-bold text-base ${idx === 0 ? 'text-yellow-400' : 'text-slate-200'}`}>{pr.team.displayName}</p>
                          <p className="text-xs text-slate-500 md:hidden">Score: {(pr.powerScore * 100).toFixed(0)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      <div className="w-full bg-slate-800 rounded-full h-2.5 max-w-xs mx-auto">
                        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2.5 rounded-full" style={{ width: `${Math.min(pr.powerScore * 100, 100)}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">{(pr.powerScore * 100).toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell text-emerald-400 font-mono">
                      {pr.recentForm.toFixed(1)} <span className="text-xs text-slate-500 font-sans block">{t('ptsWk')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Parasha Section */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <Trash2 className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
            Parasha
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Current Resident (Absolute Worst) */}
          {parashaResident && (
            <div className="md:col-span-1 glass-card p-6 flex flex-col items-center text-center border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
              <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4 relative">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-xl mb-1 text-red-400">{t('resident')}</h3>
              <p className="text-xs text-slate-400 mb-4">{t('deadLast')}</p>

              {parashaResident.team.avatarUrl ? (
                <div className="w-12 h-12 rounded-full overflow-hidden mb-2 border-2 border-red-500/50">
                  <Image src={parashaResident.team.avatarUrl} alt={parashaResident.team.displayName} width={48} height={48} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-2 border-2 border-red-500/50">
                  <span className="font-bold">{parashaResident.team.displayName.charAt(0)}</span>
                </div>
              )}

              <div className="mt-auto">
                <p className="font-bold text-white text-lg">{parashaResident.team.displayName}</p>
                <p className="text-sm text-red-400 mt-1">{(parashaResident.winPercentage * 100).toFixed(1)}% {t('trueWinRate')}</p>
                <p className="text-xs text-slate-500">{parashaResident.team.fpts.toFixed(1)} {t('pf')}</p>
              </div>
            </div>
          )}

          {/* Candidates */}
          <div className="md:col-span-3 glass-card p-6 border-orange-500/20">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-lg text-orange-400">{t('atRisk')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {parashaCandidates.map((candidate, idx) => (
                <div key={candidate.team.rosterId} className="bg-slate-800/40 rounded-xl p-4 flex flex-col items-center text-center border border-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3 font-bold text-sm">
                    #{allPlay.length - 1 - idx}
                  </div>
                  {candidate.team.avatarUrl ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden mb-2 border border-slate-600">
                      <Image src={candidate.team.avatarUrl} alt={candidate.team.displayName} width={40} height={40} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mb-2 border border-slate-600">
                      <span className="text-xs font-bold">{candidate.team.displayName.charAt(0)}</span>
                    </div>
                  )}
                  <p className="font-bold text-slate-200 text-sm">{candidate.team.displayName}</p>
                  <p className="text-xs text-orange-300 mt-1">{(candidate.winPercentage * 100).toFixed(1)}% {t('wr')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';



