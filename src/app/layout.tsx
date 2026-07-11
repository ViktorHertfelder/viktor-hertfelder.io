import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hertfelder.io"),

  title: "Viktor Hertfelder | Softwareentwickler aus Dresden",
  description:
    "Softwareentwickler aus Dresden für individuelle Softwarelösungen, Automatisierungen und technische Unterstützung in Web- und Backend-Projekten.",

  openGraph: {
    title: "Viktor Hertfelder | Softwareentwickler aus Dresden",
    description:
      "Individuelle Softwarelösungen, Automatisierung sowie Web- und Backend-Entwicklung.",
    url: "https://hertfelder.io",
    siteName: "Viktor Hertfelder",
    locale: "de_DE",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Viktor Hertfelder | Softwareentwickler aus Dresden",
    description:
      "Individuelle Softwarelösungen, Automatisierung sowie Web- und Backend-Entwicklung.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
