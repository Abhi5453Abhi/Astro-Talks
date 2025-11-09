import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Astro Talks - Connect with Astrologer',
  description: 'Experience personalized astrological guidance from your Astrologer',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body className="bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}

