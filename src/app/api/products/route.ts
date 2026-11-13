import { NextRequest, NextResponse } from 'next/server';
import { createProduct, listProducts } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const activeOnly = req.nextUrl.searchParams.get('active') === '1';
    const products = await listProducts({ activeOnly });
    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const product = await createProduct({
      specimen_code: body.specimen_code,
      name: String(body.name || ''),
      category_id: String(body.category_id || ''),
      description: String(body.description || ''),
      price: Number(body.price),
      stock: Number(body.stock),
      image_url: String(body.image_url || ''),
      is_active: Boolean(body.is_active ?? true),
      is_featured: Boolean(body.is_featured ?? true),
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create product' },
      { status: 400 }
    );
  }
}

