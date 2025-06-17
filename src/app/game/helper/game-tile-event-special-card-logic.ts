import { qS, translateUI, moneyFormat } from "../../../helper/helper"
import { SpecialCardEventType, IMiscContext, IGameContext } from "../../../helper/types"

// ========== # SPECIAL CARD EVENT ==========
// ========== # SPECIAL CARD EVENT ==========
export function useSpecialCard(data: SpecialCardEventType, findPlayer: number, miscState: IMiscContext, gameState: IGameContext) {
    const playerTurnData = gameState.gamePlayerInfo[findPlayer]
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    const notifTimer = qS('#result_notif_timer')
    // sound effect
    const soundSpecialCard = qS('#sound_special_card') as HTMLAudioElement

    return new Promise(async (resolve: (value: [string, string|number])=>void) => {
        // city: anti tax, nerf tax
        // prison: anti jail
        // dice: gaming dice
        // parking: nerf parking
        // start: fortune block
        // cursed: curse reverser
        // misc: upgrade city, the striker
        // ==============
        // card exist
        if(data.type == 'city') {
            const {price, debuff} = data;
            // set event text for notif
            const [eventTitle, eventContent] = [
                translateUI({lang: miscState.language, text: 'Paying Taxes'}), 
                translateUI({lang: miscState.language, text: `xxx paid taxes of xxx`})
            ]
            notifTitle.textContent = eventTitle
            notifMessage.textContent = eventContent
                                    .replace('xxx', playerTurnData.display_name) // player name
                                    .replace('xxx', moneyFormat(price)) // city price
                                    + (debuff ? `\n${translateUI({lang: miscState.language, text: '"debuff tax more"'})}` : '')
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // get card
            // ### KEMUNGKINAN ERROR DISINI
            const specialCard = splitSpecialCard?.map(v => v.match(/anti tax|nerf tax/i)).flat().filter(i=>i) || []
            // match special card
            for(let sc of specialCard) {
                // player has card
                if(sc == 'nerf tax') {
                    // show notif (tax)
                    miscState.setAnimation(true)
                    gameState.setShowGameNotif('with_button-2' as any)
                    const newPrice = price * .35
                    return resolve(await specialCardConfirmation({sc, newValue: newPrice, eventContent}))
                }
                else if(sc == 'anti tax') {
                    // show notif (tax)
                    miscState.setAnimation(true)
                    gameState.setShowGameNotif('with_button-2' as any)
                    const newPrice = 0
                    return resolve(await specialCardConfirmation({sc, newValue: newPrice, eventContent}))
                }
            }
            // no card, show normal notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            return resolve([null, null])
        }
        else if(data.type == 'start') {
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // get card
            const specialCard = splitSpecialCard?.map(v => v.match(/fortune block/i)).flat().filter(i=>i) || []
            if(specialCard[0]) {
                setSpecialCardHistory(specialCard[0])
                const newMoney = 5000
                return resolve([`used-${specialCard[0]}`, newMoney])
            }
            return resolve([null, null])
        }
        else if(data.type == 'prison') {
            // prison info
            const findRoomInfo = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
            const prisonAccumulateLimit = gameState.gameRoomInfo[findRoomInfo].dice * 6
            const [eventTitle, eventContent] = [
                translateUI({lang: miscState.language, text: 'Prison'}),
                translateUI({lang: miscState.language, text: 'ppp get arrested for being silly. accumulate > aaa dice number to be free.'}),
            ]
            // notif message
            notifTitle.textContent = eventTitle
            notifMessage.textContent = eventContent
                                    .replace('ppp', gameState.gamePlayerInfo[findPlayer].display_name)
                                    .replace('aaa', prisonAccumulateLimit.toString())
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // get card
            const specialCard = splitSpecialCard?.map(v => v.match(/anti prison/i)).flat().filter(i=>i) || []
            if(specialCard[0]) {
                // show notif (tax)
                miscState.setAnimation(true)
                gameState.setShowGameNotif('with_button-2' as any)
                return resolve(await specialCardConfirmation({sc: specialCard[0], newValue: 'free', eventContent}))
            }
            // no card, show normal notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            return resolve([null, null])
        }
        else if(data.type == 'dice') {
            const {diceNumber} = data
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // get card
            const specialCard = splitSpecialCard?.map(v => v.match(/gaming dice/i)).flat().filter(i=>i) || []
            if(specialCard[0]) {
                setSpecialCardHistory(specialCard[0])
                const newMoney = diceNumber * 10_000
                return resolve([`used-${specialCard[0]}`, newMoney])
            }
            return resolve([null, null])
        }
        else if(data.type == 'parking') {
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // get card
            const specialCard = splitSpecialCard?.map(v => v.match(/nerf parking/i)).flat().filter(i=>i) || []
            if(specialCard[0]) {
                setSpecialCardHistory(specialCard[0])
                // add nerf tiles
                const nerfTiles = []
                for(let i=0; i<24; i++) {
                    const randTile = Math.floor(Math.random() * 24)
                    // skip prison & parking tile
                    if(randTile === 9 || randTile === 21) 
                        nerfTiles.push(randTile+1)
                    else nerfTiles.push(randTile)
                }
                // filter nerf tiles
                const filteredNerfTiles = nerfTiles.filter((v, i) => nerfTiles.indexOf(v) === i)
                // if there are still too many nerf tiles, slice the array to 12
                if(filteredNerfTiles.length > 12) {
                    return resolve([
                        `used-${specialCard[0]}`, 
                        filteredNerfTiles.slice(0, 12).join(',')
                    ])
                }
                // nerf tiles <= 12
                return resolve([
                    `used-${specialCard[0]}`, 
                    filteredNerfTiles.join(',')
                ])
            }
            return resolve([null, null])
        }
        else if(data.type == 'cursed') {
            const {price} = data
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // get card
            const specialCard = splitSpecialCard?.map(v => v.match(/curse reverser/i)).flat().filter(i=>i) || []
            if(specialCard[0]) {
                setSpecialCardHistory(specialCard[0])
                const newMoney = price * .50
                return resolve([`used-${specialCard[0]}`, newMoney])
            }
            return resolve([null, null])
        }
        else return resolve([null, null])
    })

    // confirmation function
    interface ISpecialCardConfirm {
        sc: string, newValue: string|number, eventContent: string
    }
    function specialCardConfirmation(data: ISpecialCardConfirm) {
        const {sc, newValue, eventContent} = data
        
        return new Promise((resolve: (value: [string, string|number])=>void) => {
            let specialCardTimer = 6
            const specialCardInterval = setInterval(() => {
                notifTimer.textContent = translateUI({lang: miscState.language, text: `"wanna use sss card?" ttt`})
                                        .replace('sss', sc).replace('ttt', specialCardTimer.toString())
                specialCardTimer--
                // get buttons
                const [nopeButton, ofcourseButton] = [
                    qS('[data-id=notif_button_0]'), 
                    qS('[data-id=notif_button_1]')
                ] as HTMLInputElement[]
                // timeout = cancel
                if(specialCardTimer < 0) {
                    clearInterval(specialCardInterval)
                    notifTimer.textContent = ''
                    nopeButton ? nopeButton.click() : null
                    // hide notif after click
                    miscState.setAnimation(false)
                    gameState.setShowGameNotif(null)
                    return
                }
                // choice event
                if(nopeButton && playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
                    // show buttons
                    ofcourseButton.classList.remove('hidden')
                    // modify button 
                    ofcourseButton.textContent = translateUI({lang: miscState.language, text: 'Of course'})
                    ofcourseButton.classList.add('text-green-300')
                    // click event
                    ofcourseButton.onclick = () => {
                        clearInterval(specialCardInterval)
                        notifTimer.textContent = ''
                        // set history
                        setSpecialCardHistory(sc)
                        // hide button
                        nopeButton.classList.add('hidden')
                        ofcourseButton.classList.add('hidden')
                        // modify tax price
                        notifMessage.textContent = setSpecialCardContent(newValue, eventContent)
                        // return data
                        return resolve([`used-${sc}`, newValue])
                    }
                    // show buttons
                    nopeButton.classList.remove('hidden')
                    // modify button 
                    nopeButton.textContent = translateUI({lang: miscState.language, text: 'Nope'})
                    nopeButton.classList.add('text-red-300')
                    // click event
                    nopeButton.onclick = () => {
                        clearInterval(specialCardInterval)
                        notifTimer.textContent = ''
                        // hide button
                        nopeButton.classList.add('hidden')
                        ofcourseButton.classList.add('hidden')
                        // return data
                        return resolve([null, null])
                    }
                }
            }, 1000);
        })
    }

    function setSpecialCardContent(newValue: string|number, eventContent: string) {
        switch(true) {
            case typeof newValue == 'number':
                return eventContent
                .replace('xxx', playerTurnData.display_name) // player name
                .replace('xxx', moneyFormat(newValue)) // city price
            case typeof newValue == 'string':
                return eventContent
        }
    }

    /**
     * @description set special card to game history & play sound
     */
    function setSpecialCardHistory(specialCard: string) {
        if(playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
            localStorage.setItem('specialCardUsed', `special_card: ${specialCard} 💳`)
            soundSpecialCard.play()
        }
    }
}

// ========== > UPDATE SPECIAL CARD LIST ==========
// ========== > UPDATE SPECIAL CARD LIST ==========
/**
 * @param cardData array of special card (ex: ['used-upgrade city', 'add-anti tax'])
 * @param currentSpecialCard current player card data
 * @returns 
 */
export function updateSpecialCardList(cardData: string[], currentSpecialCard: string) {
    const tempCurrentSpecialCard = currentSpecialCard?.split(';') || []
    for(let cd of cardData) {
        // card null
        if(!cd) continue
        // card exist
        const [action, specialCard] = cd.split('-')
        if(action == 'add') {
            // check if player already have the card
            const isSpecialCardOwned = tempCurrentSpecialCard.indexOf(specialCard)
            // dont have yet, then add
            if(isSpecialCardOwned === -1) tempCurrentSpecialCard.push(specialCard)
        }
        else if(action == 'used') {
            // remove the card
            const findSpecialCard = tempCurrentSpecialCard.indexOf(specialCard)
            tempCurrentSpecialCard.splice(findSpecialCard, 1)
        }
    }
    return tempCurrentSpecialCard.length === 0 ? null : tempCurrentSpecialCard.join(';')
}