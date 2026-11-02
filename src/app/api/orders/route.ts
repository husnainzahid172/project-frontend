import { NextRequest, NextResponse } from 'next/server';
import { processOrderCreation } from '@/lib/order-service';
import { fetchAllOrders, updateOrderStatusInDb } from '@/lib/supabase';
import { OrderCreateRequest, OrderStatus } from '@/types/order';
import { requireAdminUser, requireAdminWrite } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderCreateRequest;
    const result = await processOrderCreation(body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('API /api/orders POST error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected order processing error.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdminUser();
    const orders = await fetchAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized access to order logs.' }, { status: 401 });
    }
    console.error('API /api/orders GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve orders.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminWrite();
    const body = (await req.json()) as { orderId?: string; status?: OrderStatus };
    if (!body.orderId || !body.status) {
      return NextResponse.json({ success: false, error: 'orderId and status are required.' }, { status: 400 });
    }
    const updated = await updateOrderStatusInDb(body.orderId, body.status);
    if (!updated) return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    return NextResponse.json({ success: true, orderId: body.orderId, status: body.status });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Read-only admin role.' }, { status: 403 });
    }
    console.error('API /api/orders PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order status.' }, { status: 500 });
  }
}
