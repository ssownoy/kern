import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ñðàâíåíèå ñìåò â Kern',
  description: 'Ñðàâíèòå äâå ñòðîèòåëüíûå ñìåòû ïî ïîçèöèÿì è èòîãîâîé ñòîèìîñòè.',
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
