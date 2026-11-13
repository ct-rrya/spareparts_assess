import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  getDemoCredentials,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    const creds = getDemoCredentials();
    // allow both standard demo email and screenshot email
    const validEmails = [
      creds.email.toLowerCase(),
      'admin@spareparts.ph',
      'admin@spareparts.demo',
    ];

    if (!validEmails.includes(email) || password !== creds.password) {
      return NextResponse.json(
        { error: 'Invalid demo admin credentials.' },
        { status: 401 }
      );
    }

    const token = createSessionToken(email);
    const res = NextResponse.json({ ok: true, email });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Login failed.' }, { status: 400 });
  }
}
