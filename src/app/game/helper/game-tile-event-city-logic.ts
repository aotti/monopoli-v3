import { FormEvent } from "react"
import { fetcher, fetcherOptions, moneyFormat, qS, setInputValue, simpleDecrypt, simpleEncrypt, translateUI } from "../../../helper/helper"
import { EventDataType, IGameContext, IMiscContext, IResponse, UpdateCityListType } from "../../../helper/types"
import { rollDiceGameRoom } from "./game-prepare-playing-logic"
import { updateSpecialCardList, useSpecialCard } from "./game-tile-event-special-card-logic"
import { useBuffDebuff } from "./game-tile-event-buff-debuff-logic"
import { playGameSounds } from "./game-tile-event-sounds"

// ========== # NORMAL & SPECIAL CITY EVENT ==========
// ========== # NORMAL & SPECIAL CITY EVENT ==========
export function stopByCity(tileInfo: 'city'|'special', findPlayer: number, tileElement: HTMLElement, miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        const playerTurnData = gameState.gamePlayerInfo[findPlayer]
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        const notifTimer = qS('#result_notif_timer')
        // get city info
        const getCityInfo = tileElement.dataset.cityInfo
        const decCityInfo = simpleDecrypt(getCityInfo, miscState.simpleKey).split(',')
        const [buyCityName, buyCityProperty, buyCityPrice, buyCityOwner] = decCityInfo
        // if city quaked, set 0.5 multiplier, else 1
        const findQuakeCity = gameState.gameQuakeCity ? gameState.gameQuakeCity.indexOf(buyCityName) : null
        // check type of number to prevent bug, because 0 == false
        const cityQuake = typeof findQuakeCity == 'number' && findQuakeCity !== -1 ? 0.5 : 1
        // if city owner not current player
        const isCityMine = buyCityOwner != playerTurnData.display_name
        // paying taxes
        if(isCityMine && buyCityProperty != 'land') 
            return resolve(await payingTaxes())
    
        // if you own the city (max upgrade) and its special, get money
        const isCitySpecialOrFullUpgrade = (tileInfo == 'city' && buyCityProperty == 'realestate') || 
                                        (tileInfo == 'special' && buyCityProperty == '1house')
        if(isCitySpecialOrFullUpgrade) {
            // only play sound if get money
            playGameSounds('city_money', miscState)
            // notif message 
            notifTitle.textContent = translateUI({lang: miscState.language, text: 'Special City'})
            notifMessage.textContent = translateUI({lang: miscState.language, text: 'You get xxx when visiting your grandma'})
                                    .replace('xxx', moneyFormat(+buyCityPrice * cityQuake))
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            return resolve({
                event: 'special_city',
                money: +buyCityPrice * cityQuake
            })
        }
        // check buff 
        const [buffDebuff, buffDebuffEffect] = useBuffDebuff(
            {type: 'buff', effect: 'reduce price', price: +buyCityPrice},
            findPlayer, miscState, gameState
        ) as [string, number];
        // only play sound if buy/upgrade
        playGameSounds('city_buy', miscState)
        // set buy city price
        const buyCityPriceFixed = buffDebuff ? +buyCityPrice - buffDebuffEffect : +buyCityPrice
        // set event text for notif
        let [eventTitle, eventContent] = [
            !isCityMine 
                ? translateUI({lang: miscState.language, text: 'Upgrade City'}) 
                : translateUI({lang: miscState.language, text: 'Buy City'}), 
            !isCityMine 
                // upgrade city content
                ? translateUI({lang: miscState.language, text: 'Do you wanna upgrade xxx city for xxx?'})
                // buy city content
                : translateUI({lang: miscState.language, text: `Do you wanna buy xxx city for xxx?`})
        ]
        // notif (buy)
        notifTitle.textContent = eventTitle
        notifMessage.textContent = eventContent
                                .replace('xxx', buyCityName) // city name
                                .replace('xxx', moneyFormat(buyCityPriceFixed)) // price
        // show notif (must be on top the buttons to prevent undefined)
        miscState.setAnimation(true)
        gameState.setShowGameNotif(`with_button-2` as any)
        // set timer
        let buyCityTimer = 6
        const buyCityInterval = setInterval(() => {
            notifTimer.textContent = buffDebuff 
                                ? `${translateUI({lang: miscState.language, text: '"buff reduce price"'})} ${buyCityTimer}` 
                                : `${buyCityTimer}`
            buyCityTimer--
            // event buttons (2 buttons)
            const [nopeButton, ofcourseButton] = [
                qS('[data-id=notif_button_0]'), 
                qS('[data-id=notif_button_1]')
            ] as HTMLInputElement[]
            // if timer run out, auto cancel
            if(buyCityTimer < 0) {
                clearInterval(buyCityInterval)
                notifTimer.textContent = ''
                nopeButton ? nopeButton.click() : null
                // hide notif after click
                miscState.setAnimation(false)
                gameState.setShowGameNotif(null)
                return
            }
            // prevent other player from doing event
            if(nopeButton && playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
                // show buttons
                ofcourseButton.classList.remove('hidden')
                // modify button 
                ofcourseButton.textContent = translateUI({lang: miscState.language, text: 'Of course'})
                ofcourseButton.classList.add('text-green-300')
                // click event
                ofcourseButton.onclick = () => {
                    clearInterval(buyCityInterval)
                    notifTimer.textContent = ''
                    // hide buttons
                    ofcourseButton.classList.add('hidden')
                    nopeButton.classList.add('hidden')
                    // is money enough
                    const isMoneyEnough = playerTurnData.money >= buyCityPriceFixed
                    if(!isMoneyEnough) {
                        notifTimer.textContent = 'smh my head, you poor'
                        // set event data (for history)
                        const eventData: EventDataType = {
                            event: 'buy_city',
                            status: false,
                            money: 0
                        }
                        // return event data
                        return resolve(eventData)
                    }
                    // turn off notif
                    miscState.setAnimation(false)
                    gameState.setShowGameNotif(null)
                    // update game player info
                    const myCity = playerTurnData.city
                    const buyingCity = updateCityList({
                        action: 'buy', 
                        currentCity: myCity, 
                        cityName: buyCityName, 
                        cityProperty: buyCityProperty
                    })
                    // set event data (for history)
                    const eventData: EventDataType = {
                        event: 'buy_city',
                        status: true,
                        display_name: playerTurnData.display_name,
                        city: buyingCity,
                        name: buyCityName,
                        property: buyCityProperty == '2house1hotel' ? '1hotel' : buyCityProperty,
                        money: -buyCityPriceFixed,
                        buff: buffDebuff
                    }
                    // return event data
                    return resolve(eventData)
                }
                // show buttons
                nopeButton.classList.remove('hidden')
                // modify button 
                nopeButton.textContent = translateUI({lang: miscState.language, text: 'Nope'})
                nopeButton.classList.add('text-red-300')
                // click event
                nopeButton.onclick = () => {
                    clearInterval(buyCityInterval)
                    notifTimer.textContent = ''
                    // turn off notif
                    miscState.setAnimation(false)
                    gameState.setShowGameNotif(null)
                    // hide buttons
                    ofcourseButton.classList.add('hidden')
                    nopeButton.classList.add('hidden')
                    // set event data (for history)
                    const eventData: EventDataType = {
                        event: 'buy_city',
                        status: false,
                        money: 0
                    }
                    // return event data
                    return resolve(eventData)
                }
            }
        }, 1000);

        async function payingTaxes() {
            // check debuff
            const [buffDebuff, buffDebuffEffect] = useBuffDebuff(
                {type: 'debuff', effect: 'tax more', price: +buyCityPrice},
                findPlayer, miscState, gameState
            ) as [string, number];
            // check if special card exist
            const [specialCard, specialEffect] = await useSpecialCard(
                {type: 'city', price: +buyCityPrice, debuff: buffDebuff}, 
                findPlayer, miscState, gameState
            ) as [string, number];
            // set tax price
            const taxPrice = specialCard?.match('anti tax') ? 0 
                            : -buyCityPrice + (buffDebuffEffect || 0) + (specialEffect || 0)
            // update tax notif and only play sound if pay tax
            if(taxPrice < 0) {
                playGameSounds('city_tax', miscState)
                const newTaxNotif = notifMessage.textContent.replace(/Rp\s[0-9.]+/, `${moneyFormat(taxPrice * cityQuake)}`)
                notifMessage.textContent = newTaxNotif
            }
            // set event data (for history)
            const eventData: EventDataType = {
                event: 'pay_tax', 
                owner: buyCityOwner, 
                visitor: playerTurnData.display_name,
                taxMoney: taxPrice * cityQuake,
                money: 0,
                card: specialCard,
                debuff: buffDebuff
            }
            // return event history
            return eventData
        }
    })
}

