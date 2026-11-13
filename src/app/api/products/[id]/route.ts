import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProduct,
  getProductByIdOrSlug,
  updateProduct,
} from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await getProductByIdOrSlug(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const product = await updateProduct(id, {
      specimen_code: body.specimen_code,
      name: String(body.name || ''),
      category_id: String(body.category_id || ''),
      description: String(body.description || ''),
      price: Number(body.price),
      stock: Number(body.stock),
      image_url: String(body.image_url || ''),
      is_active: Boolean(body.is_active),
      is_featured:
        typeof body.is_featured === 'boolean' ? body.is_featured : undefined,
    });
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update product' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to delete product';
    const isRef = msg.startsWith('REFERENCED_IN_ORDER:');
    return NextResponse.json(
      {
        error: msg.replace('REFERENCED_IN_ORDER: ', ''),
        referencedInOrder: isRef,
      },
      { status: isRef ? 409 : 400 }
    );
  }
}

