import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kern — Sravnenie smet',
  description: 'Kern — sravnenie dvuh stroitelnyh smet',
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
