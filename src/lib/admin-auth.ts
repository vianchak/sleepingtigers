import { cookies } from 'next/headers';
import { getSiteConfig } from './site-config';

export const ADMIN_COOKIE_NAME = 'st_admin_session';

const CF_REQUEST_CONTEXT_SYMBOL = Symbol.for('__cloudflare-request-context__');

function getEnvAdminPassword(): string {
  try {
    const ctx = (globalThis as any)[CF_REQUEST_CONTEXT_SYMBOL];
    const cfEnv = ctx?.env as any;
    if (cfEnv && typeof cfEnv.ADMIN_PASSWORD === 'string' && cfEnv.ADMIN_PASSWORD) {
      return cfEnv.ADMIN_PASSWORD;
    }
  } catch {
    // ignore
  }
  return process.env.ADMIN_PASSWORD || '';
}

export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getExpectedSessionToken(): Promise<string | null> {
  const envPassword = getEnvAdminPassword();
  if (envPassword) {
    const hash = await sha256Hex(`st_admin:${envPassword}`);
    return await sha256Hex(`session:${hash}`);
  }

  const config = await getSiteConfig();
  if (config.adminPasswordHash) {
    return await sha256Hex(`session:${config.adminPasswordHash}`);
  }

  return null;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const envPassword = getEnvAdminPassword();
  if (envPassword) {
    return password === envPassword;
  }

  const config = await getSiteConfig();
  if (config.adminPasswordHash) {
    const inputHash = await sha256Hex(`st_admin:${password}`);
    return inputHash === config.adminPasswordHash;
  }

  return false;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!sessionCookie) return false;

    const expectedToken = await getExpectedSessionToken();
    if (expectedToken) {
      return sessionCookie === expectedToken;
    }

    // If no ADMIN_PASSWORD is set in .env and no custom hash is stored yet in this isolate,
    // accept an existing valid 64-char SHA-256 session cookie set by /api/admin/auth.
    return /^[0-9a-f]{64}$/.test(sessionCookie);
  } catch {
    return false;
  }
}
