import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'sp_admin_session';

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'spare-parts-demo-secret-key';
}

export function getDemoCredentials() {
  return {
    email: process.env.ADMIN_DEMO_EMAIL || 'admin@spareparts.demo',
    password: process.env.ADMIN_DEMO_PASSWORD || 'cubetech-demo',
  };
}

export function createSessionToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, iat: Date.now() })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): { email: string } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, sig] = parts;
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url');

  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof parsed.email === 'string' && parsed.email.length > 0) {
      return { email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