// ========== > SELL CITY ==========
// ========== > SELL CITY ==========
export async function handleSellCity(ev: FormEvent<HTMLFormElement>, currentCity: string, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // submit button
    const sellButton = (ev.nativeEvent as any).submitter as HTMLInputElement
    // input value container
    const inputValues = {
        action: 'game sell city',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
        city_left: null,
        sell_city_name: null,
        sell_city_price: null
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // filter inputs
            if(setInputValue('sell_city_name', input)) {
                inputValues.sell_city_name = input.value.trim()
                // update player city
                inputValues.city_left = updateCityList({
                    action: 'sell', 
                    currentCity: currentCity, 
                    cityName: inputValues.sell_city_name
                })
            }
            else if(setInputValue('sell_city_price', input)) inputValues.sell_city_price = input.value.trim().toLowerCase()
            // error
            else {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                // error message
                notifTitle.textContent = 'error 400'
                notifMessage.textContent = `${input.id} doesnt match`
                return
            }
        }
    }
    // CONFIRMATION TO SELL CITY
    const translatedCityName = translateUI({lang: miscState.language, text: inputValues.sell_city_name as any}) || inputValues.sell_city_name
    const sellCityWarning = translateUI({lang: miscState.language, text: 'Do you really wanna sell ccc city?'})
                            .replace('ccc', translatedCityName)
    if(!confirm(sellCityWarning)) return false
    // loading button
    const tempButtonText = sellButton.textContent
    sellButton.textContent = 'Loading'
    sellButton.disabled = true
    // set state to disable "back to room & surrender" buttons
    miscState.setDisableButtons('gameroom')
    // fetch
    const sellCityFetchOptions = fetcherOptions({method: 'PUT', credentials: true, body: JSON.stringify(inputValues)})
    const sellCityResponse: IResponse = await (await fetcher('/game', sellCityFetchOptions)).json()
    // response
    switch(sellCityResponse.status) {
        case 200: 
            // save access token
            if(sellCityResponse.data[0].token) {
                localStorage.setItem('accessToken', sellCityResponse.data[0].token)
                delete sellCityResponse.data[0].token
            }
            // save missing data to localStorage (only for checking)
            setTimeout(() => {
                localStorage.setItem('missingData', JSON.stringify(sellCityResponse.data[0].missingData))
            }, 3000);
            // enable gameroom buttons
            miscState.setDisableButtons(null)
            // submit button normal
            sellButton.textContent = tempButtonText
            sellButton.removeAttribute('disabled')
            return
        default: 
            // enable gameroom buttons
            miscState.setDisableButtons(null)
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${sellCityResponse.status}`
            notifMessage.textContent = `${sellCityResponse.message}`
            // submit button normal
            sellButton.textContent = tempButtonText
            sellButton.removeAttribute('disabled')
            return
    }
}

// ========== > UPDATE CITY LIST ==========
// ========== > UPDATE CITY LIST ==========
export function updateCityList(data: UpdateCityListType) {
    // buy city
    if(data.action == 'buy') {
        const {currentCity, cityName, cityProperty} = data
        // check if player own the city
        const isCityOwned = currentCity?.match(cityName)
        // city owned
        if(isCityOwned) {
            // find city
            const splitCurrentCity = currentCity.split(';')
            const findCity = splitCurrentCity.map(v => v.match(cityName)).flat().indexOf(cityName)
            // update property
            splitCurrentCity[findCity] += `,${cityProperty}`
            return splitCurrentCity.join(';')
        }
        // city not owned
        else {
            const addNewCity = currentCity ? `${currentCity};${cityName}*${cityProperty}` : `${cityName}*${cityProperty}`
            return addNewCity
        }
    }
    // sell city
    else if(data.action == 'sell') {
        const {currentCity, cityName} = data
        // city left container
        const cityLeft: string[] = []
        // check if player own the city
        const isCityOwned = currentCity?.match(cityName)
        if(isCityOwned) {
            const splitCurrentCity = currentCity.split(';')
            for(let scc of splitCurrentCity) {
                // remove city from list
                if(!scc.match(cityName)) cityLeft.push(scc)
            }
            return cityLeft.length === 0 ? '' : cityLeft.join(';')
        }
        else {
            return null
        }
    }
    // destroy
    else if(data.action == 'destroy') {
        const {currentCity, rng} = data
        // find city with building, then destroy
        const splitCurrentCity = currentCity?.split(';')
        if(splitCurrentCity) {
            // check property, if city has any house then destroy
            const isPropertyExist = splitCurrentCity.map(v => v.match(/2house1hotel$|2house$|1house$/) ? v : null).filter(i => i)
            if(isPropertyExist.length > 0) {
                const destroyRNG = rng % isPropertyExist.length
                // destroy property
                const destroyedProperty = isPropertyExist[destroyRNG].match(/2house1hotel$|2house$|1house$/)[0]
                // set property left
                const [cityName, cityProperties] = isPropertyExist[destroyRNG].split('*')
                const propertyLeft = cityProperties.split(',').filter(v => v != destroyedProperty).join(',')
                // merge destroyed city
                return [...splitCurrentCity.filter(v => !v.match(cityName)), `${cityName}*${propertyLeft}`].join(';')
            }
        }
        // if theres no city / houses, return current city
        return null
    }
}

// ========== > SPECIAL UPGRADE CITY ==========
// ========== > SPECIAL UPGRADE CITY ==========
export function specialUpgradeCity(playerTurnData: IGameContext['gamePlayerInfo'][0], rng: number, miscState: IMiscContext) {
    // get all owned city, except special & fully upgrade city
    const myCityList = playerTurnData.city.split(';').filter(v => !v.match(/2house1hotel|special/i))
    console.log(myCityList);
    
    // get city name
    const upgradeRNG = rng % myCityList.length
    const upgradeCityName = myCityList[upgradeRNG].split('*')[0]
    const encUpgradeCityName = simpleEncrypt(upgradeCityName, miscState.simpleKey)
    // get city element & tile info
    const upgradeCityElement = qS(`[data-city-info^='${encUpgradeCityName}']`) as HTMLElement
    const upgradeCityTileInfo = upgradeCityElement.dataset.tileInfo
    // return data
    return [upgradeCityTileInfo, upgradeCityElement] as [string, HTMLElement]
}

// ========== > HANDLE UPGRADE CITY ==========
// ========== > HANDLE UPGRADE CITY ==========
export async function handleUpgradeCity(miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // get player data
    const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(gameState.myPlayerInfo.display_name)
    const playerData = gameState.gamePlayerInfo[findPlayer]
    // input value container
    const inputValues = {
        action: 'game upgrade city',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
        city: null,
        target_city: null,
        target_city_property: null,
        event_money: null,
        card: updateSpecialCardList(['used-upgrade city'], playerData.card),
        special_card: 'used-upgrade city',
    }
    // warning before display buy city modal
    const upgradeCityWarning = translateUI({lang: miscState.language, text: 'Only use if you have any city! (not special city) Otherwise, the card will be used and do nothing.\nProceed to upgrade city?'})
    if(!confirm(upgradeCityWarning)) return

    // get upgrade city data
    const upgradeRNG = Math.floor(Math.random() * 101)
    const [upgradeCityTileInfo, upgradeCityElement] = specialUpgradeCity(playerData, upgradeRNG, miscState)
    // buy city event
    const buyCityData = await stopByCity(upgradeCityTileInfo as any, findPlayer, upgradeCityElement, miscState, gameState)
    if(buyCityData.event == 'buy_city') {
        inputValues.target_city = buyCityData.status ? buyCityData.name : null
        inputValues.target_city_property = buyCityData.status ? buyCityData.property : null
        inputValues.city = buyCityData.status ? buyCityData.city : playerData.city
        inputValues.event_money = buyCityData.money.toString()
    }
    // set state to disable "back to room & surrender" buttons
    miscState.setDisableButtons('gameroom')

    // fetching
    const upgradeCityFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const upgradeCityResponse: IResponse = await (await fetcher('/game', upgradeCityFetchOptions)).json()
    // response
    switch(upgradeCityResponse.status) {
        case 200:
            // save access token
            if(upgradeCityResponse.data[0].token) {
                localStorage.setItem('accessToken', upgradeCityResponse.data[0].token)
                delete upgradeCityResponse.data[0].token
            }
            // save missing data to localStorage (only for checking)
            setTimeout(() => {
                localStorage.setItem('missingData', JSON.stringify(upgradeCityResponse.data[0].missingData))
            }, 3000);
            // enable gameroom buttons
            miscState.setDisableButtons(null)
            return
        default:
            // enable gameroom buttons
            miscState.setDisableButtons(null)
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${upgradeCityResponse.status}`
            notifMessage.textContent = `${upgradeCityResponse.message}`
            return
    }
}