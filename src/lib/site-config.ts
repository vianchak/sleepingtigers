import { cookies } from 'next/headers';

export type LLMProvider = 'google' | 'openai' | 'anthropic' | 'openrouter';

export interface SiteConfig {
  leagueId: string;
  leagueName: string;
  newsletterEnabled: boolean;
  llmProvider: LLMProvider;
  llmModel: string;
  llmApiKey: string;
  llmBaseUrl: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterPersona: string;
  adminPasswordHash?: string;
}

export interface PublicSiteConfig {
  leagueId: string;
  leagueName: string;
  newsletterEnabled: boolean;
  llmProvider: LLMProvider;
  llmModel: string;
  hasApiKey: boolean;
  apiKeySource: 'custom' | 'env' | 'none';
  maskedApiKey: string;
  llmBaseUrl: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterPersona: string;
  hasAdminPassword: boolean;
  adminPasswordSource: 'env' | 'custom' | 'none';
  storageBackend: 'cloudflare-kv' | 'memory';
}

export const DEFAULT_NEWSLETTER_PERSONA = `You are a witty, slightly cynical, and deeply frustrated fantasy football beat writer.
The core theme of this newsletter is "burning / raging / utter meltdown". We "burn" because of how painfully unpredictable, unfair, and frustrating fantasy football is. Focus heavily on bad beats, fluke performances, bench points that ruined everything, and the sheer agony of managing these teams.
Keep it humorous, engaging, and absolutely ruthless. Embrace the chaos.`;

const CONFIG_KV_KEY = 'site:config';
export const CONFIG_COOKIE_NAME = 'st_site_config';

const CF_REQUEST_CONTEXT_SYMBOL = Symbol.for('__cloudflare-request-context__');

// Global memory fallback within the current isolate
const globalForConfig = globalThis as unknown as {
  __siteConfigCache?: Partial<SiteConfig>;
};

function getCloudflareContext(): any | null {
  try {
    return (globalThis as any)[CF_REQUEST_CONTEXT_SYMBOL] || null;
  } catch {
    return null;
  }
}

function getKV(): any | null {
  try {
    const ctx = getCloudflareContext();
    const env = ctx?.env as any;
    if (env && env.NEWSLETTERS) {
      return env.NEWSLETTERS;
    }
  } catch {
    // Not in Cloudflare request context
  }
  return null;
}

function getEnvVar(key: string): string {
  try {
    const ctx = getCloudflareContext();
    const cfEnv = ctx?.env as any;
    if (cfEnv && typeof cfEnv[key] === 'string' && cfEnv[key]) {
      return cfEnv[key];
    }
  } catch {
    // Ignore
  }
  return (process.env as any)?.[key] || '';
}

export function getDefaultEnvApiKey(provider: LLMProvider): string {
  if (provider === 'google') {
    return getEnvVar('GOOGLE_GENERATIVE_AI_API_KEY') || getEnvVar('LLM_API_KEY');
  }
  if (provider === 'openai') {
    return getEnvVar('OPENAI_API_KEY') || getEnvVar('LLM_API_KEY');
  }
  if (provider === 'anthropic') {
    return getEnvVar('ANTHROPIC_API_KEY') || getEnvVar('LLM_API_KEY');
  }
  if (provider === 'openrouter') {
    return getEnvVar('OPENROUTER_API_KEY') || getEnvVar('LLM_API_KEY');
  }
  return getEnvVar('LLM_API_KEY') || getEnvVar('GOOGLE_GENERATIVE_AI_API_KEY');
}

async function readCookieConfig(): Promise<Partial<SiteConfig>> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(CONFIG_COOKIE_NAME)?.value;
    if (raw) {
      return JSON.parse(decodeURIComponent(raw));
    }
  } catch {
    // Ignore outside request context
  }
  return {};
}

