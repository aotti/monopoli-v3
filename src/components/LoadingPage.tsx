import { useEffect, useState } from "react"
import { useGame } from "../context/GameContext"
import { useMisc } from "../context/MiscContext"
import { translateUI } from "../helper/helper"

export default function LoadingPage() {
    const gameState = useGame()
    
    return (
        // h-[calc()] used to fill the empty (height) space 
        // 100vh = landscape using h-screen
        // must count all pixel that affected by margin, padding, height
        // 100vh - 3.75rem (header height)
        <div className="flex flex-col items-center justify-center h-[calc(100vh-3.75rem)]">
            <p className="text-center text-xl"> Loading.. </p>
            {/* add button to go home or room */}
            {gameState.myPlayerInfo.display_name == 'guest' ? <BackToHome /> : <BackToRoomList />}
        </div>
    )
}

function BackToHome() {
    const miscState = useMisc()
    const [stuckLoad, setStuckLoad] = useState(false)

    let stuckLoadInterval = null
    useEffect(() => {
        // loading screen more than 2 seconds
        if(miscState.isLoading) {
            stuckLoadInterval = setTimeout(() => setStuckLoad(true), 3000);
        }
        else {
            clearInterval(stuckLoadInterval)
            setStuckLoad(false)
        }
    }, [miscState.isLoading])
    
    return !stuckLoad ? null
        : <div className="text-center text-xs italic"> 
            <span suppressHydrationWarning={true}> {translateUI({lang: miscState.language, text: 'takes too long? back to '})} </span> 
            <a href="/" className="underline text-green-400" suppressHydrationWarning={true}> 
                {translateUI({lang: miscState.language, text: 'Home', lowercase: true})} 
            </a>
        </div>
}

function BackToRoomList() {
    const miscState = useMisc()
    const [stuckLoad, setStuckLoad] = useState(false)

    let stuckLoadInterval = null
    useEffect(() => {
        // loading screen more than 2 seconds
        if(miscState.isLoading) {
            stuckLoadInterval = setTimeout(() => setStuckLoad(true), 3000);
        }
        else {
            clearInterval(stuckLoadInterval)
            setStuckLoad(false)
        }
    }, [miscState.isLoading])

    return !stuckLoad ? null
        : <div className="text-center text-xs italic"> 
            <span suppressHydrationWarning={true}> {translateUI({lang: miscState.language, text: 'takes too long? back to '})} </span> 
            <a href="/room" className="underline text-green-400" suppressHydrationWarning={true}> 
                {translateUI({lang: miscState.language, text: 'Home', lowercase: true})} 
            </a>
        </div>
}