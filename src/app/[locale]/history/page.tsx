import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getLeagueHistory, getAllTimeMatchups } from '@/lib/sleeper-api';
import { calculateAllTimeRecords } from '@/lib/stats-engine';
import { Trophy, Skull, Crown, Trash2, Flame, HeartCrack, Bomb, Medal, History as HistoryLucide } from 'lucide-react';
import Image from 'next/image';

export default async function HistoryPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, 'History');
  const isUk = locale === 'uk';
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID;
  if (!leagueId) {
    return <div className="text-red-500">Error: NEXT_PUBLIC_SLEEPER_LEAGUE_ID is not set.</div>;
  }

  const [history, allTimeMatchups] = await Promise.all([
    getLeagueHistory(leagueId),
    getAllTimeMatchups(leagueId)
  ]);

  if ((!history || history.length === 0) && (!allTimeMatchups || allTimeMatchups.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <Trophy className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-300">{t('noHistory')}</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          {t('noHistoryDesc')}
        </p>
      </div>
    );
  }

  const records = calculateAllTimeRecords(allTimeMatchups || [], history || []);
  const winKing = records.leaderboard[0] || null;
  const scoringKing = [...records.leaderboard].sort((a, b) => b.totalPoints - a.totalPoints)[0] || null;
  const ppgKing = [...records.leaderboard].sort((a, b) => b.ppg - a.ppg)[0] || null;

  return (
    <div className="space-y-14 animate-in fade-in duration-500">
      {/* Broadcast Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 mb-4 shadow-[0_0_25px_rgba(234,179,8,0.2)]">
          <HistoryLucide className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 mb-2">
          {t('title')}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          {t('description')}
        </p>
      </div>

      {/* 3 All-Time Hall of Fame Career Pods */}
      {records.leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {winKing && (
            <div className="glass-card p-5 relative overflow-hidden border-yellow-500/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500"></div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-yellow-400 block mb-2.5">
                {isUk ? 'Лідер За Перемогами В Історії' : 'All-Time Wins Leader'}
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {winKing.avatarUrl && (
                    <Image src={winKing.avatarUrl} alt={winKing.displayName} width={42} height={42} className="rounded-full border-2 border-yellow-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-white text-lg truncate">{winKing.displayName}</p>
                    <p className="text-xs font-mono text-slate-400">{(winKing.winPct * 100).toFixed(1)}% {t('winPct')}</p>
                  </div>
                </div>
                <span className="font-mono font-black text-2xl text-yellow-300 shrink-0">
                  {winKing.wins}-{winKing.losses}
                </span>
              </div>
            </div>
          )}

          {scoringKing && (
            <div className="glass-card p-5 relative overflow-hidden border-emerald-500/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-2.5">
                {isUk ? 'Найбільше Очок За Кар\'єру' : 'All-Time Scoring King'}
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {scoringKing.avatarUrl && (
                    <Image src={scoringKing.avatarUrl} alt={scoringKing.displayName} width={42} height={42} className="rounded-full border-2 border-emerald-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-white text-lg truncate">{scoringKing.displayName}</p>
                    <p className="text-xs font-mono text-slate-400">{scoringKing.seasonsPlayed} {t('seasons')}</p>
                  </div>
                </div>
                <span className="font-mono font-black text-2xl text-emerald-300 shrink-0">
                  {scoringKing.totalPoints.toFixed(0)}
                </span>
              </div>
            </div>
          )}

          {ppgKing && (
            <div className="glass-card p-5 relative overflow-hidden border-cyan-500/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 block mb-2.5">
                {isUk ? 'Найвищий Середній Бал (Очок/Гра)' : 'Highest Career PPG'}
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {ppgKing.avatarUrl && (
                    <Image src={ppgKing.avatarUrl} alt={ppgKing.displayName} width={42} height={42} className="rounded-full border-2 border-cyan-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-white text-lg truncate">{ppgKing.displayName}</p>
                    <p className="text-xs font-mono text-slate-400">{t('ppg')}</p>
                  </div>
                </div>
                <span className="font-mono font-black text-2xl text-cyan-300 shrink-0">
                  {ppgKing.ppg.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All-Time Franchise Leaderboard Table */}
      {records.leaderboard.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-3">
              <Medal className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-extrabold font-heading text-white">
                {t('franchiseLeaderboard')}
              </h2>
            </div>
            <p className="text-xs text-slate-400">{t('franchiseSubtitle')}</p>
          </div>

          <div className="glass-card overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-cyan-400"></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-900/70 border-b border-slate-800 text-slate-300">
                  <tr>
                    <th className="px-4 py-4 font-bold text-center w-14">{t('rank')}</th>
                    <th className="px-4 py-4 font-bold">{t('manager')}</th>
                    <th className="px-4 py-4 font-bold text-center">{t('trophies')}</th>
                    <th className="px-4 py-4 font-bold text-center hidden md:table-cell">{t('seasons')}</th>
                    <th className="px-4 py-4 font-bold text-center">{t('careerRecord')}</th>
                    <th className="px-4 py-4 font-bold text-center">{t('winPct')}</th>
                    <th className="px-4 py-4 font-bold text-right hidden sm:table-cell">{t('careerPf')}</th>
                    <th className="px-4 py-4 font-bold text-right">{t('ppg')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {records.leaderboard.map((franchise, idx) => (
                    <tr key={franchise.userId} className="hover:bg-slate-800/35 transition-colors">
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center font-mono font-bold text-xs ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                          idx === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-400/50' :
                          idx === 2 ? 'bg-amber-700/20 text-amber-400 border border-amber-600/50' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {franchise.avatarUrl ? (
                            <Image src={franchise.avatarUrl} alt={franchise.displayName} width={36} height={36} className="rounded-full border border-slate-600 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                              <span className="font-bold text-xs">{franchise.displayName.substring(0, 2).toUpperCase()}</span>
                            </div>
                          )}
                          <span className={`font-bold text-base ${idx === 0 ? 'text-yellow-400' : 'text-slate-100'}`}>
                            {franchise.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {franchise.championships.map(yr => (
                            <span key={`win-${yr}`} title={`${yr} ${t('leagueChampion')}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                              🏆 '{yr.slice(-2)}
                            </span>
                          ))}
                          {franchise.toiletBowls.map(yr => (
                            <span key={`loss-${yr}`} title={`${yr} ${t('lastPlace')}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                              🚽 '{yr.slice(-2)}
                            </span>
                          ))}
                          {franchise.championships.length === 0 && franchise.toiletBowls.length === 0 && (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-slate-400 hidden md:table-cell">
                        {franchise.seasonsPlayed}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-200">
                        {franchise.wins}-{franchise.losses}{franchise.ties > 0 ? `-${franchise.ties}` : ''}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-mono font-bold px-2.5 py-0.5 rounded-full text-xs border ${
                          franchise.winPct >= 0.55 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                          franchise.winPct < 0.45 ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                          'bg-slate-800/80 text-slate-300 border-slate-700'
                        }`}>
                          {(franchise.winPct * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-300 hidden sm:table-cell">
                        {franchise.totalPoints.toFixed(1)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-cyan-300">
                        {franchise.ppg.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Single-Week Record Vault */}
      {records.highestScores.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <Flame className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-extrabold font-heading text-white">
              {t('singleWeekVault')}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nuclear Weeks */}
            <div className="glass-card p-6 border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-400"></div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-heading text-lg text-emerald-400">{t('nuclearWeeks')}</h3>
              </div>

              <div className="space-y-2.5">
                {records.highestScores.map((rec, i) => (
                  <div key={`high-${i}`} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-emerald-400 text-xs w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{rec.displayName}</p>
                        <p className="text-xs text-slate-400 truncate font-mono">
                          {rec.season} {t('wk')} {rec.week} • {t('vs')} {rec.opponentName} ({rec.opponentPoints.toFixed(1)})
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-black text-lg text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg shrink-0 ml-3">
                      {rec.points.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hall of Shame */}
            <div className="glass-card p-6 border-rose-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 to-orange-500"></div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <Skull className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-heading text-lg text-rose-400">{t('hallOfShame')}</h3>
              </div>

              <div className="space-y-2.5">
                {records.lowestScores.map((rec, i) => (
                  <div key={`low-${i}`} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-rose-400 text-xs w-6 h-6 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{rec.displayName}</p>
                        <p className="text-xs text-slate-400 truncate font-mono">
                          {rec.season} {t('wk')} {rec.week} • {t('vs')} {rec.opponentName} ({rec.opponentPoints.toFixed(1)})
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-black text-lg text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-lg shrink-0 ml-3">
                      {rec.points.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Heartbreak Index */}
            <div className="glass-card p-6 border-purple-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <HeartCrack className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-heading text-lg text-purple-400">{t('heartbreakIndex')}</h3>
              </div>

              <div className="space-y-2.5">
                {records.closestGames.map((rec, i) => (
                  <div key={`close-${i}`} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-purple-400 text-xs w-6 h-6 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">
                          <span className="text-rose-300">{rec.loserName}</span>{' '}
                          <span className="text-slate-500 text-xs font-normal">{t('vs')}</span>{' '}
                          <span className="text-emerald-300">{rec.winnerName}</span>
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {rec.season} {t('wk')} {rec.week} • {rec.loserPoints.toFixed(2)} - {rec.winnerPoints.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-black text-lg text-purple-300 bg-purple-500/15 px-2.5 py-1 rounded-lg border border-purple-500/30 shrink-0 ml-3">
                      +{rec.margin.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Biggest Blowouts */}
            <div className="glass-card p-6 border-amber-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Bomb className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-heading text-lg text-amber-400">{t('biggestBlowouts')}</h3>
              </div>

              <div className="space-y-2.5">
                {records.biggestBlowouts.map((rec, i) => (
                  <div key={`blowout-${i}`} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-amber-400 text-xs w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">
                          <span className="text-emerald-300">{rec.winnerName}</span>{' '}
                          <span className="text-slate-500 text-xs font-normal">{t('vs')}</span>{' '}
                          <span className="text-rose-300">{rec.loserName}</span>
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {rec.season} {t('wk')} {rec.week} • {rec.winnerPoints.toFixed(2)} - {rec.loserPoints.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-black text-lg text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 shrink-0 ml-3">
                      +{rec.margin.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Past Seasons Champions & Toilet Bowls */}
      {history && history.length > 0 && (
        <section className="space-y-10">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-extrabold font-heading text-white">
              {t('pastSeasons')}
            </h2>
          </div>

          <div className="space-y-12">
            {history.map((season) => (
              <div key={season.year} className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
                  <span className="px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-sm font-extrabold font-heading text-yellow-400 uppercase tracking-widest">
                    {season.year}{t('season')}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* League Champion Card */}
                  <div className="glass-card p-7 border-yellow-500/30 relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 to-amber-400"></div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-extrabold uppercase tracking-wider mb-5">
                      <Crown className="w-4 h-4" />
                      <span>{t('leagueChampion')}</span>
                    </div>

                    {season.winner ? (
                      <>
                        {season.winner.avatarUrl ? (
                          <Image src={season.winner.avatarUrl} alt={season.winner.displayName} width={80} height={80} className="rounded-2xl border-2 border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.25)] mb-4" />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center border-2 border-yellow-400 mb-4">
                            <span className="font-bold text-2xl">{season.winner.displayName.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <p className="font-extrabold font-heading text-white text-2xl sm:text-3xl mb-3">{season.winner.displayName}</p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono font-bold text-yellow-300">
                            {season.winner.wins}-{season.winner.losses}
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono font-bold text-emerald-300">
                            {season.winner.fpts.toFixed(1)} PF
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-400">
                            {season.winner.fptsAgainst.toFixed(1)} PA
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-500 mt-6">{t('dataUnavailable')}</p>
                    )}
                  </div>

                  {/* Last Place Card */}
                  <div className="glass-card p-7 border-rose-500/30 relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-600 to-orange-500"></div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-extrabold uppercase tracking-wider mb-5">
                      <Trash2 className="w-4 h-4" />
                      <span>{t('lastPlace')}</span>
                    </div>

                    {season.loser ? (
                      <>
                        {season.loser.avatarUrl ? (
                          <Image src={season.loser.avatarUrl} alt={season.loser.displayName} width={80} height={80} className="rounded-2xl border-2 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.2)] mb-4" />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center border-2 border-rose-400 mb-4">
                            <span className="font-bold text-2xl">{season.loser.displayName.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <p className="font-extrabold font-heading text-white text-2xl sm:text-3xl mb-3">{season.loser.displayName}</p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono font-bold text-rose-300">
                            {season.loser.wins}-{season.loser.losses}
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono font-bold text-slate-300">
                            {season.loser.fpts.toFixed(1)} PF
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-400">
                            {season.loser.fptsAgainst.toFixed(1)} PA
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-500 mt-6">{t('dataUnavailable')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
