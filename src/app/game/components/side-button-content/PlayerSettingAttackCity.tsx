import { useState } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { moneyFormat, qSA, translateUI } from "../../../../helper/helper"
import { declareAttackCity, pickCityToRaid } from "../../helper/game-tile-event-attack-logic"
import { IAttackCityList } from "../../../../helper/types"

export default function PlayerSettingAttackCity() {
    const miscState = useMisc()
    const gameState = useGame()
    const [showAttackConfirmation, setShowAttackConfirmation] = useState(false)

    const attackCityList: IAttackCityList[] = []
    // attack city card container
    const attackCityCard = []
    // get city owned list
    gameState.gamePlayerInfo.map(v => {
        if(v.display_name != gameState.myPlayerInfo.display_name) {
            // set my city list
            // tempCityInfo = v.city
            const attackCityData: IAttackCityList = {
                cityOwner: null,
                currentCity: null,
                cityList: [],
            }
            // loop city
            const dataCityInfo = qSA(`[data-city-info]`) as NodeListOf<HTMLElement>
            for(let city of dataCityInfo) {
                const [cityName, cityProperty, cityPrice, cityOwner] = city.dataset.cityInfo.split(',')
                // match owned city then push attackCityList.push(`${cityOwner},${cityAmount},${cityName},${cityPrice}`)
                if(v.city?.match(cityName)) {
                    attackCityData.cityOwner = cityOwner
                    attackCityData.currentCity = v.city
                    attackCityData.cityList.push(`${cityName},${cityPrice}`)
                }
            }
            attackCityList.push(attackCityData)
        }
        else {
            // check attack city card
            attackCityCard.push(v.card?.match(/attack city/i))
        }
    })
    const isAttackCityCardExist = attackCityCard.flat().filter(i=>i).length === 1

    return (
        <div className={`${gameState.displaySettingItem == 'attack_city' ? 'block' : 'hidden'}
        absolute top-9 bg-darkblue-2 w-[calc(100%-.5rem)] h-[calc(100%-2.5rem)]`}>
            <div className="flex flex-col p-1">
                {/* title */}
                <div className="mb-1">
                    <span className="border-b-2 pb-1">
                        {translateUI({lang: miscState.language, text: 'Attack City', lowercase: true})}
                    </span>
                </div>
                {/* city list */}
                <div className="flex flex-col gap-2 h-36 lg:h-[17rem] overflow-y-scroll">
                    {attackCityList.map(v => {
                        return v.cityList.map((cityData, i) => 
                            <AttackCityForm key={i} cityData={cityData} isAttackCityCardExist={isAttackCityCardExist} setShowAttackConfirmation={setShowAttackConfirmation} />
                        )
                    })}
                </div>
                {/* attack city confirmation */}
                <AttackCityConfirmation attackCityList={attackCityList} showAttackConfirmation={showAttackConfirmation} setShowAttackConfirmation={setShowAttackConfirmation} />
                {/* close button */}
                <div className="flex justify-center border-t-2">
                    <button type="button" className="p-1 active:opacity-75" onClick={() => gameState.setDisplaySettingItem(null)}>
                        {translateUI({lang: miscState.language, text: 'Close'})} 
                    </button>
                </div>
            </div>
        </div>
    )
}

function AttackCityForm({cityData, isAttackCityCardExist, setShowAttackConfirmation}) {
    const miscState = useMisc()
    // attack city data
    const [cityName, cityPrice] = cityData.split(',') as string[]
    const translatedCityName = translateUI({lang: miscState.language, text: cityName as any}) 

    return (
        <form onSubmit={ev => pickCityToRaid(ev, setShowAttackConfirmation, cityData.split(','))} 
        className="grid grid-cols-5 gap-1 items-center">
            <span className="col-span-2"> {translatedCityName || cityName} </span>
            <span className="col-span-2"> {moneyFormat(+cityPrice)} </span>
            <div className="w-fit">
                <RaidCityButton isAttackCityCardExist={isAttackCityCardExist} />
            </div>
        </form>
    )
}

function RaidCityButton({isAttackCityCardExist}) {
    const miscState = useMisc()

    return isAttackCityCardExist
        ? <button type="submit" id="sell_city_button" className="bg-primary border-8bit-primary active:opacity-75">
            {translateUI({lang: miscState.language, text: 'raid'})}
        </button>
        : <button type="button" id="sell_city_button" className="saturate-0 bg-primary border-8bit-primary active:opacity-75">
            {translateUI({lang: miscState.language, text: 'raid'})}
        </button>
}

function AttackCityConfirmation({
    attackCityList, 
    showAttackConfirmation, 
    setShowAttackConfirmation
}: {
    attackCityList: IAttackCityList[], 
    showAttackConfirmation, 
    setShowAttackConfirmation
}) {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <form onSubmit={ev => declareAttackCity(ev, attackCityList, setShowAttackConfirmation, miscState, gameState)} className={`${showAttackConfirmation ? 'flex' : 'hidden'}
        flex-col justify-center absolute bg-darkblue-1 w-[calc(100%-.5rem)] h-[calc(100%-0.5rem)] p-1`}>
            <div className="flex flex-col gap-4 grow justify-center">
                {/* confirmation text */}
                <p> what type of attack you wanna declare to <span id="attack_confirmation_city"></span> city? </p>
                {/* attack types */}
                <div className="flex justify-around">
                    <button type="submit" id="attack_city_quake" className="text-green-400 border rounded-md p-1 w-14 lg:w-24 h-6 lg:h-10 hover:bg-darkblue-2"> quake </button>
                    <button type="submit" id="attack_city_meteor" className="text-green-400 border rounded-md p-1 w-14 lg:w-24 h-6 lg:h-10 hover:bg-darkblue-2"> meteor </button>
                    <button type="submit" id="attack_city_steal" className="text-green-400 border rounded-md p-1 w-14 lg:w-24 h-6 lg:h-10 hover:bg-darkblue-2"> steal </button>
                </div>
            </div>
            <div className="flex justify-center border-t-2">
                <button type="button" className="p-1 active:opacity-75" onClick={() => setShowAttackConfirmation(false)}>
                    {translateUI({lang: miscState.language, text: 'Close'})}
                </button>
            </div>
        </form>
    )
}