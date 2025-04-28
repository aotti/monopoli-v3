import { FormEvent } from "react"
import { catchError, fetcher, fetcherOptions, moneyFormat, qS, qSA, setInputValue, shuffle, translateUI } from "../../../helper/helper"
import { BuffDebuffEventType, EventDataType, IGameContext, IGamePlay, IMiscContext, IResponse, IRollDiceData, SpecialCardEventType, UpdateCityListType } from "../../../helper/types"
import chance_cards_list from "../config/chance-cards.json"
import community_cards_list from "../config/community-cards.json"
import debuff_effect_list from "../config/debuff-effects.json"
import buff_effect_list from "../config/buff-effects.json"

/*
    TABLE OF CONTENTS
    - GAME PREPARE
        # START GAME
        # ROLL TURN
        # ROLL DICE
    - GAME PLAYING
        # PLAYER MOVING
        # EVENT HISTORY
        # CHECK GAME PROGRESS
        # GAME OVER
    - GAME TILE EVENT
        # NORMAL CITY EVENT
        # SPECIAL CITY EVENT
            > SELL CITY
            > UPDATE CITY
            > SPECIAL UPGRADE CITY
        # CARD EVENT
        # PRISON EVENT
        # PARKING EVENT
        # CURSED CITY EVENT
        # SPECIAL CARD EVENT
            > UPDATE SPECIAL CARD
        # BUFF/DEBUFF EVENT
            > UPDATE BUFF/DEBUFF LIST
*/

// ========== GAME PREPARE ==========
// ========== GAME PREPARE ==========
export async function getPlayerInfo(roomId: number, miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    const playerTurnNotif = qS('#player_turn_notif')
    // button
    const rollTurnButton = qS('#roll_turn_button') as HTMLInputElement
    const readyButton = qS('#ready_button') as HTMLInputElement
    // fetch
    const getPlayerFetchOptions = fetcherOptions({method: 'GET', credentials: true, noCache: true})
    const getPlayerResponse: IResponse = await (await fetcher(`/game?id=${roomId}`, getPlayerFetchOptions)).json()
    // response
    switch(getPlayerResponse.status) {
        case 200: 
            const { getPlayers, gameStage, decidePlayers, preparePlayers, gameHistory, playerTurns } = getPlayerResponse.data[0]
            // set game stage
            gameState.setGameStages(gameStage)
            // set player list
            gameState.setGamePlayerInfo(getPlayers)
            // set game history
            gameState.setGameHistory(gameHistory)
            // set player turns
            localStorage.setItem('playerTurns', JSON.stringify(playerTurns))
            // set decide players
            if(decidePlayers) {
                // change game stage
                const isGameStage = decidePlayers.length === preparePlayers.length
                if(isGameStage) gameState.setGameStages('play')
                else gameState.setGameStages('decide')
                // display rolled number
                displayRolledNumber()
                return
            }
            // set prepare players
            else if(preparePlayers) {
                playerTurnNotif ? playerTurnNotif.textContent = `${preparePlayers.length} player(s) ready` : null
                // if > 2 players ready, set start notif
                if(preparePlayers.length >= 2) gameStartNotif()
                // disable button if ready is clicked (for other)
                const isReadyClicked = preparePlayers.indexOf(gameState.myPlayerInfo?.display_name)
                if(readyButton && isReadyClicked !== -1) {
                    readyButton.disabled = true
                    readyButton.className = 'min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0'
                    return
                }
                // change to start button (for creator)
                // creator has clicked ready
                const findCreator = gameState.gameRoomInfo.map(v => v.creator).indexOf(gameState.myPlayerInfo?.display_name)
                if(readyButton && isReadyClicked !== -1 && findCreator !== -1) {
                    readyButton.id = 'start_button'
                    readyButton.textContent = translateUI({lang: miscState.language, text: 'start'})
                    return
                }
            }
            return
        default: 
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${getPlayerResponse.status}`
            notifMessage.textContent = `${getPlayerResponse.message}`
            return
    }

    // display rolled number
    function displayRolledNumber() {
        const decidePlayersRank = []
        for(let dp of getPlayerResponse.data[0]?.decidePlayers) {
            decidePlayersRank.push(`${dp.rolled_number} - ${dp.display_name}`)
            // check if player have rolled
            if(rollTurnButton && dp.display_name == gameState.myPlayerInfo.display_name) {
                rollTurnButton.disabled = true
                rollTurnButton.className = 'min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0'
            }
        }
        playerTurnNotif ? playerTurnNotif.textContent = decidePlayersRank.join('\n') : null
    }

    // game start notif
    function gameStartNotif() {
        // show notif
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        notifTitle.textContent = translateUI({lang: miscState.language, text: 'Preparation'})
        notifMessage.textContent = translateUI({lang: miscState.language, text: 'if all players are ready, room creator have to click the "start" button'})
    }
}

export async function leaveGameRoom(miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // submit button
    const leaveButton = qS('#leave_button') as HTMLInputElement
    // get my character for remove
    const getMyCharacter = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(gameState.myPlayerInfo.display_name)
    // input value container
    const inputValues = {
        action: 'room leave',
        room_id: gameState.gameRoomId.toString(),
        display_name: gameState.myPlayerInfo.display_name,
        select_character: gameState.gamePlayerInfo[getMyCharacter].character
    }
    // check is player creator
    const isCreatorLeave = gameState.gameRoomInfo.map(v => v.creator).indexOf(inputValues.display_name)
    if(isCreatorLeave !== -1) {
        // show notif
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        // error message
        notifTitle.textContent = `error 400`
        notifMessage.textContent = translateUI({lang: miscState.language, text: `creator cannot leave this way, please delete the room to leave`})
        return
    }
    // loading button
    const tempButtonText = leaveButton.textContent
    leaveButton.textContent = 'Loading'
    leaveButton.disabled = true
    // fetch
    const leaveGameFetchOptions = fetcherOptions({method: 'DELETE', credentials: true, body: JSON.stringify(inputValues)})
    const leaveGameResponse: IResponse = await (await fetcher('/room', leaveGameFetchOptions)).json()
    // response
    switch(leaveGameResponse.status) {
        case 200: 
            // save access token
            if(leaveGameResponse.data[0].token) {
                localStorage.setItem('accessToken', leaveGameResponse.data[0].token)
                delete leaveGameResponse.data[0].token
            }
            // move to room list
            const link = qS('#gotoRoom') as HTMLAnchorElement
            link.click()
            // set my current game
            gameState.setMyCurrentGame(null)
            // enable submit buttons
            leaveButton.textContent = tempButtonText
            leaveButton.removeAttribute('disabled')
            return
        default:
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${leaveGameResponse.status}`
            notifMessage.textContent = `${leaveGameResponse.message}`
            // enable submit buttons
            leaveButton.textContent = tempButtonText
            leaveButton.removeAttribute('disabled')
            return
    }
}

