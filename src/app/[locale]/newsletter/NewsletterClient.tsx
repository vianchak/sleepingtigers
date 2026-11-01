'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Loader2,
  Flame,
  FlameKindling,
  AlertTriangle,
  Save,
  ArchiveRestore,
  Image as ImageIcon,
  Settings,
  Lock,
  Pencil,
  Check,
  RefreshCw,
  Newspaper,
  Tv,
  Trophy,
  Skull,
  Zap,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
  Printer,
  Sparkles,
  Repeat,
  Swords,
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useTranslation } from '@/lib/i18n/client';
import { useParams } from 'next/navigation';
import type {
  NewsletterMeta,
  MatchupTelemetry,
  TeamStandingTelemetry,
} from '@/lib/newsletter-telemetry';

type VisualTheme = 'paper' | 'broadcast';
type RerollSection = 'leadStory' | 'matchups' | 'awards' | 'powerRankings' | 'extras';

function ManagerAvatar({
  avatarUrl,
  name,
  size = 36,
  highlight = false,
  dimmed = false,
}: {
  avatarUrl?: string | null;
  name: string;
  size?: number;
  highlight?: boolean;
  dimmed?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const initials = (name || 'TM').slice(0, 2).toUpperCase();

  if (!avatarUrl || failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-full bg-orange-500/20 border flex items-center justify-center font-mono font-black text-xs shrink-0 ${
          highlight
            ? 'border-emerald-500 text-emerald-600'
            : 'border-current/20 opacity-80'
        }`}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className={`rounded-full object-cover shrink-0 ${
        highlight
          ? 'border-2 border-emerald-500'
          : dimmed
          ? 'border border-slate-500/40 opacity-80'
          : 'border border-current/20'
      }`}
    />
  );
}

export default function NewsletterClient({
  leagueId,
  currentWeek,
  initialArchives,
  readOnly = false,
  isAdmin = false,
  customTitle = '',
  customSubtitle = '',
}: {
  leagueId: string;
  currentWeek: number;
  initialArchives: number[];
  readOnly?: boolean;
  isAdmin?: boolean;
  customTitle?: string;
  customSubtitle?: string;
}) {
  const params = useParams();
  const locale = params.locale as string;
  const isUk = locale === 'uk';
  const t = useTranslation('NewsletterClient');

  const [week, setWeek] = useState(currentWeek > 0 ? currentWeek : 1);
  const [loading, setLoading] = useState(false);
  const [rerollingSection, setRerollingSection] = useState<RerollSection | null>(null);
  const [newsletter, setNewsletter] = useState<any>(null);

  const [archives, setArchives] = useState<number[]>(initialArchives || []);
  const [isSaved, setIsSaved] = useState(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  // Editorial & Theme states
  const [theme, setTheme] = useState<VisualTheme>('paper');
  const [editMode, setEditMode] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [commissionerNotes, setCommissionerNotes] = useState('');

  // Fetch legacy static archives and merge with KV/localStorage archives
  useEffect(() => {
    if (!leagueId) return;
    fetch(`/api/newsletter/save?leagueId=${encodeURIComponent(leagueId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.archives)) {
          setArchives((prev) =>
            Array.from(new Set([...prev, ...data.archives])).sort((a, b) => b - a)
          );
        }
      })
      .catch(() => {});

    fetch(`/newsletters/${leagueId}/index.json`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArchives((prev) =>
            Array.from(new Set([...prev, ...data])).sort((a, b) => b - a)
          );
        }
      })
      .catch(() => {});
  }, [leagueId]);

  // If in readOnly mode (News page) and no newsletter is loaded, auto-load the latest one once archives are available
  useEffect(() => {
    if (readOnly && !newsletter && archives.length > 0) {
      handleLoadArchive(Math.max(...archives));
    }
  }, [readOnly, newsletter, archives]);

  // Hydrate deterministic telemetry if a loaded legacy archive lacks `meta`
  const hydrateMetaIfMissing = async (loadedData: any, targetWeek: number) => {
    if (loadedData?.meta?.matchups && loadedData?.meta?.standings) {
      return loadedData;
    }
    try {
      const res = await fetch(
        `/api/newsletter?leagueId=${encodeURIComponent(leagueId)}&week=${targetWeek}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.meta) {
          return { ...loadedData, meta: json.meta };
        }
      }
    } catch (e) {
      console.warn('Failed to hydrate telemetry for archive:', e);
    }
    return loadedData;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setIsSaved(false);
    setHasUnsavedEdits(false);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId,
          week,
          locale,
          commissionerNotes: commissionerNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate newsletter');
      }

      setNewsletter(data);
    } catch (error) {
      console.error('Failed to generate newsletter:', error);
      alert(
        `Failed to generate newsletter. Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRerollSection = async (section: RerollSection) => {
    if (!newsletter) return;
    setRerollingSection(section);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId,
          week,
          locale,
          commissionerNotes:
            newsletter.commissionerNotes || commissionerNotes.trim() || undefined,
          regenerateSection: section,
        }),
      });

      const fresh = await res.json();
      if (!res.ok) {
        throw new Error(fresh.error || 'Failed to regenerate section');
      }

      setNewsletter((prev: any) => {
        if (!prev) return fresh;
        const next = { ...prev, meta: fresh.meta || prev.meta };
        if (section === 'leadStory') next.leadStory = fresh.leadStory;
        if (section === 'matchups') next.matchups = fresh.matchups;
        if (section === 'awards') next.awards = fresh.awards;
        if (section === 'powerRankings') next.powerRankings = fresh.powerRankings;
        if (section === 'extras') {
          next.nextVictim = fresh.nextVictim;
          next.horoscope = fresh.horoscope;
          next.anecdote = fresh.anecdote;
        }
        return next;
      });
      setIsSaved(false);
      setHasUnsavedEdits(true);
    } catch (error) {
      console.error('Failed to re-roll section:', error);
      alert(
        `Failed to re-roll section: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setRerollingSection(null);
    }
  };

  const handleLoadArchive = async (archiveWeek: number) => {
    setLoading(true);
    setWeek(archiveWeek);
    setEditMode(false);
    setHasUnsavedEdits(false);
    try {
      let data = null;
      try {
        const res = await fetch(
          `/api/newsletter/save?leagueId=${encodeURIComponent(leagueId)}&week=${archiveWeek}`
        );
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            data = resData.data;
          }
        }
      } catch (err) {
        console.warn('Save isolate fetch failed, falling back', err);
      }

      if (!data) {
        try {
          const res = await fetch(
            `/api/newsletter/archive?leagueId=${encodeURIComponent(leagueId)}&week=${archiveWeek}`
          );
          if (res.ok) {
            const resData = await res.json();
            if (resData.success) {
              data = resData.data;
            }
          }
        } catch (err) {
          console.warn('KV fetch failed, falling back to static files', err);
        }
      }

      if (!data) {
        const res = await fetch(`/newsletters/${leagueId}/week-${archiveWeek}.json`);
        if (res.ok) {
          data = await res.json();
        }
      }

      if (data) {
        const hydrated = await hydrateMetaIfMissing(data, archiveWeek);
        setNewsletter(hydrated);
        if (hydrated.commissionerNotes) {
          setCommissionerNotes(hydrated.commissionerNotes);
        }
        setIsSaved(true);
      } else {
        alert('Archive not found!');
      }
    } catch (error) {
      console.error('Failed to load archive:', error);
      alert('Failed to load archive.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!newsletter) return;
    setSaving(true);
    try {
      const payload = {
        ...newsletter,
        ...(commissionerNotes.trim()
          ? { commissionerNotes: commissionerNotes.trim() }
          : {}),
      };
      const res = await fetch('/api/newsletter/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, week, data: payload }),
      });
      const resData = await res.json();

      if (resData.success) {
        setIsSaved(true);
        setHasUnsavedEdits(false);
        setEditMode(false);
        if (!archives.includes(week)) {
          setArchives([...archives, week].sort((a, b) => b - a));
        }
      } else {
        alert('Failed to save: ' + resData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save archive');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadImage = async () => {
    const newsletterEl = document.getElementById('newsletter-content');
    if (!newsletterEl) return;

    setDownloadingImage(true);
    try {
      const bg = theme === 'broadcast' ? '#0b1120' : '#fbf7f0';
      const dataUrl = await htmlToImage.toJpeg(newsletterEl, {
        quality: 0.95,
        backgroundColor: bg,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `newsletter-week-${week}-${theme}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to generate image.');
    } finally {
      setDownloadingImage(false);
    }
  };

  // Helper to update nested newsletter fields during Inline Edit Mode
  const markEdited = (updater: (prev: any) => any) => {
    setNewsletter((prev: any) => updater(prev));
    setIsSaved(false);
    setHasUnsavedEdits(true);
  };

  if (!readOnly && !isAdmin) {
    return (
      <div className="max-w-lg mx-auto my-16 glass-panel p-8 border border-orange-500/30 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold font-heading text-white">
          {isUk ? 'Доступ Тільки для Адміністратора' : 'Admin Access Required'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isUk
            ? 'Генерація та публікація нових випусків газети доступна лише адміністратору ліги.'
            : 'Generating and publishing new AI newsletter editions requires Site Admin authentication.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href={`/${locale}/admin`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
          >
            <Settings className="w-4 h-4" />
            <span>{isUk ? 'Увійти як Адмін' : 'Admin Sign In'}</span>
          </Link>
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider"
          >
            <span>{isUk ? 'Читати Архів' : 'Read Archives'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const meta: NewsletterMeta | undefined = newsletter?.meta;
  const isPaper = theme === 'paper';

  // Helper to match AI matchup item to telemetry
  const findMatchupTelemetry = (m: any, idx: number): MatchupTelemetry | undefined => {
    if (!meta?.matchups?.length) return undefined;
    const byNames = meta.matchups.find(
      (tm) =>
        (tm.teamA === m.teamA && tm.teamB === m.teamB) ||
        (tm.teamA === m.teamB && tm.teamB === m.teamA)
    );
    return byNames || meta.matchups[idx];
  };

  // Helper to match AI power ranking item to telemetry
  const findStandingTelemetry = (teamName: string, rank: number): TeamStandingTelemetry | undefined => {
    if (!meta?.standings?.length) return undefined;
    const lower = (teamName || '').toLowerCase().trim();
    return (
      meta.standings.find((s) => s.team.toLowerCase().trim() === lower) ||
      meta.standings.find(
        (s) =>
          lower.includes(s.team.toLowerCase()) || s.team.toLowerCase().includes(lower)
      ) ||
      meta.standings[rank - 1]
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Studio / Reader Top Command Bar */}
      <div className="glass-panel p-5 sm:p-6 border border-orange-500/30 relative overflow-hidden print:hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-400" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 shadow-[0_0_25px_rgba(249,115,22,0.2)]">
              <Flame className="h-6 w-6 text-orange-400 fill-orange-500/40" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-white uppercase tracking-tight">
                  {customTitle || t('title')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-orange-500/15 text-orange-300 border border-orange-500/30">
                  {readOnly
                    ? isUk
                      ? 'Читацький Зал'
                      : 'Press Archive'
                    : isUk
                    ? 'AI Редакція'
                    : 'AI Editorial Studio'}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                {customSubtitle || t('subtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            {readOnly && isAdmin && (
              <Link
                href={`/${locale}/newsletter`}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 hover:opacity-95 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-orange-500/10"
              >
                <FlameKindling className="h-4 w-4" />
                <span>{isUk ? 'Студія Генерації' : 'Editorial Studio'}</span>
              </Link>
            )}

            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={() => setShowNotesDrawer((v) => !v)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    showNotesDrawer || commissionerNotes.trim()
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900/90 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                  }`}
                >
                  <MessageSquarePlus className="h-4 w-4 text-amber-400" />
                  <span>{isUk ? 'Інсайди Тижня' : 'Insider Tea'}</span>
                  {commissionerNotes.trim() && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                  {showNotesDrawer ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                <Link
                  href={`/${locale}/admin`}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Settings className="h-4 w-4 text-cyan-400" />
                  <span>{isUk ? 'AI Налаштування' : 'AI Settings'}</span>
                </Link>

                <div className="flex items-center">
                  <select
                    className="px-3.5 py-2.5 rounded-xl border border-orange-500/40 bg-slate-950 text-orange-300 font-bold text-xs uppercase tracking-wider focus:outline-none focus:border-orange-400 cursor-pointer"
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                  >
                    {[...Array(17)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {t('week')}
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FlameKindling className="h-4 w-4" />
                  )}
                  <span>{loading ? t('igniting') : t('lightTheFire')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Collapsible Commissioner's Weekly Storylines Drawer */}
        {!readOnly && showNotesDrawer && (
          <div className="mt-5 pt-5 border-t border-white/10 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {t('commissionerNotesTitle')}
              </label>
              <span className="text-[11px] text-slate-400">
                {isUk
                  ? 'Буде вплетено в сюжет при генерації та показано в блоці Комісіонера'
                  : 'Injected into the AI prompt & displayed in the Commissioner Desk callout'}
              </span>
            </div>
            <textarea
              rows={3}
              value={commissionerNotes}
              onChange={(e) => {
                setCommissionerNotes(e.target.value);
                if (newsletter) {
                  markEdited((prev) => ({
                    ...prev,
                    commissionerNotes: e.target.value,
                  }));
                }
              }}
              placeholder={t('commissionerNotesPlaceholder')}
              className="w-full p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs sm:text-sm leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Archives Edition Selector Bar */}
      {archives.length > 0 ? (
        <div className="glass-panel px-4 py-3 border border-white/10 flex flex-wrap items-center gap-2 print:hidden">
          <div className="text-slate-400 font-bold text-xs px-2.5 py-1 uppercase tracking-wider flex items-center gap-2 border-r border-white/10 mr-1">
            <ArchiveRestore className="w-4 h-4 text-orange-400" />
            <span>{t('editions')}</span>
          </div>
          {[...archives]
            .sort((a, b) => a - b)
            .map((w) => {
              const isActive = newsletter && week === w;
              return (
                <button
                  key={w}
                  onClick={() => handleLoadArchive(w)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.35)] scale-105'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/10'
                  }`}
                >
                  {t('week')}
                  {w}
                </button>
              );
            })}
        </div>
      ) : readOnly ? (
        <div className="glass-panel p-10 text-center space-y-4">
          <Flame className="w-10 h-10 text-orange-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">
            {isUk ? 'Випусків ще немає' : 'No Newsletter Editions Published Yet'}
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {isUk
              ? 'Адміністратор ліги ще не опублікував жодного випуску газети за цей сезон.'
              : 'The league administrator has not published any weekly newsletter editions for this league yet.'}
          </p>
          {isAdmin && (
            <Link
              href={`/${locale}/newsletter`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs uppercase tracking-wider"
            >
              <FlameKindling className="w-4 h-4" />
              <span>
                {isUk ? 'Згенерувати Перший Випуск' : 'Generate First Edition'}
              </span>
            </Link>
          )}
        </div>
      ) : null}

      {/* Editorial Controls, Theme Switcher & Export Bar */}
      {newsletter && (
        <div className="glass-panel p-3.5 border border-white/10 flex flex-wrap items-center justify-between gap-3 print:hidden">
          {/* Theme Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setTheme('paper')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPaper
                  ? 'bg-amber-100 text-zinc-900 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>{t('themePaper')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('broadcast')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isPaper
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{t('themeBroadcast')}</span>
            </button>
          </div>

          {/* Right Controls: Edit, Publish, Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!readOnly && (
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                  editMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-900 text-slate-200 border-white/15 hover:border-amber-400/50 hover:text-amber-300'
                }`}
              >
                {editMode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('doneEditing')}</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{t('editMode')}</span>
                  </>
                )}
              </button>
            )}

            {!readOnly && (!isSaved || hasUnsavedEdits) && (
              <button
                onClick={handlePublish}
                disabled={saving}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:opacity-95 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/15"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>{t('publishToArchive')}</span>
                {hasUnsavedEdits && (
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-950/30 text-[10px]">
                    •
                  </span>
                )}
              </button>
            )}

            {!readOnly && isSaved && !hasUnsavedEdits && (
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{t('published')}</span>
              </span>
            )}

            <button
              onClick={handleDownloadImage}
              disabled={downloadingImage}
              className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {downloadingImage ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              <span>{t('saveAsImage')}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t('saveAsPdf')}</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          NEWSPAPER / BROADCAST EDITION CANVAS
         ===================================================================== */}
      {newsletter && (
        <div
          id="newsletter-content"
          className={` transition-colors duration-300 relative overflow-hidden shadow-2xl print:shadow-none ${
            isPaper
              ? 'bg-[#fbf7f0] text-zinc-900 border-4 border-zinc-900 p-6 sm:p-10 md:p-12'
              : 'bg-[#0b1120] text-slate-100 border-2 border-cyan-500/30 rounded-2xl p-6 sm:p-10 md:p-12'
          }`}
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          {/* Top Accent Ribbon */}
          <div
            className={`absolute top-0 left-0 w-full h-2.5 ${
              isPaper
                ? 'bg-gradient-to-r from-red-700 via-orange-600 to-amber-500'
                : 'bg-gradient-to-r from-cyan-500 via-orange-500 to-rose-500'
            }`}
          />

          {/* Masthead */}
          <header
            className={`text-center pb-6 mb-8 mt-2 border-b-4 ${
              isPaper ? 'border-zinc-900' : 'border-slate-800'
            }`}
          >
            <div
              className={`flex flex-wrap justify-between items-center text-[11px] font-mono font-bold uppercase tracking-widest pb-3 mb-4 border-b ${
                isPaper
                  ? 'border-zinc-400 text-zinc-600'
                  : 'border-slate-800 text-slate-400'
              }`}
            >
              <span>
                {t('vol')}
                {week} • ISSUE #{week}
              </span>
              <span
                className={`flex items-center gap-1.5 font-black ${
                  isPaper ? 'text-red-700' : 'text-orange-400'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                {t('officialReport')}
              </span>
              <span>{t('price')}</span>
            </div>

            <h2
              className={`text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-none ${
                isPaper ? 'text-zinc-900' : 'text-white'
              }`}
              style={{ fontFamily: isPaper ? 'Impact, Georgia, serif' : undefined }}
            >
              {customTitle ? (
                <span className={isPaper ? 'text-zinc-900' : 'text-white'}>
                  {customTitle}
                </span>
              ) : (
                <>
                  {t('herald')}{' '}
                  <span className={isPaper ? 'text-orange-600' : 'text-orange-400'}>
                    {t('burning')}
                  </span>
                </>
              )}
            </h2>

            {(customSubtitle || t('subtitle')) && (
              <p
                className={`mt-2.5 text-xs sm:text-sm italic font-serif max-w-2xl mx-auto ${
                  isPaper ? 'text-zinc-600' : 'text-slate-400'
                }`}
              >
                {customSubtitle || t('subtitle')}
              </p>
            )}

            {/* Front-Page Stat Pulse Strip (Above the Fold) */}
            {meta?.pulse && meta.pulse.highestScorer.team !== 'N/A' && (
              <div
                className={`grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t-2 text-left ${
                  isPaper ? 'border-zinc-900' : 'border-slate-800'
                }`}
              >
                {/* High Scorer */}
                <div
                  className={`p-3 rounded-lg border ${
                    isPaper
                      ? 'bg-[#f4ede1] border-zinc-300'
                      : 'bg-slate-900/90 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    <span className={isPaper ? 'text-emerald-800' : 'text-emerald-400'}>
                      {t('pulseHighScorer')}
                    </span>
                    <Trophy
                      className={`w-3.5 h-3.5 ${
                        isPaper ? 'text-emerald-700' : 'text-emerald-400'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <ManagerAvatar
                      avatarUrl={meta.pulse.highestScorer.avatarUrl}
                      name={meta.pulse.highestScorer.team}
                      size={28}
                      highlight
                    />
                    <div className="min-w-0">
                      <div className="font-black text-xs sm:text-sm truncate">
                        {meta.pulse.highestScorer.team}
                      </div>
                      <div
                        className={`text-xs font-mono font-bold ${
                          isPaper ? 'text-emerald-700' : 'text-emerald-400'
                        }`}
                      >
                        {meta.pulse.highestScorer.points.toFixed(2)} PTS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Low Scorer */}
                <div
                  className={`p-3 rounded-lg border ${
                    isPaper
                      ? 'bg-[#f4ede1] border-zinc-300'
                      : 'bg-slate-900/90 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    <span className={isPaper ? 'text-rose-800' : 'text-rose-400'}>
                      {t('pulseLowScorer')}
                    </span>
                    <Skull
                      className={`w-3.5 h-3.5 ${
                        isPaper ? 'text-rose-700' : 'text-rose-400'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <ManagerAvatar
                      avatarUrl={meta.pulse.lowestScorer.avatarUrl}
                      name={meta.pulse.lowestScorer.team}
                      size={28}
                    />
                    <div className="min-w-0">
                      <div className="font-black text-xs sm:text-sm truncate">
                        {meta.pulse.lowestScorer.team}
                      </div>
                      <div
                        className={`text-xs font-mono font-bold ${
                          isPaper ? 'text-rose-700' : 'text-rose-400'
                        }`}
                      >
                        {meta.pulse.lowestScorer.points.toFixed(2)} PTS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biggest Blowout */}
                <div
                  className={`p-3 rounded-lg border ${
                    isPaper
                      ? 'bg-[#f4ede1] border-zinc-300'
                      : 'bg-slate-900/90 border-orange-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    <span className={isPaper ? 'text-orange-800' : 'text-orange-400'}>
                      {t('pulseBlowout')}
                    </span>
                    <Zap
                      className={`w-3.5 h-3.5 ${
                        isPaper ? 'text-orange-700' : 'text-orange-400'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-xs sm:text-sm truncate">
                      {meta.pulse.biggestBlowout.winner} def.{' '}
                      {meta.pulse.biggestBlowout.loser}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold ${
                        isPaper ? 'text-orange-700' : 'text-orange-400'
                      }`}
                    >
                      +{meta.pulse.biggestBlowout.margin.toFixed(2)} PT MARGIN
                    </div>
                  </div>
                </div>

                {/* Closest Game */}
                <div
                  className={`p-3 rounded-lg border ${
                    isPaper
                      ? 'bg-[#f4ede1] border-zinc-300'
                      : 'bg-slate-900/90 border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                    <span className={isPaper ? 'text-cyan-900' : 'text-cyan-400'}>
                      {t('pulseClosest')}
                    </span>
                    <Scale
                      className={`w-3.5 h-3.5 ${
                        isPaper ? 'text-cyan-800' : 'text-cyan-400'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-xs sm:text-sm truncate">
                      {meta.pulse.closestGame.winner} edged{' '}
                      {meta.pulse.closestGame.loser}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold ${
                        isPaper ? 'text-cyan-800' : 'text-cyan-400'
                      }`}
                    >
                      BY {meta.pulse.closestGame.margin.toFixed(2)} PTS
                    </div>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Main 12-Column Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT 8 COLUMNS: Lead Story, Matchups, Extras */}
            <div className="lg:col-span-8 space-y-10">
              {/* 1. LEAD STORY */}
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                      isPaper
                        ? 'bg-zinc-900 text-amber-50'
                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    }`}
                  >
                    {isUk ? 'ГОЛОВНА ТЕМА ТИЖНЯ' : 'FRONT PAGE LEAD STORY'}
                  </span>

                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleRerollSection('leadStory')}
                      disabled={rerollingSection === 'leadStory'}
                      className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/40 flex items-center gap-1 hover:bg-orange-500/30 cursor-pointer print:hidden"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${
                          rerollingSection === 'leadStory' ? 'animate-spin' : ''
                        }`}
                      />
                      <span>
                        {rerollingSection === 'leadStory'
                          ? t('rerolling')
                          : t('rerollSection')}
                      </span>
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newsletter.leadStory.headline}
                      onChange={(e) =>
                        markEdited((prev) => ({
                          ...prev,
                          leadStory: { ...prev.leadStory, headline: e.target.value },
                        }))
                      }
                      className={`w-full p-3 rounded-lg border-2 font-black text-2xl uppercase ${
                        isPaper
                          ? 'bg-white border-orange-400 text-zinc-900'
                          : 'bg-slate-900 border-orange-500/50 text-white'
                      }`}
                    />
                    <textarea
                      rows={6}
                      value={newsletter.leadStory.content}
                      onChange={(e) =>
                        markEdited((prev) => ({
                          ...prev,
                          leadStory: { ...prev.leadStory, content: e.target.value },
                        }))
                      }
                      className={`w-full p-3 rounded-lg border-2 font-serif text-base leading-relaxed ${
                        isPaper
                          ? 'bg-white border-orange-400 text-zinc-900'
                          : 'bg-slate-900 border-orange-500/50 text-slate-100'
                      }`}
                    />
                  </div>
                ) : (
                  <>
                    <h3
                      className={`text-3xl sm:text-4xl font-black leading-tight uppercase tracking-tight ${
                        isPaper ? 'text-zinc-900' : 'text-white'
                      }`}
                    >
                      {newsletter.leadStory.headline}
                    </h3>
                    <div
                      className={`text-base sm:text-lg leading-relaxed font-serif whitespace-pre-line ${
                        isPaper
                          ? 'text-zinc-800 drop-cap'
                          : 'text-slate-300'
                      }`}
                    >
                      {newsletter.leadStory.content}
                    </div>
                  </>
                )}

                {/* Commissioner's Desk Callout Box (if notes provided) */}
                {(newsletter.commissionerNotes || commissionerNotes.trim()) && (
                  <div
                    className={`mt-5 p-4 rounded-xl border-l-4 ${
                      isPaper
                        ? 'bg-amber-100/70 border-amber-700 text-zinc-900'
                        : 'bg-amber-500/10 border-amber-400 text-amber-100'
                    }`}
                  >
                    <div className="text-xs font-mono font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('commissionerDesk')}</span>
                    </div>
                    {editMode ? (
                      <textarea
                        rows={2}
                        value={newsletter.commissionerNotes ?? commissionerNotes}
                        onChange={(e) => {
                          setCommissionerNotes(e.target.value);
                          markEdited((prev) => ({
                            ...prev,
                            commissionerNotes: e.target.value,
                          }));
                        }}
                        className={`w-full p-2 rounded border text-sm font-serif ${
                          isPaper
                            ? 'bg-white border-amber-400 text-zinc-900'
                            : 'bg-slate-900 border-amber-500/40 text-white'
                        }`}
                      />
                    ) : (
                      <p className="text-sm sm:text-base font-serif italic leading-relaxed">
                        {newsletter.commissionerNotes || commissionerNotes}
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* 2. MATCHUP SCORECARDS ("DUMPSTER FIRES") */}
              <section
                className={`border-t-4 pt-8 ${
                  isPaper ? 'border-zinc-900' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
                  <h3
                    className={`text-2xl font-black flex items-center gap-2.5 uppercase tracking-wide ${
                      isPaper ? 'text-zinc-900' : 'text-white'
                    }`}
                  >
                    <FlameKindling
                      className={`h-6 w-6 ${
                        isPaper ? 'text-orange-600' : 'text-orange-400'
                      }`}
                    />
                    <span>
                      {t('week')}
                      {week} {t('dumpsterFires')}
                    </span>
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleRerollSection('matchups')}
                      disabled={rerollingSection === 'matchups'}
                      className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/40 flex items-center gap-1 hover:bg-orange-500/30 cursor-pointer print:hidden"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${
                          rerollingSection === 'matchups' ? 'animate-spin' : ''
                        }`}
                      />
                      <span>
                        {rerollingSection === 'matchups'
                          ? t('rerolling')
                          : t('rerollSection')}
                      </span>
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {newsletter.matchups.map((m: any, i: number) => {
                    const tm = findMatchupTelemetry(m, i);
                    const totalPts = tm ? tm.scoreA + tm.scoreB : 0;
                    const pctA =
                      tm && totalPts > 0
                        ? Math.round((tm.scoreA / totalPts) * 100)
                        : 50;
                    const aWon = tm ? tm.scoreA >= tm.scoreB : true;

                    return (
                      <div
                        key={i}
                        className={`rounded-xl border-2 overflow-hidden transition-all ${
                          isPaper
                            ? 'bg-[#f5efe4] border-zinc-800 shadow-sm'
                            : 'bg-slate-900/90 border-slate-800'
                        }`}
                      >
                        {/* Broadcast Matchup Header */}
                        {tm ? (
                          <div
                            className={`p-4 border-b ${
                              isPaper
                                ? 'bg-[#ebe2d3] border-zinc-300'
                                : 'bg-slate-950/80 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              {/* Team A */}
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <ManagerAvatar
                                  avatarUrl={tm.teamAAvatar}
                                  name={tm.teamA}
                                  size={36}
                                  highlight={aWon}
                                  dimmed={!aWon}
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-black text-sm sm:text-base truncate">
                                      {tm.teamA}
                                    </span>
                                    {aWon && (
                                      <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                                        W
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className={`text-[11px] font-mono ${
                                      isPaper ? 'text-zinc-600' : 'text-slate-400'
                                    }`}
                                  >
                                    {tm.teamARecord} • {t('benchLeft')}:{' '}
                                    {tm.benchPointsA.toFixed(1)}
                                  </div>
                                </div>
                              </div>

                              {/* Center Score Pill */}
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-black text-base sm:text-lg shrink-0 bg-zinc-900 text-white">
                                <span
                                  className={
                                    aWon ? 'text-emerald-400' : 'text-slate-400'
                                  }
                                >
                                  {tm.scoreA.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500">-</span>
                                <span
                                  className={
                                    !aWon ? 'text-emerald-400' : 'text-slate-400'
                                  }
                                >
                                  {tm.scoreB.toFixed(2)}
                                </span>
                              </div>

                              {/* Team B */}
                              <div className="flex items-center justify-end gap-2.5 min-w-0 flex-1 text-right">
                                <div className="min-w-0">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {!aWon && (
                                      <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                                        W
                                      </span>
                                    )}
                                    <span className="font-black text-sm sm:text-base truncate">
                                      {tm.teamB}
                                    </span>
                                  </div>
                                  <div
                                    className={`text-[11px] font-mono ${
                                      isPaper ? 'text-zinc-600' : 'text-slate-400'
                                    }`}
                                  >
                                    {tm.teamBRecord} • {t('benchLeft')}:{' '}
                                    {tm.benchPointsB.toFixed(1)}
                                  </div>
                                </div>
                                <ManagerAvatar
                                  avatarUrl={tm.teamBAvatar}
                                  name={tm.teamB}
                                  size={36}
                                  highlight={!aWon}
                                  dimmed={aWon}
                                />
                              </div>
                            </div>

                            {/* Proportional Score Bar */}
                            <div className="w-full h-1.5 rounded-full overflow-hidden flex mt-3 bg-zinc-400/30">
                              <div
                                style={{ width: `${pctA}%` }}
                                className={
                                  aWon ? 'bg-emerald-500' : 'bg-orange-500/70'
                                }
                              />
                              <div
                                style={{ width: `${100 - pctA}%` }}
                                className={
                                  !aWon ? 'bg-emerald-500' : 'bg-orange-500/70'
                                }
                              />
                            </div>

                            {/* MVP / Bench Blunder Mini Telemetry Pills */}
                            {(tm.mvpStarterA?.isNamed ||
                              tm.mvpStarterB?.isNamed ||
                              tm.whatIfFlip) && (
                              <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-current/10 text-[11px] font-mono">
                                {tm.mvpStarterA?.isNamed && (
                                  <span
                                    className={
                                      isPaper ? 'text-zinc-700' : 'text-slate-300'
                                    }
                                  >
                                    ★ {tm.mvpStarterA.name} ({tm.mvpStarterA.points})
                                  </span>
                                )}
                                {tm.mvpStarterB?.isNamed && (
                                  <span
                                    className={
                                      isPaper ? 'text-zinc-700' : 'text-slate-300'
                                    }
                                  >
                                    ★ {tm.mvpStarterB.name} ({tm.mvpStarterB.points})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`px-5 py-3 font-black text-lg border-b uppercase tracking-tight ${
                              isPaper
                                ? 'bg-orange-100 border-orange-300 text-zinc-900'
                                : 'bg-slate-950 border-slate-800 text-orange-300'
                            }`}
                          >
                            {m.scoreText}
                          </div>
                        )}

                        {/* Matchup Narrative Body */}
                        <div className="p-5">
                          {editMode ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={m.scoreText}
                                onChange={(e) =>
                                  markEdited((prev) => {
                                    const list = [...prev.matchups];
                                    list[i] = {
                                      ...list[i],
                                      scoreText: e.target.value,
                                    };
                                    return { ...prev, matchups: list };
                                  })
                                }
                                className={`w-full p-2 rounded border font-mono text-xs font-bold ${
                                  isPaper
                                    ? 'bg-white border-zinc-400 text-zinc-900'
                                    : 'bg-slate-950 border-slate-700 text-white'
                                }`}
                              />
                              <textarea
                                rows={3}
                                value={m.recap}
                                onChange={(e) =>
                                  markEdited((prev) => {
                                    const list = [...prev.matchups];
                                    list[i] = { ...list[i], recap: e.target.value };
                                    return { ...prev, matchups: list };
                                  })
                                }
                                className={`w-full p-2.5 rounded border font-serif text-sm leading-relaxed ${
                                  isPaper
                                    ? 'bg-white border-zinc-400 text-zinc-900'
                                    : 'bg-slate-950 border-slate-700 text-slate-100'
                                }`}
                              />
                            </div>
                          ) : (
                            <p
                              className={`font-serif leading-relaxed text-base ${
                                isPaper ? 'text-zinc-800' : 'text-slate-300'
                              }`}
                            >
                              {m.recap}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 3. EXTRAS: NEXT VICTIM + UPCOMING SLATE, HOROSCOPE, ANECDOTE */}
              {(newsletter.nextVictim ||
                newsletter.horoscope ||
                newsletter.anecdote) && (
                <section
                  className={`border-t-4 pt-8 space-y-6 ${
                    isPaper ? 'border-zinc-900' : 'border-slate-800'
                  }`}
                >
                  {editMode && (
                    <div className="flex justify-end print:hidden">
                      <button
                        type="button"
                        onClick={() => handleRerollSection('extras')}
                        disabled={rerollingSection === 'extras'}
                        className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/40 flex items-center gap-1 hover:bg-orange-500/30 cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${
                            rerollingSection === 'extras' ? 'animate-spin' : ''
                          }`}
                        />
                        <span>
                          {rerollingSection === 'extras'
                            ? t('rerolling')
                            : t('rerollSection')}
                        </span>
                      </button>
                    </div>
                  )}

                  {newsletter.nextVictim && (
                    <div
                      className={`p-6 rounded-xl border-l-4 ${
                        isPaper
                          ? 'bg-red-50/90 border-red-700 text-zinc-900'
                          : 'bg-rose-950/25 border-rose-500 text-slate-100'
                      }`}
                    >
                      <h3 className="text-xl font-black mb-2.5 uppercase tracking-wide flex items-center gap-2">
                        <Swords
                          className={`w-5 h-5 ${
                            isPaper ? 'text-red-700' : 'text-rose-400'
                          }`}
                        />
                        <span>{t('nextVictim')}</span>
                      </h3>
                      {editMode ? (
                        <textarea
                          rows={3}
                          value={newsletter.nextVictim}
                          onChange={(e) =>
                            markEdited((prev) => ({
                              ...prev,
                              nextVictim: e.target.value,
                            }))
                          }
                          className={`w-full p-2.5 rounded border font-serif text-sm ${
                            isPaper
                              ? 'bg-white border-red-300 text-zinc-900'
                              : 'bg-slate-900 border-rose-500/40 text-white'
                          }`}
                        />
                      ) : (
                        <p className="font-serif text-base sm:text-lg leading-relaxed">
                          {newsletter.nextVictim}
                        </p>
                      )}

                      {/* Mini Next Week Matchup Pills */}
                      {meta?.nextWeekMatchups && meta.nextWeekMatchups.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-current/10">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-75 mb-2">
                            {t('upcomingSlate')} ({t('week')}
                            {week + 1})
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {meta.nextWeekMatchups.map((nm) => (
                              <div
                                key={nm.matchupId}
                                className={`px-3 py-1.5 rounded text-xs font-mono flex items-center justify-between ${
                                  isPaper
                                    ? 'bg-white/80 border border-red-200 text-zinc-800'
                                    : 'bg-slate-900/80 border border-white/10 text-slate-300'
                                }`}
                              >
                                <span className="font-bold truncate">
                                  {nm.teamA} ({nm.teamARecord})
                                </span>
                                <span className="px-1.5 text-[10px] opacity-60">
                                  VS
                                </span>
                                <span className="font-bold truncate text-right">
                                  {nm.teamB} ({nm.teamBRecord})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {newsletter.horoscope && (
                      <div
                        className={`p-5 rounded-xl border ${
                          isPaper
                            ? 'bg-[#f4ede1] border-zinc-400'
                            : 'bg-slate-900/70 border-purple-500/30'
                        }`}
                      >
                        <h3 className="text-lg font-black mb-2 uppercase tracking-wide">
                          {t('horoscope')}
                        </h3>
                        {editMode ? (
                          <textarea
                            rows={4}
                            value={newsletter.horoscope}
                            onChange={(e) =>
                              markEdited((prev) => ({
                                ...prev,
                                horoscope: e.target.value,
                              }))
                            }
                            className={`w-full p-2 rounded border font-serif text-sm ${
                              isPaper
                                ? 'bg-white border-zinc-400 text-zinc-900'
                                : 'bg-slate-950 border-slate-700 text-white'
                            }`}
                          />
                        ) : (
                          <p className="font-serif text-sm sm:text-base italic leading-relaxed opacity-90">
                            {newsletter.horoscope}
                          </p>
                        )}
                      </div>
                    )}

                    {newsletter.anecdote && (
                      <div
                        className={`p-5 rounded-xl border ${
                          isPaper
                            ? 'bg-zinc-200/70 border-zinc-400'
                            : 'bg-slate-900/70 border-slate-700'
                        }`}
                      >
                        <h3 className="text-lg font-black mb-2 uppercase tracking-wide">
                          {t('anecdote')}
                        </h3>
                        {editMode ? (
                          <textarea
                            rows={4}
                            value={newsletter.anecdote}
                            onChange={(e) =>
                              markEdited((prev) => ({
                                ...prev,
                                anecdote: e.target.value,
                              }))
                            }
                            className={`w-full p-2 rounded border font-serif text-sm ${
                              isPaper
                                ? 'bg-white border-zinc-400 text-zinc-900'
                                : 'bg-slate-950 border-slate-700 text-white'
                            }`}
                          />
                        ) : (
                          <p className="font-serif text-sm sm:text-base leading-relaxed">
                            &ldquo;{newsletter.anecdote}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT 4 COLUMNS: Tragedy Awards, Power Rankings, Waiver Wire */}
            <aside
              className={`lg:col-span-4 space-y-8 border-l-0 lg:border-l-4 lg:pl-8 ${
                isPaper ? 'border-zinc-900' : 'border-slate-800'
              }`}
            >
              {/* 1. TRAGEDY AWARDS */}
              <div
                className={`p-6 rounded-xl shadow-md border-b-4 ${
                  isPaper
                    ? 'bg-zinc-900 text-white border-orange-600'
                    : 'bg-slate-900/95 text-white border-orange-500 ring-1 ring-white/10'
                }`}
              >
                <div className="flex items-center justify-between border-b border-zinc-700 pb-3 mb-5">
                  <h3 className="text-xl font-black flex items-center gap-2 text-white uppercase tracking-wide">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                    <span>{t('tragedyAwards')}</span>
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleRerollSection('awards')}
                      disabled={rerollingSection === 'awards'}
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1 cursor-pointer print:hidden"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${
                          rerollingSection === 'awards' ? 'animate-spin' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                <div className="space-y-4 font-serif text-zinc-100 text-sm">
                  {(
                    [
                      ['honorRoll', t('honorRoll'), 'text-emerald-400'],
                      ['detention', t('detention'), 'text-rose-400'],
                      ['fraudWatch', t('fraudWatch'), 'text-amber-400'],
                      ['faabFool', t('faabFool'), 'text-orange-400'],
                      ['whatIfMachine', t('whatIfMachine'), 'text-cyan-400'],
                    ] as const
                  ).map(([key, label, colorClass]) => {
                    const val = newsletter.awards?.[key];
                    if (!val && !editMode) return null;
                    return (
                      <div
                        key={key}
                        className="pb-3.5 border-b border-zinc-800 last:border-b-0 last:pb-0"
                      >
                        <span
                          className={`font-sans font-black block text-xs uppercase tracking-wider mb-1 ${colorClass}`}
                        >
                          {label}
                        </span>
                        {editMode ? (
                          <textarea
                            rows={2}
                            value={val || ''}
                            onChange={(e) =>
                              markEdited((prev) => ({
                                ...prev,
                                awards: {
                                  ...prev.awards,
                                  [key]: e.target.value,
                                },
                              }))
                            }
                            className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-white text-xs font-serif"
                          />
                        ) : (
                          <p className="leading-relaxed text-zinc-200">{val}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. POWER RANKINGS */}
              <div>
                <div
                  className={`flex items-center justify-between pb-2.5 mb-5 border-b-4 ${
                    isPaper ? 'border-zinc-900' : 'border-slate-800'
                  }`}
                >
                  <h3 className="text-xl font-black uppercase tracking-wide flex items-center gap-2">
                    <span>{t('powerRankings')}</span>
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleRerollSection('powerRankings')}
                      disabled={rerollingSection === 'powerRankings'}
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 border border-orange-500/40 flex items-center gap-1 cursor-pointer print:hidden"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${
                          rerollingSection === 'powerRankings'
                            ? 'animate-spin'
                            : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {newsletter.powerRankings.map((item: any, idx: number) => {
                    const st = findStandingTelemetry(item.team, item.rank);
                    const delta = st?.rankDelta || 0;

                    return (
                      <div
                        key={`${item.team}-${idx}`}
                        className={`p-3.5 rounded-xl border ${
                          isPaper
                            ? 'bg-[#f4ede1] border-zinc-300'
                            : 'bg-slate-900/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`font-black text-xl font-mono w-6 text-center shrink-0 ${
                                isPaper ? 'text-orange-600' : 'text-orange-400'
                              }`}
                            >
                              {item.rank}
                            </span>
                            <ManagerAvatar
                              avatarUrl={st?.avatarUrl}
                              name={item.team}
                              size={28}
                            />
                            <div className="min-w-0">
                              <div className="font-black text-sm uppercase tracking-tight truncate">
                                {item.team}
                              </div>
                              {st && (
                                <div
                                  className={`text-[10px] font-mono ${
                                    isPaper ? 'text-zinc-600' : 'text-slate-400'
                                  }`}
                                >
                                  {st.record} • {st.fpts.toFixed(1)} PF •{' '}
                                  {st.streak}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Rank Movement Badge */}
                          {st && week > 1 && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-0.5 shrink-0 ${
                                delta > 0
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : delta < 0
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                  : 'bg-slate-500/10 text-slate-500'
                              }`}
                            >
                              {delta > 0 ? (
                                <>
                                  <ArrowUpRight className="w-3 h-3" />
                                  {delta}
                                </>
                              ) : delta < 0 ? (
                                <>
                                  <ArrowDownRight className="w-3 h-3" />
                                  {Math.abs(delta)}
                                </>
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>

                        {editMode ? (
                          <textarea
                            rows={2}
                            value={item.blurb}
                            onChange={(e) =>
                              markEdited((prev) => {
                                const list = [...prev.powerRankings];
                                list[idx] = {
                                  ...list[idx],
                                  blurb: e.target.value,
                                };
                                return { ...prev, powerRankings: list };
                              })
                            }
                            className={`w-full p-2 rounded border text-xs font-serif ${
                              isPaper
                                ? 'bg-white border-zinc-400 text-zinc-900'
                                : 'bg-slate-950 border-slate-700 text-white'
                            }`}
                          />
                        ) : (
                          <p
                            className={`text-xs sm:text-sm font-serif leading-snug ${
                              isPaper ? 'text-zinc-700' : 'text-slate-300'
                            }`}
                          >
                            {item.blurb}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. WAIVER & TRADE WIRE TICKER */}
              {meta?.transactions && meta.transactions.length > 0 && (
                <div
                  className={`p-5 rounded-xl border ${
                    isPaper
                      ? 'bg-[#f4ede1] border-zinc-400'
                      : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 mb-3 pb-2 border-b border-current/15">
                    <Repeat
                      className={`w-4 h-4 ${
                        isPaper ? 'text-orange-600' : 'text-cyan-400'
                      }`}
                    />
                    <span>{t('waiverTicker')}</span>
                  </h3>
                  <div className="space-y-2.5 text-xs font-mono">
                    {meta.transactions.slice(0, 6).map((tx) => (
                      <div
                        key={tx.id}
                        className="pb-2 border-b border-current/10 last:border-b-0 last:pb-0 leading-relaxed"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{tx.managers.join(' & ')}</span>
                          {tx.faabBid > 0 && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] ${
                                isPaper
                                  ? 'bg-amber-200 text-amber-950'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              ${tx.faabBid} FAAB
                            </span>
                          )}
                        </div>
                        {tx.added.length > 0 && (
                          <div
                            className={
                              isPaper ? 'text-emerald-800' : 'text-emerald-400'
                            }
                          >
                            +{' '}
                            {tx.added
                              .map((p) => `${p.name} (${p.points}p)`)
                              .join(', ')}
                          </div>
                        )}
                        {tx.dropped.length > 0 && (
                          <div
                            className={
                              isPaper ? 'text-rose-800' : 'text-rose-400'
                            }
                          >
                            -{' '}
                            {tx.dropped
                              .map((p) => `${p.name} (${p.points}p)`)
                              .join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
