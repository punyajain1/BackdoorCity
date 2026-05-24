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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://backdoor-city.vercel.app/"),
  title: "BackdoorCity",
  description: "A community-built wiki of the best spots across Indian cities",
  openGraph: {
    title: "BackdoorCity",
    description: "A community-built wiki of the best spots across Indian cities",
    url: "https://backdoor-city.vercel.app/",
    siteName: "BackdoorCity",
    images: [
      {
        url: "/image.png",
        width: 1200,
        height: 630,
        alt: "BackdoorCity - A community guide to India's best spots",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BackdoorCity",
    description: "A community-built wiki of the best spots across Indian cities",
    images: ["/image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
