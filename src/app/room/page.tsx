"use client"

import HeaderContent from "../../components/HeaderContent";
import ScreenPortraitWarning from "../../components/ScreenPortraitWarning";
import { Press_Start_2P } from "next/font/google"
import RoomContent from "./RoomContent";

const retroFont = Press_Start_2P({
    subsets: ['latin'],
    weight: ['400']
})

export default function Page() {

    return (
        <div className={`${retroFont.className} text-white text-xs lg:text-sm`}>
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 h-screen w-screen">
                <header>
                    <HeaderContent />
                </header>
    
                <main>
                    <RoomContent />
                </main>
            </div>
            {/* orientation portrait warning */}
            <ScreenPortraitWarning />
        </div>
    )
}