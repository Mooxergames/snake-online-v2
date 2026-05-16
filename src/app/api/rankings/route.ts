import { NextResponse } from 'next/server';
import { getOverview } from '@/lib/api';

// Don't prerender at build (backend /players returns 11MB and can take >60s
// on a cold cache, which breaks Next's per-page static-generation timeout).
// Serve on first request, then edge-cache for `revalidate`.
export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  const data = await getOverview();
  if (!data) return NextResponse.json({ success: false }, { status: 502 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
