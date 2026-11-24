import type { NextConfig } from "next";

const securityHeadersCommon = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Embed route: ALLOW framing from any origin, no X-Frame-Options
        source: "/event/embed",
        headers: [
          ...securityHeadersCommon,
        ],
      },
      {
        // All other routes: prevent clickjacking with SAMEORIGIN
        source: "/((?!event/embed).*)",
        headers: [
          ...securityHeadersCommon,
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
