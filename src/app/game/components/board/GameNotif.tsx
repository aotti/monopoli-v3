import { useRef } from "react"
import { clickOutsideElement } from "../../../../helper/click-outside"
import { useMisc } from "../../../../context/MiscContext"
import { useGame } from "../../../../context/GameContext"

export default function GameNotif() {
    const miscState = useMisc()
    const gameState = useGame()
    // hide notif
    const gameNotifRef = useRef()
    // click outside element
    clickOutsideElement(gameNotifRef, () => {
        // dont close if notif has button
        if(!gameState.showGameNotif || gameState.showGameNotif.match('with_button')) return
        miscState.setAnimation(false)
        setTimeout(() => gameState.setShowGameNotif(null), 400)
    })
    
    return (
        <div ref={gameNotifRef} className={`relative z-10 top-1/3 flex-col gap-2 bg-darkblue-1 border-8bit-text w-2/5 leading-relaxed
        ${gameState.showGameNotif ? 'flex' : 'hidden'}
        ${miscState.animation ? 'animate-slide-down' : 'animate-slide-up'}`}>
            <p id="result_notif_title" className="border-b-2 p-1"></p>
            <div className="flex items-center justify-around">
                <GameNotifWithImage />
                <div className="w-[50vw] lg:w-[35vw]">
                    <p id="result_notif_message"></p>
                    <p id="result_notif_timer"></p>
                    {gameState.showGameNotif?.match('with_button') ? <GameNotifWithButtons /> : null}
                </div>
            </div>
        </div>
    )
}

function GameNotifWithImage() {
    const gameState = useGame()
    const showImage = gameState.showGameNotif?.match('card') ? 'block' : 'hidden'

    return (
        <div className={`${showImage} lg:w-44 lg:h-40`}>
            <img id="card_image" src="" alt="card-image" draggable={false} />
        </div>
    )
}

function GameNotifWithButtons() {
    const gameState = useGame()
    // set button number
    const getButtonInfo = gameState.showGameNotif.split('-')[1]
    const countNotifButtons = [...new Array(+getButtonInfo).keys()]
    const setJustifyAlign = +getButtonInfo === 2 ? 'justify-between' : 'justify-around'

    return (
        <div className={`flex flex-wrap gap-2 ${setJustifyAlign} my-2 mx-6`}>
            {countNotifButtons.map(v => 
                <button key={v} type="button" data-id={`notif_button_${v}`} className="hidden p-1 min-w-10 active:opacity-75">
                    {v+1}
                </button>
            )}
        </div>
    )
}