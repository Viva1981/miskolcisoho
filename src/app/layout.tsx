import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Bebas_Neue } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://miskolcisoho.vercel.app"),
  title: {
    default: "Miskolc Soho",
    template: "%s | Miskolc Soho",
  },
  description:
    "Miskolc Soho: események, galéria és közösségi élet Miskolc szívében. Nézd meg a közelgő bulikat, a friss tartalmakat és a galériákat.",
  applicationName: "Miskolc Soho",
  keywords: [
    "Miskolc Soho",
    "Soho Miskolc",
    "miskolci programok",
    "miskolci események",
    "miskolci szórakozóhely",
    "Miskolc klub",
    "Miskolc galéria",
    "Soho események",
  ],
  icons: {
    icon: [
      {
        url: "/branding/soho_logo.png",
        type: "image/png",
      },
    ],
    shortcut: ["/branding/soho_logo.png"],
    apple: [
      {
        url: "/branding/soho_logo.png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "https://miskolcisoho.vercel.app",
    siteName: "Miskolc Soho",
    title: "Miskolc Soho",
    description:
      "Események, galéria és közösségi élet Miskolcon. Kövesd a Miskolc Soho friss programjait és tartalmait.",
    images: [
      {
        url: "/branding/soho_logo.png",
        width: 1500,
        height: 820,
        alt: "Miskolc Soho logó",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Miskolc Soho",
    description:
      "Események, galéria és közösségi élet Miskolcon. Kövesd a Miskolc Soho friss programjait és tartalmait.",
    images: ["/branding/soho_logo.png"],
  },
  alternates: {
    canonical: "https://miskolcisoho.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${geistSans.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
