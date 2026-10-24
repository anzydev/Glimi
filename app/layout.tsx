import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Authoritative typography: Instrument Sans throughout
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Monospace for code evidence and git tags
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glimi · Intent-Based Developer Discovery & Collaboration",
  description:
    "Discover collaborators through public GitHub metadata, stated intents, and context-first invitations. No verified-expertise claims and no fabricated profiles.",
  keywords: [
    "developer discovery",
    "find developers",
    "hackathon teammates",
    "open source collaboration",
    "pair programming",
    "contributor rescue",
  ],
  authors: [{ name: "Glimi Team" }],
  openGraph: {
    title: "Glimi · Intent-Based Developer Discovery & Collaboration",
    description:
      "Find developers by publicly observable repository metadata and matching collaboration intents. Not another resume directory.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1f2fa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
