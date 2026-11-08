import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getLeagueHistory, getAllTimeMatchups } from '@/lib/sleeper-api';
import { calculateAllTimeRecords } from '@/lib/stats-engine';
import { Trophy, Skull, Crown, Trash2, Flame, HeartCrack, Bomb, Medal, History as HistoryLucide } from 'lucide-react';
import Image from 'next/image';
import { getSiteConfig } from '@/lib/site-config';
import LeagueNotConfigured from '@/components/LeagueNotConfigured';

export default async function HistoryPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, 'History');
  const isUk = locale === 'uk';
  const { leagueId } = await getSiteConfig();
  if (!leagueId) {
    return <LeagueNotConfigured locale={locale} />;
  }

  const [history, allTimeMatchups] = await Promise.all([
    getLeagueHistory(leagueId),
    getAllTimeMatchups(leagueId)
  ]);

  if ((!history || history.length === 0) && (!allTimeMatchups || allTimeMatchups.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <Trophy className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-300">{t('noHistory')}</h2>
        <p className="text-zinc-500 mt-2 max-w-md">
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
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Pastel Ledger Header */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-200/15 border border-amber-200/35 text-amber-200 flex items-center justify-center shrink-0">
            <HistoryLucide className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-200 mb-1">
              <span>SECTION 06 // HISTORICAL FRANCHISE ARCHIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading uppercase tracking-tight text-white">
              {t('title')}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {t('description')}
            </p>
          </div>
        </div>
      </div>

      {/* 3 All-Time Hall of Fame Career Pods */}
      {records.leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {winKing && (
            <div className="glass-card p-5 relative overflow-hidden border-amber-200/25">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-200 block pb-2.5 mb-3 border-b border-dashed border-white/10">
                01 // {isUk ? 'Лідер За Перемогами' : 'All-Time Wins Leader'}
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {winKing.avatarUrl && (
                    <Image src={winKing.avatarUrl} alt={winKing.displayName} width={42} height={42} className="rounded-lg border border-amber-200/50 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-heading font-bold uppercase text-white text-lg truncate">{winKing.displayName}</p>
                    <p className="text-xs font-mono text-zinc-400">{(winKing.winPct * 100).toFixed(1)}% {t('winPct')}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-2xl text-amber-200 shrink-0">
                  {winKing.wins}-{winKing.losses}
                </span>
              </div>
            </div>
          )}

          {scoringKing && (
            <div className="glass-card p-5 relative overflow-hidden border-emerald-200/25">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-200 block pb-2.5 mb-3 border-b border-dashed border-white/10">
                02 // {isUk ? 'Найбільше Очок За Кар\'єру' : 'All-Time Scoring King'}
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {scoringKing.avatarUrl && (
                    <Image src={scoringKing.avatarUrl} alt={scoringKing.displayName} width={42} height={42} className="rounded-lg border border-emerald-200/50 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-heading font-bold uppercase text-white text-lg truncate">{scoringKing.displayName}</p>
                    <p className="text-xs font-mono text-zinc-400">{scoringKing.seasonsPlayed} {t('seasons')}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-2xl text-emerald-200 shrink-0">
                  {scoringKing.totalPoints.toFixed(0)}
                </span>
              </div>
            </div>
          )}

          {ppgKing && (
            <div className="glass-card p-5 relative overflow-hidden border-sky-200/25">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-200 block pb-2.5 mb-3 border-b border-dashed border-white/10">
                03 // {isUk ? 'Найвищий Середній Бал (PPG)' : 'Highest Career PPG'}
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {ppgKing.avatarUrl && (
                    <Image src={ppgKing.avatarUrl} alt={ppgKing.displayName} width={42} height={42} className="rounded-lg border border-sky-200/50 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-heading font-bold uppercase text-white text-lg truncate">{ppgKing.displayName}</p>
                    <p className="text-xs font-mono text-zinc-400">{t('ppg')}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-2xl text-sky-200 shrink-0">
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-3 gap-2">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-200/15 text-amber-200 border border-amber-200/30 font-mono text-xs font-bold">
                01
              </span>
              <h2 className="text-2xl font-bold font-heading uppercase text-white">
                {t('franchiseLeaderboard')}
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400">{t('franchiseSubtitle')}</p>
          </div>

          <div className="glass-card overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] font-mono uppercase bg-[#111318] border-b border-white/10 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3.5 font-bold text-center w-14">{t('rank')}</th>
                    <th className="px-4 py-3.5 font-bold">{t('manager')}</th>
                    <th className="px-4 py-3.5 font-bold text-center">{t('trophies')}</th>
                    <th className="px-4 py-3.5 font-bold text-center hidden md:table-cell">{t('seasons')}</th>
                    <th className="px-4 py-3.5 font-bold text-center">{t('careerRecord')}</th>
                    <th className="px-4 py-3.5 font-bold text-center">{t('winPct')}</th>
                    <th className="px-4 py-3.5 font-bold text-right hidden sm:table-cell">{t('careerPf')}</th>
                    <th className="px-4 py-3.5 font-bold text-right">{t('ppg')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.leaderboard.map((franchise, idx) => (
                    <tr key={franchise.userId} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex w-7 h-7 rounded-md items-center justify-center font-mono font-bold text-xs ${
                          idx === 0 ? 'bg-amber-200/20 text-amber-200 border border-amber-200/40' :
                          idx === 1 ? 'bg-zinc-300/15 text-zinc-200 border border-zinc-400/30' :
                          idx === 2 ? 'bg-orange-200/15 text-orange-200 border border-orange-300/30' :
                          'bg-[#111318] text-zinc-400 border border-white/10'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {franchise.avatarUrl ? (
                            <Image src={franchise.avatarUrl} alt={franchise.displayName} width={36} height={36} className="rounded-lg border border-white/15 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#111318] border border-white/15 flex items-center justify-center shrink-0">
                              <span className="font-bold text-xs text-amber-200">{franchise.displayName.substring(0, 2).toUpperCase()}</span>
                            </div>
                          )}
                          <span className={`font-heading font-bold uppercase text-base ${idx === 0 ? 'text-amber-200' : 'text-zinc-100'}`}>
                            {franchise.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {franchise.championships.map(yr => (
                            <span key={`win-${yr}`} title={`${yr} ${t('leagueChampion')}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-200/15 text-amber-200 border border-amber-200/30">
                              🏆 '{yr.slice(-2)}
                            </span>
                          ))}
                          {franchise.toiletBowls.map(yr => (
                            <span key={`loss-${yr}`} title={`${yr} ${t('lastPlace')}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-200/15 text-rose-200 border border-rose-200/30">
                              🚽 '{yr.slice(-2)}
                            </span>
                          ))}
                          {franchise.championships.length === 0 && franchise.toiletBowls.length === 0 && (
                            <span className="text-zinc-600 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-zinc-400 hidden md:table-cell">
                        {franchise.seasonsPlayed}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-zinc-200">
                        {franchise.wins}-{franchise.losses}{franchise.ties > 0 ? `-${franchise.ties}` : ''}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-mono font-bold px-2.5 py-0.5 rounded text-xs border ${
                          franchise.winPct >= 0.55 ? 'bg-emerald-200/10 text-emerald-200 border-emerald-200/25' :
                          franchise.winPct < 0.45 ? 'bg-rose-200/10 text-rose-200 border-rose-200/25' :
                          'bg-[#111318] text-zinc-300 border-white/10'
                        }`}>
                          {(franchise.winPct * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-zinc-300 hidden sm:table-cell">
                        {franchise.totalPoints.toFixed(1)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sky-200">
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
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-200/15 text-emerald-200 border border-emerald-200/30 font-mono text-xs font-bold">
              02
            </span>
            <h2 className="text-2xl font-bold font-heading uppercase text-white">
              {t('singleWeekVault')}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nuclear Weeks */}
            <div className="glass-card p-6 border-emerald-200/20 relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-dashed border-white/10">
                <div className="w-9 h-9 rounded-lg bg-emerald-200/10 border border-emerald-200/25 text-emerald-200 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-heading uppercase text-lg text-emerald-200">{t('nuclearWeeks')}</h3>
              </div>

              <div className="space-y-2.5">
                {records.highestScores.map((rec, i) => (
                  <div key={`high-${i}`} className="flex items-center justify-between bg-[#111318] border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-emerald-200 text-xs w-6 h-6 rounded-md bg-emerald-200/10 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-heading font-bold uppercase text-white truncate">{rec.displayName}</p>
                        <p className="text-xs text-zinc-400 truncate font-mono">
                          {rec.season} {t('wk')} {rec.week} • {t('vs')} {rec.opponentName} ({rec.opponentPoints.toFixed(1)})
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-base text-emerald-200 bg-emerald-200/10 border border-emerald-200/25 px-2.5 py-1 rounded-md shrink-0 ml-3">
                      {rec.points.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hall of Shame */}
            <div className="glass-card p-6 border-rose-200/20 relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-dashed border-white/10">
                <div className="w-9 h-9 rounded-lg bg-rose-200/10 border border-rose-200/25 text-rose-200 flex items-center justify-center">
                  <Skull className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-heading uppercase text-lg text-rose-200">{t('hallOfShame')}</h3>
              </div>

              <div className="space-y-2.5">
                {records.lowestScores.map((rec, i) => (
                  <div key={`low-${i}`} className="flex items-center justify-between bg-[#111318] border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-rose-200 text-xs w-6 h-6 rounded-md bg-rose-200/10 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-heading font-bold uppercase text-white truncate">{rec.displayName}</p>
                        <p className="text-xs text-zinc-400 truncate font-mono">
                          {rec.season} {t('wk')} {rec.week} • {t('vs')} {rec.opponentName} ({rec.opponentPoints.toFixed(1)})
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-base text-rose-200 bg-rose-200/10 border border-rose-200/25 px-2.5 py-1 rounded-md shrink-0 ml-3">
                      {rec.points.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Heartbreak Index */}
            <div className="glass-card p-6 border-violet-200/20 relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-dashed border-white/10">
                <div className="w-9 h-9 rounded-lg bg-violet-200/10 border border-violet-200/25 text-violet-200 flex items-center justify-center">
                  <HeartCrack className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-heading uppercase text-lg text-violet-200">{t('heartbreakIndex')}</h3>
              </div>

              <div className="space-y-2.5">
                {records.closestGames.map((rec, i) => (
                  <div key={`close-${i}`} className="flex items-center justify-between bg-[#111318] border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-violet-200 text-xs w-6 h-6 rounded-md bg-violet-200/10 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">
                          <span className="text-rose-200">{rec.loserName}</span>{' '}
                          <span className="text-zinc-500 text-xs font-normal">{t('vs')}</span>{' '}
                          <span className="text-emerald-200">{rec.winnerName}</span>
                        </p>
                        <p className="text-xs text-zinc-400 font-mono">
                          {rec.season} {t('wk')} {rec.week} • {rec.loserPoints.toFixed(2)} - {rec.winnerPoints.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-base text-violet-200 bg-violet-200/10 px-2.5 py-1 rounded-md border border-violet-200/25 shrink-0 ml-3">
                      +{rec.margin.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Biggest Blowouts */}
            <div className="glass-card p-6 border-amber-200/20 relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-dashed border-white/10">
                <div className="w-9 h-9 rounded-lg bg-amber-200/10 border border-amber-200/25 text-amber-200 flex items-center justify-center">
                  <Bomb className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-heading uppercase text-lg text-amber-200">{t('biggestBlowouts')}</h3>
              </div>

              <div className="space-y-2.5">
                {records.biggestBlowouts.map((rec, i) => (
                  <div key={`blowout-${i}`} className="flex items-center justify-between bg-[#111318] border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-amber-200 text-xs w-6 h-6 rounded-md bg-amber-200/10 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">
                          <span className="text-emerald-200">{rec.winnerName}</span>{' '}
                          <span className="text-zinc-500 text-xs font-normal">{t('vs')}</span>{' '}
                          <span className="text-rose-200">{rec.loserName}</span>
                        </p>
                        <p className="text-xs text-zinc-400 font-mono">
                          {rec.season} {t('wk')} {rec.week} • {rec.winnerPoints.toFixed(2)} - {rec.loserPoints.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-base text-amber-200 bg-amber-200/10 px-2.5 py-1 rounded-md border border-amber-200/25 shrink-0 ml-3">
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
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-200/15 text-amber-200 border border-amber-200/30 font-mono text-xs font-bold">
              03
            </span>
            <h2 className="text-2xl font-bold font-heading uppercase text-white">
              {t('pastSeasons')}
            </h2>
          </div>

          <div className="space-y-12">
            {history.map((season) => (
              <div key={season.year} className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px flex-1 bg-white/10"></div>
                  <span className="px-4 py-1.5 rounded-md bg-[#111318] border border-amber-200/30 text-xs font-bold font-mono text-amber-200 uppercase tracking-widest">
                    {season.year}{t('season')}
                  </span>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* League Champion Card */}
                  <div className="glass-card p-7 border-amber-200/25 relative overflow-hidden flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-200/10 border border-amber-200/30 text-amber-200 text-xs font-mono font-bold uppercase tracking-wider mb-5">
                      <Crown className="w-4 h-4" />
                      <span>{t('leagueChampion')}</span>
                    </div>

                    {season.winner ? (
                      <>
                        {season.winner.avatarUrl ? (
                          <Image src={season.winner.avatarUrl} alt={season.winner.displayName} width={80} height={80} className="rounded-2xl border-2 border-amber-200/60 shadow-lg mb-4" />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-[#111318] flex items-center justify-center border-2 border-amber-200/60 mb-4">
                            <span className="font-bold text-2xl text-amber-200">{season.winner.displayName.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <p className="font-bold font-heading uppercase text-white text-2xl sm:text-3xl mb-3">{season.winner.displayName}</p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <span className="px-3 py-1 rounded-md bg-[#111318] border border-amber-200/25 text-xs font-mono font-bold text-amber-200">
                            {season.winner.wins}-{season.winner.losses}
                          </span>
                          <span className="px-3 py-1 rounded-md bg-[#111318] border border-emerald-200/25 text-xs font-mono font-bold text-emerald-200">
                            {season.winner.fpts.toFixed(1)} PF
                          </span>
                          <span className="px-3 py-1 rounded-md bg-[#111318] border border-white/10 text-xs font-mono text-zinc-400">
                            {season.winner.fptsAgainst.toFixed(1)} PA
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-zinc-500 mt-6">{t('dataUnavailable')}</p>
                    )}
                  </div>

                  {/* Last Place Card */}
                  <div className="glass-card p-7 border-rose-200/25 relative overflow-hidden flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-200/10 border border-rose-200/30 text-rose-200 text-xs font-mono font-bold uppercase tracking-wider mb-5">
                      <Trash2 className="w-4 h-4" />
                      <span>{t('lastPlace')}</span>
                    </div>

                    {season.loser ? (
                      <>
                        {season.loser.avatarUrl ? (
                          <Image src={season.loser.avatarUrl} alt={season.loser.displayName} width={80} height={80} className="rounded-2xl border-2 border-rose-200/60 shadow-lg mb-4" />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-[#111318] flex items-center justify-center border-2 border-rose-200/60 mb-4">
                            <span className="font-bold text-2xl text-rose-200">{season.loser.displayName.substring(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <p className="font-bold font-heading uppercase text-white text-2xl sm:text-3xl mb-3">{season.loser.displayName}</p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <span className="px-3 py-1 rounded-md bg-[#111318] border border-rose-200/25 text-xs font-mono font-bold text-rose-200">
                            {season.loser.wins}-{season.loser.losses}
                          </span>
                          <span className="px-3 py-1 rounded-md bg-[#111318] border border-white/10 text-xs font-mono font-bold text-zinc-300">
                            {season.loser.fpts.toFixed(1)} PF
                          </span>
                          <span className="px-3 py-1 rounded-md bg-[#111318] border border-white/10 text-xs font-mono text-zinc-400">
                            {season.loser.fptsAgainst.toFixed(1)} PA
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-zinc-500 mt-6">{t('dataUnavailable')}</p>
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
