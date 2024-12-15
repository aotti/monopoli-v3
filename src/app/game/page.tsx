import GamePage from "./GamePage";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Monopoli Lemao | Game Room',
        description: 'Lets play this shit game together! 😀',
        icons: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/Logo-transparent-18GAoQsXBykQtfc3WF2eD85z7yfzhc.png'
    }
}

export default function Page() {
    // pubnub settings
    const pubnubSetting = {
      subscribeKey: process.env.PUBNUB_SUB_KEY,
      publishKey: process.env.PUBNUB_PUB_KEY,
      userId: process.env.PUBNUB_UUID
    }

    return <GamePage pubnubSetting={pubnubSetting} />
}