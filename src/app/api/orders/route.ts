import { NextRequest, NextResponse } from 'next/server';
import { createOrderFromCheckout, listOrders } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { PAYMENT_METHODS, PaymentMethod } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = await listOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customerName = String(body.customer_name || '').trim();
    const customerEmail = String(body.customer_email || '').trim();
    const contactNumber = String(body.contact_number || '').trim();
    const deliveryAddress = String(body.delivery_address || '').trim();
    const paymentMethod = String(body.payment_method || '') as PaymentMethod;
    const orderNotes = String(body.order_notes || '').trim();

    if (!customerName) {
      return NextResponse.json(
        { error: 'Customer name is required.' },
        { status: 400 }
      );
    }
    if (!customerEmail || !EMAIL_REGEX.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }
    if (!contactNumber || !/\d{5,}/.test(contactNumber.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Please enter a valid contact number.' },
        { status: 400 }
      );
    }
    if (!deliveryAddress) {
      return NextResponse.json(
        { error: 'Delivery address is required.' },
        { status: 400 }
      );
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Please choose a valid payment method.' },
        { status: 400 }
      );
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Cannot place an order with an empty cart.' },
        { status: 400 }
      );
    }

    const order = await createOrderFromCheckout({
      customer_name: customerName,
      customer_email: customerEmail,
      contact_number: contactNumber,
      delivery_address: deliveryAddress,
      payment_method: paymentMethod,
      order_notes: orderNotes,
      items,
    });

    // send confirmation email after order is saved; don't block order on smtp errors
    const emailStatus = await sendOrderConfirmationEmail(order);

    return NextResponse.json({ order, emailStatus }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to place order.';
    const needsReview = msg.startsWith('REVIEW_REQUIRED:');
    return NextResponse.json(
      {
        error: msg.replace('REVIEW_REQUIRED: ', ''),
        reviewRequired: needsReview,
      },
      { status: needsReview ? 409 : 400 }
    );
  }
}

