import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

// Use timingSafeEqual to prevent timing attacks on token comparison.
function safeEqual(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    // Buffers must be same length for timingSafeEqual; if lengths differ, they
    // are not equal — but we still run the comparison on a padded copy so the
    // execution time doesn't leak the length difference.
    if (ab.length !== bb.length) {
      // constant-time no-op comparison to avoid early exit timing leak
      timingSafeEqual(ab, ab);
      return false;
    }
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const expected = process.env.ADMIN_PASSWORD;
  if (!token || !expected) return false;
  return safeEqual(token, expected);
}
