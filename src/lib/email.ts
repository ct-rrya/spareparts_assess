import { Resend } from 'resend';
import { Order } from '@/types';
import { formatPHP } from './money';

export type EmailSendStatus = 'sent' | 'skipped' | 'failed';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendOrderConfirmationEmail(
  order: Order
): Promise<EmailSendStatus> {
  const apiKey = process.env.RESEND_API_KEY;

  // skip gracefully if resend key isn't set up yet
  if (!apiKey || apiKey.includes('your-resend-api-key')) {
    return 'skipped';
  }

  const from =
    process.env.RESEND_FROM_EMAIL || 'Spare Parts <onboarding@resend.dev>';

  try {
    const resend = new Resend(apiKey);
    const items = order.items || [];

    const textLines = items
      .map(
        (i) =>
          `- ${i.specimen_code_snapshot} ${i.product_name_snapshot} x${i.quantity} (${formatPHP(i.line_total)})`
      )
      .join('\n');

    const htmlRows = items
      .map(
        (i) => `
          <tr>
            <td style="padding:10px;border-bottom:1px dashed #5882E8;">
              <span style="font-family:monospace;color:#4A4F8A;">${escapeHtml(i.specimen_code_snapshot)}</span>
              ${escapeHtml(i.product_name_snapshot)}
            </td>
            <td style="padding:10px;border-bottom:1px dashed #5882E8;">${i.quantity}</td>
            <td style="padding:10px;border-bottom:1px dashed #5882E8;text-align:right;font-weight:bold;">
              ${escapeHtml(formatPHP(i.line_total))}
            </td>
          </tr>`
      )
      .join('');

    const { error } = await resend.emails.send({
      from,
      to: [order.customer_email],
      subject: `Spare Parts — Order Confirmation (${order.order_number})`,
      text: [
        `Hi ${order.customer_name},`,
        '',
        `Thanks for your order with Spare Parts! Your order ${order.order_number} has been saved with status: ${order.status}.`,
        '',
        'Items:',
        textLines,
        '',
        `Total: ${formatPHP(order.total)}`,
        `Payment Method: ${order.payment_method}`,
        `Delivery Address: ${order.delivery_address}`,
        order.order_notes ? `Notes: ${order.order_notes}` : '',
        '',
        'CubeTech Demo Storefront — Spare Parts',
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
        <div style="font-family:system-ui,sans-serif;color:#1F06AC;max-width:600px;margin:0 auto;border:1.5px solid #1F06AC;background:#fff;">
          <div style="background:#1F06AC;color:#fff;padding:24px;">
            <div style="font-family:monospace;font-size:12px;color:#E3EF4F;letter-spacing:0.08em;">SPARE PARTS / ORDER CONFIRMATION</div>
            <h1 style="margin:8px 0 0;font-size:28px;">${escapeHtml(order.order_number)}</h1>
          </div>
          <div style="padding:24px;">
            <p style="margin-top:0;">Hi <b>${escapeHtml(order.customer_name)}</b>, your requisition order has been received with status <b>${escapeHtml(order.status)}</b>.</p>
            <table style="width:100%;border-collapse:collapse;border:1.5px solid #1F06AC;margin:16px 0;">
              <thead>
                <tr style="background:#EEF2FD;text-align:left;font-family:monospace;font-size:11px;">
                  <th style="padding:10px;border-bottom:1.5px solid #1F06AC;">ITEM</th>
                  <th style="padding:10px;border-bottom:1.5px solid #1F06AC;">QTY</th>
                  <th style="padding:10px;border-bottom:1.5px solid #1F06AC;text-align:right;">LINE TOTAL</th>
                </tr>
              </thead>
              <tbody>${htmlRows}</tbody>
            </table>
            <p style="font-size:18px;font-weight:bold;text-align:right;margin:12px 0;">Total: ${escapeHtml(formatPHP(order.total))}</p>
            <div style="border-top:1px dashed #5882E8;padding-top:12px;font-size:13px;">
              <div><b>Payment:</b> ${escapeHtml(order.payment_method)}</div>
              <div><b>Delivery Address:</b> ${escapeHtml(order.delivery_address)}</div>
              <div><b>Contact:</b> ${escapeHtml(order.contact_number)}</div>
              ${order.order_notes ? `<div><b>Notes:</b> ${escapeHtml(order.order_notes)}</div>` : ''}
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('resend error:', error);
      return 'failed';
    }

    return 'sent';
  } catch (err) {
    console.error('failed to send order confirmation email:', err);
    return 'failed';
  }
}
