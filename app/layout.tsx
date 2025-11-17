import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from './components/AuthProvider'

export const metadata: Metadata = {
  title: 'Merry PBL',
  description: 'G-PBL 팀을 위한 크리스마스 이벤트 웹사이트',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

