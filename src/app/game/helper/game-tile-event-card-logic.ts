import { catchError, moneyFormat, qS, qSA, shuffle, translateUI } from "../../../helper/helper"
import { EventDataType, IGameContext, IMiscContext } from "../../../helper/types"
import chance_cards_list from "../config/chance-cards.json"
import community_cards_list from "../config/community-cards.json"
import { playerMoving } from "./game-prepare-playing-logic"
import { useBuffDebuff } from "./game-tile-event-buff-debuff-logic"
import { stopByCity, updateCityList } from "./game-tile-event-city-logic"

// ========== # CARD EVENT ==========
// ========== # CARD EVENT ==========
export function stopByCards(card: 'chance'|'community', findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        const notifImage = qS('#card_image') as HTMLImageElement
        // cards data
        const cardsList = card == 'chance' ? chance_cards_list.cards : community_cards_list.cards
        // check buff
        const [buffDebuff, buffDebuffEffect] = useBuffDebuff(
            {type: 'buff', effect: 'pick rarity'}, findPlayer, miscState, gameState
        ) as [string, number];
        // loop cards
        for(let cards of cardsList) {
            const [minRange, maxRange] = cards.chance
            const pickRarityRNG = buffDebuff 
                                ? buffDebuffEffect >= minRange && buffDebuffEffect <= maxRange
                                : +rng[0] >= minRange && +rng[0] <= maxRange
            // match rng
            if(pickRarityRNG) {
                const cardRNG = +rng[0] % cards.data.length
                // notif content
                notifTitle.textContent = card == 'chance' 
                                        ? translateUI({lang: miscState.language, text: 'Chance Card'})
                                        : translateUI({lang: miscState.language, text: 'Community Card'})
                notifMessage.textContent = translateUI({lang: miscState.language, text: cards.data[cardRNG].description as any})
                                        + (buffDebuff ? `\n${translateUI({lang: miscState.language, text: '"buff pick rarity"'})}` : '')
                notifImage.src = cards.data[cardRNG].img
                // run card effect
                const cardData = {
                    tileName: card,
                    rank: cards.category.split('_')[0],
                    effectData: cards.data[cardRNG].effect
                }
                // get event data
                const eventData = await cardEffects(cardData, findPlayer, rng, miscState, gameState)
                // add buff/debuff to event data
                if(buffDebuff) (eventData as any).buff = buffDebuff
                // resolve event data
                return resolve(eventData)
            }
        }
    })
}

