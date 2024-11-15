import { useState } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"
import board_help_items from "../../config/board-help-items.json"

export default function HelpSection() {
    const miscState = useMisc()
    const gameState = useGame()
    // cards
    const communityCards = board_help_items.community_card
    const chanceCards = board_help_items.chance_card
    const cardEffect = board_help_items.card_effect
    const buffdebuffArea = board_help_items.area_items

    return (
        <div className={`${gameState.gameSideButton == 'help' ? 'block' : 'hidden'}
        absolute top-[0vh] right-[calc(0rem+2.25rem)] lg:right-[calc(0rem+2.75rem)] 
        [writing-mode:horizontal-tb] p-1 overflow-y-scroll
        bg-darkblue-1 border-8bit-text w-[30vw] h-[calc(100%-1rem)]`}>
            <p className="text-xs lg:text-sm border-b-2 pb-1 mb-1">
                {translateUI({lang: miscState.language, text: 'help'})}
            </p>
            <ol className="text-left text-2xs lg:text-[10px]">
                {/* kartu dana umum */}
                <ListWithTabs title="Community Card" data={communityCards} />
                {/* kartu kesempatan */}
                <ListWithTabs title="Chance Card" data={chanceCards} />
                {/* efek kartu */}
                <ListWithTabs title="Card Effect" data={cardEffect} />
                {/* buff debuff */}
                <ListWithTabs title="Buff/Debuff Area" data={buffdebuffArea} />
            </ol>
        </div>
    )
}

function ListWithTabs({ title, data }: {title: string, data: {[key:string]: string[]}}) {
    const miscState = useMisc()
    // move between tabs
    const [tab, setTab] = useState<string>(null)

    return (
        <details className="my-2 cursor-pointer">
            <summary className="text-[10px] lg:text-xs text-green-400"> {translateUI({lang: miscState.language, text: title as any})} </summary>
            <div className="relative border">
                {/* pages */}
                <div className="flex justify-around">
                    {Object.keys(data).map((key, i) => {
                        // rarity bg color
                        const rarityBgColor = getRarityBgColor(key)
                        return (
                            <p key={i} className={`${tab == key ? rarityBgColor : 'bg-slate-600'} w-full text-center py-1`} 
                            onClick={() => setTab(key as any)}> {key} </p>
                        )
                    })}
                </div>
                {/* list */}
                {Object.entries(data).map(([key,value], i) => {
                    // rarity bg color
                    const rarityBgColor = getRarityBgColor(key)
                    return (
                        <div key={i} className={`${tab == key ? `block ${rarityBgColor}` : 'hidden'} w-full border`}>
                            <ol>
                                {value.map((v, j) => {
                                    return <li key={j}> {translateUI({lang: miscState.language, text: v as any})} </li>
                                })}
                            </ol>
                        </div>
                    )
                })}
            </div>
        </details>
    )
}

function getRarityBgColor(key: string) {
    return key == '>25%' ? 'bg-red-600'
        : key == '25%' ? 'bg-orange-600'
        : key == '15%' ? 'bg-yellow-600'
        : key == '8%' ? 'bg-emerald-600' 
        : key == '5%' ? 'bg-stone-600'
        : 'bg-emerald-600'
}