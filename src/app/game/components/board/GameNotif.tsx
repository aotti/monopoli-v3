import { useEffect, useRef } from "react"
import { clickOutsideElement } from "../../../../helper/helper"
import { useMisc } from "../../../../context/MiscContext"

export default function GameNotif() {
    const miscState = useMisc()
    // ### TESTING NOTIF ANIMATION
    const notifRef = useRef()
    clickOutsideElement(notifRef, () => {
        miscState.setAnimation(false)
        setTimeout(() => miscState.setShowModal(null), 400)
    })
    useEffect(() => {
        if(!miscState.showModal) miscState.setShowModal('notif')
    }, [])
    
    return (
        // notif box
        <div ref={notifRef} className={`relative top-1/3 flex flex-col gap-2 bg-darkblue-1 border-8bit-text w-2/5 leading-relaxed
        ${miscState.showModal == 'notif' ? 'block' : 'hidden'}
        ${miscState.animation ? 'animate-slide-down' : 'animate-slide-up'}`}>
            <p className="border-b-2 p-1"> notif title </p>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid laborum velit voluptatibus in et ut cupiditate nesciunt quaerat ad vel? Delectus sint repellendus odio praesentium nesciunt illo neque fugit est!
            </p>
        </div>
    )
}