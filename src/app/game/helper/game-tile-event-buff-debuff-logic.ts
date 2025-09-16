import { qS, translateUI, moneyFormat, qSA } from "../../../helper/helper"
import { IMiscContext, IGameContext, EventDataType, BuffDebuffEventType } from "../../../helper/types"
import { playerMoving } from "./game-prepare-playing-logic"
import debuff_effect_list from "../config/debuff-effects.json"
import buff_effect_list from "../config/buff-effects.json"

// ========== # BUFF/DEBUFF EVENT ==========
// ========== # BUFF/DEBUFF EVENT ==========
export function stopByBuffDebuff(area: 'buff'|'debuff', findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        // buff/debuff data
        const buffDebuffList = area == 'buff' ? buff_effect_list.buff : debuff_effect_list.debuff
        for(let bd of buffDebuffList) {
            const [minRange, maxRange] = bd.chance
            // match rng
            if(+rng[1] >= minRange && +rng[1] <= maxRange) {
                const bdRNG = +rng[1] % bd.data.length
                // notif content
                notifTitle.textContent = area == 'buff' 
                                        ? translateUI({lang: miscState.language, text: 'Buff Area'})
                                        : translateUI({lang: miscState.language, text: 'Debuff Area'})
                notifMessage.textContent = translateUI({lang: miscState.language, text: bd.data[bdRNG].description as any})
                // run buff/debuff effect
                const bdData = {
                    tileName: area,
                    effectData: bd.data[bdRNG].effect
                }
                return resolve(await buffDebuffEffects(bdData, findPlayer, rng, miscState, gameState))
            }
        }
    })
}

