import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import { getDraftReport } from '@/lib/sleeper-api';
import { Search, TrendingUp, TrendingDown, ArrowRight, Award, Frown, Compass, UserPlus, History } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteConfig } from '@/lib/site-config';
import LeagueNotConfigured from '@/components/LeagueNotConfigured';

export default async function DraftReportPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, 'DraftReport');
  const { leagueId } = await getSiteConfig();
  if (!leagueId) {
    return <LeagueNotConfigured locale={locale} />;
  }

  const { steal, bust, managerGrades, biggestRegret, positionalReach, waiverHero, redraftBoard } = await getDraftReport(leagueId);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      
      {/* Pastel Ledger Header */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-200/15 border border-teal-200/35 text-teal-200 flex items-center justify-center shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-teal-200 mb-1">
              <span>SECTION 07 // DRAFT AUDIT & HINDSIGHT REPORT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading uppercase tracking-tight text-white">{t('title')}</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {t('description')}
            </p>
          </div>
        </div>
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors bg-[#111318] border border-white/10 px-3.5 py-2 rounded-lg shrink-0">
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          {t('back')}
        </Link>
      </div>

      {/* 1. Manager Draft Grades */}
      {managerGrades.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-200/15 text-teal-200 border border-teal-200/30 font-mono text-xs font-bold">
              01
            </span>
            <h2 className="text-2xl font-bold font-heading uppercase text-white">{t('managerDraftGrades')}</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] font-mono uppercase bg-[#111318] border-b border-white/10 text-zinc-400">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">{t('rank')}</th>
                    <th className="px-6 py-3.5 font-bold">{t('manager')}</th>
                    <th className="px-6 py-3.5 font-bold text-right">{t('draftedPts')}</th>
                    <th className="px-6 py-3.5 font-bold text-right">{t('expected')}</th>
                    <th className="px-6 py-3.5 font-bold text-right">{t('value')}</th>
                    <th className="px-6 py-3.5 font-bold text-center">{t('grade')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {managerGrades.map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-zinc-400 font-mono font-bold">#{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {m.avatarUrl ? (
                            <Image src={m.avatarUrl} alt={m.managerName} width={28} height={28} className="rounded-lg border border-white/15" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-[#111318] flex items-center justify-center border border-white/15">
                              <span className="text-[10px] font-bold text-teal-200">{m.managerName.substring(0,2).toUpperCase()}</span>
                            </div>
                          )}
                          <span className="font-heading font-bold uppercase text-white">{m.managerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-300 font-mono">{m.totalPoints.toFixed(1)}</td>
                      <td className="px-6 py-4 text-right text-zinc-500 font-mono">{m.expectedPoints.toFixed(1)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${m.valueOverExpected > 0 ? 'bg-emerald-200/15 text-emerald-200 border border-emerald-200/25' : 'bg-rose-200/15 text-rose-200 border border-rose-200/25'}`}>
                          {m.valueOverExpected > 0 ? '+' : ''}{m.valueOverExpected.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-mono font-bold text-lg px-2.5 py-0.5 rounded ${m.grade.startsWith('A') ? 'text-emerald-200 bg-emerald-200/10' : m.grade.startsWith('B') ? 'text-sky-200 bg-sky-200/10' : m.grade.startsWith('C') ? 'text-amber-200 bg-amber-200/10' : m.grade.startsWith('D') ? 'text-orange-200 bg-orange-200/10' : 'text-rose-200 bg-rose-200/10'}`}>
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
          <section className="glass-card p-6 border-rose-200/20 relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-white/10">
              <Frown className="w-5 h-5 text-rose-200" />
              <h2 className="text-lg font-bold font-heading uppercase text-rose-200">{t('biggestRegret')}</h2>
            </div>
            
            <p className="text-sm text-zinc-300 mb-6">
              <span className="font-bold text-white">{biggestRegret.managerName}</span>{t('passedOn')}<span className="font-bold text-rose-200 font-mono">{biggestRegret.pointDiff.toFixed(1)}</span>{t('pointsDot')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#111318] p-4 rounded-xl border border-white/10">
              <div className="flex-1 w-full text-center p-3 rounded-lg border border-rose-200/25 bg-rose-200/[0.06]">
                <span className="text-[10px] font-mono uppercase text-rose-200 font-bold block mb-1">{t('draftedPick')}{biggestRegret.draftedPlayer.pickNo})</span>
                <span className="font-bold text-white block truncate">{biggestRegret.draftedPlayer.playerName}</span>
                <span className="text-rose-200 font-mono font-bold mt-1 block">{biggestRegret.draftedPlayer.totalPoints.toFixed(1)} {t('pts')}</span>
              </div>
              <div className="shrink-0 text-zinc-500 font-mono font-bold px-2 flex flex-col items-center">
                <span>{t('vs')}</span>
                <ArrowRight className="w-4 h-4 mt-1" />
              </div>
              <div className="flex-1 w-full text-center p-3 rounded-lg border border-emerald-200/25 bg-emerald-200/[0.06]">
                <span className="text-[10px] font-mono uppercase text-emerald-200 font-bold block mb-1">{t('passedPick')}{biggestRegret.passedPlayer.pickNo})</span>
                <span className="font-bold text-white block truncate">{biggestRegret.passedPlayer.playerName}</span>
                <span className="text-emerald-200 font-mono font-bold mt-1 block">{biggestRegret.passedPlayer.totalPoints.toFixed(1)} {t('pts')}</span>
              </div>
            </div>
          </section>
        )}

        {/* 3. Positional Reach */}
        {positionalReach && (
          <section className="glass-card p-6 border-amber-200/20 relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-white/10">
              <Compass className="w-5 h-5 text-amber-200" />
              <h2 className="text-lg font-bold font-heading uppercase text-amber-200">{t('positionalReach')}</h2>
            </div>
            
            <p className="text-sm text-zinc-300 mb-6">
              <span className="font-bold text-white">{positionalReach.managerName}</span>{t('reachedFor')}{positionalReach.reachPlayer.position}{t('tooEarly')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#111318] p-4 rounded-xl border border-white/10">
              <div className="flex-1 w-full text-center p-3 rounded-lg border border-amber-200/25 bg-amber-200/[0.06]">
                <span className="text-[10px] font-mono uppercase text-amber-200 font-bold block mb-1">{t('reachedPick')}{positionalReach.reachPlayer.pickNo})</span>
                <span className="font-bold text-white block truncate">{positionalReach.reachPlayer.playerName}</span>
                <span className="text-amber-200 font-mono font-bold mt-1 block">{positionalReach.reachPlayer.totalPoints.toFixed(1)} {t('pts')}</span>
              </div>
              <div className="shrink-0 text-zinc-500 font-mono font-bold px-2 flex flex-col items-center">
                <span>{t('vs')}</span>
                <ArrowRight className="w-4 h-4 mt-1" />
              </div>
              <div className="flex-1 w-full text-center p-3 rounded-lg border border-emerald-200/25 bg-emerald-200/[0.06]">
                <span className="text-[10px] font-mono uppercase text-emerald-200 font-bold block mb-1">{t('passedPick')}{positionalReach.passedPlayer.pickNo})</span>
                <span className="font-bold text-white block truncate">{positionalReach.passedPlayer.playerName}</span>
                <span className="text-emerald-200 font-mono font-bold mt-1 block">{positionalReach.passedPlayer.totalPoints.toFixed(1)} {t('pts')}</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 4. Waiver Hero */}
      {waiverHero && (
        <section>
          <div className="glass-card p-6 sm:p-8 border-violet-200/25 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-200/15 border border-violet-200/30 flex items-center justify-center text-violet-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-violet-200 tracking-wide uppercase">{t('waiverHero')}</h2>
              </div>
              <p className="text-zinc-300 text-base">
                <span className="font-bold text-white">{waiverHero.managerName}</span>{t('highestScoring')}
              </p>
            </div>

            <div className="flex-1 flex justify-center md:justify-end w-full">
              <div className="bg-[#111318] p-6 rounded-xl border border-violet-200/30 text-center w-full max-w-sm relative">
                 <div className="absolute -top-3 -right-3 bg-violet-200 text-zinc-900 text-[10px] font-mono font-bold px-3 py-1 rounded-md uppercase tracking-widest shadow-md">
                   {t('undraftedGem')}
                 </div>
                 <p className="text-xs font-mono text-violet-200 font-bold mb-1">{waiverHero.team} • {waiverHero.position}</p>
                 <h3 className="text-2xl font-bold font-heading uppercase text-white mb-2">{waiverHero.playerName}</h3>
                 <div className="bg-violet-200/10 text-violet-200 font-mono font-bold text-xl py-2 rounded-lg mt-4 border border-violet-200/25">
                   {waiverHero.totalPoints.toFixed(1)} {t('ptsCaps')}
                 </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Original Steal and Bust */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* The Steal */}
        <div className="glass-card p-6 sm:p-8 border-emerald-200/25 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-emerald-200/15 border border-emerald-200/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading uppercase text-emerald-200">{t('stealOfDraft')}</h2>
              <p className="text-xs text-zinc-400">{t('stealDesc')}</p>
            </div>
          </div>

          {steal ? (
            <div className="bg-[#111318] rounded-xl p-5 border border-white/10">
              <p className="text-xs font-mono text-emerald-200 font-bold mb-1">{steal.team} • {steal.position}</p>
              <h3 className="text-2xl font-bold font-heading uppercase text-white mb-2 truncate">{steal.playerName}</h3>
              <div className="flex items-center justify-between mt-4 text-xs font-mono border-t border-dashed border-white/10 pt-3">
                <div className="text-zinc-400">
                  {t('drafted')}<span className="text-white font-bold">{t('round')}{steal.round}</span> (Pick {steal.pickNo})
                </div>
                <div className="text-zinc-400">
                  {t('points')}<span className="text-emerald-200 font-bold text-base">{steal.totalPoints.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400">{t('notEnoughSteal')}</p>
          )}
        </div>

        {/* The Bust */}
        <div className="glass-card p-6 sm:p-8 border-rose-200/25 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-rose-200/15 border border-rose-200/30 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading uppercase text-rose-200">{t('biggestBust')}</h2>
              <p className="text-xs text-zinc-400">{t('bustDesc')}</p>
            </div>
          </div>

          {bust ? (
            <div className="bg-[#111318] rounded-xl p-5 border border-white/10">
              <p className="text-xs font-mono text-rose-200 font-bold mb-1">{bust.team} • {bust.position}</p>
              <h3 className="text-2xl font-bold font-heading uppercase text-white mb-2 truncate">{bust.playerName}</h3>
              <div className="flex items-center justify-between mt-4 text-xs font-mono border-t border-dashed border-white/10 pt-3">
                <div className="text-zinc-400">
                  {t('drafted')}<span className="text-white font-bold">{t('round')}{bust.round}</span> (Pick {bust.pickNo})
                </div>
                <div className="text-zinc-400">
                  {t('points')}<span className="text-rose-200 font-bold text-base">{bust.totalPoints.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400">{t('notEnoughBust')}</p>
          )}
        </div>
      </div>

      {/* 5. The Hindsight First Round */}
      {redraftBoard.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-3 mb-6 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-200/15 text-sky-200 border border-sky-200/30 font-mono text-xs font-bold">
                05
              </span>
              <h2 className="text-2xl font-bold font-heading uppercase text-white">{t('redraftBoard')}</h2>
            </div>
            <p className="text-xs font-mono text-zinc-400 hidden sm:inline">
              {t('redraftDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {redraftBoard.map((pick) => {
              const diff = pick.actualPickNo - pick.shouldHaveGone;
              return (
                <div key={pick.shouldHaveGone} className="glass-card p-4 flex flex-col relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3 border-b border-dashed border-white/10 pb-2.5">
                    <span className="text-xs font-mono font-bold text-sky-200">{t('pick1')}{pick.shouldHaveGone}</span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#111318] text-zinc-300 border border-white/10">
                      {t('actually')}{pick.actualPickNo}
                    </span>
                  </div>
                  
                  <h3 className="font-bold font-heading uppercase text-white text-lg truncate mb-1">{pick.playerName}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-mono text-zinc-400">{pick.team} • {pick.position}</span>
                    <span className="font-mono font-bold text-emerald-200">{pick.totalPoints.toFixed(1)}</span>
                  </div>

                  {diff > 0 && (
                    <div className="absolute bottom-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <TrendingUp className="w-12 h-12 text-emerald-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
