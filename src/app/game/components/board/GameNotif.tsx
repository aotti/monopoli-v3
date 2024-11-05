import { useEffect, useRef } from "react"
import { clickOutsideElement } from "../../../../helper/helper"
import { useMisc } from "../../../../context/MiscContext"
import { useGame } from "../../../../context/GameContext"

export default function GameNotif() {
    const miscState = useMisc()
    const gameState = useGame()
    // ### TESTING NOTIF ANIMATION
    // ### NANTI GANTI showModal DENGAN gameState.showNotif
    const notifRef = useRef()
    clickOutsideElement(notifRef, () => {
        miscState.setAnimation(false)
        setTimeout(() => gameState.setShowNotif(null), 400)
    })
    useEffect(() => {
        if(!miscState.showModal) gameState.setShowNotif('normal')
    }, [])
    
    return (
        // notif box
        <div ref={notifRef} className={`relative top-1/3 flex-col gap-2 bg-darkblue-1 border-8bit-text w-2/5 leading-relaxed
        ${gameState.showNotif == 'normal' ? 'flex' : 'hidden'}
        ${miscState.animation ? 'animate-slide-down' : 'animate-slide-up'}`}>
            <p className="border-b-2 p-1"> notif title </p>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid laborum velit voluptatibus in et ut cupiditate nesciunt quaerat ad vel? Delectus sint repellendus odio praesentium nesciunt illo neque fugit est!
            </p>
        </div>
    )
}
