import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  saveNewsletterArchive,
  deleteNewsletterArchive,
  getArchivedNewsletter,
  getNewsletterArchives,
} from '@/app/[locale]/newsletter/storage-actions';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get('leagueId');
    const week = searchParams.get('week');

    if (!leagueId) {
      return NextResponse.json({ success: false, error: 'Missing leagueId' }, { status: 400 });
    }

    if (!week) {
      const archives = await getNewsletterArchives(leagueId);
      return NextResponse.json({ success: true, archives });
    }

    const data = await getArchivedNewsletter(leagueId, Number(week));
    if (data) {
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin login required to publish newsletters.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { leagueId, week, data } = body;

    if (!leagueId || !week || !data) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const res = await saveNewsletterArchive(String(leagueId), Number(week), data);
    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || 'Failed to save archive' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, backend: res.backend });
  } catch (error: any) {
    console.error('Failed to save newsletter:', error);
    return NextResponse.json(
      { success: false, error: error.message || String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin login required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get('leagueId');
    const week = searchParams.get('week');

    if (!leagueId || !week) {
      return NextResponse.json(
        { success: false, error: 'Missing leagueId or week' },
        { status: 400 }
      );
    }

    const res = await deleteNewsletterArchive(leagueId, Number(week));
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || String(error) },
      { status: 500 }
    );
  }
}