// ========== > CARD EFFECTS ==========
// ========== > CARD EFFECTS ==========
export function cardEffects(cardData: Record<'tileName'|'rank'|'effectData', string>, findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
    // notif timer
    const notifTimer = qS('#result_notif_timer')
    // ### rank will be used for rarity border
    const {tileName, rank, effectData} = cardData
    // current player data (walking)
    const playerTurnData = gameState.gamePlayerInfo[findPlayer]

    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        // check card separator
        const isMultipleEffects = effectData.split('&')
        const isOptionalEffects = effectData.split('|')
        // card has multiple effects
        if(isMultipleEffects.length === 2) {
            // combine container
            const eventDataCombined: EventDataType = {
                event: 'get_card',
                rank: rank,
                type: '',
                tileName: tileName,
                money: 0
            }
            // run the effect
            for(let i in isMultipleEffects) {
                const [type, effect] = isMultipleEffects[i].split('_')
                const eventData = await executeEffect(type, effect, null, 'AND')
                // set event data
                eventDataCombined.money += eventData.money
                eventDataCombined.type += i == '0' ? type : `,${type}`
            }
            resolve(eventDataCombined)
        }
        // card has optional effect
        else if(isOptionalEffects.length === 2) {
            // show notif with button
            miscState.setAnimation(true)
            gameState.setShowGameNotif(`card_with_button-2` as any)
            // get effect prefix
            const getPrefix = effectData.split('-')
            // get optional effect
            const getOptionalEffect = getPrefix[1].split('|')
            const optionalTypes = getOptionalEffect.map(v => v.split('_')[0])
            const optionalEffects = getOptionalEffect.map(v => v.split('_')[1])
            // player choose the optional effect
            if(getPrefix[0] == 'button') {
                // run effect
                const eventData = await executeOptionalCard(6, optionalTypes, optionalEffects)
                resolve(eventData)
            }
            // system choose the optional effect
            else if(getPrefix[0] == 'random') {
                // run effect
                const eventData = await executeOptionalCard(2, optionalTypes, optionalEffects)
                resolve(eventData)
            }
        }
        // only 1 effect
        else {
            // check if the event is random (choices but system pick)
            const getPrefix = effectData.split('-')
            if(getPrefix[0] == 'random' || getPrefix[0] == 'button') {
                // get type & effect
                const [type, effect] = getPrefix[1].split('_')
                const eventData = await executeEffect(type, effect, getPrefix[0])
                resolve(eventData)
            }
            else {
                const [type, effect] = effectData.split('_')
                const eventData = await executeEffect(type, effect)
                resolve(eventData)
            }
        }
    })

    /**
     * @param timer prefix random = 2 | button = 6
     * @param types card types
     * @param effects card effects
     * @returns 
     */
    function executeOptionalCard(timer: number, types: string[], effects: string[]) {
        return new Promise((resolve: (value: EventDataType)=>void) => {
            const [leftType, rightType] = types
            const [leftEffect, rightEffect] = effects
            // event interval
            let optionalButtonTimer = timer
            const optionalButtonInterval = setInterval(async () => {
                notifTimer.textContent = `${optionalButtonTimer}`
                optionalButtonTimer--
                // optional buttons
                const [leftButton, rightButton] = [qS(`[data-id=notif_button_0]`), qS(`[data-id=notif_button_1]`)] as HTMLInputElement[]
                // auto click on timer off
                if(optionalButtonTimer < 0) {
                    clearInterval(optionalButtonInterval)
                    notifTimer.textContent = ''
                    // disable button
                    leftButton.disabled = true
                    rightButton.disabled = true
                    // run event, check prefix (random = 2 | button = 6)
                    if(timer == 2) {
                        // rng % 2 buttons
                        const optionalButtons = [
                            {button: leftButton, type: leftType, effect: leftEffect},
                            {button: rightButton, type: rightType, effect: rightEffect},
                        ]
                        const optionalRNG = +rng[0] % optionalButtons.length
                        // modify button
                        optionalButtons[optionalRNG].button.classList.add('text-green-300')
                        // run effect
                        return resolve(await executeEffect(
                            optionalButtons[optionalRNG].type, 
                            optionalButtons[optionalRNG].effect, 
                            'button', 'OR'
                        ))
                    }
                    // modify button
                    leftButton.classList.add('text-green-300')
                    // run effect
                    return resolve(await executeEffect(leftType, leftEffect, 'button', 'OR'))
                }
                if(rightButton && playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
                    // show buttons
                    leftButton.classList.remove('hidden')
                    // modify button (timer 2 == random pick)
                    timer == 2 ? leftButton.disabled = true : null
                    leftButton.textContent = leftEffect.match(/\d{4}/) ? moneyFormat(+leftEffect) : leftEffect
                    // click event
                    leftButton.onclick = async () => {
                        clearInterval(optionalButtonInterval)
                        notifTimer.textContent = ''
                        // hide button
                        timer == 2 ? null : leftButton.classList.add('hidden')
                        timer == 2 ? null : rightButton.classList.add('hidden')
                        // run effect
                        return resolve(await executeEffect(leftType, leftEffect, 'button', 'OR'))
                    }
                    // show buttons
                    rightButton.classList.remove('hidden')
                    // modify button (timer 2 == random pick)
                    timer == 2 ? rightButton.disabled = true : null
                    rightButton.textContent = rightEffect.match(/\d{4}/) ? moneyFormat(+rightEffect) : rightEffect
                    // click event
                    rightButton.onclick = async () => {
                        clearInterval(optionalButtonInterval)
                        notifTimer.textContent = ''
                        // hide button
                        timer == 2 ? null : leftButton.classList.add('hidden')
                        timer == 2 ? null : rightButton.classList.add('hidden')
                        // run effect
                        return resolve(await executeEffect(rightType, rightEffect, 'button', 'OR'))
                    }
                }
            }, 1000)
        })
    }

    /**
     * @param prefix could be 'button'|'random'
     * @returns 
     */
    function executeEffect(type: string, effect: string, prefix?: string, separator?: 'OR'|'AND') {
        return new Promise((resolve: (value: EventDataType)=>void) => {
            // ### effect list
            // ### get money, more money, lose money, move forward, move backward, move place, 
            // ### special card, destroy, take card, upgrade, sell city
            if(type == 'get money') {
                // get money choice
                if(prefix == 'button' && !separator) {
                    // show notif
                    miscState.setAnimation(true)
                    gameState.setShowGameNotif(`card_with_button-3` as any)
                    // coin rng
                    const coinPrizes = shuffle([1, 2, 3])
                    // card interval
                    let getMoneyTimer = 6
                    const getMoneyInterval = setInterval(() => {
                        notifTimer.textContent = `${getMoneyTimer}`
                        getMoneyTimer--
                        // buttons
                        const coinButtons = [
                            qS(`[data-id=notif_button_0]`),
                            qS(`[data-id=notif_button_1]`),
                            qS(`[data-id=notif_button_2]`)
                        ] as HTMLInputElement[]
                        // choose random
                        if(getMoneyTimer < 0) {
                            clearInterval(getMoneyInterval)
                            notifTimer.textContent = ``
                            // show number on selected coin
                            coinButtons[0] ? coinButtons[0].textContent = `${coinPrizes[0]}` : null
                            // set timeout to hide all buttons
                            return setTimeout(() => {
                                for(let coin of coinButtons) coin ? coin.classList.add('hidden') : null
                                // hide notif after click
                                miscState.setAnimation(false)
                                gameState.setShowGameNotif(null)
                                // return event data
                                resolve({
                                    event: 'get_card',
                                    rank: rank,
                                    type: type,
                                    tileName: tileName,
                                    money: +effect * coinPrizes[0]
                                })
                            }, 1500);
                        }
                        if(coinButtons[0] && playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
                            for(let i=0; i<coinButtons.length; i++) {
                                // show button
                                coinButtons[i].classList.remove('hidden')
                                // modify button
                                coinButtons[i].textContent = '???'
                                coinButtons[i].classList.add('!w-12', 'h-12', 'lg:!w-20', 'lg:h-20', 'border', 'rounded-full')
                                // click event
                                coinButtons[i].onclick = () => {
                                    clearInterval(getMoneyInterval)
                                    notifTimer.textContent = ``
                                    // show number on selected coin
                                    coinButtons[i].textContent = `${coinPrizes[i]}`
                                    // set timeout to hide all buttons
                                    setTimeout(() => {
                                        for(let coin of coinButtons) coin.classList.add('hidden')
                                        // return event data
                                        resolve({
                                            event: 'get_card',
                                            rank: rank,
                                            type: type,
                                            tileName: tileName,
                                            money: +effect * coinPrizes[i]
                                        })
                                    }, 1500);
                                }
                            }
                        }
                    }, 1000);
                }
                // normal get money
                else {
                    // show notif
                    miscState.setAnimation(true)
                    gameState.setShowGameNotif('card')
                    // check for more money
                    const getMoreMoney = localStorage.getItem('moreMoney')
                    // get money + more money
                    if(getMoreMoney) {
                        const moreMoney = (playerTurnData.money + +effect) * +getMoreMoney
                        return resolve({
                            event: 'get_card',
                            rank: rank,
                            type: type,
                            tileName: tileName,
                            money: +effect + moreMoney
                        })
                    }
                    // return event data
                    resolve({
                        event: 'get_card',
                        rank: rank,
                        type: type,
                        tileName: tileName,
                        money: +effect
                    })
                }
            }
            else if(type == 'more money') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                // set more money to local storage
                const isEffectPercent = effect.match('%') ? +effect.split('%')[0] / 100 : +effect
                localStorage.setItem('moreMoney', `${isEffectPercent}`)
                resolve({
                    event: 'get_card',
                    rank: rank,
                    type: type,
                    tileName: tileName,
                    money: 0
                })
            }
            else if(type == 'lose money') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                // check percent
                const isEffectPercent = effect.match('%')
                resolve(isEffectPercent
                    ? {
                        event: 'get_card',
                        rank: rank,
                        type: type,
                        tileName: tileName,
                        money: -(playerTurnData.money * +effect.split('%')[0] / 100)
                    } 
                    : {
                        event: 'get_card',
                        rank: rank,
                        type: type,
                        tileName: tileName,
                        money: -effect.split('%')[0]
                    }
                ) 
            }
            else if(type == 'take money') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                // get all players 
                const otherPlayerNames = gameState.gamePlayerInfo.map(v => v.display_name).join(',')
                resolve({
                    event: 'get_card',
                    rank: rank,
                    type: type,
                    tileName: tileName,
                    money: +effect,
                    takeMoney: `${+effect};${otherPlayerNames}`
                })
            }
            else if(type == 'move forward' || type == 'move backward') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                // set additional event data for history (only for moving cards, upgrade, take card)
                if(separator != 'AND' && playerTurnData.display_name == gameState.myPlayerInfo.display_name)
                    localStorage.setItem('subEventData', `get_card: ${type} (${tileName} ${rank})`)
                // set dice number
                const diceNumber = type == 'move forward' ? +effect : -effect
                const rollDiceData = {
                    playerTurn: playerTurnData.display_name,
                    playerDice: diceNumber,
                    playerRNG: rng
                }
                // move player
                playerMoving(rollDiceData, miscState, gameState)
                // resolve only for multiple effect
                if(separator == 'AND') {
                    return resolve({
                        event: 'get_card',
                        rank: rank,
                        type: type,
                        tileName: tileName,
                        money: 0
                    })
                }
            }
            else if(type == 'move place') {
                // set additional event data for history (only for moving cards, upgrade, take card, optional effect)
                if(separator != 'AND' && playerTurnData.display_name == gameState.myPlayerInfo.display_name)
                    localStorage.setItem('subEventData', `get_card: ${type} (${tileName} ${rank})`)
                // get tile data (tile number)
                const getTileList = getMovePlaceTiles(effect, separator)
                // if tile data empty, just resolve
                if(getTileList.length === 0) {
                    return setTimeout(() => {
                        notifTimer.textContent = 'nowhere to go'
                        resolve(null)
                    }, 1000);
                }
                // set timer
                let movePlaceTimer = prefix == 'button' 
                                    ? separator == 'OR' 
                                        ? 1 // optional effect \w button (already timer in optional function)
                                        : 6 // 1 effect \w button prefix
                                    : 2 // random prefix
                let chosenButton: HTMLElement = null
                const movePlaceInterval = setInterval(() => {
                    // no need timer for multiple effect card
                    notifTimer.textContent = !separator ? `${movePlaceTimer}` : ''
                    movePlaceTimer--
                    // if timer run out, system pick
                    if(movePlaceTimer < 0) {
                        clearInterval(movePlaceInterval)
                        notifTimer.textContent = ''
                        // highlight choosen button (only single effect)
                        if(!separator) chosenButton.classList.add('bg-green-600')
                        // set player dice
                        const chosenSquare = +chosenButton.dataset.destination
                        const tempCurrentPos = +playerTurnData.pos.split('x')[0]
                        const setChosenDice = tempCurrentPos > chosenSquare 
                                            ? (24 + chosenSquare) - tempCurrentPos
                                            : chosenSquare - tempCurrentPos
                        const rollDiceData = {
                            playerTurn: playerTurnData.display_name,
                            playerDice: setChosenDice,
                            playerRNG: rng
                        }
                        // hide notif after data set
                        miscState.setAnimation(false)
                        gameState.setShowGameNotif(null)
                        // move to chosen place
                        playerMoving(rollDiceData, miscState, gameState)
                        // resolve only for multiple effect
                        if(separator == 'AND') {
                            return resolve({
                                event: 'get_card',
                                rank: rank,
                                type: type,
                                tileName: tileName,
                                money: 0
                            })
                        }
                    }
                    // check if button created
                    const movePlaceButtons = qSA('[data-id^=notif_button]') as NodeListOf<HTMLElement>
                    if(movePlaceButtons[0]) {
                        // buttons created, then modify buttons
                        // set chosen button
                        const chosenIndex = +rng[0] % movePlaceButtons.length
                        // separator null means only card \w single effect can modify the button
                        // destination random / choice
                        if(!separator) {
                            for(let i=0; i<movePlaceButtons.length; i++) {
                                const button = movePlaceButtons[i]
                                button.classList.remove('hidden')
                                button.classList.add('border')
                                // tile name
                                button.textContent = getTileList[i]
                                // tile number
                                button.dataset.destination = getTileList[i]
                                // set event click for prefix button + single effect
                                if(prefix == 'button') {
                                    button.onclick = () => {
                                        clearInterval(movePlaceInterval)
                                        notifTimer.textContent = ''
                                        // set player dice
                                        const chosenSquare = +button.dataset.destination
                                        const tempCurrentPos = +playerTurnData.pos.split('x')[0]
                                        const setChosenDice = tempCurrentPos > chosenSquare 
                                                            ? (24 + chosenSquare) - tempCurrentPos
                                                            : chosenSquare - tempCurrentPos
                                        const rollDiceData = {
                                            playerTurn: playerTurnData.display_name,
                                            playerDice: setChosenDice,
                                            playerRNG: rng
                                        }
                                        // move to chosen place
                                        playerMoving(rollDiceData, miscState, gameState)
                                    }
                                }
                            }
                            chosenButton = movePlaceButtons[chosenIndex]
                        }
                        // destination already set, so it only has 1 array element
                        else {
                            // set tile number
                            movePlaceButtons[chosenIndex].dataset.destination = getTileList[0]
                            chosenButton = movePlaceButtons[chosenIndex]
                        }
                    }
                }, 1000)
            }
            else if(type == 'upgrade city') {
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                notifTimer.textContent = 'getting city data..'
                // get player city list
                setTimeout(async () => {
                    const playerCityList = playerTurnData.city?.split(';')
                    // player has city
                    if(playerCityList) {
                        // set additional event data for history (only for moving cards, upgrade, take card)
                        // only add sub event data if player have any city
                        if(playerTurnData.display_name == gameState.myPlayerInfo.display_name)
                            localStorage.setItem('subEventData', `get_card: ${type} (${tileName} ${rank})`)
                        // hide timer
                        notifTimer.textContent = ''
                        // filter fully upgrade city
                        const filteredCityList = playerCityList.filter(v => !v.match(/2house1hotel/))
                        // set upgrade params
                        const upgradeRNG = +rng[0] % filteredCityList.length
                        const upgradeCityName = filteredCityList[upgradeRNG].split('*')[0]
                        const upgradeCityElement = qS(`[data-city-info^='${upgradeCityName}']`) as HTMLElement
                        // upgrade city
                        const [error, eventData] = await catchError(stopByCity('city', findPlayer, upgradeCityElement, miscState, gameState))
                        if(error) console.log(error)
                        return resolve(eventData)
                    }
                    // show notif have no city
                    notifTimer.textContent = 'smh my head, homeless'
                    resolve({
                        event: 'get_card',
                        rank: rank,
                        type: type,
                        tileName: tileName,
                        money: 0,
                        city: null
                    })
                }, 2000)
            }
            else if(type == 'sell city') {
                // notif message
                notifTimer.textContent = 'getting city data..'
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                // get owned city
                const getOwnedCity = playerTurnData.city ? playerTurnData.city.split(';') : null
                if(!getOwnedCity) {
                    setTimeout(() => {
                        // notif message
                        notifTimer.textContent = 'can you buy a city pls?'
                        return resolve({
                            event: 'get_card',
                            rank: rank,
                            type: type,
                            tileName: tileName,
                            money: 0
                        })
                    }, 2000);
                }
                // sell city interval
                let sellCityTimer = 2
                let chosenSellCity = null
                const sellCityInterval = setInterval(() => {
                    notifTimer.textContent = `${sellCityTimer}`
                    sellCityTimer--
                    if(sellCityTimer < 0) {
                        clearInterval(sellCityInterval)
                        notifTimer.textContent = translateUI({lang: miscState.language, text: 'ccc city sold'})
                                                .replace('ccc', chosenSellCity)
                        // selling city
                        const cityLeft = updateCityList({
                            action: 'sell', 
                            currentCity: playerTurnData.city,
                            cityName: chosenSellCity
                        })
                        const getCityInfo = (qS(`[data-city-info^=${chosenSellCity}]`) as HTMLElement).dataset.cityInfo.split(',')
                        const [cityName, cityProperty, cityPrice, cityOwner] = getCityInfo
                        // hide notif after data set
                        miscState.setAnimation(false)
                        gameState.setShowGameNotif(null)
                        // return event data
                        resolve({
                            event: 'get_card',
                            rank: rank,
                            type: type,
                            tileName: tileName,
                            money: +cityPrice,
                            city: cityLeft
                        })
                    }
                    // sell city rng
                    const sellCityRNG = +rng[0] % getOwnedCity.length
                    chosenSellCity = getOwnedCity[sellCityRNG].split('*')[0]
                }, 1000);
            }
            else if(type == 'destroy property') {
                // destroy city property
                const cityPropertyLeft = updateCityList({
                    action: 'destroy', 
                    currentCity: playerTurnData.city,
                    rng: +rng[1]
                })
                // get destroyed city
                const getDestroyedCity = cityPropertyLeft ? cityPropertyLeft.split(';') : null
                // index 0 = city | index 1 = property
                const destroyedCity = getDestroyedCity ? getDestroyedCity[getDestroyedCity.length-1].split('*') : null
                // use notif timer as addition message
                notifTimer.textContent = destroyedCity 
                                    ? translateUI({lang: miscState.language, text: '"ccc city collapse"'}).replace('ccc', destroyedCity[0])
                                    : translateUI({lang: miscState.language, text: '"go get a house, homeless"'})
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                // if destroyed, show broken video & sound
                if(destroyedCity) {
                    // get destroyed property
                    // if the last property is 2house, then hotel destroyed
                    // else is house destroyed
                    const destroyedProperty = destroyedCity[1].match(/2house1hotel$|2house$|1house$|land$/)[0] == '2house'
                                            ? 'hotel' : 'house'
                    const videoCityBroken = qS(`#video_city_broken_${destroyedProperty}_${destroyedCity[0]}`) as HTMLVideoElement
                    const soundCityBroken = qS('#sound_city_broken') as HTMLAudioElement
                    videoCityBroken.classList.remove('hidden')
                    // play
                    videoCityBroken.play()
                    soundCityBroken.play()
                    // hide broken video
                    setTimeout(() => videoCityBroken.classList.add('hidden'), 2000)
                }
                // return event data
                resolve({
                    event: 'get_card',
                    rank: rank,
                    tileName: tileName,
                    type: type,
                    money: 0,
                    city: cityPropertyLeft || null
                })
            }
            else if(type == 'take card') {
                // set additional event data for history (only for moving cards, upgrade, take card)
                if(playerTurnData.display_name == gameState.myPlayerInfo.display_name)
                    localStorage.setItem('subEventData', `get_card: ${type} (${tileName} ${rank})`)
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                notifTimer.textContent = `getting ${effect} card..`
                // run card
                setTimeout(async () => {
                    notifTimer.textContent = ''
                    const [error, eventData] = await catchError(stopByCards(effect as any, findPlayer, [rng[1], rng[1]], miscState, gameState))
                    if(error) console.log(error)
                    return resolve(eventData)
                }, 2000);
            }
            else if(type == 'special card') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                resolve({
                    event: 'get_card',
                    rank: rank,
                    type: type,
                    tileName: tileName,
                    money: 0,
                    card: `add-${effect}`
                })
            }
        })
    }

    function getMovePlaceTiles(destination: string, separator: 'OR'|'AND') {
        // get city tiles
        if(destination == 'other city' || destination == 'my city') {
            const boughtCityList = qSA('[data-city-info]') as NodeListOf<HTMLElement>
            const filteredBoughtCityList = []
            // loop city list
            for(let city of boughtCityList) {
                const [cityName, cityProperty, cityPrice, cityOwner] = city.dataset.cityInfo.split(',')
                // ### cityOwner != null
                if(destination == 'other city' && cityOwner && cityOwner != playerTurnData.display_name)
                    filteredBoughtCityList.push(city.dataset.playerPath)
                else if(destination == 'my city' && cityOwner && cityOwner == playerTurnData.display_name)
                    filteredBoughtCityList.push(city.dataset.playerPath)
            }
            // show notif with buttons
            miscState.setAnimation(true)
            gameState.setShowGameNotif(`card_with_button-${filteredBoughtCityList.length}` as any)
            // return data
            return filteredBoughtCityList
        }
        // get misc tiles
        else {
            const destinedCity = qS(`[data-tile-info=${destination}]`) as HTMLElement
            const destinedCitySquare = [destinedCity.dataset.playerPath]
            // show notif with buttons (single effect)
            if(separator != 'OR') {
                miscState.setAnimation(true)
                gameState.setShowGameNotif(`card_with_button-${destinedCitySquare.length}` as any)
            }
            // return data
            return destinedCitySquare
        }
    }
}