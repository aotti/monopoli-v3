import { useGame } from "../../../../context/GameContext"

export default function BoardDelta() {
    const squareNumberStyle = 'before:absolute before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'

    return (
        <>
            {/* row 1 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="15">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 2 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="16">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 3 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="17">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 4 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="18">
                    <TileCity cityname={'Jakarta'} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 5 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="19">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 6 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="20">
                    <TileCity cityname={'Jakarta'} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 7 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="21">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 8 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="22">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 9 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="23">
                    <TileCity cityname={'Jakarta'} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="24">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
            </div>
            {/* row 2 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="14">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
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
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
            </div>
            {/* row 3 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="13">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
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
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
            </div>
            {/* row 4 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="12">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
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
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
            </div>
            {/* row 5 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="11">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
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
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
            </div>
            {/* row 6 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="10">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 2 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="9">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 3 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="8">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 4 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="7">
                    <TileCity cityname={'Jakarta'} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 5 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="6">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 6 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="5">
                    <TileCity cityname={'Jakarta'} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 7 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="4">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 8 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="3">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 9 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="2">
                    <TileCity cityname={'Jakarta'} imgsrc={'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM'} />
                </div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="1">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
            </div>
        </>
    )
}

function TileCity({ cityname, imgsrc }) {
    const gameState = useGame()

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
                <p className={`leading-3 lg:leading-relaxed text-[2vh] after:block after:content-['Rp_70.000']`}> 
                    {cityname} 
                </p>
            </div>
            <img src={imgsrc} alt={cityname} className={`${gameState.showTileImage == 'city' ? 'relative' : ''} w-[7.5vw] h-[15.5vh]`} draggable={false} />
        </>
    )
}