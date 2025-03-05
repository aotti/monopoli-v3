import GamePage from "./GamePage";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const imgHost = 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
    return {
        title: 'Monopoli Lemao | Game Room',
        description: 'Lets play this shit game together! 😀',
        icons: `https://${imgHost}/misc/Logo-transparent-18GAoQsXBykQtfc3WF2eD85z7yfzhc.png`,
        openGraph: {
            images: [{
                url: `https://${imgHost}/tile_other/Jail_100l-ICZXioK3ZAtyBzFw1EDulpESLGnpYt.png`
            }]
        }
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