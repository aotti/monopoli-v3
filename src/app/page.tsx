import { cookies } from "next/headers";
import HomePage from "./home/HomePage";
import { Metadata } from "next";
import MaintenancePage from "./home/MaintenancePage";

export async function generateMetadata(): Promise<Metadata> {
    const imgHost = 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
    return {
        title: 'Monopoli Lemao',
        description: 'Permainan monopoli yang tidak hanya berkeliling dan beli kota, tapi bisa menyerang kota pemain lain atau bermain minigame. Ayo main bersama teman agar hosting gratisan ini kena limit dan server menjadi down! (teu ngarti basa sunda aing teh, hayang belajar tapi kumaha.. 😢)',
        icons: `https://${imgHost}/misc/Logo-transparent-18GAoQsXBykQtfc3WF2eD85z7yfzhc.png`,
        openGraph: {
            images: [{
                url: `https://${imgHost}/tile_other/Jail_100l-ICZXioK3ZAtyBzFw1EDulpESLGnpYt.png`
            }]
        }
    }
}

export default async function Page() {
    const maintenanceStatus = process.env.MAINTENANCE_STATUS
    const isRefreshTokenExist = typeof cookies().get('refreshToken')?.value == 'string'

    return maintenanceStatus === 'true'
            ? <MaintenancePage />
            : <HomePage isRefreshTokenExist={isRefreshTokenExist} />
}