import { useEffect, useState } from "react"
import { useGame } from "../context/GameContext"
import { useMisc } from "../context/MiscContext"
import { translateUI } from "../helper/helper"

export default function LoadingPage() {
    
    return (
        // h-[calc()] used to fill the empty (height) space 
        // 100vh = landscape using h-screen
        // must count all pixel that affected by margin, padding, height
        // 100vh - 3.75rem (header height)
        <div className="flex flex-col items-center justify-center h-[calc(100vh-3.75rem)]">
            <p className="text-center text-xl"> Loading.. </p>
            {/* add button to go home */}
            <BackToHome />
        </div>
    )
}

function BackToHome() {
    const miscState = useMisc()
    
    return (
        <div className="text-center text-xs italic"> 
            <span suppressHydrationWarning={true}> {translateUI({lang: miscState.language, text: 'takes too long? back to '})} </span> 
            <a href="/" className="underline text-green-400" suppressHydrationWarning={true}> 
                {translateUI({lang: miscState.language, text: 'Home', lowercase: true})} 
            </a>
        </div>
    )
}