export async function readyGameRoom(miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // submit button
    const readyButton = qS('#ready_button') as HTMLInputElement
    // input value container
    const inputValues = {
        action: 'game ready player',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name
    }
    // loading button
    const tempButtonText = readyButton.textContent
    readyButton.textContent = 'Loading'
    readyButton.disabled = true
    // fetch
    const readyGameFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const readyGameResponse: IResponse = await (await fetcher('/game', readyGameFetchOptions)).json()
    // response
    switch(readyGameResponse.status) {
        case 200: 
            // save access token
            if(readyGameResponse.data[0].token) {
                localStorage.setItem('accessToken', readyGameResponse.data[0].token)
                delete readyGameResponse.data[0].token
            }
            // button for creator
            const findCreator = gameState.gameRoomInfo.map(v => v.creator).indexOf(gameState.myPlayerInfo.display_name)
            if(findCreator !== -1) {
                readyButton.removeAttribute('disabled')
                readyButton.id = 'start_button'
                readyButton.textContent = translateUI({lang: miscState.language, text: 'start'})
                return
            }
            // button for other
            readyButton.textContent = tempButtonText
            readyButton.className = 'min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0'
            return
        default: 
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${readyGameResponse.status}`
            notifMessage.textContent = `${readyGameResponse.message}`
            // enable submit buttons
            readyButton.textContent = tempButtonText
            readyButton.removeAttribute('disabled')
            return
    }
}

// ========== GAME PLAYING ==========
// ========== GAME PLAYING ==========

// ========== # START GAME ==========
// ========== # START GAME ==========
export async function startGameRoom(miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // submit button
    const startButton = qS('#start_button') as HTMLInputElement
    // input value container
    const inputValues = {
        action: 'game start',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`
    }
    // loading button
    const tempButtonText = startButton.textContent
    startButton.textContent = 'Loading'
    startButton.disabled = true
    // fetch
    const startGameFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const startGameResponse: IResponse = await (await fetcher('/game', startGameFetchOptions)).json()
    // response
    switch(startGameResponse.status) {
        case 200: 
            // save access token
            if(startGameResponse.data[0].token) {
                localStorage.setItem('accessToken', startGameResponse.data[0].token)
                delete startGameResponse.data[0].token
            }
            // normal submit buttons
            startButton.textContent = tempButtonText
            startButton.className = 'min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0'
            return
        default:
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${startGameResponse.status}`
            notifMessage.textContent = `${startGameResponse.message}`
            // enable submit buttons
            startButton.textContent = tempButtonText
            startButton.removeAttribute('disabled')
            return
    }
}

// ========== # ROLL TURN ==========
// ========== # ROLL TURN ==========
export async function rollTurnGameRoom(formInputs: HTMLFormControlsCollection, tempButtonText: string, miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // submit button
    const rollTurnButton = qS('#roll_turn_button') as HTMLInputElement
    // input value container
    const inputValues = {
        action: 'game roll turn',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
        rolled_number: null
    }
    // get input elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName.match(/INPUT/)) {
            // filter inputs
            if(setInputValue('rolled_number', input)) inputValues.rolled_number = input.value.trim().toLowerCase()
            // error
            else {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                notifTitle.textContent = 'error 400'
                notifMessage.textContent = `${input.id} doesnt match`
                return
            }
        }
    }
    // fetch
    const rollTurnFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const rollTurnResponse: IResponse = await (await fetcher('/game', rollTurnFetchOptions)).json()
    // response
    switch(rollTurnResponse.status) {
        case 200: 
            // save access token
            if(rollTurnResponse.data[0].token) {
                localStorage.setItem('accessToken', rollTurnResponse.data[0].token)
                delete rollTurnResponse.data[0].token
            }
            // normal submit buttons
            rollTurnButton.textContent = tempButtonText
            rollTurnButton.className = 'min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0'
            return
        default: 
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${rollTurnResponse.status}`
            notifMessage.textContent = `${rollTurnResponse.message}`
            // enable submit buttons
            rollTurnButton.textContent = tempButtonText
            rollTurnButton.removeAttribute('disabled')
            return
    }
}

