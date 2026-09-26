import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getAllTimeMatchups } from '@/lib/sleeper-api';
import { getRivalries } from '@/lib/stats-engine';
import { Swords, Skull, Trophy, History } from 'lucide-react';
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

  console.log('El Clasico:', elClasico);
  // Most Frequent Matchups
  const mostFrequent = [...rivalries].sort((a, b) => b.totalMatches - a.totalMatches).slice(0, 4);

  // Kryptonite: rivalries where one side has a massive lead (e.g. 2-0, 3-0, 3-1)
  // Since this is all time, a sweep could be 6-0. Let's say a sweep is 100% win rate with at least 3 matches, OR just any flawless record with >= 2 matches.
  const sweeps = rivalries.filter(r => (r.winsA >= 2 && r.winsB === 0) || (r.winsB >= 2 && r.winsA === 0)).sort((a, b) => Math.max(b.winsA, b.winsB) - Math.max(a.winsA, a.winsB));

  // Determine first season
  const uniqueSeasons = Array.from(new Set(allTimeMatchups.map(m => m.season))).sort();
  const firstSeason = uniqueSeasons.length > 0 ? uniqueSeasons[0] : 'Unknown';

  // Get unique managers
  const uniqueManagers = new Map<string, any>();
  rivalries.forEach(r => {
    uniqueManagers.set(r.managerA.userId, r.managerA);
    uniqueManagers.set(r.managerB.userId, r.managerB);
  });
  const managers = Array.from(uniqueManagers.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
          <Swords className="w-10 h-10 text-rose-400" />
        </div>
        <h1 className="text-4xl font-bold font-heading text-gradient">{t('title')}</h1>
        <div className="inline-flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
          <History className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-slate-300">{t('allTimeData')}{firstSeason}{t('allTimeDataEnd')}</span>
        </div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      {elClasico && (
        <section>
          <div className="glass-card p-1 border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.2)] bg-gradient-to-br from-yellow-500/20 via-slate-900 to-rose-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
            <div className="bg-slate-950 p-8 rounded-xl relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-500"></div>
                <h2 className="text-xl font-bold font-heading text-yellow-500 tracking-widest uppercase">{t('elClasico')}</h2>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500"></div>
              </div>
              
              <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
                {/* Manager A */}
                <div className="flex flex-col items-center flex-1">
                  {elClasico.managerA.avatarUrl ? (
                    <Image src={elClasico.managerA.avatarUrl} alt={elClasico.managerA.displayName} width={96} height={96} className="rounded-full border-4 border-yellow-500/50 shadow-2xl mb-4" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-yellow-500/50 flex items-center justify-center mb-4 shadow-2xl">
                      <span className="font-bold text-xl">{elClasico.managerA.displayName.substring(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="text-2xl font-bold text-white">{elClasico.managerA.displayName}</span>
                  <span className="text-5xl font-black text-yellow-500 mt-2 font-mono">{elClasico.winsA}</span>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center px-8">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{t('totalMatches')}</span>
                  <span className="text-3xl font-black text-slate-300 font-mono mb-2">{elClasico.totalMatches}</span>
                  <Swords className="w-12 h-12 text-slate-700" />
                </div>

                {/* Manager B */}
                <div className="flex flex-col items-center flex-1">
                  {elClasico.managerB.avatarUrl ? (
                    <Image src={elClasico.managerB.avatarUrl} alt={elClasico.managerB.displayName} width={96} height={96} className="rounded-full border-4 border-yellow-500/50 shadow-2xl mb-4" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-yellow-500/50 flex items-center justify-center mb-4 shadow-2xl">
                      <span className="font-bold text-xl">{elClasico.managerB.displayName.substring(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="text-2xl font-bold text-white">{elClasico.managerB.displayName}</span>
                  <span className="text-5xl font-black text-yellow-500 mt-2 font-mono">{elClasico.winsB}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {mostFrequent.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-2">
            <History className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">{t('mostFrequent')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mostFrequent.map((r, idx) => (
              <div key={idx} className="glass-card p-4 flex items-center justify-between border-slate-700/50">
                <div className="flex flex-col items-center w-1/3">
                  <span className="font-bold text-slate-300 truncate w-full text-center text-sm">{r.managerA.displayName}</span>
                  <span className={`text-xl font-black mt-1 font-mono ${r.winsA > r.winsB ? 'text-emerald-400' : r.winsA < r.winsB ? 'text-rose-400' : 'text-slate-400'}`}>{r.winsA}</span>
                </div>
                <div className="flex flex-col items-center w-1/3 border-x border-slate-800/50 px-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{t('games')}</span>
                  <span className="font-bold text-lg text-white font-mono">{r.totalMatches}</span>
                </div>
                <div className="flex flex-col items-center w-1/3">
                  <span className="font-bold text-slate-300 truncate w-full text-center text-sm">{r.managerB.displayName}</span>
                  <span className={`text-xl font-black mt-1 font-mono ${r.winsB > r.winsA ? 'text-emerald-400' : r.winsB < r.winsA ? 'text-rose-400' : 'text-slate-400'}`}>{r.winsB}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sweeps.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-2">
            <Skull className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-bold text-white">{t('kryptonite')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sweeps.map((rivalry, idx) => {
              const dominator = rivalry.winsA > rivalry.winsB ? rivalry.managerA : rivalry.managerB;
              const victim = rivalry.winsA > rivalry.winsB ? rivalry.managerB : rivalry.managerA;
              const domWins = Math.max(rivalry.winsA, rivalry.winsB);
              
              return (
                <div key={idx} className="glass-card p-6 border-rose-500/20 relative overflow-hidden flex items-center justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                  
                  <div className="flex flex-col items-center flex-1">
                    {dominator.avatarUrl ? (
                      <Image src={dominator.avatarUrl} alt={dominator.displayName} width={64} height={64} className="rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] mb-2" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <span className="font-bold">{dominator.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="font-bold text-emerald-400">{dominator.displayName}</span>
                    <span className="text-2xl font-black text-white mt-1">{domWins}</span>
                  </div>

                  <div className="px-6 flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('owns')}</span>
                    <Swords className="w-6 h-6 text-rose-500" />
                  </div>

                  <div className="flex flex-col items-center flex-1 opacity-60">
                    {victim.avatarUrl ? (
                      <Image src={victim.avatarUrl} alt={victim.displayName} width={64} height={64} className="rounded-full border-2 border-rose-500/50 mb-2 grayscale" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-rose-500/50 flex items-center justify-center mb-2 grayscale">
                        <span className="font-bold">{victim.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="font-bold text-slate-300">{victim.displayName}</span>
                    <span className="text-2xl font-black text-slate-500 mt-1">0</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">{t('allHeadToHead')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div key={manager.userId} className="glass-card flex flex-col overflow-hidden border border-slate-700/50 hover:border-slate-500 transition-colors">
                <div className="p-4 bg-slate-900/80 border-b border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {manager.avatarUrl ? (
                      <Image src={manager.avatarUrl} alt={manager.displayName} width={40} height={40} className="rounded-full border border-slate-600" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                        <span className="font-bold text-xs">{manager.displayName.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-white leading-tight truncate max-w-[120px]">{manager.displayName}</h3>
                      <p className="text-xs text-slate-400 font-mono">{totalWins}-{totalLosses} ({winRate.toFixed(1)}%)</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <div className="space-y-3">
                    {theirRivalries.map(r => {
                      const isWinning = r.wins > r.losses;
                      const isLosing = r.wins < r.losses;

                      return (
                        <div key={r.opponent.userId} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {r.opponent.avatarUrl ? (
                              <Image src={r.opponent.avatarUrl} alt={r.opponent.displayName} width={24} height={24} className="rounded-full grayscale group-hover:grayscale-0 transition-all shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                <span className="font-bold text-[10px]">{r.opponent.displayName.charAt(0)}</span>
                              </div>
                            )}
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">{r.opponent.displayName}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${isWinning ? 'bg-emerald-500/20 text-emerald-400' : isLosing ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'}`}>
                              {r.wins} - {r.losses}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  );
}


export const runtime = 'edge';



export const dynamic = 'force-dynamic';

