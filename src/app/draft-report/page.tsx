import { getDraftReport } from '@/lib/sleeper-api';
import { Search, TrendingUp, TrendingDown, ArrowRight, Award, Frown, Compass, UserPlus, History } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 3600;

export default async function DraftReportPage() {
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID;
  if (!leagueId) {
    return <div className="text-red-500">Error: NEXT_PUBLIC_SLEEPER_LEAGUE_ID is not set.</div>;
  }

  const { steal, bust, managerGrades, biggestRegret, positionalReach, waiverHero, redraftBoard } = await getDraftReport(leagueId);

  return (
    <div className="space-y-16 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
          <Search className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-gradient">The Hindsight Report</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Hindsight is 20/20. We analyzed every pick, calculated the value over expectation, and exposed every single draft mistake made in your league this season.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-slate-800 px-4 py-2 rounded-full mt-4">
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </Link>
      </div>

      {/* 1. Manager Draft Grades */}
      {managerGrades.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-2">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Manager Draft Grades</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-900/80 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-300">Rank</th>
                    <th className="px-6 py-4 font-bold text-slate-300">Manager</th>
                    <th className="px-6 py-4 font-bold text-slate-300 text-right">Drafted Pts</th>
                    <th className="px-6 py-4 font-bold text-slate-300 text-right">Expected</th>
                    <th className="px-6 py-4 font-bold text-slate-300 text-right">Value (VOE)</th>
                    <th className="px-6 py-4 font-bold text-slate-300 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {managerGrades.map((m, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono font-bold">#{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {m.avatarUrl ? (
                            <Image src={m.avatarUrl} alt={m.managerName} width={28} height={28} className="rounded-full border border-slate-600" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                              <span className="text-[10px] font-bold">{m.managerName.substring(0,2).toUpperCase()}</span>
                            </div>
                          )}
                          <span className="font-bold text-white">{m.managerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300 font-mono">{m.totalPoints.toFixed(1)}</td>
                      <td className="px-6 py-4 text-right text-slate-500 font-mono">{m.expectedPoints.toFixed(1)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono font-bold px-2 py-1 rounded ${m.valueOverExpected > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {m.valueOverExpected > 0 ? '+' : ''}{m.valueOverExpected.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black text-xl ${m.grade.startsWith('A') ? 'text-emerald-400' : m.grade.startsWith('B') ? 'text-blue-400' : m.grade.startsWith('C') ? 'text-yellow-400' : m.grade.startsWith('D') ? 'text-orange-400' : 'text-rose-500'}`}>
                          {m.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Regret and Reach Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. The Biggest Regret */}
        {biggestRegret && (
          <section className="glass-card p-6 border-rose-500/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
            <div className="flex items-center gap-3 mb-6">
              <Frown className="w-6 h-6 text-rose-400" />
              <h2 className="text-xl font-bold text-rose-400">The Biggest Regret</h2>
            </div>
            
            <p className="text-sm text-slate-300 mb-6">
              <span className="font-bold text-white">{biggestRegret.managerName}</span> passed on a superstar for a total bust, costing them <span className="font-bold text-rose-400 font-mono">{biggestRegret.pointDiff.toFixed(1)}</span> points.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex-1 w-full text-center p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
                <span className="text-[10px] uppercase text-rose-400 font-bold block mb-1">Drafted (Pick {biggestRegret.draftedPlayer.pickNo})</span>
                <span className="font-bold text-white block truncate">{biggestRegret.draftedPlayer.playerName}</span>
                <span className="text-rose-400 font-mono font-bold mt-1 block">{biggestRegret.draftedPlayer.totalPoints.toFixed(1)} pts</span>
              </div>
              <div className="shrink-0 text-slate-500 font-bold px-2 flex flex-col items-center">
                <span>VS</span>
                <ArrowRight className="w-4 h-4 mt-1" />
              </div>
              <div className="flex-1 w-full text-center p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-1">Passed (Pick {biggestRegret.passedPlayer.pickNo})</span>
                <span className="font-bold text-white block truncate">{biggestRegret.passedPlayer.playerName}</span>
                <span className="text-emerald-400 font-mono font-bold mt-1 block">{biggestRegret.passedPlayer.totalPoints.toFixed(1)} pts</span>
              </div>
            </div>
          </section>
        )}

        {/* 3. Positional Reach */}
        {positionalReach && (
          <section className="glass-card p-6 border-orange-500/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
            <div className="flex items-center gap-3 mb-6">
              <Compass className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-bold text-orange-400">The Positional Reach</h2>
            </div>
            
            <p className="text-sm text-slate-300 mb-6">
              <span className="font-bold text-white">{positionalReach.managerName}</span> reached for a {positionalReach.reachPlayer.position} too early, passing on an elite skill player.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex-1 w-full text-center p-3 rounded-lg border border-orange-500/30 bg-orange-500/5">
                <span className="text-[10px] uppercase text-orange-400 font-bold block mb-1">Reached (Pick {positionalReach.reachPlayer.pickNo})</span>
                <span className="font-bold text-white block truncate">{positionalReach.reachPlayer.playerName}</span>
                <span className="text-orange-400 font-mono font-bold mt-1 block">{positionalReach.reachPlayer.totalPoints.toFixed(1)} pts</span>
              </div>
              <div className="shrink-0 text-slate-500 font-bold px-2 flex flex-col items-center">
                <span>VS</span>
                <ArrowRight className="w-4 h-4 mt-1" />
              </div>
              <div className="flex-1 w-full text-center p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-1">Passed (Pick {positionalReach.passedPlayer.pickNo})</span>
                <span className="font-bold text-white block truncate">{positionalReach.passedPlayer.playerName}</span>
                <span className="text-emerald-400 font-mono font-bold mt-1 block">{positionalReach.passedPlayer.totalPoints.toFixed(1)} pts</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 4. Waiver Hero */}
      {waiverHero && (
        <section>
          <div className="glass-card p-1 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-gradient-to-br from-purple-500/20 via-slate-900 to-indigo-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
            <div className="bg-slate-950 p-8 rounded-xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <UserPlus className="w-8 h-8 text-purple-400" />
                  <h2 className="text-2xl font-bold font-heading text-purple-400 tracking-wide uppercase">The Waiver Hero</h2>
                </div>
                <p className="text-slate-300 text-lg">
                  <span className="font-bold text-white">{waiverHero.managerName}'s</span> highest scoring player wasn't even drafted by them! They saved their season by acquiring this absolute unit.
                </p>
              </div>

              <div className="flex-1 flex justify-center md:justify-end w-full">
                <div className="bg-slate-900/80 p-6 rounded-2xl border border-purple-500/30 text-center w-full max-w-sm shadow-2xl relative">
                   <div className="absolute -top-3 -right-3 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                     Undrafted Gem
                   </div>
                   <p className="text-sm text-purple-400 font-bold mb-1">{waiverHero.team} • {waiverHero.position}</p>
                   <h3 className="text-3xl font-black text-white mb-2">{waiverHero.playerName}</h3>
                   <div className="bg-purple-500/20 text-purple-300 font-mono font-bold text-2xl py-2 rounded-lg mt-4 border border-purple-500/30">
                     {waiverHero.totalPoints.toFixed(1)} PTS
                   </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Original Steal and Bust */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* The Steal */}
        <div className="glass-card p-8 border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-400">The Steal of the Draft</h2>
              <p className="text-sm text-slate-400">Massive production for zero draft capital.</p>
            </div>
          </div>

          {steal ? (
            <div className="space-y-6">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                <p className="text-sm text-emerald-400 font-bold mb-1">{steal.team} • {steal.position}</p>
                <h3 className="text-3xl font-black text-white mb-2 truncate">{steal.playerName}</h3>
                <div className="flex items-center justify-between mt-4 text-sm border-t border-slate-700/50 pt-4">
                  <div className="text-slate-400">
                    Drafted: <span className="text-white font-bold">Round {steal.round}</span> (Pick {steal.pickNo})
                  </div>
                  <div className="text-slate-400">
                    Points: <span className="text-emerald-400 font-bold font-mono text-lg">{steal.totalPoints.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Not enough data to determine a steal yet.</p>
          )}
        </div>

        {/* The Bust */}
        <div className="glass-card p-8 border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-orange-500"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-rose-400">The Biggest Bust</h2>
              <p className="text-sm text-slate-400">Premium draft capital entirely wasted.</p>
            </div>
          </div>

          {bust ? (
            <div className="space-y-6">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                <p className="text-sm text-rose-400 font-bold mb-1">{bust.team} • {bust.position}</p>
                <h3 className="text-3xl font-black text-white mb-2 truncate">{bust.playerName}</h3>
                <div className="flex items-center justify-between mt-4 text-sm border-t border-slate-700/50 pt-4">
                  <div className="text-slate-400">
                    Drafted: <span className="text-white font-bold">Round {bust.round}</span> (Pick {bust.pickNo})
                  </div>
                  <div className="text-slate-400">
                    Points: <span className="text-rose-400 font-bold font-mono text-lg">{bust.totalPoints.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Not enough data to determine a bust yet.</p>
          )}
        </div>
      </div>

      {/* 5. The Hindsight First Round */}
      {redraftBoard.length > 0 && (
        <section>
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8 mt-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <History className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold font-heading text-white">The Redraft Board</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              If the draft happened today, knowing what we know now, here is what the First Round should have looked like.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {redraftBoard.map((pick) => {
              const diff = pick.actualPickNo - pick.shouldHaveGone;
              return (
                <div key={pick.shouldHaveGone} className="glass-card p-4 border border-slate-700/50 flex flex-col relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-3">
                    <span className="text-sm font-bold text-slate-400">Pick 1.{pick.shouldHaveGone}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Actually: #{pick.actualPickNo}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-white text-lg truncate mb-1">{pick.playerName}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-400">{pick.team} • {pick.position}</span>
                    <span className="font-mono font-bold text-cyan-400">{pick.totalPoints.toFixed(1)}</span>
                  </div>

                  {/* Visual Rise indicator */}
                  {diff > 0 && (
                    <div className="absolute bottom-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <TrendingUp className="w-12 h-12 text-emerald-500" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

    </div>
  );
}
