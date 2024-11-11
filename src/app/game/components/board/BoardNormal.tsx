import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { moneyFormat, translateUI } from "../../../../helper/helper"
import board_tiles from '../../../../config/board-tiles.json'

export default function BoardDelta() {
    const miscState = useMisc()
    const squareNumberStyle = 'before:absolute before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'
    // city tiles
    const cityTiles = board_tiles.city
    // other tiles
    const otherTiles = board_tiles.other

    return (
        <>
            {/* row 1 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="15">
                    <TileCity cityname={`${translateUI({lang: miscState.language, text: 'Special'})}-3`} cityprice={70000} imgsrc={''} />
                </div>
                {/* 2 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="16">
                    <TileOther tilename={translateUI({lang: miscState.language, text: otherTiles.community.name})} imgsrc={otherTiles.community.img} />
                </div>
                {/* 3 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="17">
                    <TileOther tilename={translateUI({lang: miscState.language, text: otherTiles.chance.name})} imgsrc={otherTiles.chance.img} />
                </div>
                {/* 4 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="18">
                    <TileCity cityname={cityTiles.magelang.name} cityprice={cityTiles.magelang.price} imgsrc={cityTiles.magelang.img} />
                </div>
                {/* 5 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="19">
                    <TileCity cityname={'Surabaya'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 6 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="20">
                    <TileCity cityname={`${translateUI({lang: miscState.language, text: 'Special'})}-4`} cityprice={70000} imgsrc={''} />
                </div>
                {/* 7 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="21">
                    <TileCity cityname={'Denpasar'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 8 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="22">
                    <TileOther tilename={translateUI({lang: miscState.language, text: otherTiles.community.name})} imgsrc={otherTiles.community.img} />
                </div>
                {/* 9 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="23">
                    <TileOther tilename={otherTiles.debuff.name} imgsrc={otherTiles.debuff.img} />
                </div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="24">
                    <TileOther tilename={`${translateUI({lang: miscState.language, text: 'Free Parking'})} 😎 `} imgsrc={``} />
                </div>
            </div>
            {/* row 2 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="14">
                    <TileOther tilename={otherTiles.buff.name} imgsrc={otherTiles.buff.img} />
                </div>
                {/* 2 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 3 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 4 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 5 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 6 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 7 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 8 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 9 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="25">
                    <TileCity cityname={'Mataram'} cityprice={70000} imgsrc={''} />
                </div>
            </div>
            {/* row 3 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="13">
                    <TileCity cityname={'Yogyakarta'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 2 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 3 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 4 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 5 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 6 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 7 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 8 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 9 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="26">
                    <TileCity cityname={'Merauke'} cityprice={70000} imgsrc={''} />
                </div>
            </div>
            {/* row 4 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="12">
                    <TileCity cityname={cityTiles.jakarta.name} cityprice={cityTiles.jakarta.price} imgsrc={cityTiles.jakarta.img} />
                </div>
                {/* 2 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 3 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 4 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 5 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 6 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 7 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 8 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 9 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="27">
                    <TileCity cityname={`${translateUI({lang: miscState.language, text: 'Cursed'})}-2`} cityprice={70000} imgsrc={''} />
                </div>
            </div>
            {/* row 5 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="11">
                    <TileCity cityname={`${translateUI({lang: miscState.language, text: 'Special'})}-2`} cityprice={70000} imgsrc={''} />
                </div>
                {/* 2 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 3 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 4 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 5 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 6 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 7 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 8 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 9 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="28">
                    <TileOther tilename={translateUI({lang: miscState.language, text: otherTiles.chance.name})} imgsrc={otherTiles.chance.img} />
                </div>
            </div>
            {/* row 6 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="10">
                    <TileOther tilename={`${translateUI({lang: miscState.language, text: 'Get Arrested'})} 👮 `} imgsrc={``} />
                </div>
                {/* 2 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="9">
                    <TileOther tilename={translateUI({lang: miscState.language, text: otherTiles.chance.name})} imgsrc={otherTiles.chance.img} />
                </div>
                {/* 3 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="8">
                    <TileCity cityname={`${translateUI({lang: miscState.language, text: 'Cursed'})}-1`} cityprice={70000} imgsrc={''} />
                </div>
                {/* 4 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="7">
                    <TileCity cityname={`${translateUI({lang: miscState.language, text: 'Special'})}-1`} cityprice={70000} imgsrc={''} />
                </div>
                {/* 5 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="6">
                    <TileCity cityname={'Palembang'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 6 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="5">
                    <TileCity cityname={'Padang'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 7 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="4">
                    <TileOther tilename={translateUI({lang: miscState.language, text: otherTiles.community.name})} imgsrc={otherTiles.community.img} />
                </div>
                {/* 8 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="3">
                    <TileOther tilename={otherTiles.debuff.name} imgsrc={otherTiles.debuff.img} />
                </div>
                {/* 9 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="2">
                    <TileCity cityname={'Aceh'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="1">
                    <TileOther tilename={translateUI({lang: miscState.language, text: otherTiles.start.name})} imgsrc={otherTiles.start.img} />
                </div>
            </div>
        </>
    )
}

function TileCity({ cityname, cityprice, imgsrc }: {imgsrc: string, cityname: string, cityprice: number, cityhouse?: string}) {
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
                    {cityname} 
                </p>
            </div>
            <img src={imgsrc} alt={cityname} className={`${gameState.showTileImage == 'city' ? 'relative' : ''} w-[7.5vw] h-[15.5vh]`} draggable={false} />
        </>
    )
}

function TileOther({ tilename, imgsrc }: {tilename: string, imgsrc: string}) {
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
                    {tilename} 
                </p>
            </div>
            <img src={imgsrc} alt={tilename} className={`${gameState.showTileImage == 'other' ? 'relative' : ''} w-[7.5vw] h-[15.5vh]`} draggable={false} />
        </>
    )
}