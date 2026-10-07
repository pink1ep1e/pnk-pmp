import type { Metadata } from "next"
import { Unbounded, Manrope } from "next/font/google"
import "./globals.css"

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "pmp — Project Management Platform",
    template: "%s · pmp",
  },
  description: "Управление сервисами pnk: id, почта, VPS, поддержка",
  icons: {
    icon: "/pmp-small-logo.svg",
    apple: "/pmp-small-logo.svg",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${unbounded.variable} ${manrope.variable} antialiased bg-[#0c0d10] text-white`}>
        {children}
      </body>
    </html>
  )
}
