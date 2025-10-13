import { useRef } from "react"
import { clickInsideElement } from "../../../../helper/click-inside"
import { useMisc } from "../../../../context/MiscContext"
import { useGame } from "../../../../context/GameContext"
import { translateUI } from "../../../../helper/helper"
import Image from "next/image"

export default function GameNotif() {
    const miscState = useMisc()
    const gameState = useGame()
    // hide notif
    const gameNotifRef = useRef()
    // click outside element
    clickInsideElement(gameNotifRef, () => {
        // dont close if notif has button
        if(!gameState.showGameNotif || gameState.showGameNotif.match('with_button')) return
        miscState.setAnimation(false)
        setTimeout(() => gameState.setShowGameNotif(null), 400)
    })
    
    return (
        <div ref={gameNotifRef} className={`relative z-10 top-[17.5%] lg:top-1/3 flex-col gap-2 bg-darkblue-1 border-8bit-text w-3/4 lg:w-1/2 leading-relaxed
        ${gameState.showGameNotif ? 'flex' : 'hidden'}
        ${miscState.animation ? 'animate-slide-down' : 'animate-slide-up'}`}>
            <p id="result_notif_title" className="border-b-2 p-1"></p>
            <div className="flex items-center justify-around">
                <GameNotifWithImage />
                <div className="w-[50vw] lg:w-[35vw]">
                    <p id="result_notif_message" className="whitespace-pre-line"></p>
                    <p id="result_notif_timer"></p>
                    {gameState.showGameNotif?.match('with_button') ? <GameNotifWithButtons /> : null}
                </div>
            </div>
            {!gameState.showGameNotif?.match('with_button') ? 
                <span className="text-red-300">
                    {translateUI({lang: miscState.language, text: 'click notif to dismiss'})}
                </span> : null}
        </div>
    )
}

function GameNotifWithImage() {
    const gameState = useGame()
    const showImage = gameState.showGameNotif?.match('card') ? 'block' : 'hidden'

    return (
        <div className={`${showImage} lg:w-44 lg:h-40`}>
            <Image id="card_image" src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sprites/transparent-y2LMJ3nPAfiAtwX1FQordG6v3FpSaw.png" alt="card-image" width={100} height={150} unoptimized draggable={false} />
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
        <div className={`flex flex-wrap gap-4 ${setJustifyAlign} my-2 mx-4`}>
            {countNotifButtons.map(v => 
                <button key={v} type="button" data-id={`notif_button_${v}`} className="hidden p-1 min-w-14 min-h-8 lg:min-w-10 active:opacity-75">
                    {v+1}
                </button>
            )}
        </div>
    )
}

export function GameNotifPlayerTurn() {
    return (
        <div className="mx-auto">
            <span id="player_turn_notif" className="whitespace-pre"></span>
        </div>
    )
}