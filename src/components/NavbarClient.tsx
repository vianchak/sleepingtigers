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
    { code: '01', href: `/${locale}`, label: labels.dashboard, icon: Trophy, exact: true, show: true },
    { code: '02', href: `/${locale}/schedule`, label: labels.schedule, icon: CalendarDays, exact: false, show: true },
    { code: '03', href: `/${locale}/news`, label: labels.news, icon: Newspaper, exact: false, show: newsletterEnabled },
    { code: '04', href: `/${locale}/true-standings`, label: labels.trueStandings, icon: Activity, exact: false, show: true },
    { code: '05', href: `/${locale}/multiverse`, label: labels.multiverse, icon: ArrowRightLeft, exact: false, show: true },
    { code: '06', href: `/${locale}/rivalries`, label: labels.rivalries, icon: Swords, exact: false, show: true },
    { code: '07', href: `/${locale}/draft-report`, label: labels.draftReport, icon: Search, exact: false, show: true },
    { code: '08', href: `/${locale}/history`, label: labels.history, icon: History, exact: false, show: true },
  ];

  const navItems = allNavItems.filter((item) => item.show);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href || pathname === `${href}/`;
    return pathname.startsWith(href);
  };

  const isAdminActive = pathname.startsWith(`/${locale}/admin`) || pathname.startsWith(`/${locale}/newsletter`);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090a0c]/95 backdrop-blur-md border-b border-white/12">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#c8ff00] flex items-center justify-center shadow-[0_0_20px_rgba(200,255,0,0.3)] group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5 text-[#090a0c] stroke-[2.5]" />
          </div>
          <div className="hidden xl:block">
            <h1 className="text-sm font-black font-heading uppercase tracking-tight text-[#f4f1ea] group-hover:text-[#c8ff00] transition-colors leading-none whitespace-nowrap">
              {labels.title}
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-[#c8ff00] font-mono font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] inline-block" />
              {locale === 'uk' ? 'АУДИТ ЛІГИ // LIVE' : 'LEAGUE AUDIT // LIVE'}
            </span>
          </div>
        </Link>

        {/* Center: Sportsbook Ledger Menu */}
        <nav className="hidden md:flex items-center flex-nowrap gap-1 bg-[#111318] p-1 rounded-xl border border-white/10 min-w-0 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-8 flex items-center gap-1.5 px-2.5 xl:px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wide whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? 'bg-[#c8ff00] text-[#090a0c] shadow-[0_0_16px_rgba(200,255,0,0.28)]'
                    : 'text-[#f4f1ea]/65 hover:text-[#f4f1ea] hover:bg-white/5'
                }`}
              >
                <span className={`text-[10px] hidden 2xl:inline ${active ? 'text-[#090a0c]/70' : 'text-[#c8ff00]/70'}`}>
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
                ? 'bg-[#c8ff00]/20 border-[#c8ff00]/60 text-[#c8ff00] shadow-[0_0_12px_rgba(200,255,0,0.25)]'
                : 'bg-[#111318] border-white/10 text-white/60 hover:text-white hover:border-white/25'
            }`}
          >
            <Settings className="w-4 h-4" />
          </Link>
          <div className="h-9 flex items-center bg-[#111318] rounded-lg p-1 border border-white/10 font-mono">
            <Link
              href={getLocalizedPath('en')}
              className={`h-7 px-2.5 flex items-center justify-center rounded-md text-xs font-bold leading-none transition-all ${
                locale === 'en'
                  ? 'bg-[#c8ff00] text-[#090a0c] shadow-sm'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              EN
            </Link>
            <Link
              href={getLocalizedPath('uk')}
              className={`h-7 px-2.5 flex items-center justify-center rounded-md text-xs font-bold leading-none transition-all ${
                locale === 'uk'
                  ? 'bg-[#c8ff00] text-[#090a0c] shadow-sm'
                  : 'text-white/55 hover:text-white'
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
                  ? 'bg-[#c8ff00] text-[#090a0c] border-[#c8ff00]'
                  : 'border-white/10 bg-[#111318] text-white/65'
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
