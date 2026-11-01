import type { Metadata } from 'next';
import { Inter, Rubik, JetBrains_Mono } from 'next/font/google';
import '../globals.css';
import NavbarClient from '@/components/NavbarClient';
import { getDictionary, getScopedTranslator } from '@/lib/i18n/dictionaries';
import { TranslationProvider } from '@/lib/i18n/client';
import { notFound } from 'next/navigation';

const locales = ['en', 'uk'];

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const rubik = Rubik({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-rubik',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  try {
    const t = getScopedTranslator(locale, 'Layout');
    return {
      title: t('title'),
      description: t('description'),
    };
  } catch(e) {
    return {
      title: 'Error',
      description: 'Error'
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

  const navLabels = {
    title: t('title'),
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
    <html lang={locale} className={`${inter.variable} ${rubik.variable} ${jetbrainsMono.variable}`}>
      <body className="text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <TranslationProvider messages={messages}>
          <div className="flex flex-col min-h-screen">
            <NavbarClient locale={locale} labels={navLabels} />

            <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
              {children}
            </main>

            <footer className="glass-panel mt-16 rounded-none border-x-0 border-b-0 border-t border-white/10 py-6 text-center text-slate-500 text-xs sm:text-sm">
              <p>{t('footer')}</p>
            </footer>
          </div>
        </TranslationProvider>
      </body>
    </html>
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
