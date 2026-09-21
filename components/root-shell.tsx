import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "../app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// <html>/<body> commun aux deux "racines" du site : les pages préfixées par la
// langue (app/[locale]) et celles qui ne le sont pas (app/share).
export default function RootShell({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
