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
  const t = await getTranslations({locale, namespace: 'Layout'});
  return {
    title: t('title'),
    description: t('description'),
  };
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

  let messages; let t; try { messages = await getMessages(); t = await getTranslations('Layout'); } catch(e: any) { return <html><body>Error: {e.message}</body></html> }

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
              <nav className="hidden md:flex space-x-3 lg:space-x-5 text-sm">
                <Link href="/" className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                  <Trophy className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('dashboard')}</span>
                </Link>
                <Link href="/schedule" className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                  <CalendarDays className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('schedule')}</span>
                </Link>
                <Link href="/news" className="flex items-center space-x-1 hover:text-orange-400 transition-colors">
                  <Newspaper className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('news')}</span>
                </Link>
                <Link href="/true-standings" className="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
                  <Activity className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('trueStandings')}</span>
                </Link>
                <Link href="/multiverse" className="flex items-center space-x-1 hover:text-purple-400 transition-colors">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('multiverse')}</span>
                </Link>
                <Link href="/rivalries" className="flex items-center space-x-1 hover:text-rose-400 transition-colors">
                  <Swords className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('rivalries')}</span>
                </Link>
                <Link href="/draft-report" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
                  <Search className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('draftReport')}</span>
                </Link>
                <Link href="/history" className="flex items-center space-x-1 hover:text-yellow-400 transition-colors">
                  <History className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('history')}</span>
                </Link>
              </nav>
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/10 text-sm font-medium">
                  <a href="/en" className={`px-2 py-1 rounded ${locale === 'en' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>EN</a>
                  <a href="/uk" className={`px-2 py-1 rounded ${locale === 'uk' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>UK</a>
                </div>
                <RefreshButton />
              </div>
            </header>
            
            <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
              {children}
            </main>

            <footer className="py-6 text-center text-sm text-slate-500 border-t border-white/5 mt-8">
              <p>{t('footer')}</p>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export const runtime = 'edge';


