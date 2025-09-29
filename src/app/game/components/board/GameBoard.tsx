import { useEffect } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { applyTooltipEvent, moneyFormat, simpleEncrypt, translateUI } from "../../../../helper/helper"
import board_normal from '../../config/board-normal.json'
import board_twoway from '../../config/board-twoway.json'
import Image from "next/image"
import Character from "./Character"
import { TileHistory } from "../side-button-content/PlayerSettingGameHistory"

export default function GameBoard({ boardType }: {boardType: string}) {
    const gameState = useGame()

    const squareNumberStyle = 'before:absolute before:z-10 before:content-[attr(data-square)] before:p-1 before:text-2xs before:lg:text-xs'
    // board tiles
    const board = boardType === 'normal' ? board_normal : board_twoway
    // tooltip (the element must have position: relative)
    useEffect(() => {
        setTimeout(() => applyTooltipEvent(), 3000)
    }, [gameState.gamePlayerInfo])

    return (
        <div className="relative z-10 animate-fade animate-delay-200">
            {/* row 1 */}
            <div className="flex">
            {board.row_1.map((tile, i) => {
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
            {board.row_2.map((tile, i) => {
                return (
                    tile.type === null
                        ? <div key={i} className="w-[7.5vw] h-[23vh]"></div>
                        : tile.type == 'history'
                            ? <div className="relative w-[7.5vw] h-[23vh]">
                                {gameState.showGameHistory ? <TileHistory data={{title: 'chance'}}/> : null}
                            </div>
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
            {board.row_3.map((tile, i) => {
                return (
                    tile.type === null
                        ? <div key={i} className="w-[7.5vw] h-[23vh]"></div>
                        : tile.type == 'history'
                            ? <div className="relative w-[7.5vw] h-[23vh]">
                                {gameState.showGameHistory ? <TileHistory data={{title: 'community'}}/> : null}
                            </div>
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
            {board.row_4.map((tile, i) => {
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
    // tile name
    const translateCityName = name.match(/\d/) ? translateUI({lang: miscState.language, text: name as any}) : name
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
    const isPlayerOnTop = gameState.gamePlayerInfo.map(v => v.pos).indexOf(`${square}`)
    // tile info
    const tileInfo = setTileInfo(name)
    // price label
    const priceTextClass = `after:block after:content-[attr(data-price)]`
    // match city with player data
    const getCityData = []
    gameState.gamePlayerInfo.map(player => {
        const cityList = player.city?.split(';') || []
        // city name
        let tempCityName = name.match(/\d/) ? translateUI({lang: miscState.language, text: name as any}) : name
        // match current city
        const isCityBought = cityList.map(v => v.split('*')[0]).indexOf(name)
        if(isCityBought !== -1) {
            // set city color
            let cityColor = null
            switch(true) {
                case player.character.match('circle') != null: cityColor = 'shadow-lg shadow-red-500'; break
                case player.character.match('square') != null: cityColor = 'shadow-lg shadow-purple-400'; break
                case player.character.match('triangle') != null: cityColor = 'shadow-lg shadow-pink-400'; break
                case player.character.match('diamond') != null: cityColor = 'shadow-lg shadow-blue-400'; break
                case player.character.match('cylinder') != null: cityColor = 'shadow-lg shadow-orange-500'; break
            }
            // check city property (match the latest prop)
            const tempCityProperty = cityList[isCityBought].match(/2house1hotel$|2house$|1house$|land$/)[0]
            // check if city is quaked
            const findQuakeCity = gameState.gameQuakeCity ? gameState.gameQuakeCity.indexOf(name) : null
            // check type of number to prevent bug, because 0 == false
            const isCityQuake = typeof findQuakeCity == 'number' && findQuakeCity !== -1 ? 'quake' : null
            switch(tempCityProperty) {
                // [owner, price, property]
                case 'land': 
                    // set city owner (only after bought land property)
                    getCityData.push(`${tempCityName}\n${player.display_name}`, player.display_name, price + (price * .10), '1house', '', isCityQuake, cityColor)
                    return
                case '1house': 
                    getCityData.push(tempCityName, player.display_name, price + (price * .20), '2house', '🏡', isCityQuake, cityColor)
                    return
                case '2house': 
                    getCityData.push(tempCityName, player.display_name, price + (price * .30), '2house1hotel', '🏡🏡', isCityQuake, cityColor)
                    return
                case '2house1hotel': 
                    getCityData.push(tempCityName, player.display_name, price + (price * .40), 'realestate', '🏡🏡🏨', isCityQuake, cityColor)
                    return
            }
        }
    })
    const [cityName, cityOwner, cityPrice, cityProperty, cityIcon, cityQuake, cityColor] = getCityData as [string, string, number, string, string, string, string]
    // city info
    // ### DONT TRANSLATE CITY INFO
    // ### ITS USED IN GAME LOGIC
    const cityInfo = cityOwner ? `${name},${cityProperty},${cityPrice},${cityOwner}` : `${name},land,${cursedCityPrice || price}`
    const encCityInfo = simpleEncrypt(cityInfo, miscState.simpleKey)
    // modify info
    const cityBoughtInfo = cityOwner 
                        ? cityProperty == 'realestate'
                            ? `<${cityOwner}>;${moneyFormat(cityPrice)};max upgrade` 
                            : `<${cityOwner}>;${moneyFormat(cityPrice)}` 
                        : null
    const translateInfo = translateUI({lang: miscState.language, text: info as any})
    const newInfo = name.match('Cursed')
                    ? `${translateCityName};${curseRand};${translateInfo}`
                    : cityBoughtInfo ? `${translateCityName};${cityBoughtInfo}` : `${translateCityName};${translateInfo}`
    // tile quake & meteor
    const hostname = 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
    const attackAnimation = {
        quake: {
            house: `https://${hostname}/tile_city/House_Quake_100-hYEYVKh2As7GCYOZs5LXN65zx0Ie6t.mp4`,
            hotel: `https://${hostname}/tile_city/Hotel_Quake_100-0nVkj3hGoNg3P16WkQv4tWnOo1wCHA.mp4`
        },
        meteor: {
            house: `https://${hostname}/tile_city/House_Meteor_100-cU4vFNIV932WtP4whmXlV7eRTGMONK.mp4`,
            hotel: `https://${hostname}/tile_city/Hotel_Meteor_100-j0xIfdMXF1hLNlKtxCXWKz5ml4GlvJ.mp4`
        }
    }
    // tile crack 
    const crackImage = `https://${hostname}/tile_city/crack-YTcUa49T5ggR81xgez23xHdkSvn8k0.png`

    return (
        <div className="relative">
            <div className="absolute z-20" data-player-path={square} data-tile-info={tileInfo} data-city-info={encCityInfo}>
                {gameState.gamePlayerInfo.map((player, i) => player.pos == `${square}` ? <Character key={i} playerData={player}/> : null)}
            </div>
            <div data-tooltip={newInfo.replaceAll(';', '\n')} className="relative flex flex-col">
                {/* tile quake */}
                <video id={`video_city_quake_house_${name}`} src={attackAnimation.quake.house} className="absolute z-10 hidden" />
                <video id={`video_city_quake_hotel_${name}`} src={attackAnimation.quake.hotel} className="absolute z-10 hidden" />
                {/* tile meteor */}
                <video id={`video_city_meteor_house_${name}`} src={attackAnimation.meteor.house} className="absolute z-10 hidden" />
                <video id={`video_city_meteor_hotel_${name}`} src={attackAnimation.meteor.hotel} className="absolute z-10 hidden" />
                {/* tile image */}
                <div className="relative">
                    <Image src={img} alt={name} width={100} height={100} className={`${cityQuake ? 'saturate-0' : ''} ${cityColor} w-[7.5vw] h-[23vh]`} draggable={false} priority={true} unoptimized />
                    {/* tile image crack */}
                    {cityQuake
                        ? <Image src={crackImage} alt="crack" width={100} height={100} className={`absolute z-10 top-0 saturate-0 w-[7.5vw] h-[23vh]`} draggable={false} priority={true} />
                        : null}
                </div>
                {/* tile label */}
                <div className={`${isPlayerOnTop !== -1 ? 'animate-player-pos' : ''} 
                font-mono ml-px w-[7.1vw] h-[6.75vh] bg-darkblue-4/90 text-black text-center`}>
                    <p className={`${cityProperty ? '' : priceTextClass} leading-3 lg:leading-relaxed text-[2vh] whitespace-pre`} 
                    data-price={moneyFormat(cityPrice || (cursedCityPrice || price))}> 
                        {cityProperty ? `${cityName}\n${cityIcon}` : cityName || translateCityName} 
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
    const isPlayerOnTop = gameState.gamePlayerInfo.map(v => v.pos).indexOf(`${square}`)
    // tile info
    const tileInfo = setTileInfo(name)

    const findRoomInfo = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
    const findPlayer = gameState.gamePlayerInfo?.map(v => v.display_name).indexOf(gameState.myPlayerInfo.display_name)
    // prison info
    const prisonAccumulateLimit = gameState.gameRoomInfo[findRoomInfo].dice * 6
    const prisonNumber = gameState.gamePlayerInfo[findPlayer]?.prison
    const isPrisonNumber = typeof prisonNumber == 'number'
                        ? prisonNumber : '?'
    // minigame info
    const minigameNumber = gameState.gamePlayerInfo[findPlayer]?.minigame
    // modify info
    const newInfo = name.match(/arrested/i)
                    // prison tile info
                    ? translateInfo.replace('xxx', `${isPrisonNumber}`).replace('xxx', `${prisonAccumulateLimit}`)
                    // other tile info
                    : name.match(/start/i)
                        ? translateInfo.replace('xxx', `${minigameNumber}`)
                        : translateInfo

    return (
        <div className="relative">
            <div className="absolute z-20" data-player-path={square} data-tile-info={tileInfo}>
                {gameState.gamePlayerInfo.map((player, i) => player.pos == `${square}` ? <Character key={i} playerData={player}/> : null)}
            </div>
            <div data-tooltip={info ? newInfo : null} className="relative flex flex-col">
                {/* tile image */}
                <Image src={img} alt={name} width={100} height={100} className={`w-[7.5vw] h-[23vh]`} draggable={false} priority={true} unoptimized />
                {/* tile label */}
                <div className={`${isPlayerOnTop !== -1 ? 'animate-player-pos' : ''}
                font-mono ml-px w-[7.1vw] h-[6.75vh] bg-darkblue-4/90 text-black text-center`}>
                    <p className={`leading-3 lg:leading-relaxed text-[2vh]`}> 
                        {translateUI({lang: miscState.language, text: name as any})} 
                    </p>
                </div>
            </div>
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