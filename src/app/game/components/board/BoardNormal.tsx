import { useGame } from "../../../../context/GameContext"
import { moneyFormat } from "../../../../helper/helper"

export default function BoardDelta() {
    const squareNumberStyle = 'before:absolute before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'

    return (
        <>
            {/* row 1 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="15">
                    <TileCity cityname={'Khusus-3'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 2 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="16">
                    <TileOther tilename={`Kartu Dana Umum`} imgsrc="" />
                </div>
                {/* 3 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="17">
                    <TileOther tilename={`Kartu Kesempatan`} imgsrc="" />
                </div>
                {/* 4 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="18">
                    <TileCity cityname={'Magelang'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 5 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="19">
                    <TileCity cityname={'Surabaya'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 6 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="20">
                    <TileCity cityname={'Khusus-4'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 7 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="21">
                    <TileCity cityname={'Denpasar'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 8 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="22">
                    <TileOther tilename={`Kartu Dana Umum`} imgsrc="" />
                </div>
                {/* 9 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="23">
                    <TileOther tilename={`Buff or Debuff`} imgsrc="" />
                </div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="24">
                    <TileOther tilename={`Parkir Bebas 😎 `} imgsrc="" />
                </div>
            </div>
            {/* row 2 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="14">
                    <TileOther tilename={`Buff or Debuff`} imgsrc="" />
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
                    <TileCity cityname={'Mataram'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
            </div>
            {/* row 3 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="13">
                    <TileCity cityname={'Yogyakarta'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
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
                    <TileCity cityname={'Merauke'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
            </div>
            {/* row 4 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="12">
                    <TileCity cityname={'Jakarta'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
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
                    <TileCity cityname={'Terkutuk-2'} cityprice={70000} imgsrc={''} />
                </div>
            </div>
            {/* row 5 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="11">
                    <TileCity cityname={'Khusus-2'} cityprice={70000} imgsrc={''} />
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
                    <TileOther tilename={`Kartu Kesempatan`} imgsrc="" />
                </div>
            </div>
            {/* row 6 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="10">
                    <TileOther tilename={`Masuk Penjara 👮 `} imgsrc="" />
                </div>
                {/* 2 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="9">
                    <TileOther tilename={`Kartu Kesempatan`} imgsrc="" />
                </div>
                {/* 3 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="8">
                    <TileCity cityname={'Terkutuk-1'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 4 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="7">
                    <TileCity cityname={'Khusus-1'} cityprice={70000} imgsrc={''} />
                </div>
                {/* 5 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="6">
                    <TileCity cityname={'Palembang'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 6 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="5">
                    <TileCity cityname={'Padang'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 7 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="4">
                    <TileOther tilename={`Kartu Dana Umum`} imgsrc="" />
                </div>
                {/* 8 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="3">
                    <TileOther tilename={`Buff or Debuff`} imgsrc="" />
                </div>
                {/* 9 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="2">
                    <TileCity cityname={'Aceh'} cityprice={70000} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="1">
                    <TileOther tilename={`Imagine lewat start..`} imgsrc="" />
                </div>
            </div>
        </>
    )
}

function TileCity({ cityname, cityprice, imgsrc }: {imgsrc: string, cityname: string, cityprice: number, cityhouse?: string}) {
    const gameState = useGame()
    const priceText = `after:block after:content-['${moneyFormat(cityprice)}']`

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
                <p className={`leading-3 lg:leading-relaxed text-[2vh] ${priceText}`}> 
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
            <img src={imgsrc} alt={tilename} className={`${gameState.showTileImage == 'city' ? 'relative' : ''} w-[7.5vw] h-[15.5vh]`} draggable={false} />
        </>
    )
}