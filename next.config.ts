import type { NextConfig } from "next";

const securityHeaders = [
  // Clickjacking protection
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Stop referrer leaking to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS — force HTTPS for 1 year (only active over real HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Disable browser features we don't need
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Content Security Policy
  // Next.js needs 'unsafe-inline' for hydration scripts/styles; no eval needed in prod.
  // Images allowed from self, data URIs and all HTTPS (Vercel Blob URLs vary).
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cswoods.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
