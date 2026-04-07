import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контроль качества строительства по фото — Kern AI',
  description: 'Сфотографируйте строительный объект — AI найдёт дефекты, нарушения норм и составит акт осмотра. Бесплатно онлайн.',
  keywords: 'контроль качества строительства, дефекты на фото, строительный контроль, акт осмотра, нарушения норм',
  openGraph: {
    title: 'AI-контроль качества строительства по фото',
    description: 'Загрузите фото объекта — AI найдёт дефекты и нарушения норм за секунды.',
    url: 'https://kern-eight.vercel.app/quality',
    siteName: 'Kern',
    locale: 'ru_RU',
    type: 'website',
  },
}

export default function QualityLayout({ children }: { children: React.ReactNode }) {
  return children
}
