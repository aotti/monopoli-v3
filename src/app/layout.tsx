import PubNub from 'pubnub'
import { GameProvider } from '../context/GameContext'
import { MiscProvider } from '../context/MiscContext'
import './globals.css'
import { Viewport } from 'next'
import { Press_Start_2P } from 'next/font/google'
import Head from 'next/head'

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
          <body className={`${retroFont.className}`}>{children}</body>
        </GameProvider>
      </MiscProvider>
    </html>
  )
}
