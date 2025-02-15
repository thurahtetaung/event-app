import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/AuthContext"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Event Ticketing Platform",
  description: "Book and manage event tickets easily",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader className="sticky top-0 z-50" />
              <main className="flex-1">
                {children}
              </main>
              <SiteFooter className="mt-auto" />
            </div>
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                className: "text-center",
                style: {
                  textAlign: "center",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

