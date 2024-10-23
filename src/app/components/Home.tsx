"use client"

import { Press_Start_2P } from "next/font/google"
import MainContent from "./main/MainContent"
import { useState } from "react"
import { IMiscContext, ITranslate } from "../helper/types"
import HeaderContent from "./header/HeaderContent"
import ScreenPortraitWarning from "./ScreenPortraitWarning"
import { MiscContext } from "../context/MiscContext"

const retroFont = Press_Start_2P({
    subsets: ['latin'],
    weight: ['400']
})

export default function Home() {
    const [language, setLanguage] = useState<ITranslate['lang']>('english')
    // misc context state
    const miscContextState: IMiscContext = {
        language: language,
        setLanguage: setLanguage
    }

    return (
        <MiscContext.Provider value={miscContextState}>
            <div className={`${retroFont.className} text-white text-xs lg:text-sm`}>
                {/* padding .5rem */}
                <div className="p-2 bg-darkblue-2 h-screen w-screen">
                    <header>
                        <HeaderContent />
                    </header>
        
                    <main>
                        <MainContent />
                    </main>
                </div>
                {/* orientation portrait warning */}
                <ScreenPortraitWarning />
            </div>
        </MiscContext.Provider>
    )
}