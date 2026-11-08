import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import '../globals.css';
import NavbarClient from '@/components/NavbarClient';
import { getDictionary, getScopedTranslator } from '@/lib/i18n/dictionaries';
import { TranslationProvider } from '@/lib/i18n/client';
import { getSiteConfig } from '@/lib/site-config';
import { notFound } from 'next/navigation';

const locales = ['en', 'uk'];

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-rubik',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  try {
    const t = getScopedTranslator(locale, 'Layout');
    const config = await getSiteConfig();
    return {
      title: config.leagueName || t('title'),
      description: t('description'),
    };
  } catch(e) {
    return {
      title: 'Sleeper Fantasy Analytics',
      description: 'Fantasy football analytics dashboard'
    };
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

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = getDictionary(locale);
  const t = getScopedTranslator(locale, 'Layout');
  const config = await getSiteConfig();

  const navLabels = {
    title: config.leagueName || t('title'),
    dashboard: t('dashboard'),
    schedule: t('schedule'),
    news: t('news'),
    trueStandings: t('trueStandings'),
    multiverse: t('multiverse'),
    rivalries: t('rivalries'),
    draftReport: t('draftReport'),
    history: t('history'),
  };

  return (
    <html lang={locale} className={`${ibmPlexSans.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <body className="text-zinc-100 antialiased selection:bg-emerald-200/30 selection:text-emerald-100">
        <TranslationProvider messages={messages}>
          <div className="flex flex-col min-h-screen">
            <NavbarClient
              locale={locale}
              labels={navLabels}
              newsletterEnabled={config.newsletterEnabled}
            />

            <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
              {children}
            </main>

            <footer className="mt-16 border-t border-white/10 bg-[#111318]/90 py-6 text-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block animate-pulse" />
                  <span className="text-zinc-300 font-bold">OFFICIAL FANTASY AUDIT LEDGER</span>
                </div>
                <p>{t('footer')}</p>
              </div>
            </footer>
          </div>
        </TranslationProvider>
      </body>
    </html>
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
