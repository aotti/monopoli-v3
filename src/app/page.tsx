import HomePage from "./home/HomePage";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Monopoli Lemao',
        description: 'Lets play this shit game together! 😀',
        icons: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/Logo-transparent-18GAoQsXBykQtfc3WF2eD85z7yfzhc.png'
    }
}

export default function Page() {

    return <HomePage />
}