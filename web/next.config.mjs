import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

// Dev:   `pnpm dev` proxies /api/* to the Python server (default http://127.0.0.1:8000).
// Build: `pnpm build` writes a static site to web/out, which the Python server serves.
const API = process.env.MELLO_API || 'http://127.0.0.1:8000'

export default (phase) => {
  const dev = phase === PHASE_DEVELOPMENT_SERVER
  return {
    ...(dev
      ? { async rewrites() { return [{ source: '/api/:path*', destination: `${API}/api/:path*` }] } }
      : { output: 'export' }),
    typescript: { ignoreBuildErrors: true },
    images: { unoptimized: true },
  }
}
