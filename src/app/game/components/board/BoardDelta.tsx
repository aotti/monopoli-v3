import Tooltip from "../../../../components/Tooltip"
import { useMisc } from "../../../../context/MiscContext"
import { ITooltip } from "../../../../helper/types"

export default function BoardDelta() {
    const miscState = useMisc()
    // square number
    const squareNumberStyle = 'before:absolute before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'
    // tooltip options
    const cityOneTooltip: ITooltip = {
        text: 'kota jakarta\nowner:\ndengkul\nprice:\nRp 70.000',
        key: '#jakarta',
        pos: 'right',
        arrow: ['left', 'start']
    }
    const cityTwoTooltip: ITooltip = {
        text: 'kota bandung\nowner:\nlele\nprice:\nRp 50.000',
        key: '#bandung',
        pos: 'top',
        arrow: ['bottom', 'middle']
    }

    return (
        <>
            {/* row 1 */}
            <div className="flex">
                {/* 1 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 2 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 3 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 4 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 5 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="19">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 6 */}
                <div id="jakarta" className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="20"
                onTouchStart={() => miscState.setHoverTooltip(`${cityOneTooltip.key.substring(1)}`)}
                onTouchEnd={() => miscState.setHoverTooltip(null)}
                onMouseOver={() => miscState.setHoverTooltip(`${cityOneTooltip.key.substring(1)}`)} 
                onMouseOut={() => miscState.setHoverTooltip(null)}>
                    <img src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
                    {
                        miscState.hoverTooltip == 'jakarta'
                            ? <Tooltip options={cityOneTooltip} />
                            : null
                    }
                </div>
                {/* 7 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 8 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 9 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 10 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
            </div>
            {/* row 2 */}
            <div className="flex">
                {/* 1 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 2 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 3 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 4 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="17">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 5 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="18">
                    <img src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 6 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="21">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 7 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="22">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 8 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 9 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 10 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
            </div>
            {/* row 3 */}
            <div className="flex">
                {/* 1 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 2 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 3 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="15">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 4 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="16">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 5 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 6 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 7 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="23">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 8 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="24">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 9 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 10 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
            </div>
            {/* row 4 */}
            <div className="flex">
                {/* 1 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 2 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="13">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 3 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="14">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 4 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 5 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 6 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 7 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
                {/* 8 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="25">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 9 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="26">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 10 */}
                <div className="w-[7.5vw] h-[15.5vh]"></div>
            </div>
            {/* row 5 */}
            <div className="flex">
                {/* 1 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="11">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 2 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="12">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
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
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="27">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
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
                    <img src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 5 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="6">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
                {/* 6 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="5">
                    <img src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
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
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="2"
                onTouchStart={() => miscState.setHoverTooltip(`${cityTwoTooltip.key.substring(1)}`)}
                onTouchEnd={() => miscState.setHoverTooltip(null)}
                onMouseOver={() => miscState.setHoverTooltip(`${cityTwoTooltip.key.substring(1)}`)} 
                onMouseOut={() => miscState.setHoverTooltip(null)}>
                    <img id="bandung" src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/jakarta-mWTBxZTjqPhyEVaMF0HSkitkyVxjKM" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
                    {
                        miscState.hoverTooltip == 'bandung'
                            ? <Tooltip options={cityTwoTooltip} />
                            : null
                    }
                </div>
                {/* 10 */}
                <div className={`border w-[7.5vw] h-[15.5vh] ${squareNumberStyle}`} data-square="1">
                    <img src="" alt="" className="bg-darkblue-1 w-[7.5vw] h-[15.5vh]" draggable={false} />
                </div>
            </div>
        </>
    )
}