'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Activity,
  ArrowRightLeft,
  History,
  CalendarDays,
  Swords,
  Search,
  Newspaper,
  Settings,
  Receipt,
} from 'lucide-react';
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
  labels,
  newsletterEnabled = true,
}: {
  locale: string;
  labels: NavLabels;
  newsletterEnabled?: boolean;
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

  const allNavItems = [
    { code: '01', href: `/${locale}`, label: labels.dashboard, icon: Trophy, exact: true, show: true, pastel: 'bg-emerald-200/15 text-emerald-200 border-emerald-200/35' },
    { code: '02', href: `/${locale}/true-standings`, label: labels.trueStandings, icon: Activity, exact: false, show: true, pastel: 'bg-sky-200/15 text-sky-200 border-sky-200/35' },
    { code: '03', href: `/${locale}/schedule`, label: labels.schedule, icon: CalendarDays, exact: false, show: true, pastel: 'bg-indigo-200/15 text-indigo-200 border-indigo-200/35' },
    { code: '04', href: `/${locale}/multiverse`, label: labels.multiverse, icon: ArrowRightLeft, exact: false, show: true, pastel: 'bg-violet-200/15 text-violet-200 border-violet-200/35' },
    { code: '05', href: `/${locale}/rivalries`, label: labels.rivalries, icon: Swords, exact: false, show: true, pastel: 'bg-rose-200/15 text-rose-200 border-rose-200/35' },
    { code: '06', href: `/${locale}/history`, label: labels.history, icon: History, exact: false, show: true, pastel: 'bg-amber-200/15 text-amber-200 border-amber-200/35' },
    { code: '07', href: `/${locale}/draft-report`, label: labels.draftReport, icon: Search, exact: false, show: true, pastel: 'bg-teal-200/15 text-teal-200 border-teal-200/35' },
    { code: '08', href: `/${locale}/news`, label: labels.news, icon: Newspaper, exact: false, show: newsletterEnabled, pastel: 'bg-orange-200/15 text-orange-200 border-orange-200/35' },
  ];

  const navItems = allNavItems.filter((item) => item.show);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isAdminActive = pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`);

  return (
    <header className="sticky top-0 z-50 bg-[#111318]/92 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-emerald-200/15 border border-emerald-200/35 text-emerald-200 flex items-center justify-center group-hover:bg-emerald-200/25 transition-colors">
            <Receipt className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-200 font-bold leading-none mb-0.5">
              LEAGUE AUDIT // LIVE
            </span>
            <h1 className="text-base xl:text-lg font-extrabold font-heading tracking-tight uppercase text-white leading-none">
              {labels.title}
            </h1>
          </div>
        </Link>

        {/* Center: Pastel Ledger Menu */}
        <nav className="hidden md:flex items-center flex-nowrap gap-1 bg-[#171a21] p-1 rounded-xl border border-white/10 min-w-0 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-8 flex items-center gap-1.5 px-2.5 xl:px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wide whitespace-nowrap transition-all shrink-0 border ${
                  active
                    ? item.pastel
                    : 'border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                <span className={`text-[10px] hidden 2xl:inline ${active ? 'opacity-90' : 'text-zinc-500'}`}>
                  {item.code}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Refresh Button + Admin Settings + EN/UK Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <RefreshButton />
          <Link
            href={`/${locale}/admin`}
            title={locale === 'uk' ? 'Налаштування Адміна' : 'Admin Settings'}
            className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-all ${
              isAdminActive
                ? 'bg-emerald-200/15 border-emerald-200/40 text-emerald-200'
                : 'bg-[#171a21] border-white/10 text-zinc-400 hover:text-white hover:border-white/25'
            }`}
          >
            <Settings className="w-4 h-4" />
          </Link>
          <div className="h-9 flex items-center bg-[#171a21] rounded-lg p-1 border border-white/10 font-mono">
            <Link
              href={getLocalizedPath('en')}
              className={`h-7 px-2.5 flex items-center justify-center rounded-md text-xs font-bold leading-none transition-all ${
                locale === 'en'
                  ? 'bg-emerald-200/20 text-emerald-200 border border-emerald-200/35'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </Link>
            <Link
              href={getLocalizedPath('uk')}
              className={`h-7 px-2.5 flex items-center justify-center rounded-md text-xs font-bold leading-none transition-all ${
                locale === 'uk'
                  ? 'bg-emerald-200/20 text-emerald-200 border border-emerald-200/35'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              UK
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar (< md) */}
      <nav className="md:hidden flex items-center gap-1.5 px-3 pb-2.5 overflow-x-auto no-scrollbar border-t border-white/10 pt-2 font-mono">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap border transition-all shrink-0 ${
                active
                  ? item.pastel
                  : 'border-white/10 bg-[#171a21] text-zinc-400'
              }`}
            >
              <span className="text-[10px] opacity-60">{item.code}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
