import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, canWrite } from '@/lib/admin-auth';
import { adminUploadImage } from '@/lib/data';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!canWrite(admin)) return NextResponse.json({ success: false, error: 'Read-only account' }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const productId = form?.get('productId');
  if (!(file instanceof File) || typeof productId !== 'string') {
    return NextResponse.json({ success: false, error: 'File and productId are required.' }, { status: 400 });
  }
  try {
    const path = await adminUploadImage(admin.email, productId, file);
    return NextResponse.json({ success: true, path });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 400 });
  }
}
