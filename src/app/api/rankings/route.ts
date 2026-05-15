import { NextResponse } from 'next/server';
import { getOverview } from '@/lib/api';

export const revalidate = 300;

export async function GET() {
  const data = await getOverview();
  if (!data) return NextResponse.json({ success: false }, { status: 502 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
