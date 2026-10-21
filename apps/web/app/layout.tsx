import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pacers — Your training. Your people. One place.",
  description:
    "A shared training workspace for runners. Private groups, shared calendars, and the people you train with.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <Nav />
          <main className="md:pl-60 pb-20 md:pb-10 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
