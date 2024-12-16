import { useEffect, useRef } from "react"
import { clickOutsideElement } from "../../../../helper/click-outside"
import { useMisc } from "../../../../context/MiscContext"
import { useGame } from "../../../../context/GameContext"

export default function GameNotif() {
    const miscState = useMisc()
    const gameState = useGame()
    
    // hide notif
    const hideNotif = () => {
        miscState.setAnimation(false)
        setTimeout(() => gameState.setShowGameNotif(null), 400)
    }

    useEffect(() => {
        console.log('notif',gameState.showGameNotif)
    }, [gameState.showGameNotif])
    
    return (
        // notif box
        <div className={`relative z-10 top-1/3 flex-col gap-2 bg-darkblue-1 border-8bit-text w-2/5 leading-relaxed
        ${gameState.showGameNotif == 'normal' ? 'flex' : 'hidden'}
        ${miscState.animation ? 'animate-slide-down' : 'animate-slide-up'}`} onPointerLeave={hideNotif}>
            <p id="result_notif_title" className="border-b-2 p-1"></p>
            <p id="result_notif_message"></p>
        </div>
    )
}
