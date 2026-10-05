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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get('leagueId');
    const week = searchParams.get('week');

    if (!leagueId || !week) {
      return NextResponse.json({ success: false, error: 'Missing leagueId or week' }, { status: 400 });
    }

    const kv = getKV();
    if (!kv) {
      return NextResponse.json({ success: false, error: 'KV not available.' }, { status: 500 });
    }

    const key = `newsletter:${leagueId}:week:${week}`;
    const content = await kv.get(key);
    
    if (content) {
      return NextResponse.json({ success: true, data: JSON.parse(content) });
    } else {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Failed to read archive:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
