import GamePage from "./GamePage";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const imgHost = 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
    return {
        title: 'Monopoli Lemao | Game Room',
        description: 'teu ngarti basa sunda aing teh, hayang belajar tapi kumaha.. 😢',
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
        monopoly: {
            subscribeKey: process.env.MONOPOLY_SUB_KEY,
            publishKey: process.env.MONOPOLY_PUB_KEY,
            userId: process.env.MONOPOLY_UUID
        },
        chatting: {
            subscribeKey: process.env.CHATTING_SUB_KEY,
            publishKey: process.env.CHATTING_PUB_KEY,
            userId: process.env.CHATTING_UUID
        }
    }

    return <GamePage pubnubSetting={pubnubSetting} />
}