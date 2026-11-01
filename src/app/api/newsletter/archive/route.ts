import { NextResponse } from 'next/server';
import { getArchivedNewsletter } from '@/app/[locale]/newsletter/storage-actions';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get('leagueId');
    const week = searchParams.get('week');

    if (!leagueId || !week) {
      return NextResponse.json({ success: false, error: 'Missing leagueId or week' }, { status: 400 });
    }

    const data = await getArchivedNewsletter(leagueId, Number(week));
    if (data) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Failed to read archive:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
