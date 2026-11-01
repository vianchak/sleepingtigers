'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  LogOut,
  Trophy,
  Cpu,
  Newspaper,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  RotateCcw,
  KeyRound,
  Search,
  Save,
  Trash2,
  Database,
} from 'lucide-react';
import type {
  LLMProvider,
  PublicSiteConfig,
} from '@/lib/site-config';

const DEFAULT_NEWSLETTER_PERSONA = `You are a witty, slightly cynical, and deeply frustrated fantasy football beat writer.
The core theme of this newsletter is "burning / raging / utter meltdown". We "burn" because of how painfully unpredictable, unfair, and frustrating fantasy football is. Focus heavily on bad beats, fluke performances, bench points that ruined everything, and the sheer agony of managing these teams.
Keep it humorous, engaging, and absolutely ruthless. Embrace the chaos.`;

const MODEL_PRESETS: Record<LLMProvider, string[]> = {
  google: ['gemini-3.8-flash', 'gemini-3.8-pro', 'gemini-3.8-flash-lite'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'o3-mini'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
  openrouter: [
    'google/gemini-3.8-flash',
    'openai/gpt-4o-mini',
    'anthropic/claude-3.5-sonnet',
  ],
};

export default function AdminClient({
  locale,
  initialAuthenticated,
  initialConfig,
  initialArchives,
}: {
  locale: string;
  initialAuthenticated: boolean;
  initialConfig: PublicSiteConfig;
  initialArchives: number[];
}) {
  const isUk = locale === 'uk';
  const router = useRouter();

  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [config, setConfig] = useState<PublicSiteConfig>(initialConfig);
  const [archives, setArchives] = useState<number[]>(initialArchives);

  // Auth states
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form states
  const [leagueId, setLeagueId] = useState(initialConfig.leagueId);
  const [leagueName, setLeagueName] = useState(initialConfig.leagueName);
  const [newsletterEnabled, setNewsletterEnabled] = useState(
    initialConfig.newsletterEnabled
  );
  const [llmProvider, setLlmProvider] = useState<LLMProvider>(
    initialConfig.llmProvider
  );
  const [llmModel, setLlmModel] = useState(initialConfig.llmModel);
  const [llmApiKey, setLlmApiKey] = useState('');
  const [clearApiKey, setClearApiKey] = useState(false);
  const [llmBaseUrl, setLlmBaseUrl] = useState(initialConfig.llmBaseUrl);
  const [newsletterTitle, setNewsletterTitle] = useState(
    initialConfig.newsletterTitle
  );
  const [newsletterSubtitle, setNewsletterSubtitle] = useState(
    initialConfig.newsletterSubtitle
  );
  const [newsletterPersona, setNewsletterPersona] = useState(
    initialConfig.newsletterPersona
  );

  // Sleeper league verification state
  const [verifyingLeague, setVerifyingLeague] = useState(false);
  const [leaguePreview, setLeaguePreview] = useState<{
    name: string;
    season: string;
    totalRosters: number;
    status: string;
  } | null>(null);
  const [leagueVerifyError, setLeagueVerifyError] = useState('');

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const action = config.hasAdminPassword ? 'login' : 'setup';
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
        return;
      }

      setAuthenticated(true);
      setPassword('');
      // Fetch fresh config
      const cfgRes = await fetch('/api/admin/config');
      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        if (cfgData.config) {
          setConfig(cfgData.config);
          setLeagueId(cfgData.config.leagueId);
          setLeagueName(cfgData.config.leagueName);
          setNewsletterEnabled(cfgData.config.newsletterEnabled);
          setLlmProvider(cfgData.config.llmProvider);
          setLlmModel(cfgData.config.llmModel);
          setLlmBaseUrl(cfgData.config.llmBaseUrl);
          setNewsletterTitle(cfgData.config.newsletterTitle);
          setNewsletterSubtitle(cfgData.config.newsletterSubtitle);
          setNewsletterPersona(cfgData.config.newsletterPersona);
        }
      }
      router.refresh();
    } catch (err: any) {
      setAuthError(err?.message || 'Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setAuthenticated(false);
    router.refresh();
  };

  const handleVerifyLeague = async () => {
    if (!leagueId.trim()) return;
    setVerifyingLeague(true);
    setLeagueVerifyError('');
    setLeaguePreview(null);
    try {
      const res = await fetch(
        `https://api.sleeper.app/v1/league/${encodeURIComponent(leagueId.trim())}`
      );
      if (!res.ok) {
        throw new Error(
          isUk
            ? 'Лігу з таким ID не знайдено в Sleeper API.'
            : 'League ID not found on Sleeper API.'
        );
      }
      const data = await res.json();
      if (!data || !data.name) {
        throw new Error(
          isUk ? 'Некоректна відповідь від Sleeper.' : 'Invalid league response.'
        );
      }
      setLeaguePreview({
        name: data.name,
        season: data.season,
        totalRosters: data.total_rosters,
        status: data.status,
      });
    } catch (err: any) {
      setLeagueVerifyError(err?.message || 'Failed to verify league');
    } finally {
      setVerifyingLeague(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveFeedback(null);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId,
          leagueName,
          newsletterEnabled,
          llmProvider,
          llmModel,
          llmApiKey: llmApiKey.trim() || undefined,
          clearApiKey,
          llmBaseUrl,
          newsletterTitle,
          newsletterSubtitle,
          newsletterPersona,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setConfig(data.config);
      setLlmApiKey('');
      setClearApiKey(false);
      setSaveFeedback({
        type: 'success',
        message: isUk
          ? 'Налаштування успішно збережено! Кеш ліги оновлено.'
          : 'Configuration saved! League cache cleared and dashboard updated.',
      });
      router.refresh();
    } catch (err: any) {
      setSaveFeedback({
        type: 'error',
        message: err?.message || 'Error saving settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArchive = async (weekToDelete: number) => {
    const confirmMsg = isUk
      ? `Видалити архівний випуск за Тиждень ${weekToDelete}?`
      : `Delete archived newsletter for Week ${weekToDelete}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(
        `/api/newsletter/save?leagueId=${encodeURIComponent(leagueId)}&week=${weekToDelete}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setArchives((prev) => prev.filter((w) => w !== weekToDelete));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-16 glass-panel p-8 border border-cyan-500/30 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-white">
            {config.hasAdminPassword
              ? isUk
                ? 'Вхід для Адміністратора'
                : 'Site Admin Sign In'
              : isUk
              ? 'Перше Налаштування Адміна'
              : 'Initial Admin Setup'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {config.hasAdminPassword
              ? isUk
                ? 'Введіть пароль адміністратора (ADMIN_PASSWORD), щоб керувати ID ліги, LLM API та генератором газети.'
                : 'Enter your admin password to manage the Sleeper League ID, LLM API configuration, and Newsletter Studio.'
              : isUk
              ? 'Пароль ADMIN_PASSWORD ще не задано у .env. Встановіть пароль адміністратора зараз для захисту налаштувань.'
              : 'No ADMIN_PASSWORD is set in .env yet. Create an admin password below to unlock and protect site configuration.'}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {config.hasAdminPassword
                ? isUk
                  ? 'Пароль Адміністратора'
                  : 'Admin Password'
                : isUk
                ? 'Створіть Пароль Адміністратора'
                : 'Create Admin Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
            />
          </div>

          {authError && (
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/50 border border-rose-500/30 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            <span>
              {config.hasAdminPassword
                ? isUk
                  ? 'Увійти'
                  : 'Unlock Admin Panel'
                : isUk
                ? 'Зберегти Пароль та Увійти'
                : 'Set Password & Unlock'}
            </span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="glass-panel p-6 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold font-heading text-white">
                {isUk ? 'Панель Адміністратора' : 'Site Admin & Configuration'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Database className="w-3 h-3" />
                {config.storageBackend === 'cloudflare-kv'
                  ? 'Cloudflare KV'
                  : isUk
                  ? 'Локальна Пам’ять + .env'
                  : 'Runtime Memory + .env'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {isUk
                ? 'Керуйте ID ліги Sleeper, ключами LLM API та генерацією щотижневої газети.'
                : 'Configure your Sleeper League ID, LLM API provider, and Newsletter generator settings.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Link
            href={`/${locale}/newsletter`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500/15 border border-orange-500/40 text-orange-300 hover:bg-orange-500/25 text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isUk ? 'Студія Газети' : 'Newsletter Studio'}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isUk ? 'Вийти' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {saveFeedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
            saveFeedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
          }`}
        >
          {saveFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{saveFeedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="space-y-8">
        {/* Section 1: Sleeper League Configuration */}
        <section className="glass-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-400"></div>
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-extrabold font-heading text-white">
                {isUk ? '1. Налаштування Ліги Sleeper' : '1. Sleeper League Settings'}
              </h2>
              <p className="text-xs text-slate-400">
                {isUk
                  ? 'Підключіть будь-яку фентезі-лігу Sleeper за її числовим ID.'
                  : 'Connect any Sleeper fantasy football league by entering its numeric League ID.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Sleeper League ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  placeholder="e.g. 1125211995400511488"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={handleVerifyLeague}
                  disabled={verifyingLeague || !leagueId.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-50 transition-colors"
                >
                  {verifyingLeague ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>{isUk ? 'Перевірити' : 'Verify ID'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {isUk
                  ? 'Знаходиться в URL вашої ліги у браузері: sleeper.com/leagues/<LEAGUE_ID>'
                  : 'Found in your Sleeper league URL: sleeper.com/leagues/<LEAGUE_ID>'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {isUk
                  ? 'Назва Дашборду (Опціонально)'
                  : 'Custom Dashboard Title (Optional)'}
              </label>
              <input
                type="text"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder={
                  isUk
                    ? 'За замовчуванням: Аналітика Ліги'
                    : 'Default: League Analytics'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                {isUk
                  ? 'Відображається у верхньому меню та заголовку вкладки.'
                  : 'Displayed in the top navigation bar and page title.'}
              </p>
            </div>
          </div>

          {leagueVerifyError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{leagueVerifyError}</span>
            </div>
          )}

          {leaguePreview && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-sm">
                    {leaguePreview.name}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {leaguePreview.season}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {leaguePreview.totalRosters}{' '}
                  {isUk ? 'команд' : 'teams'} • Status: {leaguePreview.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLeagueName(leaguePreview.name)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors self-start sm:self-center"
              >
                {isUk
                  ? 'Використати назву для заголовка'
                  : 'Use League Name as Site Title'}
              </button>
            </div>
          )}
        </section>

        {/* Section 2: LLM API Configuration */}
        <section className="glass-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-lg font-extrabold font-heading text-white">
                  {isUk ? '2. Налаштування LLM API' : '2. LLM API Configuration'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isUk
                    ? 'Оберіть AI-провайдера, модель та API-ключ для генерації щотижневих випусків.'
                    : 'Select your AI provider, model, and API key for automated newsletter generation.'}
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                config.hasApiKey
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              {config.apiKeySource === 'custom'
                ? isUk
                  ? `Ключ: Власний (${config.maskedApiKey})`
                  : `API Key: Custom (${config.maskedApiKey})`
                : config.apiKeySource === 'env'
                ? isUk
                  ? `Ключ: З .env (${config.maskedApiKey})`
                  : `API Key: From .env (${config.maskedApiKey})`
                : isUk
                ? 'API Ключ Не Встановлено'
                : 'No API Key Configured'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {isUk ? 'LLM Провайдер' : 'LLM Provider'}
              </label>
              <select
                value={llmProvider}
                onChange={(e) => {
                  const nextProvider = e.target.value as LLMProvider;
                  setLlmProvider(nextProvider);
                  setLlmModel(MODEL_PRESETS[nextProvider][0]);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm"
              >
                <option value="google">Google Gemini (@ai-sdk/google)</option>
                <option value="openai">OpenAI (GPT-4o / o3-mini)</option>
                <option value="anthropic">Anthropic (Claude 3.5)</option>
                <option value="openrouter">
                  OpenRouter / Custom OpenAI-Compatible
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {isUk ? 'Назва Моделі' : 'Model ID'}
              </label>
              <input
                type="text"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                placeholder="e.g. gemini-2.5-flash"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {MODEL_PRESETS[llmProvider].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLlmModel(preset)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                      llmModel === preset
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {isUk ? 'Новий API Ключ (Зберігається на сервері)' : 'API Key (Stored Server-Side Only)'}
              </label>
              <input
                type="password"
                value={llmApiKey}
                onChange={(e) => {
                  setLlmApiKey(e.target.value);
                  if (e.target.value) setClearApiKey(false);
                }}
                placeholder={
                  config.hasApiKey
                    ? isUk
                      ? `Залиште порожнім, щоб зберегти поточний (${config.maskedApiKey})`
                      : `Leave blank to keep existing (${config.maskedApiKey})`
                    : isUk
                    ? 'Вставте ваш API ключ...'
                    : 'Paste your API key...'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
              />
              {config.apiKeySource === 'custom' && (
                <label className="inline-flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clearApiKey}
                    onChange={(e) => setClearApiKey(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900"
                  />
                  <span>
                    {isUk
                      ? 'Видалити власний ключ (повернутися до .env)'
                      : 'Clear custom API key (fall back to .env)'}
                  </span>
                </label>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {isUk
                  ? 'Кастомний Base URL (Опціонально)'
                  : 'Custom Base URL (Optional)'}
              </label>
              <input
                type="text"
                value={llmBaseUrl}
                onChange={(e) => setLlmBaseUrl(e.target.value)}
                placeholder={
                  llmProvider === 'openrouter'
                    ? 'https://openrouter.ai/api/v1'
                    : 'Default provider endpoint'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                {isUk
                  ? 'Використовуйте для проксі, Groq, Ollama або кастомних OpenAI-сумісних шлюзів.'
                  : 'Use for custom OpenAI-compatible gateways, proxies, Groq, or local endpoints.'}
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Newsletter Feature & Customization */}
        <section className="glass-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-400"></div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Newspaper className="w-5 h-5 text-orange-400" />
              <div>
                <h2 className="text-lg font-extrabold font-heading text-white">
                  {isUk
                    ? '3. Генератор Щотижневої Газети'
                    : '3. Newsletter Feature & AI Persona'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isUk
                    ? 'Увімкніть або вимкніть розділ новин та налаштуйте стиль і промпт вашої газети.'
                    : 'Enable or disable the newsletter feature and customize the newspaper masthead & AI writer prompt.'}
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-3 cursor-pointer bg-slate-900/90 px-4 py-2 rounded-xl border border-white/10">
              <input
                type="checkbox"
                checked={newsletterEnabled}
                onChange={(e) => setNewsletterEnabled(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded"
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {newsletterEnabled
                  ? isUk
                    ? 'Газету Увімкнено'
                  : 'Newsletter Enabled'
                  : isUk
                  ? 'Газету Вимкнено'
                  : 'Newsletter Disabled'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {isUk
                  ? 'Кастомна Назва Газети (Опціонально)'
                  : 'Custom Newspaper Masthead (Optional)'}
              </label>
              <input
                type="text"
                value={newsletterTitle}
                onChange={(e) => setNewsletterTitle(e.target.value)}
                placeholder={
                  isUk ? 'Напр. ВІСНИК ГОРІННЯ' : 'e.g. THE SUNDAY ROAST'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {isUk
                  ? 'Підзаголовок Газети (Опціонально)'
                  : 'Custom Subtitle (Optional)'}
              </label>
              <input
                type="text"
                value={newsletterSubtitle}
                onChange={(e) => setNewsletterSubtitle(e.target.value)}
                placeholder={
                  isUk
                    ? 'Тому що фентезі — це біль...'
                    : 'Because fantasy is pain, and we are all suffering.'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-400 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                {isUk
                  ? 'Персона та Інструкції для AI-Автора'
                  : 'AI Writer Persona & Theme Instructions'}
              </label>
              <button
                type="button"
                onClick={() => setNewsletterPersona(DEFAULT_NEWSLETTER_PERSONA)}
                className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>
                  {isUk ? 'Скинути за замовчуванням' : 'Reset to Default'}
                </span>
              </button>
            </div>
            <textarea
              rows={5}
              value={newsletterPersona}
              onChange={(e) => setNewsletterPersona(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-400 text-xs sm:text-sm font-mono leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              {isUk
                ? 'Цей системний промпт визначає характер, гумор та акценти автора при генерації кожного випуску.'
                : 'This prompt defines the tone, humor, and inside jokes used when generating weekly recaps.'}
            </p>
          </div>

          {/* Published Archives Management */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isUk
                  ? 'Опубліковані Випуски в Архіві'
                  : 'Published Newsletter Editions'}
              </h3>
              {archives.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {archives.map((w) => (
                    <div
                      key={w}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
                    >
                      <span>
                        {isUk ? 'Тиж' : 'Wk'} {w}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteArchive(w)}
                        title={isUk ? 'Видалити випуск' : 'Delete edition'}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  {isUk
                    ? 'В архіві KV ще немає збережених випусків для цієї ліги.'
                    : 'No KV-archived editions saved yet for this League ID.'}
                </p>
              )}
            </div>

            <Link
              href={`/${locale}/newsletter`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-colors self-start sm:self-center shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isUk
                  ? 'Відкрити Генератор Газети'
                  : 'Open Newsletter Generator'}
              </span>
            </Link>
          </div>
        </section>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-extrabold text-sm hover:opacity-95 transition-opacity shadow-[0_0_25px_rgba(52,211,153,0.3)] flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {saving
                ? isUk
                  ? 'Збереження...'
                  : 'Saving...'
                : isUk
                ? 'Зберегти Всі Налаштування'
                : 'Save All Settings'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

