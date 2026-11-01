import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  getExpectedSessionToken,
  isAdminAuthenticated,
  sha256Hex,
  verifyAdminPassword,
} from '@/lib/admin-auth';
import { getPublicSiteConfig, saveSiteConfig } from '@/lib/site-config';

export const runtime = 'edge';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  const publicConfig = await getPublicSiteConfig();
  return NextResponse.json({
    authenticated,
    hasAdminPassword: publicConfig.hasAdminPassword,
    adminPasswordSource: publicConfig.adminPasswordSource,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, password, newPassword } = body;

    if (action === 'logout') {
      const res = NextResponse.json({ success: true, authenticated: false });
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return res;
    }

    const publicConfig = await getPublicSiteConfig();

    // Initial password setup if no ADMIN_PASSWORD is in .env and none in KV/cookie yet
    if ((action === 'setup' || action === 'login') && !publicConfig.hasAdminPassword) {
      if (!password || password.trim().length < 4) {
        return NextResponse.json(
          { error: 'Password must be at least 4 characters.' },
          { status: 400 }
        );
      }
      const passwordHash = await sha256Hex(`st_admin:${password.trim()}`);
      const saveRes = await saveSiteConfig({ adminPasswordHash: passwordHash });
      if (!saveRes.success) {
        return NextResponse.json(
          { error: saveRes.error || 'Failed to save initial password.' },
          { status: 500 }
        );
      }

      const token = await getExpectedSessionToken();
      const res = NextResponse.json({
        success: true,
        authenticated: true,
        storageBackend: saveRes.storageBackend,
      });
      if (token) {
        res.cookies.set(ADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }
      return res;
    }

    if (action === 'change-password') {
      const authed = await isAdminAuthenticated();
      if (!authed) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (publicConfig.adminPasswordSource === 'env') {
        return NextResponse.json(
          { error: 'Admin password is managed by ADMIN_PASSWORD in your environment variables.' },
          { status: 400 }
        );
      }
      if (!newPassword || newPassword.trim().length < 4) {
        return NextResponse.json(
          { error: 'New password must be at least 4 characters.' },
          { status: 400 }
        );
      }
      const passwordHash = await sha256Hex(`st_admin:${newPassword.trim()}`);
      await saveSiteConfig({ adminPasswordHash: passwordHash });
      const token = await getExpectedSessionToken();
      const res = NextResponse.json({ success: true });
      if (token) {
        res.cookies.set(ADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });
      }
      return res;
    }

    // Standard login
    const valid = await verifyAdminPassword(password || '');
    if (!valid) {
      return NextResponse.json({ error: 'Invalid admin password.' }, { status: 401 });
    }

    const token = await getExpectedSessionToken();
    const res = NextResponse.json({ success: true, authenticated: true });
    if (token) {
      res.cookies.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

