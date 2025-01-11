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
    // get room info
    const getGameRoomInfo = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
    // set curse
    const curse = gameState.gameRoomInfo[getGameRoomInfo]?.curse
    const curseRand = curse > 5 ? `5~${curse}%` : `5%`
    // highlight
    const isPlayerOnTop = gameState.gamePlayerInfo.map(v => v.pos).indexOf(square)
    // tile info
    const tileInfo = name.match(/special/i) ? 'special' : name.match(/cursed/i) ? 'cursed' : 'city'
    // price label
    const priceText = `after:block after:content-[attr(data-price)]`
    // match city with player data
    const getCityData = []
    gameState.gamePlayerInfo.map(player => {
        const cityList = player.city?.split(';') || []
        // city name
        let tempCityName = name.match(/\d/) ? translateUI({lang: miscState.language, text: name as any}) : name
        // match current city
        const isCityBought = cityList.map(v => v.split('*')[0]).indexOf(name)
        if(isCityBought !== -1) {
            // check city property (match the latest prop)
            type CityPropertyType = 'land'|'1house'|'2house'|'2house1hotel'
            const tempCityProperty = cityList[isCityBought].match(/2house1hotel$|2house$|1house$|land$/)[0] as CityPropertyType
            switch(tempCityProperty) {
                // [owner, price, property]
                case 'land': 
                    // set city owner (only after bought land property)
                    getCityData.push(`${tempCityName}\n${player.display_name}`, player.display_name, price + (price * .10), '1house', '')
                    return
                case '1house': 
                    getCityData.push(tempCityName, player.display_name, price + (price * .20), '2house', '🏡')
                    return
                case '2house': 
                    getCityData.push(tempCityName, player.display_name, price + (price * .30), '2house1hotel', '🏡🏡')
                    return
                case '2house1hotel': 
                    getCityData.push(tempCityName, player.display_name, price + (price * .40), 'realestate', '🏡🏡🏨')
                    return
            }
        }
    })
    const [cityName, cityOwner, cityPrice, cityProperty, cityIcon] = getCityData as [string, string, number, string, string]
    // city info
    const cityInfo = cityOwner ? `${name},${cityProperty},${cityPrice},${cityOwner}` : `${name},land,${price}`
    // modify info
    const cityBoughtInfo = cityOwner 
                        ? cityProperty == 'realestate'
                            ? `<${cityOwner}>;${moneyFormat(cityPrice)};max upgrade` 
                            : `<${cityOwner}>;${moneyFormat(cityPrice)}` 
                        : null
    const translateInfo = translateUI({lang: miscState.language, text: info as any})
    const newInfo = name.match('Cursed')
                    ? `${name};${curseRand};${translateInfo}`
                    : cityBoughtInfo ? `${name};${cityBoughtInfo}` : `${name};${translateInfo}`

    return (
        <div className="relative">
            <div className="absolute z-10" data-player-path={square} data-tile-info={tileInfo} data-city-info={cityInfo}>
                {gameState.gamePlayerInfo.map((player, i) => player.pos == square ? <Characters key={i} playerData={player}/> : null)}
            </div>
            <div data-tooltip={newInfo.replaceAll(';', '\n')} className="relative flex flex-col">
                {/* tile image */}
                <img src={img} alt={name} className={`w-[7.5vw] h-[23vh]`} loading="lazy" draggable={false} />
                {/* tile label */}
                <div className={`${isPlayerOnTop !== -1 ? 'shadow-inner-md shadow-green-400' : ''} 
                font-mono ml-px w-[7.1vw] h-[6.75vh] bg-darkblue-4/90 text-black text-center`}>
                    <p className={`${cityProperty ? '' : priceText} leading-3 lg:leading-relaxed text-[2vh] whitespace-pre`} 
                    data-price={moneyFormat(cityPrice || price)}> 
                        {cityProperty ? `${cityName}\n${cityIcon}` : cityName || name} 
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
    const getCityOwnedList = localStorage.getItem('cityOwnedList') || '[]'
    // match player in city owned list
    const cityOwned = (JSON.parse(getCityOwnedList) as any[])
                    .map(v => v.split(',')[0] == playerData.display_name ? v : null)
                    .filter(i => i)[0]
    // set player tooltip (display_name & city owned)
    const playerTooltip = `${playerData.display_name};city owned: ${cityOwned?.split(',')[1] || 0}`

    return (
        <div data-tooltip={playerTooltip.replaceAll(';', '\n')} data-player-name={playerData.display_name} 
        className="inline-block cursor-pointer w-[3.5vw] p-1 lg:p-2">
            <img src={playerData.character} alt={playerData.display_name} />
        </div>
    )
}