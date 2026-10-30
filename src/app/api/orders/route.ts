import { NextRequest, NextResponse } from 'next/server';
import { processOrderCreation } from '@/lib/order-service';
import { fetchAllOrders, updateOrderStatusInDb } from '@/lib/supabase';
import { OrderCreateRequest, OrderStatus } from '@/types/order';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderCreateRequest;
    const result = await processOrderCreation(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('API /api/orders error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred during order processing.',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Basic authorization check for admin querying
    const authHeader = req.headers.get('authorization');
    const adminToken = process.env.ADMIN_SECRET_KEY || 'az-admin-2026';

    const isAuthorized =
      authHeader === `Bearer ${adminToken}` ||
      req.nextUrl.searchParams.get('key') === adminToken;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to order logs.' },
        { status: 401 }
      );
    }

    const orders = await fetchAllOrders();
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve orders.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const adminToken = process.env.ADMIN_SECRET_KEY || 'az-admin-2026';

    const isAuthorized =
      authHeader === `Bearer ${adminToken}` ||
      req.nextUrl.searchParams.get('key') === adminToken;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, status } = body as { orderId: string; status: OrderStatus };

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'orderId and status are required.' },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatusInDb(orderId, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Order not found or update failed.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, orderId, status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status.' },
      { status: 500 }
    );
  }
}
