export const runtime = 'edge';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { clearSleeperCache } from '@/lib/sleeper-api';

export async function POST() {
  clearSleeperCache();
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
