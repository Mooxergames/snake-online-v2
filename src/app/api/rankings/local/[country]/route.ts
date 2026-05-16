import { NextRequest, NextResponse } from 'next/server';
import { getLocalRankings } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET(req: NextRequest, { params }: { params: { country: string } }) {
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 50, 100);
  const data = await getLocalRankings(params.country, limit);
  if (!data) return NextResponse.json({ success: false }, { status: 502 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
