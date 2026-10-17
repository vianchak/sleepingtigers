import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getLeagueHistory, getAllTimeMatchups } from '@/lib/sleeper-api';
import { calculateAllTimeRecords } from '@/lib/stats-engine';
import { Trophy, Skull, Crown, Trash2, Flame, HeartCrack, Bomb, Medal } from 'lucide-react';
import Image from 'next/image';

export default async function HistoryPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, 'History');
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

  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 mb-4 flex items-center justify-center gap-3">
          <HistoryIcon /> {t('title')}
        </h2>
        <p className="text-slate-400">
          {t('description')}
        </p>
      </div>

      {records.leaderboard.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-700/50 pb-3 gap-2">
            <div className="flex items-center gap-3">
              <Medal className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold font-heading text-white">
                {t('franchiseLeaderboard')}
              </h3>
            </div>
            <p className="text-xs text-slate-400">{t('franchiseSubtitle')}</p>
          </div>

          <div className="glass-card overflow-hidden border border-slate-700/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-900/70 border-b border-slate-700 text-slate-300">
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
                    <tr key={franchise.userId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center font-bold text-xs ${
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
                            <span key={`win-${yr}`} title={`${yr} ${t('leagueChampion')}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                              🏆 {yr.slice(-2)}
                            </span>
                          ))}
                          {franchise.toiletBowls.map(yr => (
                            <span key={`loss-${yr}`} title={`${yr} ${t('lastPlace')}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                              🚽 {yr.slice(-2)}
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
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          franchise.winPct >= 0.55 ? 'bg-emerald-500/15 text-emerald-400' :
                          franchise.winPct < 0.45 ? 'bg-rose-500/15 text-rose-400' :
                          'text-slate-300'
                        }`}>
                          {(franchise.winPct * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-300 hidden sm:table-cell">
                        {franchise.totalPoints.toFixed(1)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-cyan-400">
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

      {records.highestScores.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-700/50 pb-3">
            <Flame className="w-6 h-6 text-amber-400" />
            <h3 className="text-2xl font-bold font-heading text-white">
              {t('singleWeekVault')}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-400"></div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-lg text-emerald-400">{t('nuclearWeeks')}</h4>
              </div>

              <div className="space-y-3">
                {records.highestScores.map((rec, i) => (
                  <div key={`high-${i}`} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-emerald-400/80 text-sm w-5">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{rec.displayName}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {rec.season} {t('wk')} {rec.week} • {t('vs')} {rec.opponentName} ({rec.opponentPoints.toFixed(1)})
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="font-mono font-black text-xl text-emerald-400">{rec.points.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 border-rose-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 to-orange-500"></div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Skull className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-lg text-rose-400">{t('hallOfShame')}</h4>
              </div>

              <div className="space-y-3">
                {records.lowestScores.map((rec, i) => (
                  <div key={`low-${i}`} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-rose-400/80 text-sm w-5">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{rec.displayName}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {rec.season} {t('wk')} {rec.week} • {t('vs')} {rec.opponentName} ({rec.opponentPoints.toFixed(1)})
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="font-mono font-black text-xl text-rose-400">{rec.points.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 border-purple-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <HeartCrack className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-lg text-purple-400">{t('heartbreakIndex')}</h4>
              </div>

              <div className="space-y-3">
                {records.closestGames.map((rec, i) => (
                  <div key={`close-${i}`} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-purple-400/80 text-sm w-5">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">
                          <span className="text-rose-300">{rec.loserName}</span>{' '}
                          <span className="text-slate-500 text-xs font-normal">{t('vs')}</span>{' '}
                          <span className="text-emerald-300">{rec.winnerName}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                          {rec.season} {t('wk')} {rec.week} • {rec.loserPoints.toFixed(2)} - {rec.winnerPoints.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="font-mono font-black text-lg text-purple-300 bg-purple-500/15 px-2.5 py-1 rounded-lg border border-purple-500/30">
                        +{rec.margin.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 border-amber-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bomb className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-lg text-amber-400">{t('biggestBlowouts')}</h4>
              </div>

              <div className="space-y-3">
                {records.biggestBlowouts.map((rec, i) => (
                  <div key={`blowout-${i}`} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-amber-400/80 text-sm w-5">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">
                          <span className="text-emerald-300">{rec.winnerName}</span>{' '}
                          <span className="text-slate-500 text-xs font-normal">{t('vs')}</span>{' '}
                          <span className="text-rose-300">{rec.loserName}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                          {rec.season} {t('wk')} {rec.week} • {rec.winnerPoints.toFixed(2)} - {rec.loserPoints.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="font-mono font-black text-lg text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        +{rec.margin.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {history && history.length > 0 && (
        <section className="space-y-12">
          <div className="flex items-center gap-3 border-b border-slate-700/50 pb-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h3 className="text-2xl font-bold font-heading text-white">
              {t('pastSeasons')}
            </h3>
          </div>

          <div className="space-y-16">
            {history.map((season) => (
              <div key={season.year} className="relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <span className="text-[20rem] font-bold font-heading">{season.year}</span>
                </div>
                
                <h3 className="text-3xl font-bold text-center mb-8 text-slate-300 relative z-10">{season.year}{t('season')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="glass-card p-8 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 to-amber-400"></div>
                    <div className="w-24 h-24 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-6 relative">
                      <Crown className="w-12 h-12" />
                    </div>
                    
                    <h4 className="font-bold text-2xl mb-1 text-yellow-400">{t('leagueChampion')}</h4>
                    
                    {season.winner ? (
                      <>
                        <div className="my-6">
                          {season.winner.avatarUrl ? (
                            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-yellow-500/50 shadow-lg">
                              <Image src={season.winner.avatarUrl} alt={season.winner.displayName} width={80} height={80} />
                            </div>
                          ) : (
                            <div className="w-20 h-20 mx-auto rounded-full bg-slate-700 flex items-center justify-center border-4 border-yellow-500/50 shadow-lg">
                              <span className="font-bold text-2xl">{season.winner.displayName.substring(0, 2).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-white text-3xl mb-2">{season.winner.displayName}</p>
                        <p className="text-yellow-300/80">
                          {t('record')}{season.winner.wins}-{season.winner.losses} | {season.winner.fpts.toFixed(1)}{t('pf')}{season.winner.fptsAgainst.toFixed(1)} {t('pa')}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-500 mt-8">{t('dataUnavailable')}</p>
                    )}
                  </div>

                  <div className="glass-card p-8 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400"></div>
                    <div className="w-24 h-24 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-6 relative">
                      <Trash2 className="w-12 h-12" />
                    </div>
                    
                    <h4 className="font-bold text-2xl mb-1 text-red-400">{t('lastPlace')}</h4>
                    
                    {season.loser ? (
                      <>
                        <div className="my-6">
                          {season.loser.avatarUrl ? (
                            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-red-500/50 shadow-lg">
                              <Image src={season.loser.avatarUrl} alt={season.loser.displayName} width={80} height={80} />
                            </div>
                          ) : (
                            <div className="w-20 h-20 mx-auto rounded-full bg-slate-700 flex items-center justify-center border-4 border-red-500/50 shadow-lg">
                              <span className="font-bold text-2xl">{season.loser.displayName.substring(0, 2).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-white text-3xl mb-2">{season.loser.displayName}</p>
                        <p className="text-red-300/80">
                          {t('record')}{season.loser.wins}-{season.loser.losses} | {season.loser.fpts.toFixed(1)}{t('pf')}{season.loser.fptsAgainst.toFixed(1)} {t('pa')}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-500 mt-8">{t('dataUnavailable')}</p>
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

function HistoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
