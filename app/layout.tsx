import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kern â AI-ïëàòôîðìà äëÿ ñòðîèòåëüíîé èíäóñòðèè Ðîññèè',
  description: 'Àâòîìàòèçàöèÿ ñìåò, êîíòðîëü êà÷åñòâà ïî ôîòî è ãåíåðàöèÿ äîêóìåíòîâ äëÿ ñòðîèòåëüíûõ êîìïàíèé. AI-ñìåò÷èê ïî ÷åðòåæó çà 30 ñåêóíä. Áåñïëàòíî.',
  keywords: 'ñòðîèòåëüíàÿ ñìåòà, AI äëÿ ñòðîèòåëüñòâà, êîíòðîëü êà÷åñòâà ñòðîèòåëüñòâà, ñòðîèòåëüíûå äîêóìåíòû, ÃÑÍ, ÔÅÐ, ÒÅÐ',
  authors: [{ name: 'Kern' }],
  creator: 'Kern',
  metadataBase: new URL('https://kern-eight.vercel.app'),
  other: {
    charset: 'utf-8',
  },
  openGraph: {
    title: 'Kern â AI-ïëàòôîðìà äëÿ ñòðîèòåëüíîé èíäóñòðèè',
    description: 'Ñìåòû, êîíòðîëü êà÷åñòâà è äîêóìåíòû äëÿ ñòðîèòåëüíûõ êîìïàíèé Ðîññèè.',
    url: 'https://kern-eight.vercel.app',
    siteName: 'Kern',
    locale: 'ru_RU',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://kern-eight.vercel.app',
  },
  icons: {
    icon: '/logo-avatar.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=108188162', 'ym');
            ym(108188162, 'init', {
              ssr: true,
              webvisor: true,
              clickmap: true,
              ecommerce: "dataLayer",
              accurateTrackBounce: true,
              trackLinks: true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/108188162" style={{position:'absolute',left:'-9999px'}} alt="" />
          </div>
        </noscript>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
