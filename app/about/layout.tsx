import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'О проекте Kern — AI-платформа для строительной индустрии России',
  description: 'Kern — AI-платформа для автоматизации смет, контроля качества и документооборота строительных компаний России. История, миссия, экосистема.',
  openGraph: {
    title: 'О проекте Kern',
    description: 'AI-платформа для строительной индустрии России.',
    url: 'https://kern-eight.vercel.app/about',
    siteName: 'Kern',
    locale: 'ru_RU',
    type: 'website',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
