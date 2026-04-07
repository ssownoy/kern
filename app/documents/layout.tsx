import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Генератор строительных документов — договор, акт КС-2, ТЗ | Kern',
  description: 'Создайте договор подряда, акт КС-2, дефектную ведомость или техническое задание за 30 секунд. По российским стандартам ГОСТ и СНиП.',
  keywords: 'договор строительного подряда, акт КС-2 онлайн, дефектная ведомость, техническое задание строительство, строительные документы',
  openGraph: {
    title: 'Генератор строительных документов — договор, акт, ТЗ',
    description: 'Договор подряда, акт КС-2, ТЗ по российским стандартам за 30 секунд.',
    url: 'https://kern-eight.vercel.app/documents',
    siteName: 'Kern',
    locale: 'ru_RU',
    type: 'website',
  },
}

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return children
}
