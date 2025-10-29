import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { AuthProvider } from "@/context/auth-context"
import { ServicesProvider } from "@/context/services-context"

export const metadata: Metadata = {
  title: "Paybot - Plataforma de Automatización Inteligente para Ventas",
  description:
    "Paybot es una plataforma SaaS avanzada de automatización inteligente que integra IA, CRM y mensajería para optimizar procesos de ventas y atención al cliente. Ofrece webhooks en tiempo real, gestión de leads y seguimiento de conversiones para maximizar resultados comerciales.",
  generator: "Paybot v1.0",
  applicationName: "Paybot App",
  referrer: "origin-when-cross-origin",
  keywords: [
    "automatización de ventas",
    "inteligencia artificial",
    "CRM",
    "mensajería empresarial",
    "automatización de leads",
    "seguimiento de conversiones",
    "ventas inteligentes",
    "chatbots",
    "integraciones empresariales",
    "webhooks en tiempo real",
    "IA para negocios",
    "atención al cliente automatizada",
    "SaaS de ventas",
  ],
  authors: [{ name: "Paybot Team" }],
  creator: "Paybot",
  publisher: "Paybot LLC",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://paybot.ai"),
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/es",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://paybot.ai",
    title: "Paybot - Automatización Inteligente de Ventas y CRM con IA",
    description:
      "Optimiza tus ventas con Paybot, la plataforma de automatización inteligente que integra IA, CRM y mensajería. Webhooks en tiempo real, gestión de leads y análisis de conversiones en un solo lugar.",
    siteName: "Paybot",
    images: [
      {
        url: "https://mooneyatkinson.kommo.com/frontend/images/favicon-kommo.ico",
        width: 1200,
        height: 630,
        alt: "Paybot - Plataforma de Automatización Inteligente para Ventas",
      },
      {
        url: "/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: "Paybot - CRM Automatizado con IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paybot - Automatización Inteligente para Ventas",
    description:
      "Potencia tu negocio con Paybot: IA, CRM y mensajería integradas para automatizar procesos comerciales y mejorar la conversión.",
    site: "@PaybotAI",
    creator: "@PaybotAI",
    images: ["/twitter-image.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "https://mooneyatkinson.kommo.com/frontend/images/favicon-kommo.ico" },
      { url: "https://mooneyatkinson.kommo.com/frontend/images/favicon-kommo.ico", sizes: "16x16", type: "image/png" },
      { url: "https://mooneyatkinson.kommo.com/frontend/images/favicon-kommo.ico", sizes: "32x32", type: "image/png" },
      { url: "https://mooneyatkinson.kommo.com/frontend/images/favicon-kommo.ico", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "https://mooneyatkinson.kommo.com/frontend/images/favicon-kommo.ico",
    apple: [
      { url: "https://mooneyatkinson.kommo.com/frontend/images/favicon-kommo.ico" },
      { url: "/apple-touch-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/apple-touch-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/apple-touch-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/apple-touch-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { url: "/apple-touch-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-touch-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "https://mooneyatkinson.kommo.com/frontend/images/favicon-kommo.ico",
      },
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#000000",
      },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "apple-mobile-web-app-title": "Paybot",
    "application-name": "Paybot",
    "msapplication-TileColor": "#000000",
    "msapplication-TileImage": "/mstile-144x144.png",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#000000",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
    HandheldFriendly: "True",
    MobileOptimized: "320",
    "target-densitydpi": "device-dpi",
    "full-screen": "yes",
    browsermode: "application",
    nightmode: "enable/disable",
    layoutmode: "fitscreen/standard",
    imagemode: "force",
    "screen-orientation": "portrait",
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.variable} font-sans`}>
      <AuthProvider>
        <ServicesProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Providers>
                {children}
              </Providers>
            </Suspense>
            <Toaster />
          </ServicesProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
