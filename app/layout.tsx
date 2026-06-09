import type React from "react"
import type { Metadata } from "next"
import { Lato } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-lato",
})

export const metadata: Metadata = {
  title: "Xsnipe | Solana Token Sniper",
  description:
    "Snipe & Sell Solana Tokens at Hyperspeed. The fastest Solana memecoin sniper bot with AI-powered trading.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/images/screenshot-202025-12-16-20at-2022.png",
      },
    ],
    apple: "/images/screenshot-202025-12-16-20at-2022.png",
  },
  openGraph: {
    title: "Xsnipe | Solana Token Sniper",
    description:
      "Snipe & Sell Solana Tokens at Hyperspeed. The fastest Solana memecoin sniper bot with AI-powered trading.",
    url: "https://trexsnipe.com",
    siteName: "Xsnipe",
    images: [
      {
        url: "/images/screenshot-202025-12-16-20at-2022.png",
        width: 1200,
        height: 630,
        alt: "Xsnipe - Solana Token Sniper",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XSnipe | Solana Token Sniper",
    description:
      "Snipe & Sell Solana Tokens at Hyperspeed. The fastest Solana memecoin sniper bot with AI-powered trading.",
    images: ["/images/screenshot-202025-12-16-20at-2022.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} font-sans antialiased`}>
        {children}
        <Analytics />
<Script id="smartsupp-script" strategy="afterInteractive">
        {`
          var _smartsupp = _smartsupp || {};
          _smartsupp.key = '0de24ad0b915c439c172c1b2533ae5d94949598c';
          window.smartsupp || (function(d) {
            var s, c, o = smartsupp = function() { o._.push(arguments) };
            o._ = [];
            s = d.getElementsByTagName('script')[0];
            c = d.createElement('script');
            c.type = 'text/javascript';
            c.charset = 'utf-8';
            c.async = true;
            c.src = 'https://www.smartsuppchat.com/loader.js?';
            s.parentNode.insertBefore(c, s);
          })(document);
        `}
      </Script>
      </body>
    </html>
  )
}
