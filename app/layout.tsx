import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Scene } from "@/components/3d/Scene";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalRailsWrapper } from "@/components/GlobalRailsWrapper";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  // Site-wide SEO defaults come from admin Settings
  const { getDefaultSeo } = await import("@/lib/pageData");
  const defaults = await getDefaultSeo();
  return {
    title: defaults.title || "CrazyBitBite | 3D Digital Experience",
    description: defaults.description || "A modern 3D website for CrazyBitBite brand.",
    keywords: defaults.keywords || undefined,
  };
}

import { Providers } from "@/components/providers";

import { getNavigation } from "@/lib/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve menus on the server so they render complete on first paint
  const [headerNav, footerNav] = await Promise.all([
    getNavigation("header"),
    getNavigation("footer"),
  ]);

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
            <Navbar initialNavigation={headerNav} />
            <main className="flex-grow pt-16">
              <GlobalRailsWrapper>
                {children}
              </GlobalRailsWrapper>
            </main>
            <Footer initialNavigation={footerNav} />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

