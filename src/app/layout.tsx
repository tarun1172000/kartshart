import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, DEFAULT_SITE_URL } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(DEFAULT_SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Kartshart Editorial Desk", url: DEFAULT_SITE_URL }],
  creator: "Kartshart",
  publisher: "Kartshart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: DEFAULT_SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Editorial Magazine`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    creator: "@kartshart",
    images: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: DEFAULT_SITE_URL,
    types: {
      "application/rss+xml": `${DEFAULT_SITE_URL}/rss.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable}`}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="Kartshart RSS Feed" href="/rss.xml" />
        <link rel="author" href="/about" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-200 overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
