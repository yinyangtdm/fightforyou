import { Geist, Geist_Mono, Open_Sans, Merriweather } from "next/font/google"
import "./globals.css"
import { Providers } from './providers'
import type { Metadata } from "next"
import Script from "next/script"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
})

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: {
    template: "%s | fightfor.you",
    default: "fightfor.you",
  },
  description: "When law enforcement causes harm, the odds are stacked against you — qualified immunity, police unions, city lawyers. Find the attorneys who know how to level the playing field.",
  metadataBase: new URL("https://fightfor.you"),
  verification: {
    google: "uoPZEzqiycSwWxTOEid6qmcvO5BUReUK6iAnvpuPviQ",
  },
  openGraph: {
    siteName: "fightfor.you",
    images: [{ url: "https://fightfor.you/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://fightfor.you/og-image.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Providers>
          {children}
        </Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}</Script>
          </>
        )}
      </body>
    </html>
  )
}
