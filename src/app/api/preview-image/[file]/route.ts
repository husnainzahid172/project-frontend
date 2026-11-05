import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

/** Serves seed/images for LOCAL preview only (next dev + LOCAL_PREVIEW=true). 404 everywhere else. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  if (process.env.NODE_ENV !== 'development' || process.env.LOCAL_PREVIEW !== 'true') {
    return new NextResponse('Not found', { status: 404 });
  }
  const { file } = await params;
  if (!/^[\w-]+\.(jpg|jpeg|png|webp)$/i.test(file)) return new NextResponse('Not found', { status: 404 });
  try {
    const data = await readFile(join(process.cwd(), 'seed', 'images', file));
    return new NextResponse(new Uint8Array(data), { headers: { 'Content-Type': file.endsWith('png') ? 'image/png' : 'image/jpeg', 'Cache-Control': 'no-store' } });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
