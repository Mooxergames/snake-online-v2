import { NextRequest, NextResponse } from 'next/server';
import { getGlobalRankings } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET(req: NextRequest) {
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 50, 100);
  const data = await getGlobalRankings(limit);
  if (!data) return NextResponse.json({ success: false }, { status: 502 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
