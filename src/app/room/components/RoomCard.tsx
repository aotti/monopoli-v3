import { useEffect } from "react"
import { useMisc } from "../../../context/MiscContext"
import { applyTooltip, qSA, translateUI } from "../../../helper/helper"

export default function RoomCard({ roomRules }: {roomRules: string}) {
    const miscState = useMisc()
    // tooltip (the element must have position: relative)
    useEffect(() => {
        qSA('[data-tooltip]').forEach((el: HTMLElement) => {
            // mouse event
            el.onpointerover = ev => applyTooltip(ev as any)
            el.onpointerout = ev => applyTooltip(ev as any)
            // touch event
            el.ontouchstart = ev => applyTooltip(ev as any)
            el.ontouchend = ev => applyTooltip(ev as any)
        })
    }, [])

    return (
        <div className="w-[calc(100%-52.5%)] h-56 lg:h-60 border-2">
            <form onSubmit={ev => ev.preventDefault()}>
                {/* room name */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Name'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="room_name" className="bg-transparent text-white w-3/5 border-b border-b-black" value={'lele gaming'} readOnly />
                </div>
                {/* rules */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Rules'})} </span>
                        <span> : </span>
                    </label>
                    <div className="w-3/5 border-b">
                        {/* hover rules */}
                        <p data-tooltip={roomRules.replaceAll(';', '\n')} className="relative w-full text-center bg-transparent" > ??? </p>
                        {/* input */}
                        <input type="hidden" value={roomRules} readOnly />
                    </div>
                </div>
                {/* player count */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Count'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="player_count" className="bg-transparent text-white w-3/5 border-b border-b-black" value={'1 player(s)'} readOnly />
                </div>
                {/* max player */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Max'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="max_player" className="bg-transparent text-white w-3/5 border-b border-b-black" value={'4 player(s)'} readOnly />
                </div>
                {/* creator */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Creator'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="creator" className="bg-transparent text-white w-3/5 border-b border-b-black" value={'dengkul'} readOnly />
                </div>
                {/* spectate */}
                <div className="flex text-right p-2 lg:mt-2">
                    <button type="button" className="w-16 lg:w-24 text-2xs lg:text-xs bg-success border-8bit-success">
                        {translateUI({lang: miscState.language, text: 'Join'})}
                    </button>
                    <button type="button" className="w-16 lg:w-24 text-2xs lg:text-xs bg-primary border-8bit-primary">
                        {translateUI({lang: miscState.language, text: 'Spectate'})}
                    </button>
                    <button type="button" className="w-16 lg:w-24 text-2xs lg:text-xs bg-darkblue-1 border-8bit-text">
                        {translateUI({lang: miscState.language, text: 'Delete'})}
                    </button>
                </div>
            </form>
        </div>
    )
}