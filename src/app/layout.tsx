import PubNub from 'pubnub'
import { GameProvider } from '../context/GameContext'
import { MiscProvider } from '../context/MiscContext'
import './globals.css'
import { Viewport } from 'next'

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width'
}

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
          <body>{children}</body>
        </GameProvider>
      </MiscProvider>
    </html>
  )
}
