import { useEffect } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { applyTooltipEvent, moneyFormat, translateUI } from "../../../../helper/helper"
import board_twoway from '../../config/board-twoway.json'
import { IGameContext } from "../../../../helper/types"
import Image from "next/image"

export default function BoardTwoway() {
    const gameState = useGame()

    const squareNumberStyle = 'before:absolute before:z-10 before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'
    // board tiles
    const boardTwoway = board_twoway
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [gameState.gamePlayerInfo])

    return (
        <div className="relative z-10">
            {/* row 1 */}
            <div className="flex">
            {boardTwoway.row_1.map((tile, i) => {
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
            {boardTwoway.row_2.map((tile, i) => {
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
            {boardTwoway.row_3.map((tile, i) => {
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
            {boardTwoway.row_4.map((tile, i) => {
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
    const curseRNG = Math.floor(Math.random() * (curse+1 - 5)) + 5
    const cursedLaps = gameState.gamePlayerInfo.map(v => 
        v.display_name == gameState.myPlayerInfo.display_name ? v.lap : null
    ).filter(i=>i)[0] || 0
    const cursedCityPrice = name.match(/cursed/i) 
                        ? price + (price * gameState.gamePlayerInfo.length * cursedLaps * curseRNG/100) 
                        : 0
    // highlight
    const isPlayerOnTop = gameState.gamePlayerInfo.map(v => v.pos).indexOf(square)
    // tile info
    const tileInfo = setTileInfo(name)
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
    const cityInfo = cityOwner ? `${name},${cityProperty},${cityPrice},${cityOwner}` : `${name},land,${cursedCityPrice || price}`
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
    // tile broken & destroy
    const tileBroken = {
        house: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/Broken_House_100-aO1wZX4zHUd83tK6b1uVbxSsi1sDeE.mp4',
        hotel: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/tile_city/Broken_Hotel_100-h4YRBkWKUrluT7d17MhkXjDeFiBZBl.mp4',
    }

    return (
        <div className="relative">
            <div className="absolute z-10" data-player-path={square} data-tile-info={tileInfo} data-city-info={cityInfo}>
                {gameState.gamePlayerInfo.map((player, i) => player.pos == square ? <Characters key={i} playerData={player}/> : null)}
            </div>
            <div data-tooltip={newInfo.replaceAll(';', '\n')} className="relative flex flex-col">
                {/* tile broken */}
                <video id={`video_city_broken_house_${cityName || name}`} src={tileBroken.house} className="absolute hidden" />
                <video id={`video_city_broken_hotel_${cityName || name}`} src={tileBroken.hotel} className="absolute hidden" />
                {/* tile image */}
                <Image src={img} alt={name} width={100} height={100} className={`w-[7.5vw] h-[23vh]`} draggable={false} priority={true} />
                {/* tile label */}
                <div className={`${isPlayerOnTop !== -1 ? 'shadow-inner-md shadow-green-400' : ''} 
                font-mono ml-px w-[7.1vw] h-[6.75vh] bg-darkblue-4/90 text-black text-center`}>
                    <p className={`${cityProperty ? '' : priceText} leading-3 lg:leading-relaxed text-[2vh] whitespace-pre`} 
                    data-price={moneyFormat(cityPrice || (cursedCityPrice || price))}> 
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
    // tile info
    const tileInfo = setTileInfo(name)
    // prison info
    const findRoomInfo = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
    const prisonAccumulateLimit = gameState.gameRoomInfo[findRoomInfo].dice * 6
    const findPlayer = gameState.gamePlayerInfo?.map(v => v.display_name).indexOf(gameState.myPlayerInfo.display_name)
    const prisonNumber = gameState.gamePlayerInfo[findPlayer]?.prison
    const isPrisonNumber = typeof prisonNumber == 'number'
                        ? prisonNumber : '?'
    // modify info
    const newInfo = name.match(/arrested/i)
                    ? translateInfo.replace('xxx', `${isPrisonNumber}`).replace('xxx', `${prisonAccumulateLimit}`)
                    : translateInfo

    return (
        <div className="relative">
            <div className="absolute z-10" data-player-path={square} data-tile-info={tileInfo}>
                {gameState.gamePlayerInfo.map((player, i) => player.pos == square ? <Characters key={i} playerData={player}/> : null)}
            </div>
            <div data-tooltip={info ? newInfo : null} className="relative flex flex-col">
                {/* tile image */}
                <Image src={img} alt={name} width={100} height={100} className={`w-[7.5vw] h-[23vh]`} draggable={false} priority={true} />
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
    // match player in city owned list
    const cityOwned = playerData.city?.split(';').length || 0
    const cityOwnedTooltip = `city owned: ${cityOwned}`
    // get buff data
    const buffList = playerData.buff?.split(';').length || 0
    const buffTooltip = `buff: ${buffList}`
    // get debuff data
    const debuffList = playerData.debuff?.split(';').length || 0
    const debuffTooltip = `debuff: ${debuffList}`
    // set player tooltip (display_name & city owned)
    const playerTooltip = `${playerData.display_name};${cityOwnedTooltip};${buffTooltip};${debuffTooltip}`

    return (
        <div data-tooltip={playerTooltip.replaceAll(';', '\n')} data-player-name={playerData.display_name} 
        className="inline-block cursor-pointer w-[3.5vw] p-1 lg:p-2">
            <img src={playerData.character} alt={playerData.display_name} />
        </div>
    )
}

function setTileInfo(tileName: string) {
    if(tileName.match(/special/i)) return 'special'
    else if(tileName.match(/cursed/i)) return 'cursed'
    else if(tileName.match(/chance/i)) return 'chance'
    else if(tileName.match(/community/i)) return 'community'
    else if(tileName.match(/arrested/i)) return 'prison'
    else if(tileName.match(/parking/i)) return 'parking'
    else if(tileName.match(/debuff/i)) return 'debuff'
    else if(tileName.match(/buff/i)) return 'buff'
    else if(tileName.match(/start/i)) return 'start'
    else return 'city'
}
