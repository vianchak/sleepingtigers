import Link from 'next/link';
import { Settings, Trophy, ArrowRight } from 'lucide-react';

export default function LeagueNotConfigured({
  locale,
  error,
}: {
  locale: string;
  error?: string;
}) {
  const isUk = locale === 'uk';

  return (
    <div className="max-w-xl mx-auto my-16 glass-panel p-8 border border-cyan-500/30 text-center space-y-6 animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.2)]">
        <Trophy className="w-8 h-8 text-emerald-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
          {error
            ? isUk
              ? 'Помилка завантаження ліги Sleeper'
              : 'Failed to Load Sleeper League'
            : isUk
            ? 'Вітаємо! Налаштуйте Вашу Лігу'
            : 'Welcome! Configure Your Sleeper League'}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          {error
            ? error
            : isUk
            ? 'ID ліги Sleeper ще не налаштовано. Перейдіть до панелі адміністратора, щоб вказати ID ліги, налаштувати AI-генератор новин та персоналізувати дашборд.'
            : 'No Sleeper League ID is configured yet. Open the Admin Panel to connect your Sleeper league, configure your LLM API key, and customize the newsletter generator.'}
        </p>
      </div>

      <div className="pt-2">
        <Link
          href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-95 transition-opacity shadow-lg"
        >
          <Settings className="w-4 h-4" />
          <span>{isUk ? 'Відкрити Панель Адміна' : 'Open Admin Settings'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

