import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/order-service';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`order:${ip}`, 5, 60_000)) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Please wait a minute and try again.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const { status, body: res } = await createOrder(body);
    return NextResponse.json(res, { status });
  } catch (e) {
    console.error('POST /api/orders', e);
    return NextResponse.json({ success: false, error: 'Something went wrong. Please contact us on WhatsApp.' }, { status: 500 });
  }
}
