export const runtime = 'edge';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  // Revalidate the entire layout and all paths beneath it
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
