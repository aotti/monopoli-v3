import { useEffect } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { applyTooltipEvent, moneyFormat, translateUI } from "../../../../helper/helper"
import board_normal from '../../config/board-normal.json'
import { IGameContext } from "../../../../helper/types"

export default function BoardNormal() {
    const gameState = useGame()

    const squareNumberStyle = 'before:absolute before:z-10 before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'
    // board tiles
    const boardNormal = board_normal
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [gameState.gamePlayerInfo])

    return (
        <div className="relative z-10">
            {/* row 1 */}
            <div className="flex">
            {boardNormal.row_1.map((tile, i) => {
                return (
                    tile.type === null
                        ? <div key={i} className="w-[7.5vw] h-[23vh]"></div>
                        : tile.type == 'city'
                            ? <div key={i} className={`border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileCity data={tile} />
                            </div>
                            : <div key={i} className={`border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileOther data={tile} />
                            </div>
                )
            })}
            </div>
            {/* row 2 */}
            <div className="flex">
            {boardNormal.row_2.map((tile, i) => {
                return (
                    tile.type === null
                        ? <div key={i} className="w-[7.5vw] h-[23vh]"></div>
                        : tile.type == 'city'
                            ? <div key={i} className={`border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileCity data={tile} />
                            </div>
                            : <div key={i} className={`border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileOther data={tile} />
                            </div>
                )
            })}
            </div>
            {/* row 3 */}
            <div className="flex">
            {boardNormal.row_3.map((tile, i) => {
                return (
                    tile.type === null
                        ? <div key={i} className="w-[7.5vw] h-[23vh]"></div>
                        : tile.type == 'city'
                            ? <div key={i} className={`border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileCity data={tile} />
                            </div>
                            : <div key={i} className={`border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileOther data={tile} />
                            </div>
                )
            })}
            </div>
            {/* row 4 */}
            <div className="flex">
            {boardNormal.row_4.map((tile, i) => {
                return (
                    tile.type === null
                        ? <div key={i} className="w-[7.5vw] h-[23vh]"></div>
                        : tile.type == 'city'
                            ? <div key={i} className={`border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileCity data={tile} />
                            </div>
                            : <div key={i} className={`border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileOther data={tile} />
                            </div>
                )
            })}
            </div>
        </div>
    )
}

function TileCity({ data }: {data: {[key:string]: string|number}}) {
    const miscState = useMisc()
    const gameState = useGame()
    // tile data
    type TileCityType = {name: string, price: number, img: string, info: string, square: number}
    const { name, price, img, info, square } = data as TileCityType 
    // price label
    const priceText = `after:block after:content-[attr(data-price)]`
    // get room info
    const getGameRoomInfo = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
    // set curse
    const curse = gameState.gameRoomInfo[getGameRoomInfo]?.curse
    const curseRand = curse > 5 ? `5~${curse}%` : `5%`
    // modify info
    const translateInfo = translateUI({lang: miscState.language, text: info as any})
    const newInfo = name.match('Cursed')
                    ? `${name};${curseRand};${translateInfo}`
                    : `${name};${translateInfo}`
    // highlight
    const isPlayerOnTop = gameState.gamePlayerInfo.map(v => v.pos).indexOf(square)

    return (
        <div className="relative">
            <div className="absolute z-10" data-player-path={square}>
                {gameState.gamePlayerInfo.map((player, i) => player.pos == square ? <Characters key={i} playerData={player}/> : null)}
            </div>
            <div data-tooltip={newInfo.replaceAll(';', '\n')} className="relative flex flex-col">
                {/* tile image */}
                <img src={img} alt={name} className={`w-[7.5vw] h-[23vh]`} loading="lazy" draggable={false} />
                {/* tile label */}
                <div className={`${isPlayerOnTop !== -1 ? 'shadow-inner-md shadow-green-400' : ''} 
                font-mono ml-px w-[7.1vw] h-[6.75vh] bg-darkblue-4/90 text-black text-center`}>
                    <p className={`leading-3 lg:leading-relaxed text-[2vh] ${priceText}`} data-price={moneyFormat(price)}> 
                        {name.match(/\d/)
                            ? translateUI({lang: miscState.language, text: name as any})
                            : name
                        } 
                    </p>
                </div>
            </div>
        </div>
    )
}

function TileOther({ data }: {data: {[key:string]: string|number}}) {
    const miscState = useMisc()
    const gameState = useGame()
    // tile data
    type TileOtherType = {name: string, img: string, info: string, square: number}
    const { name, img, info, square } = data as TileOtherType 
    const translateInfo = translateUI({lang: miscState.language, text: info as any})
    // highlight
    const isPlayerOnTop = gameState.gamePlayerInfo.map(v => v.pos).indexOf(square)

    return (
        <div className="relative">
            <div className="absolute z-10" data-player-path={square}>
                {gameState.gamePlayerInfo.map((player, i) => player.pos == square ? <Characters key={i} playerData={player}/> : null)}
            </div>
            <div data-tooltip={info ? translateInfo : null} className="relative flex flex-col">
                {/* tile image */}
                <img src={img} alt={name} className={`w-[7.5vw] h-[23vh]`} loading="lazy" draggable={false} />
                {/* tile label */}
                <div className={`${isPlayerOnTop !== -1 ? 'shadow-inner-md shadow-green-400' : ''}
                font-mono ml-px w-[7.1vw] h-[6.75vh] bg-darkblue-4/90 text-black text-center`}>
                    <p className={`leading-3 lg:leading-relaxed text-[2vh]`}> 
                        {translateUI({lang: miscState.language, text: name as any})} 
                    </p>
                </div>
            </div>
        </div>
    )
}

function Characters({ playerData }: {playerData: IGameContext['gamePlayerInfo'][0]}) {
    const playerTooltip = `${playerData.display_name};city owned: 0`

    return (
        <div data-tooltip={playerTooltip.replaceAll(';', '\n')} data-player-name={playerData.display_name} 
        className="inline-block cursor-pointer w-[3.5vw] p-1 lg:p-2">
            <img src={playerData.character} alt={playerData.display_name} />
        </div>
    )
}