// ========== # ROLL DICE ==========
// ========== # ROLL DICE ==========
export async function rollDiceGameRoom(formInputs: HTMLFormControlsCollection, tempButtonText: string, miscState: IMiscContext, gameState: IGameContext, specialCard?: string) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // roll dice button
    const rollDiceButton = qS('#roll_dice_button') as HTMLInputElement
    // set rng for twoway board
    const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(gameState.myPlayerInfo.display_name)
    const currentPos = gameState.gamePlayerInfo[findPlayer].pos
    const branchRNG: number[] = checkBranchTiles('roll_dice', currentPos)
    // input values container
    const inputValues = {
        action: 'game roll dice',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
        rolled_dice: specialCard ? '0' : null,
        // Math.floor(Math.random() * 101).toString()
        rng: [
            Math.floor(Math.random() * 101), 
            branchRNG[0]
        ].toString(),
        special_card: specialCard ? specialCard : null
    }
    // get input elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName.match(/INPUT/)) {
            // filter inputs
            if(setInputValue('rolled_dice', input)) inputValues.rolled_dice = input.value.trim().toLowerCase()
            // error
            else {
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                notifTitle.textContent = 'error 400'
                notifMessage.textContent = `${input.id} doesnt match`
                return
            }
        }
    }
    // set state to disable "back to room & surrender" buttons
    miscState.setDisableButtons('gameroom')
    // fetch
    const rollDiceFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const rollDiceResponse: IResponse = await (await fetcher('/game', rollDiceFetchOptions)).json()
    // response
    switch(rollDiceResponse.status) {
        case 200: 
            // save access token
            if(rollDiceResponse.data[0].token) {
                localStorage.setItem('accessToken', rollDiceResponse.data[0].token)
                delete rollDiceResponse.data[0].token
            }
            // button to normal
            rollDiceButton.textContent = tempButtonText
            rollDiceButton.removeAttribute('disabled')
            return
        default: 
            // reset disable buttons
            miscState.setDisableButtons(null)
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            const translateError = translateUI({lang: miscState.language, text: rollDiceResponse.message as any})
            notifTitle.textContent = `error ${rollDiceResponse.status}`
            notifMessage.textContent = `${translateError || rollDiceResponse.message}`
            // button to normal
            rollDiceButton.textContent = tempButtonText
            rollDiceButton.removeAttribute('disabled')
            return
    }
}

