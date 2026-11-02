import { NextResponse } from 'next/server';
import { fetchPublicProducts, updateProductInDb } from '@/lib/supabase';
import { requireAdminWrite } from '@/lib/admin-auth';
import { PRODUCT_ELIGIBILITY_STATUSES, ProductEligibilityStatus } from '@/lib/eligibility';

export async function GET() {
  try {
    const products = await fetchPublicProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch catalogue.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdminWrite();
    const body = await req.json();
    const { productId, in_stock, stock_quantity, price_gbp, price_eur, eligibility_status, image_url } = body;
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ success: false, error: 'productId is required.' }, { status: 400 });
    }

    const changes = { in_stock, stock_quantity, price_gbp, price_eur, eligibility_status, image_url };
    Object.keys(changes).forEach((key) => {
      if (changes[key as keyof typeof changes] === undefined) delete changes[key as keyof typeof changes];
    });
    const allowedStatuses = new Set(PRODUCT_ELIGIBILITY_STATUSES);
    if (
      changes.eligibility_status !== undefined &&
      !allowedStatuses.has(changes.eligibility_status as ProductEligibilityStatus)
    ) {
      return NextResponse.json({ success: false, error: 'Invalid eligibility status.' }, { status: 400 });
    }
    if (
      changes.stock_quantity !== undefined &&
      (!Number.isInteger(changes.stock_quantity) || changes.stock_quantity < 0)
    ) {
      return NextResponse.json({ success: false, error: 'Stock quantity must be a non-negative integer.' }, { status: 400 });
    }
    if (
      [changes.price_gbp, changes.price_eur].some(
        (price) => price !== undefined && (typeof price !== 'number' || !Number.isFinite(price) || price < 0)
      )
    ) {
      return NextResponse.json({ success: false, error: 'Prices must be non-negative numbers.' }, { status: 400 });
    }

    const updated = await updateProductInDb(productId, changes);
    if (!updated) return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Read-only admin role.' }, { status: 403 });
    }
    console.error('API /api/products PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product.' }, { status: 500 });
  }
}
