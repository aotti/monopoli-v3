import { qS, qSA } from "../../../helper/helper"
import { EventDataType, IGameContext, IMiscContext, IRollDiceData } from "../../../helper/types"
import { playerMoving } from "./game-prepare-playing-logic"
import { playGameSounds } from "./game-tile-event-sounds"
import { useSpecialCard } from "./game-tile-event-special-card-logic"

// ========== # PARKING EVENT ==========
// ========== # PARKING EVENT ==========
export function stopByParking(findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        // get current player
        const playerTurnData = gameState.gamePlayerInfo[findPlayer]
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        const notifTimer = qS('#result_notif_timer')
        // check special card
        const [specialCard, specialEffect] = await useSpecialCard(
            {type: 'parking'}, findPlayer, miscState, gameState
        ) as [string, string]
        // play sound
        playGameSounds('parking', miscState)
        // notif message
        notifTitle.textContent = 'Free Parking'
        notifMessage.textContent = 'select tile number'
        // show notif 
        miscState.setAnimation(true)
        gameState.setShowGameNotif('with_button-24' as any)
        // parking interval
        let parkingTimer = 10
        const parkingInterval = setInterval(() => {
            notifTimer.textContent = specialCard ? `"nerf parking" ${parkingTimer}` : `${parkingTimer}`
            parkingTimer--
            // dont move if not click
            if(parkingTimer < 0) {
                clearInterval(parkingInterval)
                notifTimer.textContent = ''
                // hide notif
                miscState.setAnimation(false)
                gameState.setShowGameNotif(null)
                return resolve({
                    event: 'parking',
                    destination: 22, // parking tile
                    money: 0,
                    card: specialCard
                })
            }
            // check button exist
            const parkingButton = qS(`[data-id=notif_button_0]`)
            if(parkingButton && playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
                // modify button
                const parkingButtons = qSA(`[data-id^=notif_button]`) as NodeListOf<HTMLInputElement>
                for(let i=0; i<parkingButtons.length; i++) {
                    // skip prison (tile 10, i 9) & parking (tile 22, i 21) 
                    // skip special effect (nerf tiles)
                    if(i === 9 || i === 21 || specialEffect?.match(`${i}`)) continue

                    const pb = parkingButtons[i]
                    pb.classList.remove('hidden')
                    pb.classList.add('border')
                    pb.textContent = `${i+1}`
                    pb.dataset.destination = `${i+1}`
                    // click event
                    pb.onclick = () => {
                        clearInterval(parkingInterval)
                        // set moving parameter
                        const chosenSquare = +pb.dataset.destination
                        const tempCurrentPos = +playerTurnData.pos.split('x')[0]
                        const setChosenDice = tempCurrentPos > chosenSquare 
                                            ? (24 + chosenSquare) - tempCurrentPos
                                            : chosenSquare - tempCurrentPos
                        const rollDiceData: IRollDiceData = {
                            playerTurn: playerTurnData.display_name,
                            playerDice: setChosenDice,
                            playerRNG: rng,
                            playerSpecialCard: specialCard
                        }
                        // reset modify buttons
                        for(let tpb of parkingButtons) {
                            tpb.classList.add('hidden')
                            tpb.classList.remove('border')
                        }
                        // set additional event data for history (only for moving cards, upgrade, take card)
                        // only add sub event if player click the button
                        localStorage.setItem('parkingEventData', `parking: tile ${chosenSquare} 😎`)
                        // update notif
                        notifTimer.textContent = `going to tile ${chosenSquare}`
                        return playerMoving(rollDiceData, miscState, gameState)
                    }
                }
            }
        }, 1000);
    })
}