// ========== > BUFF/DEBUFF EFFECTS ==========
// ========== > BUFF/DEBUFF EFFECTS ==========
export function buffDebuffEffects(bdData: Record<'tileName'|'effectData', string>, findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
    // notif timer
    const notifTimer = qS('#result_notif_timer')
    // buff/debuff data
    const {tileName, effectData} = bdData
    // event name
    const eventName = tileName == 'buff' ? 'get_buff' : 'get_debuff'
    // current player data (walking)
    const playerTurnData = gameState.gamePlayerInfo[findPlayer]
    // sound effect
    const soundAreaBuff = qS('#sound_area_buff') as HTMLAudioElement
    const soundAreaDebuff = qS('#sound_area_debuff') as HTMLAudioElement

    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        // check card separator
        const isOptionalEffects = effectData.split('|')
        // buff/debuff has optional effect
        if(isOptionalEffects.length === 2) {
            // show notif with button
            miscState.setAnimation(true)
            gameState.setShowGameNotif(`with_button-2` as any)
            // get effect prefix
            const getPrefix = effectData.split('-')
            // get optional effect
            const getOptionalEffect = getPrefix[1].split('|')
            const optionalTypes = getOptionalEffect.map(v => v.split('_')[0])
            const optionalEffects = getOptionalEffect.map(v => v.split('_')[1])
            // player choose the optional effect
            if(getPrefix[0] == 'button') {
                // run effect
                const eventData = await executeOptionalBD(6, optionalTypes, optionalEffects)
                resolve(eventData)
            }
            // system choose the optional effect
            else if(getPrefix[0] == 'random') {
                // run effect
                const eventData = await executeOptionalBD(2, optionalTypes, optionalEffects)
                resolve(eventData)
            }
        }
        else {
            // check if the event is random (choices but system pick)
            const getPrefix = effectData.split('-')
            if(getPrefix[0] == 'random' || getPrefix[0] == 'button') {
                // get type & effect
                const [type, effect] = getPrefix[1].split('_')
                const eventData = await executeEffect(tileName, type, effect, getPrefix[0])
                resolve(eventData)
            }
            else {
                const [type, effect] = effectData.split('_')
                const eventData = await executeEffect(tileName, type, effect)
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
    function executeOptionalBD(timer: number, types: string[], effects: string[]) {
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
                            tileName,
                            optionalButtons[optionalRNG].type, 
                            optionalButtons[optionalRNG].effect, 
                            'button', 'OR'
                        ))
                    }
                    // modify button
                    leftButton.classList.add('text-green-300')
                    // run effect
                    return resolve(await executeEffect(tileName, leftType, leftEffect, 'button', 'OR'))
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
                        return resolve(await executeEffect(tileName, leftType, leftEffect, 'button', 'OR'))
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
                        return resolve(await executeEffect(tileName, rightType, rightEffect, 'button', 'OR'))
                    }
                }
            }, 1000)
        })
    }

    /**
     * @param prefix 'button'|'random'
     * @description execute buff/debuff effect
     */
    function executeEffect(tileName: string, type: string, effect: string, prefix?: string, separator?: 'OR'|'AND') {
        return new Promise((resolve: (value: EventDataType)=>void) => {
            // ### effect list
            // ### get money, lose money, move place, skip turn, tax more
            // ### pick rarity, reduce price, special card
            if(type == 'get money') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                // play sound
                eventName == 'get_buff' ? soundAreaBuff.play() : soundAreaDebuff.play()
                resolve({
                    event: eventName,
                    tileName: tileName,
                    type: type,
                    money: +effect * playerTurnData.lap
                })
            }
            else if(type == 'lose money') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                // play sound
                eventName == 'get_buff' ? soundAreaBuff.play() : soundAreaDebuff.play()
                resolve({
                    event: eventName,
                    tileName: tileName,
                    type: type,
                    money: -effect * playerTurnData.lap
                })
            }
            else if(type == 'reduce money') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                resolve({
                    event: eventName,
                    tileName: tileName,
                    type: type,
                    money: 0,
                    debuff: `add-${type}_${effect}`
                })
            }
            else if(type == 'move place') {
                // play sound
                eventName == 'get_buff' ? soundAreaBuff.play() : soundAreaDebuff.play()
                // ### must save event data to local storage
                if(playerTurnData.display_name == gameState.myPlayerInfo.display_name) 
                    localStorage.setItem('buffDebuffUsed', `${eventName}: ${type} 🙏`)
                // get tile data (tile number)
                const tempCurrentPos = +playerTurnData.pos.split('x')[0]
                const getTileList = getMovePlaceTiles(effect, tempCurrentPos)
                // show notif
                if(!separator) {
                    // show notif
                    miscState.setAnimation(true)
                    gameState.setShowGameNotif(`with_button-${getTileList.length}` as any)
                }
                // interval params
                // timer = 1, cuz the buff/debuff alr timer on optional function
                // timer = 2, cuz theres no selection buff/debuff
                let movePlaceTimer = prefix == 'button' && separator == 'OR' ? 1 : 2
                let chosenButton: HTMLElement = null
                const movePlaceInterval = setInterval(() => {
                    notifTimer.textContent = `${movePlaceTimer}`
                    movePlaceTimer--
                    // if timer run out, system pick
                    if(movePlaceTimer < 0) {
                        clearInterval(movePlaceInterval)
                        notifTimer.textContent = ''
                        // set player dice
                        const chosenSquare = +chosenButton.dataset.destination
                        const setChosenDice = tempCurrentPos > chosenSquare 
                                            ? (24 + chosenSquare) - tempCurrentPos
                                            : chosenSquare - tempCurrentPos
                        // set new rng to prevent same rarity (free parking)
                        const newRNG = [rng[0], `${+rng[1] + 20}`]
                        const rollDiceData = {
                            playerTurn: playerTurnData.display_name,
                            playerDice: setChosenDice,
                            playerRNG: newRNG
                        }
                        // hide notif after data set
                        miscState.setAnimation(false)
                        gameState.setShowGameNotif(null)
                        // move to chosen place
                        playerMoving(rollDiceData, miscState, gameState)
                    }
                    // check if button created
                    const movePlaceButtons = qSA('[data-id^=notif_button]') as NodeListOf<HTMLElement>
                    if(movePlaceButtons[0]) {
                        // set chosen button
                        const chosenIndex = +rng[0] % movePlaceButtons.length
                        // destination already set, so it only has 1 array element
                        // set tile number
                        movePlaceButtons[chosenIndex].dataset.destination = getTileList[0]
                        chosenButton = movePlaceButtons[chosenIndex]
                    }
                }, 1000);
            }
            else if(type == 'skip turn') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                resolve({
                    event: eventName,
                    tileName: tileName,
                    type: type,
                    money: 0,
                    debuff: `add-${type}_${effect}`
                })
            }
            else if(type == 'tax more') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                resolve({
                    event: eventName,
                    tileName: tileName,
                    type: type,
                    money: 0,
                    debuff: `add-${type}_${effect}`
                })
            }
            else if(type == 'pick rarity') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('with_button-5' as any)
                // interval
                let pickRarityTimer = 6
                const pickRarityInterval = setInterval(() => {
                    notifTimer.textContent = `${pickRarityTimer}`
                    pickRarityTimer--
                    // pick nothing if no click
                    if(pickRarityTimer < 0) {
                        clearInterval(pickRarityInterval)
                        notifTimer.textContent = ''
                        // hide notif
                        miscState.setAnimation(false)
                        gameState.setShowGameNotif(null)
                        return resolve({
                            event: eventName,
                            tileName: tileName,
                            type: type,
                            money: 0,
                        })
                    }
                    // get rarity buttons
                    const pickRarityButtons = qSA(`[data-id^=notif_button]`) as NodeListOf<HTMLInputElement>
                    // check button
                    if(pickRarityButtons[0] && playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
                        // set rarity number
                        // A = 8% | B = 15% | C = 25% | D = 47% | S = 5%
                        //   8    |   23    |   48    |   95    |   100
                        const rarity = [
                            // all accumulate + 1 to prevent wrong rarity
                            // ex: rank A = 8, math.random * 8 only give 0 ~ 7
                            {rank: 'A', chance: Math.floor(Math.random() * 8) + 1},
                            {rank: 'B', chance: Math.floor(Math.random() * 15) + 9},
                            {rank: 'C', chance: Math.floor(Math.random() * 25) + 24},
                            {rank: 'D', chance: Math.floor(Math.random() * 47) + 49},
                            {rank: 'S', chance: Math.floor(Math.random() * 5) + 96},
                        ]
                        // loop buttons
                        for(let i=0; i<pickRarityButtons.length; i++) {
                            const prb = pickRarityButtons[i]
                            // show button & modify
                            prb.classList.remove('hidden')
                            prb.classList.add('border')
                            prb.textContent = rarity[i].rank
                            // click event
                            prb.onclick = () => {
                                clearInterval(pickRarityInterval)
                                notifTimer.textContent = `rank ${rarity[i].rank}`
                                // hide buttons
                                for(let j=0; j<pickRarityButtons.length; j++) pickRarityButtons[j].classList.add('hidden')
                                return resolve({
                                    event: eventName,
                                    tileName: tileName,
                                    type: type,
                                    money: 0,
                                    buff: `add-${type}_${rarity[i].chance}`
                                })
                            }
                        }
                    }
                }, 1000);
            }
            else if(type == 'reduce price') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                resolve({
                    event: eventName,
                    tileName: tileName,
                    type: type,
                    money: 0,
                    buff: `add-${type}_${effect}`
                })
            }
            else if(type == 'special card') {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                // play sound
                eventName == 'get_buff' ? soundAreaBuff.play() : soundAreaDebuff.play()
                resolve({
                    event: eventName,
                    type: type,
                    tileName: tileName,
                    money: 0,
                    card: `add-${effect}`
                })
            }
            else resolve(null)
        })
    }

    function getMovePlaceTiles(destination: string, currentPos: number) {
        const destinedCity = qSA(`[data-tile-info=${destination}]`) as NodeListOf<HTMLElement>
        const destinedCitySquare: string[] = []
        // no similar tiles
        if(destinedCity.length == 1) {
            destinedCitySquare.push(destinedCity[0].dataset.playerPath)
        }
        // have similar tiles
        else if(destinedCity.length > 1) {
            for(let i=0; i< destinedCity.length; i++) {
                const checkTileSquare = +destinedCity[i].dataset.playerPath - currentPos
                if(checkTileSquare <= 10) 
                    destinedCitySquare.push(destinedCity[i].dataset.playerPath)
            }
        }
        // return data
        return destinedCitySquare
    }
}

