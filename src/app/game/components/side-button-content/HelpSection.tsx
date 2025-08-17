import { useState } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { qS, translateUI } from "../../../../helper/helper"
import board_help_items from "../../config/help-items.json"

export default function HelpSection() {
    const miscState = useMisc()
    const gameState = useGame()
    // cards
    const communityCards = board_help_items.community_card
    const chanceCards = board_help_items.chance_card
    const specialCard = board_help_items.special_card
    const buffdebuffArea = board_help_items.area_items
    const gameSounds = board_help_items.game_sounds
    const minigame = board_help_items.mini_game

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
                <ListWithTabs title="Special Card" data={specialCard} />
                {/* buff debuff */}
                <ListWithTabs title="Buff/Debuff Area" data={buffdebuffArea} />
                {/* game sounds */}
                <ListWithTabs title="Game Sounds" data={gameSounds} />
                {/* mini game */}
                <ListWithTabs title="Minigame" data={minigame} />
            </ol>
        </div>
    )
}

function ListWithTabs({ title, data }: {title: string, data: {[key:string]: string[]}}) {
    const miscState = useMisc()
    // move between tabs
    const [tab, setTab] = useState<string>(null)

    return (
        <details className="my-2">
            <summary className="text-[10px] lg:text-xs text-green-400 cursor-pointer"> {translateUI({lang: miscState.language, text: title as any})} </summary>
            <div className="relative border">
                {/* pages */}
                <div className="flex justify-around cursor-pointer">
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
                                    // check if theres link
                                    const isTextValueLink = v.match(/https|null/)
                                    const textValue = isTextValueLink ? v.split(';;') : v

                                    return isTextValueLink 
                                        ? <li key={j}>
                                            <GameSoundsList tabLanguage={key} textValue={textValue as string[]} />
                                        </li>
                                        : <li key={j}> 
                                            {translateUI({lang: miscState.language, text: textValue as any})} 
                                        </li>
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
    return key == '>25%' || key == 'debuff 65%' ? 'bg-red-600'
        : key == '25%' ? 'bg-orange-600'
        : key == '15%' ? 'bg-yellow-600'
        : key == '8%' ? 'bg-emerald-600' 
        : key == '5%' || key == 'indonesia' || key == 'english' ? 'bg-stone-600'
        : 'bg-emerald-600'
}

function GameSoundsList({ tabLanguage, textValue }: {tabLanguage: string, textValue: string[]}) {
    const miscState = useMisc()

    const [name, credit, source] = textValue
    const sfxLanguage = tabLanguage == 'english' ? 'en' : 'id'
    const isSourceNull = source == 'null'
    const anchorHref = isSourceNull ? '#' : source
    const anchorClass = isSourceNull ? 'text-red-300' : 'text-blue-300'
    const anchorText = isSourceNull ? 'empty' : 'source'

    return (
        <>
            {/* 0 = name, 1 = credit */}
            <div>
                <span> {translateUI({lang: tabLanguage as any, text: name as any})} </span>
                <span> {`(${credit})`} </span>
            </div>
            {/* 2 = sfx game, 3 = sfx origin */}
            <div className="flex items-center gap-2">
                <button type="button" onClick={() => (qS(`#sound_${sfxLanguage}_${name}`) as HTMLAudioElement)?.play()}>
                    <img src="https://img.icons8.com/?id=80556&format=png" alt="play" className="!w-4 !h-4 lg:!w-6 lg:!h-6" />
                </button>
                <a href={anchorHref} target="_blank" rel="noreferrer noopener" className={`${anchorClass} underline`} onClick={ev => confirm(translateUI({lang: miscState.language, text: 'you will open new tab, proceed?'})) ? null : ev.preventDefault()}>
                    {anchorText}
                </a>
            </div>
        </>
    )
}