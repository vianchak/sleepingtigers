'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';

// Helper to get KV binding safely in both prod (Cloudflare) and local dev
function getKV() {
  try {
    const env = getRequestContext().env as any;
    if (env && env.NEWSLETTERS) {
      return env.NEWSLETTERS;
    }
  } catch (e) {
    // getRequestContext might throw when running in standard Node.js (next dev)
  }
  return null;
}

export async function saveNewsletterArchive(leagueId: string, week: number, data: any) {
  try {
    const kv = getKV();
    
    // Cloudflare KV Implementation
    if (kv) {
      const key = `newsletter:${leagueId}:week:${week}`;
      await kv.put(key, JSON.stringify(data));
      
      // Update index
      const indexKey = `newsletter:${leagueId}:index`;
      const indexStr = await kv.get(indexKey);
      let indexData = indexStr ? JSON.parse(indexStr) : [];
      if (!indexData.includes(week)) {
        indexData.push(week);
        indexData.sort((a: number, b: number) => b - a);
        await kv.put(indexKey, JSON.stringify(indexData));
      }
      return { success: true };
    }
    
    return { success: false, error: "KV not available in this environment. Are you running in Cloudflare or with setupDevPlatform?" };
  } catch (error) {
    console.error("Failed to save newsletter:", error);
    return { success: false, error: String(error) };
  }
}

export async function getNewsletterArchives(leagueId: string) {
  try {
    const kv = getKV();

    // Cloudflare KV Implementation
    if (kv) {
      const indexKey = `newsletter:${leagueId}:index`;
      const indexStr = await kv.get(indexKey);
      if (indexStr) {
        return JSON.parse(indexStr);
      }
    }
    return [];
  } catch (error) {
    console.error("Failed to read archives:", error);
    return [];
  }
}

export async function getArchivedNewsletter(leagueId: string, week: number) {
  try {
    const kv = getKV();

    // Cloudflare KV Implementation
    if (kv) {
      const key = `newsletter:${leagueId}:week:${week}`;
      const content = await kv.get(key);
      if (content) {
        return JSON.parse(content);
      }
    }
    return null;
  } catch (error) {
    console.error(`Failed to read archive for week ${week}:`, error);
    return null;
  }
}