export async function surrenderGameRoom(miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // submit button
    const surrenderButton = qS('#surrender_button') as HTMLInputElement
    // input value container
    const inputValues = {
        action: 'game surrender',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
        money: '-999999'
    }
    // surrender prompt
    if(!confirm(`Are you sure wanna surrend?`)) return
    // loading button
    const tempButtonText = surrenderButton.textContent
    surrenderButton.textContent = 'Loading'
    surrenderButton.disabled = true
    // fetch
    const surrenderFetchOptions = fetcherOptions({method: 'PUT', credentials: true, body: JSON.stringify(inputValues)})
    const surrenderResponse: IResponse = await (await fetcher('/game', surrenderFetchOptions)).json()
    // response
    switch(surrenderResponse.status) {
        case 200: 
            // save access token
            if(surrenderResponse.data[0].token) {
                localStorage.setItem('accessToken', surrenderResponse.data[0].token)
                delete surrenderResponse.data[0].token
            }
            // update my player info (game played)
            gameState.setMyPlayerInfo(player => {
                const newMyPlayer = {...player}
                newMyPlayer.game_played += 1
                // save to local storage
                localStorage.setItem('playerData', JSON.stringify(newMyPlayer))
                return newMyPlayer
            })
            return
        default: 
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${surrenderResponse.status}`
            notifMessage.textContent = `${surrenderResponse.message}`
            // enable submit buttons
            surrenderButton.textContent = tempButtonText
            surrenderButton.removeAttribute('disabled')
            return
    }
}

// ========== # PLAYER MOVING ==========
// ========== # PLAYER MOVING ==========
/**
 * @param playerDice dice result number
 */
export function playerMoving(rollDiceData: IRollDiceData, miscState: IMiscContext, gameState: IGameContext) {
    const {playerTurn, playerDice, playerRNG, playerSpecialCard} = rollDiceData
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    const notifTimer = qS('#result_notif_timer')
    const playerTurnNotif = qS('#player_turn_notif')
    // get player path
    const playerPaths = qSA(`[data-player-path]`) as NodeListOf<HTMLElement>
    // get players
    const playerNames = qSA(`[data-player-name]`) as NodeListOf<HTMLElement>
    // footstep sounds
    const [soundFootstep1, soundFootstep2] = [qS('#sound_footstep_1'), qS('#sound_footstep_2')] as HTMLAudioElement[]
    // match player name
    playerNames.forEach(player => {
        if(player.dataset.playerName != playerTurn) return
        // reset notif timer
        notifTimer.textContent = ''
        // find current room info
        const findRoomInfo = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
        const boardType = gameState.gameRoomInfo[findRoomInfo].board
        // find current player
        const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(playerTurn)
        const playerTurnData = gameState.gamePlayerInfo[findPlayer]
        // get tile element for stop by event
        let [tileInfo, tileElement]: [string, HTMLElement] = [null, null]
        // set tile info & element if theres special card
        if(playerSpecialCard && playerTurnData.city) 
            [tileInfo, tileElement] = specialUpgradeCity(playerTurnData, +playerRNG[0])
        // moving params
        let numberStep = 0
        let [numberLaps, throughStart] = [playerTurnData.lap, 0]
        const currentPos = +playerTurnData.pos.split('x')[0]
        // check next pos (only for board twoway)
        const tempDestinatedPos = (currentPos + playerDice) === 24 ? 24 : (currentPos + playerDice) % 24
        const checkDestinatedPos = checkBranchTiles('moving', tempDestinatedPos.toString())
        const checkNextPos = boardType == 'twoway' && +playerRNG[1] > 50
        // set destinated pos
        const destinatedPos = (currentPos + playerDice) === 24 
                        ? `24${checkNextPos && checkDestinatedPos.length > 0 ? 'x' : ''}`
                        : `${(currentPos + playerDice) % 24}${checkNextPos && checkDestinatedPos.length > 0 ? 'x' : ''}`
        // get prison data for checking prison status
        const prisonNumber = playerTurnData.prison
        // special card container
        // player special card = nerf parking card (nullable)
        const specialCardCollection = {cards: [playerSpecialCard], effects: []}
        // buff/debuff container
        const buffCollection = []
        const debuffCollection = []
        // move function
        const stepInterval = setInterval(async () => {
            // check debuff
            const [buffDebuff, buffDebuffEffect] = useBuffDebuff(
                {type: 'debuff', effect: 'skip turn'}, findPlayer, miscState, gameState
            )
            debuffCollection.push(buffDebuff)
            // check if player is arrested / get debuff (skip turn)
            if(prisonNumber !== -1 || buffDebuffEffect) {
                clearInterval(stepInterval)
                // turn off roll dice
                gameState.setRollNumber(null)
                // end turn
                return turnEnd(null)
            }
            // player can move
            moving()
        }, 500);

        async function moving() {
            // count step
            ++numberStep
            // step sounds (math.abs to prevent move backward bug)
            if(numberStep % 2 === 1 && numberStep <= Math.abs(playerDice)) soundFootstep1.play()
            else if(numberStep % 2 === 0 && numberStep <= Math.abs(playerDice)) soundFootstep2.play()
            // stop moving (math.abs to prevent move backward bug)
            if(numberStep > Math.abs(playerDice)) {
                clearInterval(stepInterval)
                // turn off roll dice
                gameState.setRollNumber(null)
                // check special card (gaming dice)
                const [specialCard, specialEffect] = await useSpecialCard(
                    {type: 'dice', diceNumber: playerDice}, findPlayer, miscState, gameState
                )
                specialCardCollection.cards.push(specialCard)
                specialCardCollection.effects.push(specialEffect)
                // stop by event
                stopByEvent()
                // ====== ONLY MOVING PLAYER WILL FETCH ======
                .then(eventData => turnEnd(eventData))
                return
            }
            // moving
            playerPaths.forEach(async path => {
                // prevent tile number == 0
                // check player dice to decide step forward / backward
                const tempStep = playerDice < 0 ? currentPos - numberStep : currentPos + numberStep
                const fixedNextStep = tempStep === 24 ? 24 : (tempStep % 24)
                // check branch tiles
                const branchTiles = checkBranchTiles('moving', fixedNextStep.toString())
                // set branch step to walk on branch tile (only board-twoway)
                const branchStep = checkNextPos && branchTiles.length > 0 ? 'x' : ''
                // match paths & move
                if(path.dataset.playerPath == `${fixedNextStep}${branchStep}`) {
                    [tileInfo, tileElement] = [path.dataset.tileInfo, path]
                    // update player pos
                    gameState.setGamePlayerInfo(players => {
                        const newPosInfo = [...players]
                        newPosInfo[findPlayer].pos = `${fixedNextStep}${branchStep}`
                        return newPosInfo
                    })
                    // update laps for moving player
                    if(fixedNextStep == 1 || `${fixedNextStep}${branchStep}` == '1x') {
                        numberLaps += 1
                        // update laps
                        gameState.setGamePlayerInfo(players => {
                            const newLapInfo = [...players]
                            newLapInfo[findPlayer].lap = numberLaps
                            return newLapInfo
                        })
                        // check special card
                        const [specialCard, specialEffect] = await useSpecialCard(
                            {type: 'start'}, findPlayer, miscState, gameState
                        )
                        specialCardCollection.cards.push(specialCard)
                        specialCardCollection.effects.push(0)
                        throughStart = +specialEffect || 25_000
                    }
                }
            })
        }

        function stopByEvent() {
            return new Promise((resolve: (value: EventDataType)=>void ) => {
                // match tile info
                // only buff/debuff can be triggered since lap 1
                if(numberLaps > 1) {
                    switch(tileInfo) {
                        case 'city': 
                        case 'special':
                            stopByCity(tileInfo, findPlayer, tileElement, miscState, gameState)
                            .then(eventData => resolve(eventData))
                            .catch(err => console.log(err))
                            break
                        case 'chance': 
                        case 'community': 
                            stopByCards(tileInfo, findPlayer, playerRNG, miscState, gameState)
                            // only match type "move" if the card is a single effect
                            .then(eventData => (eventData as any).type?.match(/(?<!.*,)^[move]+(?!.*,)/) ? null : resolve(eventData))
                            .catch(err => console.log(err))
                            break
                        case 'prison': 
                            stopByPrison(findPlayer, miscState, gameState)
                            .then(eventData => resolve(eventData))
                            .catch(err => console.log(err))
                            break
                        case 'parking': 
                            stopByParking(findPlayer, playerRNG, miscState, gameState)
                            .then(eventData => resolve(eventData))
                            .catch(err => console.log(err))
                            break
                        case 'cursed': 
                            stopByCursedCity(findPlayer, tileElement, miscState, gameState)
                            .then(eventData => resolve(eventData))
                            .catch(err => console.log(err))
                            break
                        case 'buff': 
                        case 'debuff': 
                            stopByBuffDebuff(tileInfo, findPlayer, playerRNG, miscState, gameState)
                            .then(eventData => resolve(eventData))
                            .catch(err => console.log(err))
                            break
                        default: 
                            resolve(null)
                            break
                    }
                }
                else if(numberLaps === 1) {
                    switch(tileInfo) {
                        case 'buff': 
                        case 'debuff': 
                            stopByBuffDebuff(tileInfo, findPlayer, playerRNG, miscState, gameState)
                            .then(eventData => resolve(eventData))
                            .catch(err => console.log(err))
                            break
                        default: 
                            resolve(null)
                            break
                    }
                }
            })
        }

        async function turnEnd(eventData: EventDataType) {
            playerTurnNotif.textContent = translateUI({lang: miscState.language, text: 'ppp turn ending..'})
                                        .replace('ppp', playerTurn)
            // prevent other player from doing event
            if(playerTurn != gameState.myPlayerInfo.display_name) return
            // check sub player dice
            const subPlayerDice = localStorage.getItem('subPlayerDice')
            // get tax data
            const taxData = eventData?.event == 'pay_tax' 
                            ? {owner: eventData.owner, visitor: eventData.visitor} 
                            : null
            // get special card event data
            if((eventData as any)?.card) specialCardCollection.cards.push((eventData as any)?.card)
            // accumulate special card effects (only money)
            const specialCardMoney = specialCardCollection.effects.filter(v => typeof v == 'number')
                                    .reduce((accumulate, current) => accumulate + current, 0)
            // update special card list
            const specialCardLeft = updateSpecialCardList(specialCardCollection.cards, playerTurnData.card)
            // set event money
            const eventMoney = throughStart 
                            ? Math.round((eventData?.money || 0) + specialCardMoney + throughStart) 
                            : Math.round((eventData?.money || 0) + specialCardMoney)
            // check debuff reduce money (only if player get money)
            const [buffDebuff, buffDebuffEffect] = eventMoney > 0 ? useBuffDebuff(
                {type: 'debuff', effect: 'reduce money', money: eventMoney},
                findPlayer, miscState, gameState
            ) as [string, number] : [null, null];
            // add debuff reduce money & set notif message
            debuffCollection.push(buffDebuff)
            notifMessage.textContent += buffDebuff ? `\n${translateUI({lang: miscState.language, text: '"debuff reduce money"'})}` : ''
            // get buff/debuff event data
            if((eventData as any)?.buff) buffCollection.push((eventData as any)?.buff)
            if((eventData as any)?.debuff) debuffCollection.push((eventData as any)?.debuff)
            // update buff/debuff list
            const buffLeft = updateBuffDebuffList(buffCollection, playerTurnData.buff)
            const debuffLeft = updateBuffDebuffList(debuffCollection, playerTurnData.debuff)
            // get prison accumulate number
            const prisonNumber = playerTurnData.prison
            // check if player is just step on prison / already arrested
            const isFirstArrested = (eventData as any)?.accumulate === 0
            const isArrested = prisonNumber < 0 ? null : prisonNumber
            // accumulate dice number
            const prisonAccumulate = isFirstArrested 
                                    ? 0 
                                    : typeof isArrested == 'number' && isArrested > -1 
                                        ? (isArrested + playerDice) 
                                        : -1
            // check if accumulate dice is enough
            // 1 dice = 6, 2 dice = 12
            const prisonAccumulateLimit = gameState.gameRoomInfo[findRoomInfo].dice * 6
            const isPrisonAccumulatePass = prisonAccumulate > prisonAccumulateLimit ? -1 : prisonAccumulate
            // input values container
            const inputValues: IGamePlay['turn_end'] | {action: string} = {
                action: 'game turn end',
                channel: `monopoli-gameroom-${gameState.gameRoomId}`,
                display_name: playerTurnData.display_name,
                // arrested (0) || debuff = stay current pos
                pos: prisonNumber !== -1 || debuffCollection.join(',').match('used-skip turn') 
                    ? currentPos.toString() 
                    : destinatedPos,
                lap: numberLaps.toString(),
                // money from event that occured
                event_money: (eventMoney - (buffDebuffEffect || 0)).toString(),
                // history = rolled_dice: num;buy_city: str;pay_tax: str;sell_city: str;get_card: str;use_card: str
                history: setEventHistory(`rolled_dice: ${subPlayerDice || playerDice}`, eventData),
                // nullable data: city, card, taxes, take money, buff, debuff
                city: (eventData as any)?.city || playerTurnData.city,
                tax_owner: taxData?.owner || null,
                tax_visitor: taxData?.visitor || null,
                card: specialCardLeft,
                buff: buffLeft,
                debuff: debuffLeft,
                // taking money from players
                take_money: (eventData as any)?.takeMoney || null,
                // prison accumulate
                prison: isPrisonAccumulatePass.toString()
            }
            // remove sub data
            localStorage.removeItem('subPlayerDice')
            localStorage.removeItem('subEventData')
            localStorage.removeItem('parkingEventData')
            localStorage.removeItem('specialCardUsed')
            localStorage.removeItem('buffDebuffUsed')
            localStorage.removeItem('moreMoney')
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
                    // update player turns
                    localStorage.setItem('playerTurns', JSON.stringify(playerTurnEndResponse.data[0].playerTurns))
                    // reset disable buttons
                    miscState.setDisableButtons(null)
                    return
                default: 
                    // show notif
                    miscState.setAnimation(true)
                    gameState.setShowGameNotif('normal')
                    // error message
                    notifTitle.textContent = `error ${playerTurnEndResponse.status}`
                    notifMessage.textContent = `${playerTurnEndResponse.message}`
                    return
            }
        }
    })
}

// ========== # CHECK BRANCH TILES ==========
// ========== # CHECK BRANCH TILES ==========
function checkBranchTiles(action: 'roll_dice'|'moving', pos: string) {
    const tempArray = []
    switch(pos) {
        case '12': case '13': case '14': case '24': case '1': case '2': 
            action == 'roll_dice' ? tempArray.push(50) : tempArray.push('x')
            break
        case '12x': case '13x': case '14x': case '24x': case '1x': case '2x': 
            action == 'roll_dice' ? tempArray.push(51) : null
            break
        default:
            action == 'roll_dice' ? tempArray.push(Math.floor(Math.random() * 101)) : null
    }
    return tempArray
}

// ========== # EVENT HISTORY ==========
// ========== # EVENT HISTORY ==========
function setEventHistory(rolled_dice: string, eventData: EventDataType) {
    // check sub event
    const subEventData = localStorage.getItem('subEventData')
    // check parking event
    const parkingEventData = localStorage.getItem('parkingEventData')
    // check special card used
    const specialCardUsed = localStorage.getItem('specialCardUsed')
    // check special card used
    const buffDebuffUsed = localStorage.getItem('buffDebuffUsed')
    // history container
    const historyArray = [rolled_dice, specialCardUsed, parkingEventData, buffDebuffUsed, subEventData].filter(i=>i)
    // check event data
    switch(eventData?.event) {
        case 'buy_city': 
            // check status
            if(eventData.status) {
                // buying city
                historyArray.push(`${eventData.event}: ${eventData.name} (${eventData.property})`)
            }
            else {
                // not buy || property max
                historyArray.push(`${eventData.event}: none`)
            }
            return historyArray.join(';')
        case 'pay_tax': 
            historyArray.push(`${eventData.event}: ${moneyFormat(eventData.money)} to ${eventData.owner}`)
            return historyArray.join(';')
        case 'get_card': 
            historyArray.push(`${eventData.event}: ${eventData.type} (${eventData.tileName} ${eventData.rank})`)
            return historyArray.join(';')
        case 'get_arrested': 
            historyArray.push(`${eventData.event}: lemao 😂`)
            return historyArray.join(';')
        case 'cursed': 
            historyArray.push(`${eventData.event}: ${moneyFormat(eventData.money)} 💀`)
            return historyArray.join(';')
        case 'special_city': 
            historyArray.push(`${eventData.event}: ${moneyFormat(eventData.money)} 💸`)
            return historyArray.join(';')
        case 'get_buff': 
        case 'get_debuff':
            historyArray.push(`${eventData.event}: ${eventData.type} 🙏`)
            return historyArray.join(';')
        default: 
            return historyArray.join(';')
    }
}

// ========== # CHECK GAME PROGRESS ==========
// ========== # CHECK GAME PROGRESS ==========
export function checkGameProgress(playersData: IGameContext['gamePlayerInfo'], miscState: IMiscContext, gameState: IGameContext) {
    // notif
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // get room info
    const findRoom = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
    // get game mode & lose condition
    const loseCondition = gameState.gameRoomInfo[findRoom].money_lose
    const gameMode = gameState.gameRoomInfo[findRoom].mode
    if(gameMode.match(/survive/i)) {
        // get alive players
        const alivePlayers = []
        for(let pd of playersData) {
            // check players money amount
            if(pd.money > loseCondition) 
                alivePlayers.push(pd.display_name)
        }
        // if only 1 left, game over
        if(alivePlayers.length === 1) {
            // set game stage
            gameState.setGameStages('over')
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // winner message
            notifTitle.textContent = translateUI({lang: miscState.language, text: 'Game Over'})
            notifMessage.textContent = translateUI({lang: miscState.language, text: 'ppp has won the game!\nback to room list in 15 seconds'}).replace('ppp', alivePlayers[0])
            setTimeout(() => {
                // set notif to null
                gameState.setShowGameNotif(null)
                const gotoRoom = qS('#gotoRoom') as HTMLAnchorElement
                gotoRoom ? gotoRoom.click() : null
            }, 15_000)
            // run game over
            return gameOver(playersData, miscState, gameState)
        }
    }
    else if(gameMode.match(/laps/i)) {
        const lapsLimit = +gameMode.split('_')[0]
        const highestMoneyPlayer = playersData.map(v => `${v.money},${v.display_name}`).sort().reverse()
        for(let pd of playersData) {
            if(pd.lap >= lapsLimit) {
                // set game stage
                gameState.setGameStages('over')
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                // winner message
                notifTitle.textContent = translateUI({lang: miscState.language, text: 'Game Over'})
                notifMessage.textContent = translateUI({lang: miscState.language, text: 'ppp has won the game!\nback to room list in 15 seconds'}).replace('ppp', highestMoneyPlayer[0].split(',')[1])
                setTimeout(() => {
                    // set notif to null
                    gameState.setShowGameNotif(null)
                    const gotoRoom = qS('#gotoRoom') as HTMLAnchorElement
                    gotoRoom ? gotoRoom.click() : null
                }, 15_000)
                return gameOver(playersData, miscState, gameState)
            }
        }
    }
}

// ========== # GAME OVER ==========
// ========== # GAME OVER ==========
async function gameOver(playersData: IGameContext['gamePlayerInfo'], miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // get room name
    const findRoom = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
    // data for update all player stats
    const allPlayerStats = []
    for(let pd of playersData) {
        // player with plus money set to -999_999 to prevent updating worst money lose
        if(pd.money > 0) allPlayerStats.push(`${pd.display_name},${-999999}`)
        // player with minus money will update worst money lose
        else allPlayerStats.push(`${pd.display_name},${pd.money}`)
    }
    // input value container
    const inputValues = {
        action: 'game over',
        all_player_stats: allPlayerStats.join(';'),
        room_id: gameState.gameRoomId.toString(),
        room_name: gameState.gameRoomInfo[findRoom].room_name
    }
    // update room & all player deleted_at
    const gameOverFetchOptions = fetcherOptions({method: 'PUT', credentials: true, body: JSON.stringify(inputValues)})
    const gameOverResponse: IResponse = await (await fetcher('/game', gameOverFetchOptions)).json()
    // response
    switch(gameOverResponse.status) {
        case 200: 
            // save access token
            if(gameOverResponse.data[0].token) {
                localStorage.setItem('accessToken', gameOverResponse.data[0].token)
                delete gameOverResponse.data[0].token
            }
            // delete room
            gameState.setRoomList(rooms => {
                const newRoomList = [...rooms]
                const findRoom = newRoomList.map(v => v.room_id).indexOf(gameState.gameRoomId)
                newRoomList.splice(findRoom, 1)
                return newRoomList
            })
            return
        default: 
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${gameOverResponse.status}`
            notifMessage.textContent = `${gameOverResponse.message}`
            return
    }
}

