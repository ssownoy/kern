import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kern — AI-сметчик для строительства | Смета по чертежу онлайн',
  description: 'Загрузите чертёж или фото объекта — получите готовую смету в рублях за 30 секунд. AI-платформа для строительных компаний России.',
  keywords: 'сметчик онлайн, смета по чертежу, AI смета строительство, автоматическая смета, сметный расчёт онлайн',
  icons: {
    icon: '/logo-avatar.svg',
  },
  openGraph: {
    title: 'Kern — AI-сметчик для строительства',
    description: 'Смета по чертежу за 30 секунд. Бесплатно.',
    url: 'https://kern-eight.vercel.app',
    siteName: 'Kern',
    locale: 'ru_RU',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
