import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { moneyFormat, qS, qSA, translateUI } from "../../../../helper/helper"
import { handleUpgradeCity, sellCity } from "../../helper/game-logic"

export default function PlayerSettingSellCity() {
    const miscState = useMisc()
    const gameState = useGame()
    // sell city container
    const mySellCityList: string[] = []
    let tempCityInfo: string = null
    // special card container
    const upgradeCityCard = []
    // get city owned list
    gameState.gamePlayerInfo.map(v => {
        if(v.display_name == gameState.myPlayerInfo.display_name) {
            // set my city list
            tempCityInfo = v.city
            // set my special cards
            upgradeCityCard.push(v.card?.match(/city upgrade/i))
            // loop city
            const dataCityInfo = qSA(`[data-city-info]`) as NodeListOf<HTMLElement>
            for(let dci of dataCityInfo) {
                const [cityName, cityProperty, cityPrice, cityOwner] = dci.dataset.cityInfo.split(',')
                // match owned city then push
                v.city?.match(cityName) ? mySellCityList.push(`${cityName},${cityPrice}`) : null
            }
        }
    })
    const isUpgradeCityCardExist = upgradeCityCard.flat().filter(i=>i).length === 1

    return (
        <div className={`${gameState.displaySettingItem == 'sell_city' ? 'block' : 'hidden'}
        absolute top-9 bg-darkblue-2 
        w-[calc(100%-.5rem)] h-[calc(100%-2.5rem)]`}>
            <div className="flex flex-col p-1">
                {/* title */}
                <div>
                    <span className="border-b-2 pb-1">
                        {translateUI({lang: miscState.language, text: 'Sell City', lowercase: true})}
                    </span>
                </div>
                {/* city list */}
                <div className="flex flex-col gap-2 h-36 lg:h-[17rem] overflow-y-scroll">
                    {/* city item */}
                    {mySellCityList.map((v,i) => 
                        <form key={i} className="grid grid-cols-5 gap-1 items-center" onSubmit={ev => sellCity(ev, tempCityInfo, miscState, gameState)}>
                            <span className="col-span-2"> {v.split(',')[0]} </span>
                            <span className="col-span-2"> {moneyFormat(+v.split(',')[1])} </span>
                            <div className="w-fit">
                                <input type="hidden" id="sell_city_name" value={v.split(',')[0]} />
                                <input type="hidden" id="sell_city_price" value={v.split(',')[1]} />
                                <button type="submit" id="sell_city_button" className="bg-primary border-8bit-primary active:opacity-75">
                                    {translateUI({lang: miscState.language, text: 'sell'})}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                {/* upgrade & close button */}
                <div className="flex justify-around w-[calc(100%-.5rem)] p-1 border-t-2">
                    <button type="button" className={`${isUpgradeCityCardExist ? '' : 'text-black'} active:opacity-75`}
                    onClick={() => handleUpgradeCity(miscState, gameState)} disabled={isUpgradeCityCardExist ? false : true}>
                        {translateUI({lang: miscState.language, text: 'Upgrade'})}
                    </button>
                    <button type="button" className="active:opacity-75" 
                    onClick={() => gameState.setDisplaySettingItem(null)}>
                        {translateUI({lang: miscState.language, text: 'Close'})}
                    </button>
                </div>
            </div>
        </div>
    )
}