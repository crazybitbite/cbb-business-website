import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Scene } from "@/components/3d/Scene";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalRailsWrapper } from "@/components/GlobalRailsWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CrazyBitBite | 3D Digital Experience",
  description: "A modern 3D website for CrazyBitBite brand.",
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* <Scene /> */}
            <Navbar />
            <main className="flex-grow pt-16">
              <GlobalRailsWrapper>
                {children}
              </GlobalRailsWrapper>
            </main>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