async function writeCookieConfig(config: Partial<SiteConfig>): Promise<void> {
  try {
    const cookieStore = await cookies();
    const serialized = encodeURIComponent(JSON.stringify(config));
    cookieStore.set(CONFIG_COOKIE_NAME, serialized, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  } catch {
    // Ignore if called in a read-only Server Component render context
  }
}

async function getStoredPartialConfig(): Promise<Partial<SiteConfig>> {
  const kv = getKV();

  if (kv) {
    try {
      const raw = await kv.get(CONFIG_KV_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read site:config from KV:', e);
    }
  }

  const fromCookie = await readCookieConfig();
  const fromMemory = globalForConfig.__siteConfigCache || {};

  // Merge memory and cookie so changes persist across all Edge route isolates
  const merged = {
    ...fromMemory,
    ...fromCookie,
  };

  if (Object.keys(merged).length > 0) {
    globalForConfig.__siteConfigCache = merged;
  }

  return merged;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const stored = await getStoredPartialConfig();

  const llmProvider: LLMProvider = stored.llmProvider || 'google';
  const envLeagueId = getEnvVar('NEXT_PUBLIC_SLEEPER_LEAGUE_ID');
  const envApiKey = getDefaultEnvApiKey(llmProvider);

  const rawModel = stored.llmModel || 'gemini-3.8-flash';
  const llmModel =
    llmProvider === 'google' && (rawModel === 'gemini-2.5-flash' || rawModel === 'gemini-2.0-flash')
      ? 'gemini-3.8-flash'
      : rawModel;

  return {
    leagueId: stored.leagueId !== undefined && stored.leagueId !== '' ? stored.leagueId : envLeagueId,
    leagueName: stored.leagueName ?? '',
    newsletterEnabled: stored.newsletterEnabled !== undefined ? stored.newsletterEnabled : true,
    llmProvider,
    llmModel,
    llmApiKey: stored.llmApiKey || envApiKey || '',
    llmBaseUrl: stored.llmBaseUrl ?? '',
    newsletterTitle: stored.newsletterTitle ?? '',
    newsletterSubtitle: stored.newsletterSubtitle ?? '',
    newsletterPersona: stored.newsletterPersona || DEFAULT_NEWSLETTER_PERSONA,
    adminPasswordHash: stored.adminPasswordHash,
  };
}

export async function saveSiteConfig(updates: Partial<SiteConfig>): Promise<{
  success: boolean;
  storageBackend: 'cloudflare-kv' | 'memory';
  error?: string;
}> {
  try {
    const kv = getKV();
    const existing = await getStoredPartialConfig();

    const merged: Partial<SiteConfig> = {
      ...existing,
      ...updates,
    };

    // If llmApiKey wasn't explicitly changed (e.g. undefined), keep existing
    if (updates.llmApiKey === undefined) {
      merged.llmApiKey = existing.llmApiKey;
    }

    globalForConfig.__siteConfigCache = merged;
    await writeCookieConfig(merged);

    if (kv) {
      await kv.put(CONFIG_KV_KEY, JSON.stringify(merged));
      return { success: true, storageBackend: 'cloudflare-kv' };
    }

    return { success: true, storageBackend: 'memory' };
  } catch (err: any) {
    console.error('Failed to save site config:', err);
    return {
      success: false,
      storageBackend: 'memory',
      error: err?.message || String(err),
    };
  }
}

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  const kv = getKV();
  const stored = await getStoredPartialConfig();
  const config = await getSiteConfig();

  const envKey = getDefaultEnvApiKey(config.llmProvider);
  const customKey = stored.llmApiKey || '';

  const apiKeySource: 'custom' | 'env' | 'none' = customKey
    ? 'custom'
    : envKey
    ? 'env'
    : 'none';

  const envAdminPassword = getEnvVar('ADMIN_PASSWORD');
  const adminPasswordSource: 'env' | 'custom' | 'none' = envAdminPassword
    ? 'env'
    : config.adminPasswordHash
    ? 'custom'
    : 'none';

  return {
    leagueId: config.leagueId,
    leagueName: config.leagueName,
    newsletterEnabled: config.newsletterEnabled,
    llmProvider: config.llmProvider,
    llmModel: config.llmModel,
    hasApiKey: Boolean(config.llmApiKey),
    apiKeySource,
    maskedApiKey: maskKey(config.llmApiKey),
    llmBaseUrl: config.llmBaseUrl,
    newsletterTitle: config.newsletterTitle,
    newsletterSubtitle: config.newsletterSubtitle,
    newsletterPersona: config.newsletterPersona,
    hasAdminPassword: adminPasswordSource !== 'none',
    adminPasswordSource,
    storageBackend: kv ? 'cloudflare-kv' : 'memory',
  };
}
