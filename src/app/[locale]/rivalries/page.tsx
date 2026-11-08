import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getAllTimeMatchups } from '@/lib/sleeper-api';
import { getRivalries } from '@/lib/stats-engine';
import { Swords, Skull, Trophy, History, Flame } from 'lucide-react';
import Image from 'next/image';
import { getSiteConfig } from '@/lib/site-config';
import LeagueNotConfigured from '@/components/LeagueNotConfigured';

export default async function RivalriesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, 'Rivalries');
  const { leagueId } = await getSiteConfig();
  if (!leagueId) {
    return <LeagueNotConfigured locale={locale} />;
  }

  const allTimeMatchups = await getAllTimeMatchups(leagueId);
  const rivalries = getRivalries(allTimeMatchups);

  // Most Frequent Matchups
  const mostFrequent = [...rivalries].sort((a, b) => b.totalMatches - a.totalMatches).slice(0, 4);

  // El Clasico (Olegi vs Fantaser, or fallback to top all-time rivalry for any other league)
  const elClasico = rivalries.find(r => 
    (r.managerA.displayName.toLowerCase() === 'olegi' && r.managerB.displayName.toLowerCase() === 'fantaser') ||
    (r.managerB.displayName.toLowerCase() === 'olegi' && r.managerA.displayName.toLowerCase() === 'fantaser')
  ) || mostFrequent[0];

  // Kryptonite sweeps
  const sweeps = rivalries.filter(r => (r.winsA >= 2 && r.winsB === 0) || (r.winsB >= 2 && r.winsA === 0)).sort((a, b) => Math.max(b.winsA, b.winsB) - Math.max(a.winsA, a.winsB));

  // Determine first season
  const uniqueSeasons = Array.from(new Set(allTimeMatchups.map(m => m.season))).sort();
  const firstSeason = uniqueSeasons.length > 0 ? uniqueSeasons[0] : 'Unknown';

  // Unique managers
  const uniqueManagers = new Map<string, any>();
  rivalries.forEach(r => {
    uniqueManagers.set(r.managerA.userId, r.managerA);
    uniqueManagers.set(r.managerB.userId, r.managerB);
  });
  const managers = Array.from(uniqueManagers.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Pastel Ledger Header */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-200/15 border border-rose-200/35 text-rose-200 flex items-center justify-center shrink-0">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-rose-200 mb-1">
              <span>SECTION 05 // HEAD-TO-HEAD GRUDGE LEDGER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading uppercase tracking-tight text-white">{t('title')}</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {t('description')}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#111318] px-3.5 py-1.5 rounded-lg border border-white/10 shrink-0">
          <History className="w-3.5 h-3.5 text-emerald-200" />
          <span className="text-xs font-mono font-bold text-zinc-300">{t('allTimeData')}{firstSeason}{t('allTimeDataEnd')}</span>
        </div>
      </div>

      {/* El Clasico Main Event */}
      {elClasico && (
        <section>
          <div className="glass-panel p-6 sm:p-8 border border-amber-200/30 relative overflow-hidden">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-amber-200/40"></div>
              <span className="px-3 py-1 rounded-md text-xs font-bold font-mono text-amber-200 bg-amber-200/10 border border-amber-200/30 tracking-widest uppercase">
                01 // {t('elClasico')}
              </span>
              <div className="h-px w-12 bg-amber-200/40"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-6 max-w-3xl mx-auto">
              {/* Manager A */}
              <div className="flex flex-col items-center text-center">
                {elClasico.managerA.avatarUrl ? (
                  <Image src={elClasico.managerA.avatarUrl} alt={elClasico.managerA.displayName} width={84} height={84} className="rounded-2xl border-2 border-amber-200/60 shadow-lg mb-3" />
                ) : (
                  <div className="w-21 h-21 rounded-2xl bg-[#111318] border-2 border-amber-200/60 flex items-center justify-center mb-3">
                    <span className="font-bold text-xl text-amber-200">{elClasico.managerA.displayName.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-xl font-bold font-heading uppercase text-white">{elClasico.managerA.displayName}</span>
                <span className="text-5xl font-bold text-amber-200 mt-1 font-mono">{elClasico.winsA}</span>
              </div>

              {/* Center Tug-of-War */}
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">{t('totalMatches')}</span>
                <span className="text-3xl font-bold text-white font-mono mb-3">{elClasico.totalMatches}</span>
                <div className="w-full h-3 bg-[#111318] rounded-full overflow-hidden flex border border-white/10">
                  <div
                    className="bg-amber-200 h-full"
                    style={{ width: `${elClasico.totalMatches > 0 ? (elClasico.winsA / elClasico.totalMatches) * 100 : 50}%` }}
                  />
                  <div
                    className="bg-rose-300 h-full"
                    style={{ width: `${elClasico.totalMatches > 0 ? (elClasico.winsB / elClasico.totalMatches) * 100 : 50}%` }}
                  />
                </div>
              </div>

              {/* Manager B */}
              <div className="flex flex-col items-center text-center">
                {elClasico.managerB.avatarUrl ? (
                  <Image src={elClasico.managerB.avatarUrl} alt={elClasico.managerB.displayName} width={84} height={84} className="rounded-2xl border-2 border-rose-200/60 shadow-lg mb-3" />
                ) : (
                  <div className="w-21 h-21 rounded-2xl bg-[#111318] border-2 border-rose-200/60 flex items-center justify-center mb-3">
                    <span className="font-bold text-xl text-rose-200">{elClasico.managerB.displayName.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-xl font-bold font-heading uppercase text-white">{elClasico.managerB.displayName}</span>
                <span className="text-5xl font-bold text-rose-200 mt-1 font-mono">{elClasico.winsB}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Most Frequent Matchups */}
      {mostFrequent.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-200/15 text-indigo-200 border border-indigo-200/30 font-mono text-xs font-bold">
              02
            </span>
            <h2 className="text-2xl font-bold font-heading uppercase text-white">{t('mostFrequent')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mostFrequent.map((r, idx) => (
              <div key={idx} className="glass-card p-5 relative overflow-hidden flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center w-2/5">
                    <span className="font-heading font-bold uppercase text-zinc-200 truncate w-full text-center text-sm">{r.managerA.displayName}</span>
                    <span className={`text-2xl font-bold mt-1 font-mono ${r.winsA > r.winsB ? 'text-emerald-200' : r.winsA < r.winsB ? 'text-rose-200' : 'text-zinc-300'}`}>{r.winsA}</span>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">{t('games')}</span>
                    <span className="font-bold text-base text-indigo-200 font-mono">{r.totalMatches}</span>
                  </div>
                  <div className="flex flex-col items-center w-2/5">
                    <span className="font-heading font-bold uppercase text-zinc-200 truncate w-full text-center text-sm">{r.managerB.displayName}</span>
                    <span className={`text-2xl font-bold mt-1 font-mono ${r.winsB > r.winsA ? 'text-emerald-200' : r.winsB < r.winsA ? 'text-rose-200' : 'text-zinc-300'}`}>{r.winsB}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#111318] rounded-full overflow-hidden flex">
                  <div className="bg-emerald-200 h-full" style={{ width: `${r.totalMatches > 0 ? (r.winsA / r.totalMatches) * 100 : 50}%` }} />
                  <div className="bg-indigo-200 h-full" style={{ width: `${r.totalMatches > 0 ? (r.winsB / r.totalMatches) * 100 : 50}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kryptonite Sweeps */}
      {sweeps.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-200/15 text-rose-200 border border-rose-200/30 font-mono text-xs font-bold">
              03
            </span>
            <h2 className="text-2xl font-bold font-heading uppercase text-white">{t('kryptonite')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sweeps.map((rivalry, idx) => {
              const dominator = rivalry.winsA > rivalry.winsB ? rivalry.managerA : rivalry.managerB;
              const victim = rivalry.winsA > rivalry.winsB ? rivalry.managerB : rivalry.managerA;
              const domWins = Math.max(rivalry.winsA, rivalry.winsB);
              
              return (
                <div key={idx} className="glass-card p-6 border-rose-200/20 relative overflow-hidden flex items-center justify-between">
                  <div className="flex flex-col items-center flex-1">
                    {dominator.avatarUrl ? (
                      <Image src={dominator.avatarUrl} alt={dominator.displayName} width={60} height={60} className="rounded-xl border border-emerald-200/60 mb-2" />
                    ) : (
                      <div className="w-15 h-15 rounded-xl bg-[#111318] border border-emerald-200/60 flex items-center justify-center mb-2">
                        <span className="font-bold text-emerald-200">{dominator.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="font-heading font-bold uppercase text-emerald-200 text-sm sm:text-base">{dominator.displayName}</span>
                    <span className="text-3xl font-bold font-mono text-white mt-0.5">{domWins}</span>
                  </div>

                  <div className="px-4 flex flex-col items-center">
                    <span className="text-[10px] font-mono font-bold text-rose-200 bg-rose-200/10 border border-rose-200/25 px-2.5 py-0.5 rounded uppercase tracking-wider mb-1.5">
                      {t('owns')}
                    </span>
                    <Swords className="w-5 h-5 text-zinc-600" />
                  </div>

                  <div className="flex flex-col items-center flex-1 opacity-65">
                    {victim.avatarUrl ? (
                      <Image src={victim.avatarUrl} alt={victim.displayName} width={60} height={60} className="rounded-xl border border-rose-200/40 mb-2 grayscale" />
                    ) : (
                      <div className="w-15 h-15 rounded-xl bg-[#111318] border border-rose-200/40 flex items-center justify-center mb-2 grayscale">
                        <span className="font-bold">{victim.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="font-heading font-bold uppercase text-zinc-300 text-sm sm:text-base">{victim.displayName}</span>
                    <span className="text-3xl font-bold font-mono text-zinc-500 mt-0.5">0</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* All Head-to-Head Records */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
          <span className="px-2.5 py-0.5 rounded-md bg-amber-200/15 text-amber-200 border border-amber-200/30 font-mono text-xs font-bold">
            04
          </span>
          <h2 className="text-2xl font-bold font-heading uppercase text-white">{t('allHeadToHead')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {managers.map(manager => {
            const theirRivalries = rivalries
              .filter(r => r.managerA.userId === manager.userId || r.managerB.userId === manager.userId)
              .map(r => {
                const isA = r.managerA.userId === manager.userId;
                return {
                  opponent: isA ? r.managerB : r.managerA,
                  wins: isA ? r.winsA : r.winsB,
                  losses: isA ? r.winsB : r.winsA,
                  totalMatches: r.totalMatches
                };
              })
              .sort((a, b) => b.totalMatches - a.totalMatches);

            const totalWins = theirRivalries.reduce((acc, curr) => acc + curr.wins, 0);
            const totalLosses = theirRivalries.reduce((acc, curr) => acc + curr.losses, 0);
            const winRate = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0;

            return (
              <div key={manager.userId} className="glass-card flex flex-col overflow-hidden relative">
                <div className="p-4 bg-[#111318] border-b border-dashed border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {manager.avatarUrl ? (
                      <Image src={manager.avatarUrl} alt={manager.displayName} width={40} height={40} className="rounded-lg border border-white/15 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#171a21] border border-white/15 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs text-sky-200">{manager.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold font-heading uppercase text-base text-white truncate">{manager.displayName}</h3>
                      <p className="text-xs text-zinc-400 font-mono">{totalWins}-{totalLosses}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    winRate >= 50
                      ? 'bg-emerald-200/10 text-emerald-200 border-emerald-200/25'
                      : 'bg-rose-200/10 text-rose-200 border-rose-200/25'
                  }`}>
                    {winRate.toFixed(0)}%
                  </span>
                </div>
                <div className="p-4 flex-1">
                  <div className="space-y-2.5">
                    {theirRivalries.map(r => {
                      const isWinning = r.wins > r.losses;
                      const isLosing = r.wins < r.losses;

                      return (
                        <div key={r.opponent.userId} className="flex items-center justify-between group py-0.5">
                          <div className="flex items-center gap-2 overflow-hidden pr-2">
                            {r.opponent.avatarUrl ? (
                              <Image src={r.opponent.avatarUrl} alt={r.opponent.displayName} width={24} height={24} className="rounded-full border border-white/15 shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#111318] flex items-center justify-center shrink-0">
                                <span className="font-bold text-[10px]">{r.opponent.displayName.charAt(0)}</span>
                              </div>
                            )}
                            <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors truncate">
                              {r.opponent.displayName}
                            </span>
                          </div>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                            isWinning
                              ? 'bg-emerald-200/15 text-emerald-200'
                              : isLosing
                              ? 'bg-rose-200/15 text-rose-200'
                              : 'bg-[#111318] text-zinc-400'
                          }`}>
                            {r.wins}-{r.losses}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
