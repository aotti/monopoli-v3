import { useEffect, useRef } from "react"
import { useGame } from "../../../../context/GameContext"
import { applyTooltipEvent, clickOutsideElement, translateUI } from "../../../../helper/helper"
import PlayerSettingSellCity from "./PlayerSettingSellCity"
import PlayerSettingAttackCity from "./PlayerSettingAttackCity"
import { useMisc } from "../../../../context/MiscContext"

export default function PlayerSection() {
    const miscState = useMisc()
    const gameState = useGame()
    // click outside element
    const playerSettingRef = useRef()
    clickOutsideElement(playerSettingRef, () => gameState.setOpenPlayerSetting(false))
    // ### TEMP PLAYER CARDS
    const tempCards = [
        '>anti tax;>anti jail',
        '>nerf gaming dice;>nerf parking;>nerf tax',
        '>anti tax;>anti jail;>nerf gaming dice;>nerf parking;>nerf tax;>terlele awiwi'
    ]
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    return (
        <div className={`${gameState.gameSideButton == 'players' ? 'block' : 'hidden'}
        absolute top-[0vh] right-[calc(0rem+2.25rem)] lg:right-[calc(0rem+2.75rem)] 
        [writing-mode:horizontal-tb] p-1 overflow-y-scroll
        bg-darkblue-1 border-8bit-text w-[35vw] h-[calc(100%-1rem)]`}>
            {/* header */}
            <div className="flex items-center justify-center text-xs lg:text-sm border-b-2 pb-2 mb-1">
                {/* title */}
                <span> {translateUI({lang: miscState.language, text: 'players'})} </span>
                {/* setting */}
                <div className="absolute z-10 top-0 right-0 w-6 lg:w-8">
                    {/* setting button */}
                    <button type="button" onClick={() => gameState.setOpenPlayerSetting(b => !b)}>
                        <img src="https://img.icons8.com/?size=50&id=4511GGVppfIx&format=png&color=FFFFFF" alt="setting" />
                    </button>
                    {/* setting menu */}
                    <div ref={playerSettingRef} className={`${gameState.openPlayerSetting ? 'block' : 'hidden'}
                    absolute right-4 flex flex-col gap-2 
                    text-2xs lg:text-xs text-left
                    bg-darkblue-3 border-8bit-modal w-max p-1`}>
                        {/* auto roll dice */}
                        <div className="flex items-center gap-2 p-1 hover:bg-darkblue-2">
                            <label htmlFor="auto_roll_dice" className="w-full"> 
                                {translateUI({lang: miscState.language, text: 'Auto roll dice'})} 
                            </label>
                            <input type="checkbox" id="auto_roll_dice" onClick={() => console.log('auto_roll')} />
                        </div>
                        {/* sell city */}
                        <div className="flex items-center p-1 hover:bg-darkblue-2">
                            <input type="button" id="sell_city" onClick={() => {
                                gameState.setDisplaySettingItem('sell_city')
                                gameState.setOpenPlayerSetting(false)
                            }} />
                            <label htmlFor="sell_city" className="w-full"> 
                                {translateUI({lang: miscState.language, text: 'Sell City'})} 
                            </label>
                        </div>
                        {/* history */}
                        <div className="flex items-center gap-2 p-1 hover:bg-darkblue-2">
                            <label htmlFor="game_history" className="w-full">
                                {translateUI({lang: miscState.language, text: 'Game History'})}
                            </label>
                            <input type="checkbox" id="game_history" onChange={ev => {
                                ev.currentTarget.checked
                                    ? gameState.setDisplaySettingItem('game_history')
                                    : gameState.setDisplaySettingItem(null)
                            }} />
                        </div>
                        {/* attack */}
                        <div className="flex items-center p-1 hover:bg-darkblue-2">
                            <input type="button" id="attack_city" onClick={() => {
                                gameState.setDisplaySettingItem('attack_city')
                                gameState.setOpenPlayerSetting(false)
                            }} />
                            <label htmlFor="attack_city" className="w-full">
                                {translateUI({lang: miscState.language, text: 'Attack City'})}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            {/* player list */}
            <div className="flex flex-col gap-1">
                {/* player 1 */}
                <div className="flex items-stretch text-center gap-1">
                    <div className="flex items-center w-[17vw] bg-darkblue-2">
                        <span className="w-full"> dengkul lele </span>
                    </div>
                    <div className="flex items-center w-[15vw] bg-darkblue-2">
                        <span className="w-full"> Rp 750.000 </span>
                    </div>
                    <div className="relative flex items-center bg-darkblue-2" data-tooltip={tempCards[0].replaceAll(';', '\n')}>
                        <img src="https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=FFFFFF" alt="📑" className="w-8 lg:w-14" />
                    </div>
                </div>
                {/* player 2 */}
                <div className="flex items-stretch text-center gap-1">
                    <div className="flex items-center w-[17vw] bg-darkblue-2">
                        <span className="w-full"> tersometimes </span>
                    </div>
                    <div className="flex items-center w-[15vw] bg-darkblue-2">
                        <span className="w-full"> Rp 50.000 </span>
                    </div>
                    <div className="relative flex items-center bg-darkblue-2" data-tooltip={tempCards[1].replaceAll(';', '\n')}>
                        <img src="https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=FFFFFF" alt="📑" className="w-8 lg:w-14" />
                    </div>
                </div>
                {/* player 3 */}
                <div className="flex items-stretch text-center gap-1">
                    <div className="flex items-center w-[17vw] bg-darkblue-2">
                        <span className="w-full"> terlele </span>
                    </div>
                    <div className="flex items-center w-[15vw] bg-darkblue-2">
                        <span className="w-full"> Rp 20.000 </span>
                    </div>
                    <div className="relative flex items-center bg-darkblue-2" data-tooltip={tempCards[2].replaceAll(';', '\n')}>
                        <img src="https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=FFFFFF" alt="📑" className="w-8 lg:w-14" />
                    </div>
                </div>
            </div>
            {/* sell city box */}
            <PlayerSettingSellCity />
            {/* attack city box */}
            <PlayerSettingAttackCity />
        </div>
    )
}