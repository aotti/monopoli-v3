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
            <p id="result_notif_message"></p>
            <p id="result_notif_timer"></p>
            {gameState.showGameNotif?.match('with_button') ? <GameNotifWithButtons /> : null}
        </div>
    )
}

function GameNotifWithButtons() {
    const miscState = useMisc()
    const gameState = useGame()
    // set button number
    const getButtonInfo = gameState.showGameNotif.split('-')[1]
    const countNotifButtons = getButtonInfo.match(/\d/) ? [...new Array(+getButtonInfo).keys()] : [...new Array(24).keys()]
    // button text
    const choiceButtonText = ['Nope', 'Of course']
    const choiceButtonColor = ['text-red-300', 'text-green-300']
    const choiceButtonId = ['nope_button', 'ofcourse_button']

    return (
        <div className="flex gap-2 justify-between my-2 mx-6">
            {countNotifButtons.map(v => {
                const colorClass = countNotifButtons.length == 2 ? choiceButtonColor[v] : ''
                const buttonId = countNotifButtons.length == 2 ? choiceButtonId[v] : null
                
                return (
                    <button key={v} type="button" id={buttonId} className={`${colorClass} hidden px-1 active:opacity-75`}>
                        {countNotifButtons.length === 2 ? choiceButtonText[v] : v+1}
                    </button>
                )
            })}
        </div>
    )
}