// ========== GAME TILE EVENT ==========
// ========== GAME TILE EVENT ==========

// ========== # NORMAL CITY EVENT ==========
// ========== # NORMAL CITY EVENT ==========
// ========== # SPECIAL CITY EVENT ==========
// ========== # SPECIAL CITY EVENT ==========
function stopByCity(tileInfo: 'city'|'special', findPlayer: number, tileElement: HTMLElement, miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        const playerTurnData = gameState.gamePlayerInfo[findPlayer]
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        const notifTimer = qS('#result_notif_timer')
        // get city info
        const getCityInfo = tileElement.dataset.cityInfo.split(',')
        const [buyCityName, buyCityProperty, buyCityPrice, buyCityOwner] = getCityInfo
        // if city owner not current player
        // === paying taxes ===
        const isCityNotMine = buyCityOwner != playerTurnData.display_name
        if(isCityNotMine && buyCityProperty != 'land') 
            return resolve(await payingTaxes())
    
        // if you own the city and its special, get money
        if(tileInfo == 'special' && buyCityProperty == '1house') {
            // notif message 
            notifTitle.textContent = translateUI({lang: miscState.language, text: 'Special City'})
            notifMessage.textContent = translateUI({lang: miscState.language, text: 'You get xxx when visiting your grandma'})
                                    .replace('xxx', moneyFormat(+buyCityPrice))
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            return resolve({
                event: 'special_city',
                money: +buyCityPrice
            })
        }
        // if you own the city and its property is maxed, stop
        if(tileInfo == 'city' && buyCityProperty == 'realestate') {
            return resolve({
                event: 'buy_city',
                status: false,
                money: 0
            })
        }
        // check buff 
        const [buffDebuff, buffDebuffEffect] = useBuffDebuff(
            {type: 'buff', effect: 'reduce price', price: +buyCityPrice},
            findPlayer, miscState, gameState
        ) as [string, number];
        // set buy city price
        const buyCityPriceFixed = buffDebuff ? +buyCityPrice - buffDebuffEffect : +buyCityPrice
        // set event text for notif
        let [eventTitle, eventContent] = [
            !isCityNotMine 
                ? translateUI({lang: miscState.language, text: 'Upgrade City'}) 
                : translateUI({lang: miscState.language, text: 'Buy City'}), 
            !isCityNotMine 
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
                {type: 'city', price: +buyCityPrice, debuff: buffDebuff}, findPlayer, miscState, gameState
            ) as [string, number];
            // set tax price
            const taxPrice = specialCard?.match('anti tax') ? 0 
                            : -buyCityPrice + (buffDebuffEffect || 0) + (specialEffect || 0)
            // set event data (for history)
            const eventData: EventDataType = {
                event: 'pay_tax', 
                owner: buyCityOwner, 
                visitor: playerTurnData.display_name,
                money: taxPrice,
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
export async function sellCity(ev: FormEvent<HTMLFormElement>, currentCity: string, miscState: IMiscContext, gameState: IGameContext) {
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
    const sellCityWarning = translateUI({lang: miscState.language, text: 'Do you really wanna sell ccc city?'})
                            .replace('ccc', inputValues.sell_city_name)
    if(!confirm(sellCityWarning)) return false
    // loading button
    const tempButtonText = sellButton.textContent
    sellButton.textContent = 'Loading'
    sellButton.disabled = true
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
            // submit button normal
            sellButton.textContent = tempButtonText
            sellButton.removeAttribute('disabled')
            return
        default: 
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

// ========== > UPDATE CITY ==========
// ========== > UPDATE CITY ==========
function updateCityList(data: UpdateCityListType) {
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
function specialUpgradeCity(playerTurnData: IGameContext['gamePlayerInfo'][0], rng: number) {
    // get all owned city, except special & fully upgrade city
    const myCityList = playerTurnData.city.split(';').filter(v => !v.match(/2house1hotel|special/))
    // get city name
    const upgradeRNG = rng % myCityList.length
    const upgradeCityName = myCityList[upgradeRNG].split('*')[0]
    // get city element & tile info
    const upgradeCityElement = qS(`[data-city-info^='${upgradeCityName}']`) as HTMLElement
    const upgradeCityTileInfo = upgradeCityElement.dataset.tileInfo
    // return data
    return [upgradeCityTileInfo, upgradeCityElement] as [string, HTMLElement]
}

export function handleUpgradeCity(miscState: IMiscContext, gameState: IGameContext) {
    const upgradeCityWarning = translateUI({lang: miscState.language, text: 'Only use if you have any city! (not special city) Otherwise, the card will be used and do nothing.\nProceed to upgrade city?'})
    if(!confirm(upgradeCityWarning)) return
    // roll dice button
    const rollDiceButton = qS('#roll_dice_button') as HTMLInputElement
    // sound effect
    const soundSpecialCard = qS('#sound_special_card') as HTMLAudioElement
    // loading button
    const tempRollDiceText = rollDiceButton.textContent
    rollDiceButton.textContent = 'Loading'
    // set history
    localStorage.setItem('specialCardUsed', `special_card: upgrade city 💳`)
    soundSpecialCard.play()
    rollDiceGameRoom([] as any, tempRollDiceText, miscState, gameState, `used-upgrade city`)
}

// ========== # CARD EVENT ==========
// ========== # CARD EVENT ==========
function stopByCards(card: 'chance'|'community', findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
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
                // ### BELUM ADA CARD BORDER RANK
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

function cardEffects(cardData: Record<'tileName'|'rank'|'effectData', string>, findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
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
                const isPercent = effect.match('%') ? +effect / 100 : +effect
                localStorage.setItem('moreMoney', `${isPercent}`)
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
                if(playerTurnData.display_name == gameState.myPlayerInfo.display_name)
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

// ========== # PRISON EVENT ==========
// ========== # PRISON EVENT ==========
function stopByPrison(findPlayer: number, miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        // check for anti prison special card
        const [specialCard, specialEffect] = await useSpecialCard({type: 'prison'}, findPlayer, miscState, gameState)
        // return event data
        return resolve({
            event: 'get_arrested',
            accumulate: specialEffect ? -1 : 0,
            money: 0,
            card: specialCard,
        })
    })
}

// ========== # PARKING EVENT ==========
// ========== # PARKING EVENT ==========
function stopByParking(findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
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

// ========== # CURSED CITY EVENT ==========
// ========== # CURSED CITY EVENT ==========
function stopByCursedCity(findPlayer: number, tileElement: HTMLElement, miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        const getCityInfo = tileElement.dataset.cityInfo.split(',')
        const [cityName, cityProperty, cityPrice, cityOwner] = getCityInfo as string[];
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        const notifTimer = qS('#result_notif_timer')
        // check special card
        const [specialCard, specialEffect] = await useSpecialCard(
            {type: 'cursed', price: +cityPrice}, findPlayer, miscState, gameState
        ) as [string, number]
        // notif message
        notifTitle.textContent = translateUI({lang: miscState.language, text: 'Cursed City'})
        notifMessage.textContent = translateUI({lang: miscState.language, text: 'The city curse you for xxx'})
                                .replace('xxx', moneyFormat(+cityPrice))
        notifTimer.textContent = specialCard ? `"${specialCard}"` : ''
        // show notif 
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        // get all players 
        const otherPlayerNames = gameState.gamePlayerInfo.map(v => v.display_name).join(',')
        // return event data
        resolve({
            event: 'cursed',
            money: specialEffect || -cityPrice,
            takeMoney: specialEffect ? `${specialEffect};${otherPlayerNames}` : null
        })
    })
}

// ========== # SPECIAL CARD EVENT ==========
// ========== # SPECIAL CARD EVENT ==========
function useSpecialCard(data: SpecialCardEventType, findPlayer: number, miscState: IMiscContext, gameState: IGameContext) {
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
                const newMoney = price * .30
                return resolve([specialCard[0], newMoney])
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

// ========== > UPDATE SPECIAL CARD ==========
// ========== > UPDATE SPECIAL CARD ==========
function updateSpecialCardList(cardData: string[], currentSpecialCard: string) {
    const tempSpecialCardArray = currentSpecialCard?.split(';') || []
    for(let cd of cardData) {
        // card null
        if(!cd) continue
        // card exist
        const [action, specialCard] = cd.split('-')
        if(action == 'add') {
            // check if player already have the card
            const isSpecialCardOwned = tempSpecialCardArray.indexOf(specialCard)
            // dont have yet, then add
            if(isSpecialCardOwned === -1) tempSpecialCardArray.push(specialCard)
        }
        else if(action == 'used') {
            // remove the card
            const findSpecialCard = tempSpecialCardArray.indexOf(specialCard)
            tempSpecialCardArray.splice(findSpecialCard, 1)
        }
    }
    return tempSpecialCardArray.length === 0 ? null : tempSpecialCardArray.join(';')
}

// ========== # BUFF/DEBUFF EVENT ==========
// ========== # BUFF/DEBUFF EVENT ==========
function stopByBuffDebuff(area: 'buff'|'debuff', findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
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
function buffDebuffEffects(bdData: Record<'tileName'|'effectData', string>, findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
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
function updateBuffDebuffList(bdData: string[], currentBuffDebuff: string) {
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
function useBuffDebuff(data: BuffDebuffEventType, findPlayer: number, miscState: IMiscContext, gameState: IGameContext): [string, string|number] {
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
            const debuff = splitBuff.map(v => v.match(/reduce price/i)).flat().filter(i=>i)
            if(debuff[0]) {
                setBuffDebuffHistory('get_buff', effect)
                const newPrice = data.price * .3
                return [`used-${debuff[0]}`, newPrice]
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
                const newPrice = -(data.price * .3)
                return [`used-${debuff[0]}`, newPrice]
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