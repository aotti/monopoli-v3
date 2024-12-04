import { useEffect } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { applyTooltipEvent, moneyFormat, translateUI } from "../../../../helper/helper"
import board_normal from '../../config/board-normal.json'

export default function BoardNormal() {
    const squareNumberStyle = 'before:absolute before:z-10 before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'
    // board tiles
    const boardNormal = board_normal
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    return (
        <div className="relative z-10">
            {/* row 1 */}
            <div className="flex">
                {boardNormal.row_1.map((tile, i) => {
                    return (
                        tile.type === null
                            ? <div key={i} className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity data={tile} />
                                </div>
                                : <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
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
                            ? <div key={i} className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity data={tile} />
                                </div>
                                : <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
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
                            ? <div key={i} className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity data={tile} />
                                </div>
                                : <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
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
                            ? <div key={i} className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity data={tile} />
                                </div>
                                : <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileOther data={tile} />
                                </div>
                    )
                })}
            </div>
            {/* row 5 */}
            <div className="flex">
                {boardNormal.row_5.map((tile, i) => {
                    return (
                        tile.type === null
                            ? <div key={i} className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity data={tile} />
                                </div>
                                : <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileOther data={tile} />
                                </div>
                    )
                })}
            </div>
            {/* row 6 */}
            <div className="flex">
                {boardNormal.row_6.map((tile, i) => {
                    return (
                        tile.type === null
                            ? <div key={i} className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity data={tile} />
                                </div>
                                : <div key={i} className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
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
    type TileCityType = {name: string, price: number, img: string, info: string}
    const { name, price, img, info } = data as TileCityType 
    // price label
    const priceText = `after:block after:content-[attr(data-price)]`
    // modify info
    const newInfo = name.match('Cursed')
                    ? `${name};5~10%;${info}`
                    : `${name};${info}`

    return (
        <div data-tooltip={newInfo.replaceAll(';', '\n')} className="relative flex">
            <button type="button" className="absolute mt-0.5 lg:mt-1 ml-[5.8vw] 
            w-3 lg:w-4 bg-darkblue-4 rounded-bl-md"
            onClick={() => {
                gameState.setShowTileImage('city');
                setTimeout(() => gameState.setShowTileImage(null), 3000);
            }}>
                <img src="https://img.icons8.com/?id=83218&format=png&color=000000" alt="" />
            </button>
            <div className="font-mono absolute ml-px mt-[8.5vh] w-[7.1vw] h-[6.75vh]
            bg-darkblue-4/90 text-black text-center">
                <p className={`leading-3 lg:leading-relaxed text-[2vh] ${priceText}`} data-price={moneyFormat(price)}> 
                    {
                        name.match(/\d/)
                            ? translateUI({lang: miscState.language, text: name as any})
                            : name
                    } 
                </p>
            </div>
            <img src={img} alt={name} className={`${gameState.showTileImage == 'city' ? 'relative' : ''} w-[7.5vw] h-[15.5vh]`} draggable={false} />
        </div>
    )
}

function TileOther({ data }: {data: {[key:string]: string|number}}) {
    const miscState = useMisc()
    const gameState = useGame()
    // tile data
    type TileOtherType = {name: string, img: string, info: string}
    const { name, img, info } = data as TileOtherType 

    return (
        <div data-tooltip={info ? info : null} className="relative flex">
            <button type="button" className="absolute mt-0.5 lg:mt-1 ml-[5.8vw] 
            w-3 lg:w-4 bg-darkblue-4 rounded-bl-md"
            onClick={() => {
                gameState.setShowTileImage('other');
                setTimeout(() => gameState.setShowTileImage(null), 3000);
            }}>
                <img src="https://img.icons8.com/?id=83218&format=png&color=000000" alt="" />
            </button>
            <div className="font-mono absolute ml-px mt-[8.5vh] w-[7.1vw] h-[6.75vh]
            bg-darkblue-4/90 text-black text-center">
                <p className={`leading-3 lg:leading-relaxed text-[2vh]`}> 
                    {translateUI({lang: miscState.language, text: name as any})} 
                </p>
            </div>
            <img src={img} alt={name} className={`${gameState.showTileImage == 'other' ? 'relative' : ''} w-[7.5vw] h-[15.5vh]`} draggable={false} />
        </div>
    )
}