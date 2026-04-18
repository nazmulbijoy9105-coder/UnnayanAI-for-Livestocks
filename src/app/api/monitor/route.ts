import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const { temp } = await req.json();
  const risk = temp > 39.5 ? 'high' : 'low';
  return NextResponse.json({ alert: true, bangla: 'গরুর জ্বর! ভেট ডাকুন', risk });
}
