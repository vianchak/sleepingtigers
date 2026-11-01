import { getLeagueData } from '@/lib/sleeper-api';
import { calculateBadges, calculateAllPlayRecord, calculatePowerRankings } from '@/lib/stats-engine';
import { Award, Zap, HeartPulse, ShieldAlert, Skull, Wrench, Medal, Backpack, RefreshCw, Trash2, AlertTriangle, TrendingUp, Crown, Activity, Flame } from 'lucide-react';
import Image from 'next/image';
import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import ManagerDossierModal from '@/components/ManagerDossierModal';
import { getSiteConfig } from '@/lib/site-config';
import LeagueNotConfigured from '@/components/LeagueNotConfigured';

export default async function DashboardHome({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = getScopedTranslator(locale, "Home");
  const config = await getSiteConfig();
  const leagueId = config.leagueId;
  if (!leagueId) {
    return <LeagueNotConfigured locale={locale} />;
  }

  let teams;
  try {
    teams = await getLeagueData(leagueId);
  } catch(e: any) {
    return <LeagueNotConfigured locale={locale} error={`API Error: ${e.message}`} />;
  }
  if (!teams || teams.length === 0) {
    return <div className="text-yellow-400">Loading league data...</div>;
  }

  // Current Leader by wins, then points
  const sortedTeams = [...teams].sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);
  const leader = sortedTeams[0];
  const topScorer = [...teams].sort((a, b) => b.fpts - a.fpts)[0];

  const badges = calculateBadges(teams, locale);
  const allPlay = calculateAllPlayRecord(teams);
  const powerRankings = calculatePowerRankings(teams);
  const allPlayLeader = allPlay[0];

  // Parasha (Bottom teams by All-Play)
  const parashaResident = allPlay.length > 0 ? allPlay[allPlay.length - 1] : null;
  const parashaCandidates = allPlay.length > 3 ? allPlay.slice(allPlay.length - 4, allPlay.length - 1).reverse() : [];

  const badgeCards = [
    {
      key: 'benchWhisperer',
      title: t('benchWhisperer'),
      desc: t('benchWhispererDesc'),
      data: badges.benchWhisperer,
      icon: Zap,
      accentBar: 'from-blue-500 to-cyan-400',
      iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      textColor: 'text-blue-300',
    },
    {
      key: 'cardiacKid',
      title: t('cardiacKid'),
      desc: t('cardiacKidDesc'),
      data: badges.cardiacKid,
      icon: HeartPulse,
      accentBar: 'from-rose-500 to-pink-500',
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      textColor: 'text-rose-300',
    },
    {
      key: 'glassCannon',
      title: t('glassCannon'),
      desc: t('glassCannonDesc'),
      data: badges.glassCannon,
      icon: ShieldAlert,
      accentBar: 'from-amber-500 to-yellow-400',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      textColor: 'text-amber-300',
    },
    {
      key: 'unlucky',
      title: t('unlucky'),
      desc: t('unluckyDesc'),
      data: badges.unlucky,
      icon: Skull,
      accentBar: 'from-purple-500 to-indigo-500',
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      textColor: 'text-purple-300',
      extraStat: badges.unlucky ? `${badges.unlucky.team.fptsAgainst.toFixed(1)} ${locale === 'uk' ? 'Проп.' : 'PA'}` : undefined,
    },
    {
      key: 'tinkerer',
      title: t('tinkerer'),
      desc: t('tinkererDesc'),
      data: badges.tinkerer,
      icon: Wrench,
      accentBar: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      textColor: 'text-indigo-300',
    },
    {
      key: 'participationTrophy',
      title: t('participationTrophy'),
      desc: t('participationTrophyDesc'),
      data: badges.participationTrophy,
      icon: Medal,
      accentBar: 'from-emerald-500 to-green-400',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      textColor: 'text-emerald-300',
    },
    {
      key: 'backpack',
      title: t('backpack'),
      desc: t('backpackDesc'),
      data: badges.backpack,
      icon: Backpack,
      accentBar: 'from-orange-500 to-amber-400',
      iconBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      textColor: 'text-orange-300',
      extraStat: badges.backpack ? `${(badges.backpack.team.maxPlayerPercentage * 100).toFixed(1)}% ${locale === 'uk' ? 'очок' : 'of pts'}` : undefined,
    },
    {
      key: 'bestBallChampion',
      title: t('bestBallChamp'),
      desc: t('bestBallChampDesc'),
      data: badges.bestBallChampion,
      icon: Crown,
      accentBar: 'from-yellow-400 to-amber-500',
      iconBg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      textColor: 'text-yellow-300',
      extraStat: badges.bestBallChampion ? `${badges.bestBallChampion.team.ppts.toFixed(1)} ${locale === 'uk' ? 'Макс' : 'Max PF'}` : undefined,
    },
    {
      key: 'oneHitWonder',
      title: t('oneHitWonder'),
      desc: t('oneHitWonderDesc'),
      data: badges.oneHitWonder,
      icon: TrendingUp,
      accentBar: 'from-cyan-400 to-sky-500',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      textColor: 'text-cyan-300',
    },
    {
      key: 'churnAndBurn',
      title: t('churnAndBurn'),
      desc: t('churnAndBurnDesc'),
      data: badges.churnAndBurn,
      icon: RefreshCw,
      accentBar: 'from-teal-400 to-emerald-500',
      iconBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      textColor: 'text-teal-300',
      extraStat: badges.churnAndBurn ? `${badges.churnAndBurn.team.totalMoves} ${locale === 'uk' ? 'ходів' : 'moves'}` : undefined,
    },
    {
      key: 'hyroxMoment',
      title: t('hyroxMoment'),
      desc: t('hyroxMomentDesc'),
      data: badges.hyroxMoment,
      icon: null,
      emoji: '💩',
      accentBar: 'from-pink-500 to-rose-500',
      iconBg: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
      textColor: 'text-pink-300',
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">

      {/* Broadcast Command Center Hero */}
      <section className="glass-panel p-6 sm:p-8 relative overflow-hidden border border-emerald-500/20">
        <div className="absolute -top-12 -right-12 p-8 opacity-[0.04] pointer-events-none">
          <Award className="w-72 h-72" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left: Current #1 Seed Spotlight */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            <div className="relative shrink-0">
              {leader.avatarUrl ? (
                <Image
                  src={leader.avatarUrl}
                  alt={leader.displayName}
                  width={88}
                  height={88}
                  className="rounded-2xl border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)]"
                />
              ) : (
                <div className="w-22 h-22 bg-slate-800 rounded-2xl border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                  <span className="text-2xl font-bold font-heading">{leader.displayName.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
              <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                <Crown className="w-4 h-4 stroke-[2.5]" />
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
                <Crown className="w-3 h-3" />
                <span>{t('currentLeader')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
                {leader.displayName}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-sm font-mono font-bold text-emerald-300">
                  {t('record')}: {leader.wins}-{leader.losses}{leader.ties > 0 ? `-${leader.ties}` : ''}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-sm font-mono font-bold text-cyan-300">
                  {leader.fpts.toFixed(1)} {t('pf')}
                </span>
              </div>
            </div>
          </div>

          {/* Right: 3 League Pulse Stat Pods */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-5 lg:pt-0 lg:pl-6">
            {topScorer && (
              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                  <Flame className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('pf')} #1</span>
                </div>
                <p className="font-bold text-white text-sm truncate">{topScorer.displayName}</p>
                <p className="font-mono text-xs text-slate-400 mt-0.5">{topScorer.fpts.toFixed(1)} {t('pf')}</p>
              </div>
            )}

            {allPlayLeader && (
              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{locale === 'uk' ? 'Всі-З-Усіма #1' : 'All-Play #1'}</span>
                </div>
                <p className="font-bold text-white text-sm truncate">{allPlayLeader.team.displayName}</p>
                <p className="font-mono text-xs text-slate-400 mt-0.5">
                  {allPlayLeader.wins}-{allPlayLeader.losses} ({(allPlayLeader.winPercentage * 100).toFixed(0)}%)
                </p>
              </div>
            )}

            {parashaResident && (
              <div className="bg-rose-950/25 border border-rose-500/20 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('parasha')}</span>
                </div>
                <p className="font-bold text-white text-sm truncate">{parashaResident.team.displayName}</p>
                <p className="font-mono text-xs text-rose-300/80 mt-0.5">
                  {(parashaResident.winPercentage * 100).toFixed(0)}% {t('wr')}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Collectible Dynamic Badges Grid */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-3">
          <Award className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-extrabold font-heading text-gradient">
            {t('dynamicBadges')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {badgeCards.map((b) => {
            const Icon = b.icon;
            const winner = b.data?.team;
            return (
              <div
                key={b.key}
                className="glass-card p-5 flex flex-col justify-between group relative overflow-hidden cursor-help"
              >
                {/* Top Colored Accent Bar */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${b.accentBar}`}></div>

                {/* Hover Tooltip with Exact Stat Reason */}
                {b.data?.reason && (
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-16 left-1/2 -translate-x-1/2 w-60 bg-slate-950/95 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 shadow-2xl z-30 transition-all duration-150 pointer-events-none text-center">
                    {b.data.reason}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${b.iconBg}`}>
                      {Icon ? <Icon className="w-5 h-5" /> : <span className="text-xl">{b.emoji}</span>}
                    </div>
                    {b.extraStat && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-900/90 border border-white/10 text-slate-300">
                        {b.extraStat}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold font-heading text-base text-white mb-1.5">{b.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-5">{b.desc}</p>
                </div>

                {/* Winner Pill Footer */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  {winner ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      {winner.avatarUrl ? (
                        <Image
                          src={winner.avatarUrl}
                          alt={winner.displayName}
                          width={26}
                          height={26}
                          className="rounded-full border border-slate-600 shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold">{winner.displayName.charAt(0)}</span>
                        </div>
                      )}
                      <span className={`font-bold text-sm truncate ${b.textColor}`}>
                        {winner.displayName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">N/A</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Official Power Rankings + Interactive Manager Dossier Modal */}
      <ManagerDossierModal
        powerRankings={powerRankings}
        allPlay={allPlay}
        badges={badges}
        teams={teams}
      />

      {/* Parasha Section */}
      <section className="mt-12">
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-800 pb-3">
          <Trash2 className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
            {t('parasha')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Current Resident (Absolute Worst) */}
          {parashaResident && (
            <div className="md:col-span-1 glass-card p-6 flex flex-col items-center text-center border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-orange-500"></div>
              <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mb-4 relative">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold font-heading text-xl mb-1 text-red-400">{t('resident')}</h3>
              <p className="text-xs text-slate-400 mb-5">{t('deadLast')}</p>

              {parashaResident.team.avatarUrl ? (
                <div className="w-14 h-14 rounded-full overflow-hidden mb-3 border-2 border-red-500/60 shadow-lg">
                  <Image src={parashaResident.team.avatarUrl} alt={parashaResident.team.displayName} width={56} height={56} />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3 border-2 border-red-500/60">
                  <span className="font-bold">{parashaResident.team.displayName.charAt(0)}</span>
                </div>
              )}

              <div className="mt-auto">
                <p className="font-bold text-white text-lg">{parashaResident.team.displayName}</p>
                <p className="text-sm font-mono font-bold text-red-400 mt-1">
                  {(parashaResident.winPercentage * 100).toFixed(1)}% {t('trueWinRate')}
                </p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{parashaResident.team.fpts.toFixed(1)} {t('pf')}</p>
              </div>
            </div>
          )}

          {/* Candidates */}
          <div className="md:col-span-3 glass-card p-6 border-orange-500/20">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold font-heading text-lg text-orange-400">{t('atRisk')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {parashaCandidates.map((candidate, idx) => (
                <div key={candidate.team.rosterId} className="bg-slate-900/60 rounded-xl p-4 flex flex-col items-center text-center border border-white/5 hover:border-orange-500/30 transition-colors">
                  <div className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 mb-3 font-mono font-bold text-xs">
                    #{allPlay.length - 1 - idx}
                  </div>
                  {candidate.team.avatarUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-2.5 border border-slate-600">
                      <Image src={candidate.team.avatarUrl} alt={candidate.team.displayName} width={48} height={48} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2.5 border border-slate-600">
                      <span className="text-xs font-bold">{candidate.team.displayName.charAt(0)}</span>
                    </div>
                  )}
                  <p className="font-bold text-slate-100 text-sm">{candidate.team.displayName}</p>
                  <p className="text-xs font-mono font-bold text-orange-300 mt-1">
                    {(candidate.winPercentage * 100).toFixed(1)}% {t('wr')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
