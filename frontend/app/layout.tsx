import type { Metadata } from "next";
import { Fraunces, Jost } from "next/font/google";
import "./globals.css";
import { Providers } from "./_components/store";
import { UIProvider } from "./_components/ui";
import SiteHeader from "./_components/SiteHeader";

// Premium editorial serif for headings/display
const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Refined geometric sans for body
const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumière — Crystals, candles & ritual tools",
  description:
    "Ethically sourced crystals, candles & ritual tools for a more intentional everyday. Slow living, beautifully made.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Providers>
          <UIProvider>
            <SiteHeader />
            {children}
          </UIProvider>
        </Providers>
      </body>
    </html>
  );
}
