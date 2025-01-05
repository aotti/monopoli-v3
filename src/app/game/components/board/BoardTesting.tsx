import { useEffect } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { applyTooltipEvent, moneyFormat, translateUI } from "../../../../helper/helper"
import board_testing from '../../config/board-testing.json'
import { IGameContext } from "../../../../helper/types"

export default function BoardTesting() {
    const miscState = useMisc()
    const gameState = useGame()

    const squareNumberStyle = 'before:absolute before:z-10 before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'
    // board tiles
    const boardTesting = board_testing
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    return (
        <div className="relative z-10">
            {/* row 1 */}
            <div className="flex">
            {boardTesting.row_1.map((tile, i) => {
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
            {/* row 3 */}
            <div className="flex">
            {boardTesting.row_3.map((tile, i) => {
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
            {/* row 5 */}
            <div className="flex">
            {boardTesting.row_5.map((tile, i) => {
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
            {/* row 6 */}
            <div className="flex">
            {boardTesting.row_6.map((tile, i) => {
                
                return (
                    tile.type === null
                        ? <div key={i} className="w-[7.5vw] h-[23vh]"></div>
                        : tile.type == 'city'
                            ? <div key={i} className={`relative border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileCity data={tile} />
                                {/* {player.pos === tile.square ? <Characters playerData={player} /> : null} */}
                            </div>
                            : <div key={i} className={`relative border w-[7.5vw] h-[23vh] ${squareNumberStyle}`} data-square={tile.square}>
                                <TileOther data={tile} />
                                {/* {player.pos === tile.square ? <Characters playerData={player} /> : null} */}
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
    type TileCityType = {name: string, price: number, img: string, info: string}
    const { name, price, img, info } = data as TileCityType 
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

    return (
        <div data-tooltip={newInfo.replaceAll(';', '\n')} className="relative flex flex-col">
            {/* view button */}
            <button type="button" className="absolute mt-0.5 lg:mt-1 ml-[5.8vw] 
            w-3 lg:w-4 bg-darkblue-4 rounded-bl-md"
            onClick={() => {
                gameState.setShowTileImage('city');
                setTimeout(() => gameState.setShowTileImage(null), 3000);
            }}>
                <img src="https://img.icons8.com/?id=83218&format=png&color=000000" alt="" loading="lazy" />
            </button>
            {/* tile image */}
            <img src={img} alt={name} className={`${gameState.showTileImage == 'city' ? 'relative' : ''} w-[7.5vw] h-[23vh]`} loading="lazy" draggable={false} />
            {/* tile label */}
            <div className="font-mono ml-px w-[7.1vw] h-[6.75vh] bg-darkblue-4/90 text-black text-center">
                <p className={`leading-3 lg:leading-relaxed text-[2vh] ${priceText}`} data-price={moneyFormat(price)}> 
                    {
                        name.match(/\d/)
                            ? translateUI({lang: miscState.language, text: name as any})
                            : name
                    } 
                </p>
            </div>
        </div>
    )
}

function TileOther({ data }: {data: {[key:string]: string|number}}) {
    const miscState = useMisc()
    const gameState = useGame()
    // tile data
    type TileOtherType = {name: string, img: string, info: string}
    const { name, img, info } = data as TileOtherType 
    const translateInfo = translateUI({lang: miscState.language, text: info as any})

    return (
        <div data-tooltip={info ? translateInfo : null} className="relative flex flex-col">
            {/* view button */}
            <button type="button" className="absolute mt-0.5 lg:mt-1 ml-[5.8vw] 
            w-3 lg:w-4 bg-darkblue-4 rounded-bl-md"
            onClick={() => {
                gameState.setShowTileImage('other');
                setTimeout(() => gameState.setShowTileImage(null), 3000);
            }}>
                <img src="https://img.icons8.com/?id=83218&format=png&color=000000" alt="" loading="lazy" draggable={false} />
            </button>
            {/* tile image */}
            <img src={img} alt={name} className={`${gameState.showTileImage == 'other' ? 'relative' : ''} w-[7.5vw] h-[23vh]`} loading="lazy" draggable={false} />
            {/* tile label */}
            <div className="font-mono ml-px w-[7.1vw] h-[6.75vh] bg-darkblue-4/90 text-black text-center">
                <p className={`leading-3 lg:leading-relaxed text-[2vh]`}> 
                    {translateUI({lang: miscState.language, text: name as any})} 
                </p>
            </div>
        </div>
    )
}

function Characters({ playerData }: {playerData: IGameContext['gamePlayerInfo'][0]}) {
    console.log(playerData);
    

    return (
        <div className="absolute z-30 bg-black">
            <img src={playerData.character} alt={playerData.display_name} />
            <span> segs </span>
        </div>
    )
}