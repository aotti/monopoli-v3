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
  // pubnub settings
  const pubnubSubSetting = {
    subscribeKey: process.env.PUBNUB_SUB_KEY,
    userId: process.env.PUBNUB_UUID
  }

  return (
    <html lang="en">
      <MiscProvider accessSecret={accessSecret} pubnubSubSetting={pubnubSubSetting}>
        <GameProvider>
          <body>{children}</body>
        </GameProvider>
      </MiscProvider>
    </html>
  )
}
