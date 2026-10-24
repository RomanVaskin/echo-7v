/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // English is served without a prefix: internally `/`, `/journeys/*`, `/team`, `/blog/*` and `/contacts` map to the `[lang]` segment as `en`.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/en' },
        { source: '/journeys/:path*', destination: '/en/journeys/:path*' },
        { source: '/team', destination: '/en/team' },
        { source: '/blog/:path*', destination: '/en/blog/:path*' },
        { source: '/contacts', destination: '/en/contacts' },
      ],
    }
  },
  // The prefixed English URLs are not public; keep a single canonical address per page.
  async redirects() {
    return [
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
