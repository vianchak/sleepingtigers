import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Link } from '@/i18n/routing';
import { Trophy, Activity, ArrowRightLeft, History, CalendarDays, Swords, Search, Newspaper } from 'lucide-react';
import { RefreshButton } from '@/components/RefreshButton';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  try {
    const t = await getTranslations({locale, namespace: 'Layout'});
    return {
      title: t('title'),
      description: t('description'),
    };
  } catch(e) {
    return {
      title: 'Error',
      description: 'Error'
    }
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  let messages; let t; try { messages = await getMessages(); t = await getTranslations('Layout'); } catch(e: any) { return <html><body>Error: {e.message || String(e)}</body></html> }

  return (
    <html lang={locale}>
      <body className={`${inter.className} text-slate-100 antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <div className="flex flex-col min-h-screen">
            <header className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-x-0 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                  <Trophy className="w-6 h-6 text-slate-900" />
                </div>
                <h1 className="text-lg lg:text-xl font-bold text-gradient whitespace-nowrap hidden sm:block">{t('title')}</h1>
              </Link>
              
              <nav className="hidden md:flex flex-1 justify-center space-x-3 lg:space-x-4 text-xs lg:text-sm px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Link href="/" className="flex items-center space-x-1 hover:text-blue-400 transition-colors whitespace-nowrap">
                  <Trophy className="w-4 h-4 hidden xl:block" />
                  <span>{t('dashboard')}</span>
                </Link>
                <Link href="/schedule" className="flex items-center space-x-1 hover:text-blue-400 transition-colors whitespace-nowrap">
                  <CalendarDays className="w-4 h-4 hidden xl:block" />
                  <span>{t('schedule')}</span>
                </Link>
                <Link href="/news" className="flex items-center space-x-1 hover:text-orange-400 transition-colors whitespace-nowrap">
                  <Newspaper className="w-4 h-4 hidden xl:block" />
                  <span>{t('news')}</span>
                </Link>
                <Link href="/true-standings" className="flex items-center space-x-1 hover:text-emerald-400 transition-colors whitespace-nowrap">
                  <Activity className="w-4 h-4 hidden xl:block" />
                  <span>{t('trueStandings')}</span>
                </Link>
                <Link href="/multiverse" className="flex items-center space-x-1 hover:text-purple-400 transition-colors whitespace-nowrap">
                  <ArrowRightLeft className="w-4 h-4 hidden xl:block" />
                  <span>{t('multiverse')}</span>
                </Link>
                <Link href="/rivalries" className="flex items-center space-x-1 hover:text-red-400 transition-colors whitespace-nowrap">
                  <Swords className="w-4 h-4 hidden xl:block" />
                  <span>{t('rivalries')}</span>
                </Link>
                <Link href="/draft-report" className="flex items-center space-x-1 hover:text-yellow-400 transition-colors whitespace-nowrap">
                  <Search className="w-4 h-4 hidden xl:block" />
                  <span>{t('draftReport')}</span>
                </Link>
                <Link href="/history" className="flex items-center space-x-1 hover:text-cyan-400 transition-colors whitespace-nowrap">
                  <History className="w-4 h-4 hidden xl:block" />
                  <span>{t('history')}</span>
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1 border border-white/5">
                  <Link href="/" locale="en" className={`px-2 py-1 rounded text-xs font-bold transition-colors ${locale === 'en' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>EN</Link>
                  <Link href="/" locale="uk" className={`px-2 py-1 rounded text-xs font-bold transition-colors ${locale === 'uk' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>UK</Link>
                </div>
                <RefreshButton />
              </div>
            </header>
            
            <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
              {children}
            </main>

            <footer className="glass-panel mt-auto rounded-none border-x-0 border-b-0 border-t border-white/10 py-6 text-center text-slate-500 text-sm">
              <p>{t('footer')}</p>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export const runtime = 'edge';

