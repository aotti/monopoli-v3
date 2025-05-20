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
    // monopoly uuid
    const monopolyUUIDs = process.env.MONOPOLY_UUID.split('.')
    const monopolyRNG = Math.floor(Math.random() * 10)
    // chatting uuid
    const chattingUUIDs = process.env.CHATTING_UUID.split('.')
    const chattingRNG = Math.floor(Math.random() * 10)
    // pubnub settings 
    const pubnubSetting = {
        monopoly: {
            subscribeKey: process.env.MONOPOLY_SUB_KEY,
            publishKey: process.env.MONOPOLY_PUB_KEY,
            userId: monopolyUUIDs[monopolyRNG]
        },
        chatting: {
            subscribeKey: process.env.CHATTING_SUB_KEY,
            publishKey: process.env.CHATTING_PUB_KEY,
            userId: chattingUUIDs[chattingRNG]
        }
    }

    return <GamePage pubnubSetting={pubnubSetting} />
}