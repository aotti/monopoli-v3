import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { moneyFormat, translateUI } from "../../../../helper/helper"
import board_normal from '../../config/board-normal.json'

export default function BoardDelta() {
    const squareNumberStyle = 'before:absolute before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'
    // board tiles
    const boardNormal = board_normal

    return (
        <>
            {/* row 1 */}
            <div className="flex">
                {boardNormal.row_1.map(tile => {
                    return (
                        tile.type === null
                            ? <div className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity cityname={tile.name} cityprice={tile.price} imgsrc={tile.img} />
                                </div>
                                : <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileOther tilename={tile.name} imgsrc={tile.img} />
                                </div>
                    )
                })}
            </div>
            {/* row 2 */}
            <div className="flex">
                {boardNormal.row_2.map(tile => {
                    return (
                        tile.type === null
                            ? <div className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity cityname={tile.name} cityprice={tile.price} imgsrc={tile.img} />
                                </div>
                                : <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileOther tilename={tile.name} imgsrc={tile.img} />
                                </div>
                    )
                })}
            </div>
            {/* row 3 */}
            <div className="flex">
                {boardNormal.row_3.map(tile => {
                    return (
                        tile.type === null
                            ? <div className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity cityname={tile.name} cityprice={tile.price} imgsrc={tile.img} />
                                </div>
                                : <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileOther tilename={tile.name} imgsrc={tile.img} />
                                </div>
                    )
                })}
            </div>
            {/* row 4 */}
            <div className="flex">
                {boardNormal.row_4.map(tile => {
                    return (
                        tile.type === null
                            ? <div className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity cityname={tile.name} cityprice={tile.price} imgsrc={tile.img} />
                                </div>
                                : <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileOther tilename={tile.name} imgsrc={tile.img} />
                                </div>
                    )
                })}
            </div>
            {/* row 5 */}
            <div className="flex">
                {boardNormal.row_5.map(tile => {
                    return (
                        tile.type === null
                            ? <div className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity cityname={tile.name} cityprice={tile.price} imgsrc={tile.img} />
                                </div>
                                : <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileOther tilename={tile.name} imgsrc={tile.img} />
                                </div>
                    )
                })}
            </div>
            {/* row 6 */}
            <div className="flex">
                {boardNormal.row_6.map(tile => {
                    return (
                        tile.type === null
                            ? <div className="w-[7.5vw] h-[15.5vh]"></div>
                            : tile.type == 'city'
                                ? <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileCity cityname={tile.name} cityprice={tile.price} imgsrc={tile.img} />
                                </div>
                                : <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square={tile.square}>
                                    <TileOther tilename={tile.name} imgsrc={tile.img} />
                                </div>
                    )
                })}
            </div>
        </>
    )
}

function TileCity({ cityname, cityprice, imgsrc }: {imgsrc: string, cityname: string, cityprice: number, cityhouse?: string}) {
    const miscState = useMisc()
    const gameState = useGame()
    const priceText = `after:block after:content-[attr(data-price)]`

    return (
        <>
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
                <p className={`leading-3 lg:leading-relaxed text-[2vh] ${priceText}`} data-price={moneyFormat(cityprice)}> 
                    {
                        cityname.match(/\d/)
                            ? translateUI({lang: miscState.language, text: cityname as any})
                            : cityname
                    } 
                </p>
            </div>
            <img src={imgsrc} alt={cityname} className={`${gameState.showTileImage == 'city' ? 'relative' : ''} w-[7.5vw] h-[15.5vh]`} draggable={false} />
        </>
    )
}

function TileOther({ tilename, imgsrc }: {tilename: string, imgsrc: string}) {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <>
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
                    {translateUI({lang: miscState.language, text: tilename as any})} 
                </p>
            </div>
            <img src={imgsrc} alt={tilename} className={`${gameState.showTileImage == 'other' ? 'relative' : ''} w-[7.5vw] h-[15.5vh]`} draggable={false} />
        </>
    )
}