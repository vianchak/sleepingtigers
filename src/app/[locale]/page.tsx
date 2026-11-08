import { getLeagueData } from '@/lib/sleeper-api';
import { calculateBadges, calculateAllPlayRecord, calculatePowerRankings } from '@/lib/stats-engine';
import { Award, Zap, HeartPulse, ShieldAlert, Skull, Wrench, Medal, Backpack, RefreshCw, Trash2, AlertTriangle, TrendingUp, Crown, Activity, Flame } from 'lucide-react';
import Image from 'next/image';
import { getScopedTranslator } from '@/lib/i18n/dictionaries';
import ManagerDossierModal from '@/components/ManagerDossierModal';
import { getSiteConfig } from '@/lib/site-config';
import LeagueNotConfigured from '@/components/LeagueNotConfigured';
import ReceiptCard from '@/components/ReceiptCard';

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
    return <div className="text-amber-200">Loading league data...</div>;
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
      code: 'EV-01',
      stamp: locale === 'uk' ? 'ЗЛОЧИН ЛАВКИ' : 'BENCH CRIME',
      title: t('benchWhisperer'),
      desc: t('benchWhispererDesc'),
      data: badges.benchWhisperer,
      icon: Zap,
      pastelIcon: 'bg-sky-200/10 text-sky-200 border-sky-200/25',
      pastelTag: 'text-sky-200 border-sky-200/30',
      extraStat: badges.benchWhisperer
        ? `${Math.max(0, badges.benchWhisperer.team.ppts - badges.benchWhisperer.team.fpts).toFixed(1)} ${locale === 'uk' ? 'На лавці' : 'Bench PTS'}`
        : undefined,
    },
    {
      key: 'cardiacKid',
      code: 'EV-02',
      stamp: locale === 'uk' ? 'ВАЛІДОЛ' : 'SWEAT EQUITY',
      title: t('cardiacKid'),
      desc: t('cardiacKidDesc'),
      data: badges.cardiacKid,
      icon: HeartPulse,
      pastelIcon: 'bg-rose-200/10 text-rose-200 border-rose-200/25',
      pastelTag: 'text-rose-200 border-rose-200/30',
    },
    {
      key: 'glassCannon',
      code: 'EV-03',
      stamp: locale === 'uk' ? 'СКЛЯНА ГАРМАТА' : 'HIGH VARIANCE',
      title: t('glassCannon'),
      desc: t('glassCannonDesc'),
      data: badges.glassCannon,
      icon: ShieldAlert,
      pastelIcon: 'bg-amber-200/10 text-amber-200 border-amber-200/25',
      pastelTag: 'text-amber-200 border-amber-200/30',
    },
    {
      key: 'unlucky',
      code: 'EV-04',
      stamp: locale === 'uk' ? 'ЖЕРТВА РОЗКЛАДУ' : 'SCHEDULE VICTIM',
      title: t('unlucky'),
      desc: t('unluckyDesc'),
      data: badges.unlucky,
      icon: Skull,
      pastelIcon: 'bg-violet-200/10 text-violet-200 border-violet-200/25',
      pastelTag: 'text-violet-200 border-violet-200/30',
      extraStat: badges.unlucky ? `${badges.unlucky.team.fptsAgainst.toFixed(1)} ${locale === 'uk' ? 'Проп.' : 'PA'}` : undefined,
    },
    {
      key: 'tinkerer',
      code: 'EV-05',
      stamp: locale === 'uk' ? 'САБОТАЖ' : 'SELF-SABOTAGE',
      title: t('tinkerer'),
      desc: t('tinkererDesc'),
      data: badges.tinkerer,
      icon: Wrench,
      pastelIcon: 'bg-indigo-200/10 text-indigo-200 border-indigo-200/25',
      pastelTag: 'text-indigo-200 border-indigo-200/30',
    },
    {
      key: 'participationTrophy',
      code: 'EV-06',
      stamp: locale === 'uk' ? 'ПАСАЖИР' : 'PASSENGER',
      title: t('participationTrophy'),
      desc: t('participationTrophyDesc'),
      data: badges.participationTrophy,
      icon: Medal,
      pastelIcon: 'bg-emerald-200/10 text-emerald-200 border-emerald-200/25',
      pastelTag: 'text-emerald-200 border-emerald-200/30',
    },
    {
      key: 'backpack',
      code: 'EV-07',
      stamp: locale === 'uk' ? 'ОДИН У ПОЛІ' : 'SOLO CARRY',
      title: t('backpack'),
      desc: t('backpackDesc'),
      data: badges.backpack,
      icon: Backpack,
      pastelIcon: 'bg-orange-200/10 text-orange-200 border-orange-200/25',
      pastelTag: 'text-orange-200 border-orange-200/30',
      extraStat: badges.backpack ? `${(badges.backpack.team.maxPlayerPercentage * 100).toFixed(1)}% ${locale === 'uk' ? 'очок' : 'of pts'}` : undefined,
    },
    {
      key: 'bestBallChampion',
      code: 'EV-08',
      stamp: locale === 'uk' ? 'МАКС ПОТЕНЦІАЛ' : 'MAX CEILING',
      title: t('bestBallChamp'),
      desc: t('bestBallChampDesc'),
      data: badges.bestBallChampion,
      icon: Crown,
      pastelIcon: 'bg-amber-200/10 text-amber-200 border-amber-200/25',
      pastelTag: 'text-amber-200 border-amber-200/30',
      extraStat: badges.bestBallChampion ? `${badges.bestBallChampion.team.ppts.toFixed(1)} ${locale === 'uk' ? 'Макс' : 'Max PF'}` : undefined,
    },
    {
      key: 'oneHitWonder',
      code: 'EV-09',
      stamp: locale === 'uk' ? 'СПАЛАХ' : 'PEAK WEEK',
      title: t('oneHitWonder'),
      desc: t('oneHitWonderDesc'),
      data: badges.oneHitWonder,
      icon: TrendingUp,
      pastelIcon: 'bg-teal-200/10 text-teal-200 border-teal-200/25',
      pastelTag: 'text-teal-200 border-teal-200/30',
    },
    {
      key: 'churnAndBurn',
      code: 'EV-10',
      stamp: locale === 'uk' ? 'ЛУДОМАН ВЕЙВЕРІВ' : 'WAIVER ADDICT',
      title: t('churnAndBurn'),
      desc: t('churnAndBurnDesc'),
      data: badges.churnAndBurn,
      icon: RefreshCw,
      pastelIcon: 'bg-emerald-200/10 text-emerald-200 border-emerald-200/25',
      pastelTag: 'text-emerald-200 border-emerald-200/30',
      extraStat: badges.churnAndBurn ? `${badges.churnAndBurn.team.totalMoves} ${locale === 'uk' ? 'ходів' : 'moves'}` : undefined,
    },
    {
      key: 'hyroxMoment',
      code: 'EV-11',
      stamp: locale === 'uk' ? 'ГАЙРОКС РОКУ' : 'HYROX MOMENT',
      title: t('hyroxMoment'),
      desc: t('hyroxMomentDesc'),
      data: badges.hyroxMoment,
      icon: null,
      emoji: '💩',
      pastelIcon: 'bg-pink-200/10 text-pink-200 border-pink-200/25',
      pastelTag: 'text-pink-200 border-pink-200/30',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* Pastel Ledger Audit Ticker */}
      <div className="bg-[#171a21] border border-white/10 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-200/15 text-emerald-200 border border-emerald-200/30 font-bold text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {locale === 'uk' ? 'АУДИТ НАЖИВО' : 'LIVE AUDIT'}
          </span>
          <span className="text-zinc-200 font-bold uppercase tracking-wider">
            {config.leagueName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400">
          <span>
            <strong className="text-amber-200">#1 SEED:</strong> {leader.displayName} ({leader.wins}-{leader.losses})
          </span>
          {allPlayLeader && (
            <>
              <span className="text-zinc-700">|</span>
              <span>
                <strong className="text-sky-200">ALL-PLAY #1:</strong> {allPlayLeader.team.displayName} ({(allPlayLeader.winPercentage * 100).toFixed(0)}%)
              </span>
            </>
          )}
          {parashaResident && (
            <>
              <span className="text-zinc-700 hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                <strong className="text-rose-300">LAST PLACE:</strong> {parashaResident.team.displayName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Pastel Ledger + Thermal Receipt Hero Split */}
      <section className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

          {/* Left 7 Columns: #1 Seed + 3 League Pulse Stat Pods */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-200/10 text-amber-200 border border-amber-200/30 font-mono text-[11px] uppercase tracking-widest font-bold mb-3">
                <Crown className="w-3.5 h-3.5" />
                <span>01 // {t('currentLeader')}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                <div className="relative shrink-0">
                  {leader.avatarUrl ? (
                    <Image
                      src={leader.avatarUrl}
                      alt={leader.displayName}
                      width={88}
                      height={88}
                      className="rounded-2xl border-2 border-amber-200/70 shadow-lg"
                    />
                  ) : (
                    <div className="w-22 h-22 bg-[#1e222b] rounded-2xl border-2 border-amber-200/70 flex items-center justify-center">
                      <span className="text-2xl font-bold font-heading text-amber-200">
                        {leader.displayName.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-lg bg-amber-200 text-zinc-900 flex items-center justify-center shadow-md">
                    <Crown className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </div>

                <div>
                  <h2 className="text-3xl sm:text-5xl font-bold font-heading text-white uppercase tracking-tight leading-none">
                    {leader.displayName}
                  </h2>
                  <p className="text-xs font-mono text-zinc-400 mt-2 uppercase tracking-wider">
                    {allPlayLeader && allPlayLeader.team.displayName !== leader.displayName
                      ? locale === 'uk'
                        ? `⚠️ УВАГА: ${allPlayLeader.team.displayName} має кращий All-Play (${(allPlayLeader.winPercentage * 100).toFixed(0)}%)`
                        : `⚠️ AUDIT NOTE: ${allPlayLeader.team.displayName} leads true All-Play (${(allPlayLeader.winPercentage * 100).toFixed(0)}%)`
                      : locale === 'uk'
                        ? '✓ Підтверджений лідер за очками та перемогами'
                        : '✓ Verified leader in both standings & All-Play'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-4">
                    <span className="px-3 py-1.5 rounded-lg bg-[#111318] border border-emerald-200/25 text-xs font-mono font-bold text-emerald-200">
                      {t('record')}: {leader.wins}-{leader.losses}{leader.ties > 0 ? `-${leader.ties}` : ''}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#111318] border border-sky-200/25 text-xs font-mono font-bold text-sky-200">
                      {leader.fpts.toFixed(1)} {t('pf')}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#111318] border border-white/10 text-xs font-mono font-bold text-zinc-400">
                      MAX PF: {leader.ppts.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Pastel Ledger Pulse Pods */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-dashed border-white/10">
              {topScorer && (
                <div className="bg-[#111318]/90 border border-amber-200/20 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200 mb-1">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 shrink-0" />
                      {t('pf')} #1
                    </span>
                    <span className="text-zinc-500">PTS</span>
                  </div>
                  <p className="font-heading font-bold text-white text-base truncate uppercase">
                    {topScorer.displayName}
                  </p>
                  <p className="font-mono text-xs text-zinc-400 mt-0.5">
                    {topScorer.fpts.toFixed(1)} {t('pf')}
                  </p>
                </div>
              )}

              {allPlayLeader && (
                <div className="bg-[#111318]/90 border border-sky-200/20 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-sky-200 mb-1">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 shrink-0" />
                      {locale === 'uk' ? 'Всі-З-Усіма #1' : 'All-Play #1'}
                    </span>
                    <span className="text-zinc-500">TRUE</span>
                  </div>
                  <p className="font-heading font-bold text-white text-base truncate uppercase">
                    {allPlayLeader.team.displayName}
                  </p>
                  <p className="font-mono text-xs text-zinc-400 mt-0.5">
                    {allPlayLeader.wins}-{allPlayLeader.losses} ({(allPlayLeader.winPercentage * 100).toFixed(0)}%)
                  </p>
                </div>
              )}

              {parashaResident && (
                <div className="bg-[#111318]/90 border border-rose-300/25 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      {t('parasha')}
                    </span>
                    <span>BOT</span>
                  </div>
                  <p className="font-heading font-bold text-white text-base truncate uppercase">
                    {parashaResident.team.displayName}
                  </p>
                  <p className="font-mono text-xs text-rose-300/90 mt-0.5">
                    {(parashaResident.winPercentage * 100).toFixed(0)}% {t('wr')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Tactile Thermal Paper Receipt Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ReceiptCard
              leagueName={config.leagueName}
              leagueId={leagueId}
              locale={locale}
              leader={leader}
              allPlayLeader={allPlayLeader}
              benchCrime={badges.benchWhisperer}
              unlucky={badges.unlucky}
              parashaResident={parashaResident || undefined}
            />
          </div>

        </div>
      </section>

      {/* Itemized Evidence Locker (Dynamic Badges Grid) */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-6 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-200/15 text-emerald-200 border border-emerald-200/30 font-mono text-xs font-bold">
              02
            </span>
            <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white">
              {t('dynamicBadges')}
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
            {locale === 'uk' ? 'ДОКАЗОВА БАЗА // 11 СТАТЕЙ' : 'ITEMIZED EVIDENCE LOCKER // 11 COUNTS'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badgeCards.map((b) => {
            const Icon = b.icon;
            const winner = b.data?.team;
            return (
              <div
                key={b.key}
                className="glass-card p-5 flex flex-col justify-between group relative overflow-hidden cursor-help"
              >
                {/* Hover Tooltip with Exact Stat Reason */}
                {b.data?.reason && (
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-16 left-1/2 -translate-x-1/2 w-64 bg-[#111318] border border-emerald-200/40 text-zinc-100 font-mono text-[11px] rounded-lg p-3 shadow-2xl z-30 transition-all duration-150 pointer-events-none text-center">
                    {b.data.reason}
                  </div>
                )}

                <div>
                  {/* Top Ledger Index Row */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-dashed border-white/10">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      {b.code} // {b.stamp}
                    </span>
                    {b.extraStat && (
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#111318] border ${b.pastelTag}`}>
                        {b.extraStat}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${b.pastelIcon}`}>
                      {Icon ? <Icon className="w-4 h-4" /> : <span className="text-base">{b.emoji}</span>}
                    </div>
                    <div>
                      <h4 className="font-bold font-heading text-base uppercase tracking-tight text-white leading-snug">
                        {b.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-1">{b.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Winner Ledger Footer */}
                <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  {winner ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      {winner.avatarUrl ? (
                        <Image
                          src={winner.avatarUrl}
                          alt={winner.displayName}
                          width={24}
                          height={24}
                          className="rounded-full border border-white/20 shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#111318] border border-white/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-mono font-bold text-emerald-200">
                            {winner.displayName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-mono font-bold text-xs text-zinc-100 truncate">
                        {winner.displayName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 font-mono">N/A</span>
                  )}
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 shrink-0">
                    {locale === 'uk' ? 'ЗАФІКСОВАНО' : 'LOGGED'}
                  </span>
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
        <div className="flex items-center justify-between gap-2.5 mb-6 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-300/15 text-rose-200 border border-rose-300/30 font-mono text-xs font-bold">
              04
            </span>
            <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white">
              {t('parasha')}
            </h2>
          </div>
          <span className="text-xs font-mono text-rose-300/80 uppercase tracking-widest hidden sm:inline">
            {locale === 'uk' ? 'ЗОНА РИЗИКУ ТА ДНО ТАБЛИЦІ' : 'RELEGATION & AUDIT PENALTY ZONE'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Current Resident (Absolute Worst) */}
          {parashaResident && (
            <div className="md:col-span-1 glass-card p-6 flex flex-col items-center text-center border-rose-300/25 relative overflow-hidden">
              <div className="w-14 h-14 rounded-xl bg-rose-300/10 border border-rose-300/30 text-rose-200 flex items-center justify-center mb-3">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold font-heading uppercase text-lg mb-0.5 text-rose-200">{t('resident')}</h3>
              <p className="text-xs font-mono text-zinc-400 mb-4">{t('deadLast')}</p>

              {parashaResident.team.avatarUrl ? (
                <div className="w-14 h-14 rounded-full overflow-hidden mb-3 border-2 border-rose-300/60">
                  <Image src={parashaResident.team.avatarUrl} alt={parashaResident.team.displayName} width={56} height={56} />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#111318] flex items-center justify-center mb-3 border-2 border-rose-300/60">
                  <span className="font-bold">{parashaResident.team.displayName.charAt(0)}</span>
                </div>
              )}

              <div className="mt-auto">
                <p className="font-heading font-bold text-white text-lg uppercase">{parashaResident.team.displayName}</p>
                <p className="text-sm font-mono font-bold text-rose-300 mt-1">
                  {(parashaResident.winPercentage * 100).toFixed(1)}% {t('trueWinRate')}
                </p>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">{parashaResident.team.fpts.toFixed(1)} {t('pf')}</p>
              </div>
            </div>
          )}

          {/* Candidates */}
          <div className="md:col-span-3 glass-card p-6">
            <div className="flex items-center gap-2 mb-6 pb-2.5 border-b border-dashed border-white/10">
              <AlertTriangle className="w-4 h-4 text-amber-200" />
              <h3 className="font-bold font-heading uppercase text-base text-amber-200 tracking-wide">{t('atRisk')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {parashaCandidates.map((candidate, idx) => (
                <div key={candidate.team.rosterId} className="bg-[#111318] rounded-xl p-4 flex flex-col items-center text-center border border-white/10 hover:border-amber-200/35 transition-colors">
                  <div className="px-2.5 py-0.5 rounded-md bg-amber-200/10 border border-amber-200/25 text-amber-200 mb-3 font-mono font-bold text-xs">
                    #{allPlay.length - 1 - idx}
                  </div>
                  {candidate.team.avatarUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-2.5 border border-white/20">
                      <Image src={candidate.team.avatarUrl} alt={candidate.team.displayName} width={48} height={48} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#171a21] flex items-center justify-center mb-2.5 border border-white/20">
                      <span className="text-xs font-bold">{candidate.team.displayName.charAt(0)}</span>
                    </div>
                  )}
                  <p className="font-heading font-bold text-zinc-100 text-sm uppercase">{candidate.team.displayName}</p>
                  <p className="text-xs font-mono font-bold text-amber-200 mt-1">
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