// ========== > UPDATE BUFF/DEBUFF LIST ==========
// ========== > UPDATE BUFF/DEBUFF LIST ==========
export function updateBuffDebuffList(bdData: string[], currentBuffDebuff: string) {
    const tempBuffDebuffArray = currentBuffDebuff?.split(';') || []
    for(let bd of bdData) {
        // card null
        if(!bd) continue
        // card exist
        const [action, buffDebuff] = bd.split('-')
        if(action == 'add') {
            // check if player already have the buff/debuff
            const isBuffDebuffOwned = tempBuffDebuffArray.indexOf(buffDebuff)
            // dont have yet, then add
            if(isBuffDebuffOwned === -1) tempBuffDebuffArray.push(buffDebuff)
        }
        else if(action == 'used') {
            // remove the buff/debuff
            const findBuffDebuff = tempBuffDebuffArray.indexOf(buffDebuff)
            tempBuffDebuffArray.splice(findBuffDebuff, 1)
        }
    }
    return tempBuffDebuffArray.length === 0 ? null : tempBuffDebuffArray.join(';')
}

// ========== > USE BUFF/DEBUFF ==========
// ========== > USE BUFF/DEBUFF ==========
export function useBuffDebuff(data: BuffDebuffEventType, findPlayer: number, miscState: IMiscContext, gameState: IGameContext): [string, string|number] {
    const playerTurnData = gameState.gamePlayerInfo[findPlayer]
    // sound effect
    const soundAreaBuff = qS('#sound_area_buff') as HTMLAudioElement
    const soundAreaDebuff = qS('#sound_area_debuff') as HTMLAudioElement

    const {type, effect} = data
    // ### pick rarity, reduce price
    if(type == 'buff') {
        // split buff
        const splitBuff = playerTurnData.buff?.split(';')
        // no buff
        if(!splitBuff) return [null, null]
        // buff exist
        if(effect == 'reduce price') {
            // get buff
            const buff = splitBuff.map(v => v.match(/reduce price/i)).flat().filter(i=>i)
            if(buff[0]) {
                setBuffDebuffHistory('get_buff', effect)
                const newPrice = data.price * .3
                return [`used-${buff[0]}`, newPrice]
            }
        }
        else if(effect == 'pick rarity') {
            // get buff
            const buff = splitBuff.map(v => v.match(/pick rarity_\d{1,3}/i)).flat().filter(i=>i)
            if(buff[0]) {
                setBuffDebuffHistory('get_buff', effect)
                const [buffName, buffEffect] = buff[0].split('_')
                return [`used-${buffName}`, +buffEffect]
            }
        }
        else if(effect == 'the void') {
            // get buff
            const buff = splitBuff.map(v => v.match(/the void/i)).flat().filter(i=>i)
            if(buff[0]) {
                setBuffDebuffHistory('get_buff', effect)
                const newMoney = Math.abs(data.money)
                return [`used-${buff[0]}`, newMoney]
            }
        }
    }
    // ### skip turn, tax more
    else if(type == 'debuff') {
        // split debuff
        const splitDebuff = playerTurnData.debuff?.split(';')
        // no debuff
        if(!splitDebuff) return [null, null]
        // debuff exist
        if(effect == 'skip turn') {
            // get debuff
            const debuff = splitDebuff.map(v => v.match(/skip turn/i)).flat().filter(i=>i)
            if(debuff[0]) {
                setBuffDebuffHistory('get_debuff', effect)
                return [`used-${debuff[0]}`, 'skip']
            }
        }
        else if(effect == 'tax more') {
            // get debuff
            const debuff = splitDebuff.map(v => v.match(/tax more/i)).flat().filter(i=>i)
            if(debuff[0]) {
                setBuffDebuffHistory('get_debuff', effect)
                const newPrice = data.price * .3
                return [`used-${debuff[0]}`, -newPrice]
            }
        }
        else if(effect == 'reduce money') {
            // get debuff
            const debuff = splitDebuff.map(v => v.match(/reduce money/i)).flat().filter(i=>i)
            if(debuff[0]) {
                const newMoney = Math.floor(data.money / 2)
                setBuffDebuffHistory('get_debuff', `${effect} (+${moneyFormat(newMoney)})`)
                return [`used-${debuff[0]}`, newMoney]
            }
        }
    }
    // nothing match
    return [null, null]

    /**
     * @description set buff/debuff to game history & play sound
     */
    function setBuffDebuffHistory(keyBuffDebuff: string, valueBuffDebuff: string) {
        if(playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
            localStorage.setItem('buffDebuffUsed', `${keyBuffDebuff}: ${valueBuffDebuff} 🙏`)
            keyBuffDebuff == 'get_buff' ? soundAreaBuff.play() : soundAreaDebuff.play()
        }
    }
}