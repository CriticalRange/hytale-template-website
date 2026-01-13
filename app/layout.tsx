import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hytale Mod Template Generator | Create Your First Mod",
  description: "Generate a customized Hytale mod template project in seconds. Get started with Hytale modding using our easy-to-use template generator.",
  keywords: ["Hytale", "mod", "template", "generator", "modding", "plugin", "Hypixel"],
  openGraph: {
    title: "Hytale Mod Template Generator",
    description: "Create your first Hytale mod with our customizable template generator",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
