import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Syne, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { SiteNav } from "@/components/nav/SiteNav";
import { MouseFollower } from "@/components/ui/MouseFollower";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NEXORA — Universal AI Infrastructure",
    template: "%s · NEXORA",
  },
  description:
    "One API. Every Model. Every Modality. Every Workflow. NEXORA connects developers, enterprise applications, autonomous agents, and multi-modal AI systems through a unified infrastructure layer.",
  applicationName: "NEXORA",
  keywords: [
    "AI infrastructure",
    "unified API",
    "model router",
    "multi-modal AI",
    "autonomous agents",
    "enterprise AI governance",
  ],
  openGraph: {
    title: "NEXORA — Universal AI Infrastructure",
    description:
      "One API. Every Model. Every Modality. Every Workflow. The unified infrastructure layer for multi-modal AI and autonomous agents.",
    siteName: "NEXORA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXORA — Universal AI Infrastructure",
    description:
      "One API. Every Model. Every Modality. Every Workflow. The unified infrastructure layer for multi-modal AI and autonomous agents.",
  },
};

export const viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body>
        <div className="noise-overlay" aria-hidden />
        <MouseFollower />
        <a
          href="#main"
          className="mono fixed left-4 top-4 z-[80] -translate-y-24 rounded-md border border-cyan/40 bg-ink px-4 py-2 text-xs uppercase tracking-[0.2em] transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <SiteNav />
          <main id="main">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}