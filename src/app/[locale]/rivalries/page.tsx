import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getAllTimeMatchups } from '@/lib/sleeper-api';
import { getRivalries } from '@/lib/stats-engine';
import { Swords, Skull, Trophy, History, Flame } from 'lucide-react';
import Image from 'next/image';

export default async function RivalriesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, 'Rivalries');
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID;
  if (!leagueId) {
    return <div className="text-red-500">Error: NEXT_PUBLIC_SLEEPER_LEAGUE_ID is not set.</div>;
  }

  const allTimeMatchups = await getAllTimeMatchups(leagueId);
  const rivalries = getRivalries(allTimeMatchups);

  // El Clasico (Olegi vs Fantaser)
  const elClasico = rivalries.find(r => 
    (r.managerA.displayName.toLowerCase() === 'olegi' && r.managerB.displayName.toLowerCase() === 'fantaser') ||
    (r.managerB.displayName.toLowerCase() === 'olegi' && r.managerA.displayName.toLowerCase() === 'fantaser')
  );

  // Most Frequent Matchups
  const mostFrequent = [...rivalries].sort((a, b) => b.totalMatches - a.totalMatches).slice(0, 4);

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
      {/* Broadcast Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.25)]">
          <Swords className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gradient">{t('title')}</h1>
        <div className="inline-flex items-center gap-2 bg-slate-900/90 px-3.5 py-1 rounded-full border border-white/10">
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-slate-300">{t('allTimeData')}{firstSeason}{t('allTimeDataEnd')}</span>
        </div>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* El Clasico Main Event */}
      {elClasico && (
        <section>
          <div className="glass-panel p-6 sm:p-8 border border-yellow-500/35 shadow-[0_0_35px_rgba(234,179,8,0.12)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-rose-500"></div>

            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-500"></div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold font-heading text-yellow-400 bg-yellow-500/15 border border-yellow-500/30 tracking-widest uppercase">
                {t('elClasico')}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-6 max-w-3xl mx-auto">
              {/* Manager A */}
              <div className="flex flex-col items-center text-center">
                {elClasico.managerA.avatarUrl ? (
                  <Image src={elClasico.managerA.avatarUrl} alt={elClasico.managerA.displayName} width={88} height={88} className="rounded-2xl border-2 border-yellow-400 shadow-xl mb-3" />
                ) : (
                  <div className="w-22 h-22 rounded-2xl bg-slate-800 border-2 border-yellow-400 flex items-center justify-center mb-3 shadow-xl">
                    <span className="font-bold text-xl">{elClasico.managerA.displayName.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-xl font-bold font-heading text-white">{elClasico.managerA.displayName}</span>
                <span className="text-5xl font-black text-yellow-400 mt-1 font-mono">{elClasico.winsA}</span>
              </div>

              {/* Center Tug-of-War */}
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('totalMatches')}</span>
                <span className="text-3xl font-black text-white font-mono mb-3">{elClasico.totalMatches}</span>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex border border-white/10">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full"
                    style={{ width: `${elClasico.totalMatches > 0 ? (elClasico.winsA / elClasico.totalMatches) * 100 : 50}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-full"
                    style={{ width: `${elClasico.totalMatches > 0 ? (elClasico.winsB / elClasico.totalMatches) * 100 : 50}%` }}
                  />
                </div>
              </div>

              {/* Manager B */}
              <div className="flex flex-col items-center text-center">
                {elClasico.managerB.avatarUrl ? (
                  <Image src={elClasico.managerB.avatarUrl} alt={elClasico.managerB.displayName} width={88} height={88} className="rounded-2xl border-2 border-rose-400 shadow-xl mb-3" />
                ) : (
                  <div className="w-22 h-22 rounded-2xl bg-slate-800 border-2 border-rose-400 flex items-center justify-center mb-3 shadow-xl">
                    <span className="font-bold text-xl">{elClasico.managerB.displayName.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-xl font-bold font-heading text-white">{elClasico.managerB.displayName}</span>
                <span className="text-5xl font-black text-rose-400 mt-1 font-mono">{elClasico.winsB}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Most Frequent Matchups */}
      {mostFrequent.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-3">
            <Flame className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-extrabold font-heading text-white">{t('mostFrequent')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mostFrequent.map((r, idx) => (
              <div key={idx} className="glass-card p-5 relative overflow-hidden flex flex-col justify-between gap-3">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center w-2/5">
                    <span className="font-bold text-slate-200 truncate w-full text-center text-sm">{r.managerA.displayName}</span>
                    <span className={`text-2xl font-black mt-1 font-mono ${r.winsA > r.winsB ? 'text-emerald-400' : r.winsA < r.winsB ? 'text-rose-400' : 'text-slate-300'}`}>{r.winsA}</span>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('games')}</span>
                    <span className="font-bold text-base text-indigo-300 font-mono">{r.totalMatches}</span>
                  </div>
                  <div className="flex flex-col items-center w-2/5">
                    <span className="font-bold text-slate-200 truncate w-full text-center text-sm">{r.managerB.displayName}</span>
                    <span className={`text-2xl font-black mt-1 font-mono ${r.winsB > r.winsA ? 'text-emerald-400' : r.winsB < r.winsA ? 'text-rose-400' : 'text-slate-300'}`}>{r.winsB}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-400 h-full" style={{ width: `${r.totalMatches > 0 ? (r.winsA / r.totalMatches) * 100 : 50}%` }} />
                  <div className="bg-indigo-400 h-full" style={{ width: `${r.totalMatches > 0 ? (r.winsB / r.totalMatches) * 100 : 50}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kryptonite Sweeps */}
      {sweeps.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-3">
            <Skull className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-extrabold font-heading text-white">{t('kryptonite')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sweeps.map((rivalry, idx) => {
              const dominator = rivalry.winsA > rivalry.winsB ? rivalry.managerA : rivalry.managerB;
              const victim = rivalry.winsA > rivalry.winsB ? rivalry.managerB : rivalry.managerA;
              const domWins = Math.max(rivalry.winsA, rivalry.winsB);
              
              return (
                <div key={idx} className="glass-card p-6 border-rose-500/25 relative overflow-hidden flex items-center justify-between">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-rose-500"></div>
                  
                  <div className="flex flex-col items-center flex-1">
                    {dominator.avatarUrl ? (
                      <Image src={dominator.avatarUrl} alt={dominator.displayName} width={60} height={60} className="rounded-full border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] mb-2" />
                    ) : (
                      <div className="w-15 h-15 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center mb-2">
                        <span className="font-bold">{dominator.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="font-bold text-emerald-300 text-sm sm:text-base">{dominator.displayName}</span>
                    <span className="text-3xl font-black font-mono text-white mt-0.5">{domWins}</span>
                  </div>

                  <div className="px-4 flex flex-col items-center">
                    <span className="text-[10px] font-extrabold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
                      {t('owns')}
                    </span>
                    <Swords className="w-5 h-5 text-slate-600" />
                  </div>

                  <div className="flex flex-col items-center flex-1 opacity-65">
                    {victim.avatarUrl ? (
                      <Image src={victim.avatarUrl} alt={victim.displayName} width={60} height={60} className="rounded-full border-2 border-rose-500/40 mb-2 grayscale" />
                    ) : (
                      <div className="w-15 h-15 rounded-full bg-slate-800 border-2 border-rose-500/40 flex items-center justify-center mb-2 grayscale">
                        <span className="font-bold">{victim.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="font-bold text-slate-300 text-sm sm:text-base">{victim.displayName}</span>
                    <span className="text-3xl font-black font-mono text-slate-500 mt-0.5">0</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* All Head-to-Head Records */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-extrabold font-heading text-white">{t('allHeadToHead')}</h2>
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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {manager.avatarUrl ? (
                      <Image src={manager.avatarUrl} alt={manager.displayName} width={40} height={40} className="rounded-full border border-slate-600 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs">{manager.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold font-heading text-base text-white truncate">{manager.displayName}</h3>
                      <p className="text-xs text-slate-400 font-mono">{totalWins}-{totalLosses}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                    winRate >= 50
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
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
                              <Image src={r.opponent.avatarUrl} alt={r.opponent.displayName} width={24} height={24} className="rounded-full border border-slate-700 shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                <span className="font-bold text-[10px]">{r.opponent.displayName.charAt(0)}</span>
                              </div>
                            )}
                            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors truncate">
                              {r.opponent.displayName}
                            </span>
                          </div>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                            isWinning
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isLosing
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-800 text-slate-400'
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
