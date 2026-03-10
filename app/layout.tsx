import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toaster'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://example.ru'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Вектор Будущего — онлайн-конкурсы для детей и педагогов',
    template: '%s — Вектор Будущего',
  },
  description:
    'Онлайн-конкурсы для детей, школьников, студентов и педагогов. Официальные дипломы, проверка 1–3 дня, участие полностью онлайн.',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon.png', type: 'image/png' }],
    apple: [{ url: '/icon-192.png' }],
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Онлайн-конкурсы для детей и педагогов',
    description: 'Дипломы и призовые места. Проверка 1–3 дня.',
    images: ['/og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Онлайн-конкурсы для детей и педагогов',
    description: 'Дипломы и призовые места. Проверка 1–3 дня.',
    images: ['/og.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
  const gaId = process.env.NEXT_PUBLIC_GA4_ID

  return (
    <html lang="ru">
      <body className="min-h-screen font-sans text-[var(--ink)] bg-[var(--bg)]">
        {!!ymId && (
          <>
            <Script id="ym-init" strategy="afterInteractive">
              {`
                (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {
                    if (document.scripts[j].src === r) { return; }
                  }
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                ym(${ymId}, "init", {
                  clickmap:true,
                  trackLinks:true,
                  accurateTrackBounce:true,
                  webvisor:true
                });
              `}
            </Script>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <noscript>
              <div>
                <img
                  src={`https://mc.yandex.ru/watch/${ymId}`}
                  style={{ position: 'absolute', left: '-9999px' }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        )}

        {!!gaId && (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
