import { GameProvider } from '../context/GameContext'
import { MiscProvider } from '../context/MiscContext'
import './globals.css'
import { Viewport } from 'next'
import { Press_Start_2P } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width'
}

const retroFont = Press_Start_2P({
    subsets: ['latin'],
    weight: ['400']
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const accessSecret = process.env.ACCESS_TOKEN_SECRET

  return (
    <html lang="en">
      <MiscProvider accessSecret={accessSecret}>
        <GameProvider>
          <body className={`${retroFont.className}`}>
            {children}
            <Analytics />
          </body>
        </GameProvider>
      </MiscProvider>
    </html>
  )
}
