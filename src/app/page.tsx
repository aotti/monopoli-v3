import HomePage from "./home/HomePage";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const imgHost = 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
    return {
        title: 'Monopoli Lemao',
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

    return <HomePage />
}