'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Activity, ArrowRightLeft, History, CalendarDays, Swords, Search, Newspaper } from 'lucide-react';
import { RefreshButton } from '@/components/RefreshButton';

interface NavLabels {
  title: string;
  dashboard: string;
  schedule: string;
  news: string;
  trueStandings: string;
  multiverse: string;
  rivalries: string;
  draftReport: string;
  history: string;
}

export default function NavbarClient({
  locale,
  labels
}: {
  locale: string;
  labels: NavLabels;
}) {
  const pathname = usePathname() || `/${locale}`;

  // Path-preserving locale switcher
  const getLocalizedPath = (targetLocale: string) => {
    const segments = pathname.split('/');
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'uk')) {
      segments[1] = targetLocale;
      return segments.join('/') || `/${targetLocale}`;
    }
    return `/${targetLocale}`;
  };

  const navItems = [
    { href: `/${locale}`, label: labels.dashboard, icon: Trophy, exact: true, activeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]' },
    { href: `/${locale}/schedule`, label: labels.schedule, icon: CalendarDays, exact: false, activeColor: 'text-blue-300 bg-blue-500/15 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]' },
    { href: `/${locale}/news`, label: labels.news, icon: Newspaper, exact: false, activeColor: 'text-orange-300 bg-orange-500/15 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]' },
    { href: `/${locale}/true-standings`, label: labels.trueStandings, icon: Activity, exact: false, activeColor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]' },
    { href: `/${locale}/multiverse`, label: labels.multiverse, icon: ArrowRightLeft, exact: false, activeColor: 'text-purple-300 bg-purple-500/15 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]' },
    { href: `/${locale}/rivalries`, label: labels.rivalries, icon: Swords, exact: false, activeColor: 'text-rose-300 bg-rose-500/15 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]' },
    { href: `/${locale}/draft-report`, label: labels.draftReport, icon: Search, exact: false, activeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]' },
    { href: `/${locale}/history`, label: labels.history, icon: History, exact: false, activeColor: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.2)]' },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href || pathname === `${href}/`;
    return pathname.startsWith(href);
  };

  return (
    <header className="glass-panel sticky top-0 z-40 rounded-none border-t-0 border-x-0 border-b border-white/10">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-[0_0_18px_rgba(52,211,153,0.35)] group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="hidden 2xl:block">
            <h1 className="text-sm font-extrabold font-heading tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-none whitespace-nowrap">
              {labels.title}
            </h1>
            <span className="text-[9px] uppercase tracking-widest text-emerald-400/80 font-mono font-bold block mt-0.5">
              {locale === 'uk' ? 'АНАЛІТИКА SLEEPER' : 'SLEEPER ANALYTICS'}
            </span>
          </div>
        </Link>

        {/* Center: Single-Line Horizontal Menu */}
        <nav className="hidden md:flex items-center flex-nowrap gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-8 flex items-center gap-1.5 px-2.5 xl:px-3 rounded-lg text-xs xl:text-[13px] font-semibold whitespace-nowrap transition-all border ${
                  active
                    ? item.activeColor
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0 hidden xl:block" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Refresh Button + EN/UK Switcher (Far Right, Vertically Aligned) */}
        <div className="flex items-center gap-2 shrink-0">
          <RefreshButton />
          <div className="h-9 flex items-center bg-slate-950/80 rounded-lg p-1 border border-white/10">
            <Link
              href={getLocalizedPath('en')}
              className={`h-7 px-2.5 flex items-center justify-center rounded-md text-xs font-bold leading-none transition-all ${
                locale === 'en'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </Link>
            <Link
              href={getLocalizedPath('uk')}
              className={`h-7 px-2.5 flex items-center justify-center rounded-md text-xs font-bold leading-none transition-all ${
                locale === 'uk'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              UK
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar (< md) */}
      <nav className="md:hidden flex items-center gap-1.5 px-3 pb-2.5 overflow-x-auto no-scrollbar border-t border-white/5 pt-2">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
                active
                  ? item.activeColor
                  : 'border-slate-800 bg-slate-900/60 text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
