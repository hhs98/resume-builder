import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import RecaptchaProvider from "@/components/RecaptchaProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans",
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body>
        <RecaptchaProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </RecaptchaProvider>
      </body>
    </html>
  )
}
