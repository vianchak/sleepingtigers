import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

function getKV() {
  try {
    const env = getRequestContext().env as any;
    if (env && env.NEWSLETTERS) {
      return env.NEWSLETTERS;
    }
  } catch (e) {
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leagueId, week, data } = body;

    if (!leagueId || !week || !data) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const kv = getKV();
    if (!kv) {
      return NextResponse.json({ success: false, error: 'KV not available in this environment. Are you running in Cloudflare or with setupDevPlatform?' }, { status: 500 });
    }

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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save newsletter:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
