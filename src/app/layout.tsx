import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'タスク管理',
  description: '社内タスク管理ツール',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-[#202124] text-[#e8eaed] antialiased" style={{ colorScheme: 'dark' }} suppressHydrationWarning>{children}</body>
    </html>
  )
}
