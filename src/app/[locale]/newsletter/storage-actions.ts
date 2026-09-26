'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';

const fs = typeof window === 'undefined' ? eval('require("fs")') : null;
const path = typeof window === 'undefined' ? eval('require("path")') : null;

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

    // Fallback to local fs for standard development
    if (!fs || !path) return { success: false, error: "Filesystem not available in this environment" };
    const dirPath = path.join(process.cwd(), 'public', 'newsletters', leagueId);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const filePath = path.join(dirPath, `week-${week}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    // Update index.json
    const indexFile = path.join(dirPath, 'index.json');
    let indexData = [];
    if (fs.existsSync(indexFile)) {
      indexData = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
    }
    if (!indexData.includes(week)) {
      indexData.push(week);
      indexData.sort((a: number, b: number) => b - a);
      fs.writeFileSync(indexFile, JSON.stringify(indexData), 'utf-8');
    }
    
    return { success: true };
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
      return [];
    }

    // Fallback to local fs
    if (!fs || !path) return [];
    const dirPath = path.join(process.cwd(), 'public', 'newsletters', leagueId);
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    const files = fs.readdirSync(dirPath);
    const weeks = files
      .filter((f: string) => f.startsWith('week-') && f.endsWith('.json'))
      .map((f: string) => {
        const match = f.match(/week-(\d+)\.json/);
        return match ? Number(match[1]) : 0;
      })
      .filter((w: number) => w > 0)
      .sort((a: number, b: number) => b - a); // sort descending
      
    return weeks;
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
      return null;
    }

    // Fallback to local fs
    if (!fs || !path) return null;
    const filePath = path.join(process.cwd(), 'public', 'newsletters', leagueId, `week-${week}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read archive for week ${week}:`, error);
    return null;
  }
}
