import type { Metadata, Viewport } from 'next'
import './globals.css'
import './motion.css'

// No analytics on purpose: this is a mental-health tool, so the page makes no third-party calls.
export const metadata: Metadata = {
  title: 'Mello: A little space for how you feel',
  description: 'A warm, voice-first wellbeing check-in for everyday moments.',
  generator: 'Mello',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f8faff',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <body className="antialiased">{children}</body>
    </html>
  )
}
