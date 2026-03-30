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

const seoDescription =
  "Célunk egy olyan városi közösségi teret teremteni, amely él, lélegzik, ahol jó megállni, leülni, találkozni Miskolcon.";

export const metadata: Metadata = {
  metadataBase: new URL("https://miskolcisoho.vercel.app"),
  title: {
    default: "Miskolci SOHO",
    template: "%s | Miskolci SOHO",
  },
  description: seoDescription,
  applicationName: "Miskolci SOHO",
  keywords: [
    "Miskolci SOHO",
    "SOHO Miskolc",
    "miskolci programok",
    "miskolci események",
    "miskolci szórakozóhely",
    "Miskolc klub",
    "Miskolc galéria",
    "SOHO események",
  ],
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "https://miskolcisoho.vercel.app",
    siteName: "Miskolci SOHO",
    title: "Miskolci SOHO",
    description: seoDescription,
    images: [
      {
        url: "/branding/soho_logo.png",
        width: 1500,
        height: 820,
        alt: "Miskolci SOHO logó",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Miskolci SOHO",
    description: seoDescription,
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
