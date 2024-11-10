"use client"

import { Press_Start_2P } from "next/font/google"
import HeaderContent from "../../components/HeaderContent"
import HomeContent from "../home/HomeContent"
import ScreenPortraitWarning from "../../components/ScreenPortraitWarning"

const retroFont = Press_Start_2P({
    subsets: ['latin'],
    weight: ['400']
})

export default function HomePage() {

    return (
        <div className={`${retroFont.className} text-white text-xs lg:text-sm`}>
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 h-screen w-screen">
                <header>
                    <HeaderContent />
                </header>
    
                <main>
                    <HomeContent />
                </main>
            </div>
            {/* orientation portrait warning */}
            <ScreenPortraitWarning />
        </div>
    )
}