import { qS, translateUI } from "../../../../helper/helper"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { useEffect } from "react"
import Image from "next/image"

export default function PlayerSettingGameHistory() {
    const miscState = useMisc()
    const gameState = useGame()

    useEffect(() => {
        // scroll to bottom when new history appear
        const historyContainer = qS('#history_container')
        if(historyContainer) historyContainer.scrollTo({top: historyContainer.scrollHeight})
    }, [gameState.gameHistory])

    return (
        <div className={`absolute -left-2 bottom-8 flex flex-col items-center transition-all ease-in-out duration-500
        w-[14vw] ${gameState.expandGameHistory ? 'h-[55vh]' : 'h-[5vh]'} bg-darkblue-1 border-2`}>
            {/* history content */}
            <div id="history_container" className="flex flex-col gap-2 w-full h-[47vh] overflow-y-scroll scrollbar-none p-1">
                {gameState.gameHistory.map((v,i) => {
                    const myHistories = v.display_name == gameState.myPlayerInfo?.display_name
                    // split history
                    const [historyTitle, historyContent] = v.history.split(': ')
                    // check card content
                    const checkHistoryContent1 = historyContent.match(/lose money,move place|get money,more money|special card|more money|get money|lose money|take money|move place|move forward|move backward|take card|destroy property|upgrade city|sell city|retrieved 🥺/) || ''
                    // check if its buy city, chance, community history
                    const checkHistoryContent2 = historyContent.match(/land|1house|2house|chance|community|none/) || ''
                    // translate history
                    const translateHistoryTitle = translateUI({lang: miscState.language, text: historyTitle as any}) || historyTitle
                    const translateHistoryContent = historyContent.replace(checkHistoryContent1[0], 
                                                    translateUI({lang: miscState.language, text: checkHistoryContent1[0] as any}))
                                                    .replace(checkHistoryContent2[0], translateUI({lang: miscState.language, text: checkHistoryContent2[0] as any}))
                    // finalized translate
                    const finalizedHistoryContent = `${translateHistoryTitle} ${translateHistoryContent}`

                    return (
                        v.room_id != gameState.gameRoomId ? null 
                        : <div key={i} className={`${myHistories ? 'bg-primary/30' : ''} border-b-2 border-dashed`}>
                            <p className="text-green-400"> {v.display_name} </p>
                            <p className="text-[7px] lg:text-[9px]"> {finalizedHistoryContent} </p>
                        </div>
                    )
                }
                )}
            </div>
            <p className="absolute bottom-0 z-20 w-full text-[1vw] text-center py-1 lg:py-2 cursor-pointer bg-darkblue-1 border-t-2"
            onClick={() => gameState.setExpandGameHistory(b => !b)} > 
                {translateUI({lang: miscState.language, text: 'Game History', lowercase: true})} 
            </p>
        </div>
    )
}

export function TileHistory({ data }) {
    const miscState = useMisc()
    const gameState = useGame()
    
    const {title} = data
    const translateTitle = translateUI({lang: miscState.language, text: title})
    const shortTitle = translateTitle.length <= 4 ? translateTitle : `${translateTitle.slice(0, 4)}-`
    // class for bottom right history
    const bottomRightClass = title == 'community' ? 'bottom-0 right-0 text-right justify-end bg-green-600/70' : 'bg-red-600/70'
    const expandHistoryClass = gameState.expandGameHistory ? 'z-20 w-[15vw] h-[46vh]' : 'w-[7.5vw] h-[11.5vh]'

    return (
        // only set z-index if history expand
        <div className={`absolute flex flex-col ${bottomRightClass} ${expandHistoryClass} transition-all ease-in-out duration-500 text-2xs lg:text-xs p-1`}>
            {title == 'community' 
                ? <>
                    {gameState.expandGameHistory ? <TileHistoryContent title={title} /> : null}
                    <span className="border-t"> {gameState.expandGameHistory ? translateTitle : shortTitle} </span>
                </>
                : <>
                    <span className="border-b"> {gameState.expandGameHistory ? translateTitle : shortTitle} </span>
                    {gameState.expandGameHistory ? <TileHistoryContent title={title} /> : null}
                </>}
        </div>
    )
}

function TileHistoryContent({ title }) {
    const gameState = useGame()

    const cardImageList = [
        {name: 'chance_s', imgclass: `card-chance-s`},
        {name: 'chance_a', imgclass: `card-chance-a`},
        {name: 'chance_b', imgclass: `card-chance-b`},
        {name: 'chance_c', imgclass: `card-chance-c`},
        {name: 'chance_d', imgclass: `card-chance-d`},
        {name: 'community_s', imgclass: `card-community-s`},
        {name: 'community_a', imgclass: `card-community-a`},
        {name: 'community_b', imgclass: `card-community-b`},
        {name: 'community_c', imgclass: `card-community-c`},
        {name: 'community_d', imgclass: `card-community-d`},
    ]
    const cardImageClass = `transition-all ease-in-out duration-300 
                            !w-6 lg:!w-14 !h-8 lg:!h-16 
                            hover:lg:!w-28 hover:lg:!h-36`
    const cardHistory = gameState.gameHistory.length === 0 ? []
                        : gameState.gameHistory.map(v => v.history.match(/community|chance/i) ? v : null).filter(i=>i)
                        
    return (
        <div className="grid grid-cols-2 justify-items-center w-full h-full py-1">
            {cardImageList.map((v,i) => {
                const modifyCardName = v.name.replace('_', ' ')
                const cardCounter = cardHistory.map(v => v.history.toLowerCase().match(modifyCardName) ? v : null).filter(i=>i)

                return (
                    !v.name.match(title) ? null
                    : <div className={i % 5 == 0 ? 'col-span-2' : ''}>
                        <Image src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sprites/transparent-y2LMJ3nPAfiAtwX1FQordG6v3FpSaw.png" alt={v.name} width={100} height={100} className={`${v.imgclass} ${cardImageClass}`} />
                        <p className="text-center"> {cardCounter.length} </p>
                    </div>
                )
            })}
        </div>
    )
}