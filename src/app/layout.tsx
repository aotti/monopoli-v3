import { GameProvider } from '../context/GameContext'
import { MiscProvider } from '../context/MiscContext'
import './globals.css'
import { Viewport } from 'next'
import { Press_Start_2P } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { cookies } from 'next/headers'

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width'
}

const retroFont = Press_Start_2P({
    subsets: ['latin'],
    weight: ['400']
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const accessSecret = process.env.ACCESS_TOKEN_SECRET
  const savedLanguage: any = (await cookies()).get('language')?.value
  const cryptoKey = process.env.CRYPTO_KEY

  return (
    <html lang="en">
      <MiscProvider accessSecret={accessSecret} savedLanguage={savedLanguage} cryptoKey={cryptoKey}>
        <GameProvider>
          <body className={`${retroFont.className}`}>
            {children}
            <Analytics />
            <SpeedInsights />
          </body>
        </GameProvider>
      </MiscProvider>
    </html>
  )
}
