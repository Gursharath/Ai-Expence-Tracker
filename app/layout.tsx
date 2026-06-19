import "./globals.css"

import { Inter } from "next/font/google"

import { AuthProvider } from "@/components/providers/auth-provider"

import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata = {
  title: "SmartExpense AI",
  description:
    "AI Powered Smart Expense Tracking Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        {/* Background Effects */}
        <div className="fixed inset-0 -z-50 overflow-hidden">
          <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]" />

          <div className="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />

          <div className="absolute inset-0 bg-grid opacity-[0.03]" />
        </div>

        <AuthProvider>
          {children}

          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              style: {
                background:
                  "rgba(17,24,39,0.9)",
                color: "white",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}