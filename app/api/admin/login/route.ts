import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

// --- In-memory rate limiter ---
// Vercel serverless: each instance has its own Map; this limits burst attempts
// within a single warm instance. Good enough for a single-admin site.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;       // per IP per window
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  rec.count++;
  if (rec.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function safeEqual(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ab.length !== bb.length) {
      timingSafeEqual(ab, ab); // keep timing consistent
      return false;
    }
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Príliš veľa pokusov. Skúste neskôr." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      }
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatná požiadavka" }, { status: 400 });
  }

  const { password } = body;
  const expected = process.env.ADMIN_PASSWORD;

  if (
    typeof password !== "string" ||
    !expected ||
    !safeEqual(password, expected)
  ) {
    return NextResponse.json({ error: "Nesprávne heslo" }, { status: 401 });
  }

  // Reset attempts on successful login
  attempts.delete(ip);

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", expected, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProd,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return res;
}
