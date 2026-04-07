import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI-ñìåò÷èê äëÿ ñòðîèòåëüñòâà | Ñìåòà ïî ÷åðòåæó îíëàéí â Kern',
  description: 'Çàãðóçèòå ÷åðòåæ èëè ôîòî îáúåêòà â AI ñîñòàâèò ñòðîèòåëüíóþ ñìåòó â ðóáëÿõ çà 30 ñåêóíä. Ðåãèîíàëüíûå öåíû, ÃÑÍ, ÔÅÐ. Áåñïëàòíî.',
  keywords: 'ñòðîèòåëüíàÿ ñìåòà îíëàéí, AI ñìåò÷èê, ñìåòà ïî ÷åðòåæó, àâòîìàòè÷åñêàÿ ñìåòà, ÃÑÍ, ÔÅÐ, ÒÅÐ',
  openGraph: {
    title: 'AI-ñìåò÷èê â ñìåòà ïî ÷åðòåæó çà 30 ñåêóíä',
    description: 'Çàãðóçèòå ÷åðòåæ ïîëó÷èòå ãîòîâóþ ñìåòó â ðóáëÿõ ïî àêòóàëüíûì ðûíî÷íûì öåíàì.',
    url: 'https://kern-eight.vercel.app/estimate',
    siteName: 'Kern',
    locale: 'ru_RU',
    type: 'website',
  },
}

export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return children
}
