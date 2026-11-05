import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, canWrite } from '@/lib/admin-auth';
import { adminUpdateOrderStatus } from '@/lib/data';
import { ORDER_STATUSES } from '@/types/order';

const schema = z.object({ orderId: z.string().uuid(), status: z.enum(ORDER_STATUSES as [string, ...string[]]) });

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!canWrite(admin)) return NextResponse.json({ success: false, error: 'Read-only account' }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });

  try {
    await adminUpdateOrderStatus(admin.email, parsed.data.orderId, parsed.data.status as never);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 400 });
  }
}
