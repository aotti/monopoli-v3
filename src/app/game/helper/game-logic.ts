import { fetcher, fetcherOptions, qS, qSA } from "../../../helper/helper"
import { IGameContext, IMiscContext, IResponse } from "../../../helper/types"


/**
 * @param numberTarget dice result number
 */
export function playerMoving(playerTurn: string, numberTarget: number, miscState: IMiscContext, gameState: IGameContext) {
    // get player path
    const playerPaths = qSA(`[data-player-path]`) as NodeListOf<HTMLElement>
    // get players
    const playerNames = qSA(`[data-player-name]`) as NodeListOf<HTMLElement>
    // footstep sounds
    const [soundFootstep1, soundFootstep2] = [qS('#sound_footstep_1'), qS('#sound_footstep_2')] as HTMLAudioElement[]
    // match player name
    playerNames.forEach(player => {
        if(player.dataset.playerName != playerTurn) return
        // find current player
        const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(playerTurn)
        // moving params
        let numberStep = 0
        let numberLaps = gameState.gamePlayerInfo[findPlayer].lap
        const currentPos = gameState.gamePlayerInfo[findPlayer].pos
        const nextPos = (currentPos + numberTarget) === playerPaths.length 
                        ? playerPaths.length 
                        : ((currentPos + numberTarget) % playerPaths.length)
        // move function
        const stepInterval = setInterval(() => moving(), 750);

        async function moving() {
            // count step
            ++numberStep
            // step sounds
            if(numberStep % 2 === 1 && numberStep <= numberTarget) soundFootstep1.play()
            else if(numberStep % 2 === 0 && numberStep <= numberTarget) soundFootstep2.play()
            // stop moving
            if(numberStep > numberTarget) {
                clearInterval(stepInterval)
                // turn off roll dice
                gameState.setRollNumber(null)
                // ====== ONLY MOVING PLAYER WILL FETCH ======
                if(gameState.gamePlayerInfo[findPlayer].display_name != gameState.myPlayerInfo.display_name) return
                // ====== ONLY MOVING PLAYER WILL FETCH ======
                console.log(gameState.myPlayerInfo.display_name, 'fetching');
                
                // result message
                const notifTitle = qS('#result_notif_title')
                const notifMessage = qS('#result_notif_message')
                // input values container
                const inputValues = {
                    action: 'game turn end',
                    channel: `monopoli-gameroom-${gameState.gameRoomId}`,
                    display_name: gameState.gamePlayerInfo[findPlayer].display_name,
                    pos: nextPos.toString(),
                    lap: numberLaps.toString(),
                    // history = rolled_dice: num;buy_city: str;sell_city: str;get_card: str;use_card: str
                    history: `rolled_dice: ${numberTarget}`
                }
                // fetch
                const playerTurnEndFetchOptions = fetcherOptions({method: 'PUT', credentials: true, body: JSON.stringify(inputValues)})
                const playerTurnEndResponse: IResponse = await (await fetcher('/game', playerTurnEndFetchOptions)).json()
                // response
                switch(playerTurnEndResponse.status) {
                    case 200: 
                        // save access token
                        if(playerTurnEndResponse.data[0].token) {
                            localStorage.setItem('accessToken', playerTurnEndResponse.data[0].token)
                            delete playerTurnEndResponse.data[0].token
                        }
                        break
                    default: 
                        // show notif
                        miscState.setAnimation(true)
                        gameState.setShowGameNotif('normal')
                        // error message
                        notifTitle.textContent = `error ${playerTurnEndResponse.status}`
                        notifMessage.textContent = `${playerTurnEndResponse.message}`
                        break
                }
                return
            }
            // moving
            playerPaths.forEach(path => {
                // prevent tile number == 0
                const tempStep = currentPos + numberStep
                const fixedNextStep = tempStep === playerPaths.length ? playerPaths.length : (tempStep % playerPaths.length)
                // match paths & move
                if(+path.dataset.playerPath === fixedNextStep) {
                    gameState.setGamePlayerInfo(players => {
                        const newPosInfo = [...players]
                        newPosInfo[findPlayer].pos = fixedNextStep
                        return newPosInfo
                    })
                    // update laps for moving player
                    if(tempStep === playerPaths.length) {
                        numberLaps += 1
                        gameState.setGamePlayerInfo(players => {
                            const newLapInfo = [...players]
                            newLapInfo[findPlayer].lap = numberLaps
                            return newLapInfo
                        })
                    }
                }
            })
        }
    })
}

function playerStopBy() {
    
}