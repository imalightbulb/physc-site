import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Physics Student Forum",
  description: "A hub for physics students to discuss, share resources, and view news.",
};

import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased min-h-screen flex flex-col font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 container max-w-screen-xl mx-auto px-4 py-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
