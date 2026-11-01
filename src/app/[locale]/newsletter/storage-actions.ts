import { cookies } from 'next/headers';

const CF_REQUEST_CONTEXT_SYMBOL = Symbol.for('__cloudflare-request-context__');

const globalForArchives = globalThis as unknown as {
  __newsletterArchives?: Map<string, any>;
  __newsletterIndex?: Map<string, number[]>;
};

function getMemoryStore() {
  if (!globalForArchives.__newsletterArchives) {
    globalForArchives.__newsletterArchives = new Map();
  }
  if (!globalForArchives.__newsletterIndex) {
    globalForArchives.__newsletterIndex = new Map();
  }
  return {
    archives: globalForArchives.__newsletterArchives,
    index: globalForArchives.__newsletterIndex,
  };
}

// Helper to get KV binding safely in both prod (Cloudflare) and local dev
function getKV() {
  try {
    const ctx = (globalThis as any)[CF_REQUEST_CONTEXT_SYMBOL];
    const env = ctx?.env as any;
    if (env && env.NEWSLETTERS) {
      return env.NEWSLETTERS;
    }
  } catch (e) {
    // Not in Cloudflare request context
  }
  return null;
}

async function readCookieArchiveIndex(leagueId: string): Promise<number[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(`st_archives_${leagueId}`)?.value;
    if (raw) {
      const parsed = JSON.parse(decodeURIComponent(raw));
      if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean);
    }
  } catch {
    // Ignore outside request context
  }
  return [];
}

async function writeCookieArchiveIndex(leagueId: string, weeks: number[]): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(`st_archives_${leagueId}`, encodeURIComponent(JSON.stringify(weeks)), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch {
    // Ignore in read-only Server Component context
  }
}

export async function saveNewsletterArchive(leagueId: string, week: number, data: any) {
  try {
    const kv = getKV();
    const key = `newsletter:${leagueId}:week:${week}`;
    const indexKey = `newsletter:${leagueId}:index`;

    // Store in memory cache + cookie index
    const mem = getMemoryStore();
    mem.archives.set(key, data);
    const cookieIdx = await readCookieArchiveIndex(leagueId);
    const memIdx = Array.from(new Set([...(mem.index.get(indexKey) || []), ...cookieIdx]));
    if (!memIdx.includes(week)) {
      memIdx.push(week);
    }
    memIdx.sort((a, b) => b - a);
    mem.index.set(indexKey, memIdx);
    await writeCookieArchiveIndex(leagueId, memIdx);

    // Cloudflare KV Implementation
    if (kv) {
      await kv.put(key, JSON.stringify(data));

      const indexStr = await kv.get(indexKey);
      const indexData = indexStr ? JSON.parse(indexStr) : [];
      if (!indexData.includes(week)) {
        indexData.push(week);
        indexData.sort((a: number, b: number) => b - a);
        await kv.put(indexKey, JSON.stringify(indexData));
      }
      return { success: true, backend: 'cloudflare-kv' };
    }

    return { success: true, backend: 'memory' };
  } catch (error) {
    console.error('Failed to save newsletter:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteNewsletterArchive(leagueId: string, week: number) {
  try {
    const kv = getKV();
    const key = `newsletter:${leagueId}:week:${week}`;
    const indexKey = `newsletter:${leagueId}:index`;

    const mem = getMemoryStore();
    mem.archives.delete(key);
    const cookieIdx = await readCookieArchiveIndex(leagueId);
    const mergedIdx = Array.from(
      new Set([...(mem.index.get(indexKey) || []), ...cookieIdx])
    ).filter((w) => w !== week);
    mem.index.set(indexKey, mergedIdx);
    await writeCookieArchiveIndex(leagueId, mergedIdx);

    if (kv) {
      await kv.delete(key);
      const indexStr = await kv.get(indexKey);
      if (indexStr) {
        const indexData = JSON.parse(indexStr).filter((w: number) => w !== week);
        await kv.put(indexKey, JSON.stringify(indexData));
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete newsletter archive:', error);
    return { success: false, error: String(error) };
  }
}

export async function getNewsletterArchives(leagueId: string): Promise<number[]> {
  try {
    const kv = getKV();
    const indexKey = `newsletter:${leagueId}:index`;

    if (kv) {
      const indexStr = await kv.get(indexKey);
      if (indexStr) {
        return JSON.parse(indexStr);
      }
    }

    const mem = getMemoryStore();
    const fromMem = mem.index.get(indexKey) || [];
    const fromCookie = await readCookieArchiveIndex(leagueId);
    return Array.from(new Set([...fromMem, ...fromCookie])).sort((a, b) => b - a);
  } catch (error) {
    console.error('Failed to read archives:', error);
    return [];
  }
}

export async function getArchivedNewsletter(leagueId: string, week: number) {
  try {
    const kv = getKV();
    const key = `newsletter:${leagueId}:week:${week}`;

    if (kv) {
      const content = await kv.get(key);
      if (content) {
        return JSON.parse(content);
      }
    }

    const mem = getMemoryStore();
    return mem.archives.get(key) || null;
  } catch (error) {
    console.error(`Failed to read archive for week ${week}:`, error);
    return null;
  }
}
