import type { NextConfig } from "next";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // Script origins: GTM + GA4 + Meta Pixel + Clarity + Vercel Analytics + Turnstile.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://*.facebook.com https://www.clarity.ms https://*.clarity.ms https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  // Connect: add GA4 collect, Meta Pixel beacon, Clarity beacon, Vercel Analytics.
  "connect-src 'self' https://app.advantagenys.com https://challenges.cloudflare.com https://*.supabase.co https://api.openai.com https://api.groq.com https://api.anthropic.com https://region1.google-analytics.com https://www.google-analytics.com https://api.brevo.com https://api.jotform.com https://www.facebook.com https://*.facebook.com https://*.clarity.ms https://c.bing.com https://vitals.vercel-insights.com https://vitals.vercel-analytics.com wss:",
  "frame-src 'self' https://challenges.cloudflare.com https://form.jotform.com https://www.jotform.com https://www.googletagmanager.com https://td.doubleclick.net",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: CONTENT_SECURITY_POLICY,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1400, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async redirects() {
    return [
      // itintaxid.com legacy WordPress paths
      { source: "/02-home-and-general-contractor-license-nyc", destination: "/services/licensing", statusCode: 301 as const },
      { source: "/02-home-and-general-contractor-license-nyc/", destination: "/services/licensing", statusCode: 301 as const },
      { source: "/itin-tax-id-by-irs-certified-acceptance-agent-80", destination: "/itin", statusCode: 301 as const },
      { source: "/itin-tax-id-by-irs-certified-acceptance-agent-80/", destination: "/itin", statusCode: 301 as const },
      { source: "/ai-chat-agent-itin-tax-id-registration", destination: "/resources/forms/itin-registration-form", statusCode: 301 as const },
      { source: "/ai-chat-agent-itin-tax-id-registration/", destination: "/resources/forms/itin-registration-form", statusCode: 301 as const },
      { source: "/ai-chat-agent-construction-license-in-nyc-nassau-county", destination: "/contractor-license", statusCode: 301 as const },
      { source: "/ai-chat-agent-construction-license-in-nyc-nassau-county/", destination: "/contractor-license", statusCode: 301 as const },
      { source: "/ai-itin-tax-id-by-irs-certified-acceptance-agent", destination: "/itin", statusCode: 301 as const },
      { source: "/ai-itin-tax-id-by-irs-certified-acceptance-agent/", destination: "/itin", statusCode: 301 as const },
      { source: "/esign-itin", destination: "/itin", statusCode: 301 as const },
      { source: "/esign-itin/", destination: "/itin", statusCode: 301 as const },

      // nysconsultants.com legacy WordPress paths
      { source: "/contractor-license-nyc", destination: "/contractor-license", statusCode: 301 as const },
      { source: "/contractor-license-nyc/", destination: "/contractor-license", statusCode: 301 as const },
      { source: "/home-improvement-and-general-contractor-license-nyc", destination: "/contractor-license", statusCode: 301 as const },
      { source: "/home-improvement-and-general-contractor-license-nyc/", destination: "/contractor-license", statusCode: 301 as const },
      { source: "/sales-tax-defense-service-by-advantage", destination: "/services/tax-services", statusCode: 301 as const },
      { source: "/sales-tax-defense-service-by-advantage/", destination: "/services/tax-services", statusCode: 301 as const },
      { source: "/ai-hil-nyc", destination: "/services/licensing", statusCode: 301 as const },
      { source: "/ai-hil-nyc/", destination: "/services/licensing", statusCode: 301 as const },

      // Catch-all: WordPress /02-* numbered slug variants
      { source: "/02-:path*", destination: "/services/licensing", statusCode: 301 as const },
    ];
  },
};

export default nextConfig;
