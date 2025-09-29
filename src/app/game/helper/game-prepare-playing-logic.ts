import { fetcher, fetcherOptions, moneyFormat, qS, qSA, setInputValue, translateUI } from "../../../helper/helper"
import { EventDataType, IGameContext, IGamePlay, IMiscContext, IResponse, IRollDiceData } from "../../../helper/types"
import { stopByCity } from "./game-tile-event-city-logic"
import { stopByCards } from "./game-tile-event-card-logic"
import { stopByPrison } from "./game-tile-event-prison-logic"
import { stopByParking } from "./game-tile-event-parking-logic"
import { stopByCursedCity } from "./game-tile-event-cursed-logic"
import { updateSpecialCardList, useSpecialCard } from "./game-tile-event-special-card-logic"
import { useBuffDebuff, stopByBuffDebuff, updateBuffDebuffList } from "./game-tile-event-buff-debuff-logic"
import { playGameSounds } from "./game-tile-event-sounds"
import { stopByMinigame } from "./game-tile-event-minigame"

/*
    TABLE OF CONTENTS
    - GAME PREPARE
        # GET PLAYER INFO
        # READY GAME
        # START GAME
        # ROLL TURN
    - GAME PLAYING
        # MISSING DATA
        # ROLL DICE
        # LEAVE GAME
        # SURRENDER GAME
        # PLAYER MOVING
        # EVENT HISTORY
        # CHECK GAME PROGRESS
        # GAME OVER
*/

// ========== - GAME PREPARE ==========
// ========== - GAME PREPARE ==========

// ========== # GET PLAYER INFO ==========
// ========== # GET PLAYER INFO ==========
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
            const { getPlayers, gameStage, decidePlayers, preparePlayers, quakeCity, gameHistory, playerTurns } = getPlayerResponse.data[0]
            // set game stage
            gameState.setGameStages(gameStage)
            // set player list
            gameState.setGamePlayerInfo(getPlayers)
            // set game quake city
            gameState.setGameQuakeCity(quakeCity)
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
            // set prepare players (ready players)
            else if(preparePlayers) {
                playerTurnNotif ? playerTurnNotif.textContent = `${preparePlayers.length} player(s) ready` : null
                // if > 2 players ready, set start notif
                if(preparePlayers.length >= 2) gameStartNotif()

                const isReadyClicked = preparePlayers.indexOf(gameState.myPlayerInfo?.display_name)
                // change to start button (for creator)
                // creator has clicked ready
                const findRoom = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
                const roomCreator = gameState.gameRoomInfo[findRoom].creator
                if(readyButton && isReadyClicked !== -1 && roomCreator == gameState.myPlayerInfo.display_name) {
                    readyButton.id = 'start_button'
                    readyButton.textContent = translateUI({lang: miscState.language, text: 'start'})
                    return
                }
                // disable button if ready is clicked (for other)
                if(readyButton && isReadyClicked !== -1) {
                    readyButton.disabled = true
                    readyButton.className = 'min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0'
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

// ========== # READY GAME ==========
// ========== # READY GAME ==========
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
    // player must be join the room to click ready
    const isPlayerJoined = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(gameState.myPlayerInfo.display_name)
    if(isPlayerJoined === -1) {
        // show notif
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        // error message
        notifTitle.textContent = `error 403`
        notifMessage.textContent = `who are you?`
        return
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
            const findRoom = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
            const roomCreator = gameState.gameRoomInfo[findRoom].creator
            if(roomCreator === gameState.myPlayerInfo.display_name) {
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

// ========== - GAME PLAYING ==========
// ========== - GAME PLAYING ==========

// ========== # MISSING DATA ==========
// ========== # MISSING DATA ==========
export async function missingDataGameRoom(miscState: IMiscContext, gameState: IGameContext) {
    // missing data elements
    const playerSideButton = qS('#player_side_button')
    const playerSettingButton = qS('#player_setting_button')
    const missingDataOption = qS('#missing_data_option')
    const warningClass = [`after:content-['!']`, `after:bg-red-600`, `after:p-1`, `after:rounded-full`]
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // submit button
    const missingButton = qS('#missing_card') as HTMLInputElement
    // payload data
    const inputValues = {
        action: 'game missing data',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
    }
    // warning
    alert('[warning]: you can only retrieve missing data 3x per game')
    // disable and loading button
    miscState.setDisableButtons('gameroom')
    missingButton.disabled = true
    let missingIncrement = 3
    const missingInterval = setInterval(() => {
        if(missingIncrement === 3) {
            missingButton.textContent = `${translateUI({lang: miscState.language, text: 'Missing Data'})} .`
            missingIncrement = 0
        }
        else if(missingIncrement < 3) {
            missingButton.textContent += '.'
            missingIncrement++
        }
    }, 1000);
    
    // fetching
    const missingCardFetchOption = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const missingCardResponse: IResponse = await (await fetcher('/game', missingCardFetchOption)).json()
    // response
    switch(missingCardResponse.status) {
        case 200:
            // stop interval
            clearInterval(missingInterval)
            missingButton.textContent = translateUI({lang: miscState.language, text: 'Missing Data'})
            // enable gameroom buttons
            missingButton.disabled = false
            miscState.setDisableButtons(null)
            // remove warning icon on player tab and missing data option
            playerSideButton.classList.remove(...warningClass)
            playerSettingButton.classList.remove(...warningClass)
            missingDataOption.classList.remove(...warningClass)
            return
        default:
            // stop interval
            clearInterval(missingInterval)
            missingButton.textContent = translateUI({lang: miscState.language, text: 'Missing Data'})
            // enable gameroom buttons
            missingButton.disabled = false
            miscState.setDisableButtons(null)
            // remove warning icon on player tab and missing data option
            playerSideButton.classList.remove(...warningClass)
            playerSettingButton.classList.remove(...warningClass)
            missingDataOption.classList.remove(...warningClass)
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${missingCardResponse.status}`
            notifMessage.textContent = `${missingCardResponse.message}`
            return
    }
}

// ========== # ROLL DICE ==========
// ========== # ROLL DICE ==========
export async function rollDiceGameRoom(formInputs: HTMLFormControlsCollection, tempButtonText: string, miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // roll dice button
    const rollDiceButton = qS('#roll_dice_button') as HTMLInputElement

    // set rng for twoway board
    const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(gameState.myPlayerInfo.display_name)
    const currentPos = gameState.gamePlayerInfo[findPlayer].pos
    const branchRNG: number[] = checkBranchTiles('roll_dice', currentPos)
    const playerGameData = {
        display_name: gameState.gamePlayerInfo[findPlayer].display_name,
        city: gameState.gamePlayerInfo[findPlayer].city,
        card: gameState.gamePlayerInfo[findPlayer].card,
        buff: gameState.gamePlayerInfo[findPlayer].buff,
        debuff: gameState.gamePlayerInfo[findPlayer].debuff,
    }
    // input values container
    const inputValues = {
        action: 'game roll dice',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
        rolled_dice: null,
        // Math.floor(Math.random() * 101).toString()
        rng: [
            Math.floor(Math.random() * 101), 
            branchRNG[0]
        ].toString(),
        game_data: JSON.stringify(playerGameData),
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

// ========== # LEAVE GAME ==========
// ========== # LEAVE GAME ==========
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

// ========== # SURRENDER GAME ==========
// ========== # SURRENDER GAME ==========
export async function surrenderGameRoom(miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    const playerTurnNotif = qS('#player_turn_notif')
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
    surrenderButton.classList.add('saturate-0')
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
            // return button text and show notif
            surrenderButton.textContent = tempButtonText
            playerTurnNotif.textContent = 'you can back to roomlist now'
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
export function playerMoving(rollDiceData: IRollDiceData, miscState: IMiscContext, gameState: IGameContext) {
    const {playerTurn, playerDice, playerRNG} = rollDiceData
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    const notifTimer = qS('#result_notif_timer')
    const playerTurnNotif = qS('#player_turn_notif')
    // get player path
    const playerPaths = qSA(`[data-player-path]`) as NodeListOf<HTMLElement>
    // get players
    const playerNames = qSA(`[data-player-name]`) as NodeListOf<HTMLElement>
    // footstep stuff
    const footstepSpeed = 400
    const [soundFootstep1, soundFootstep2] = [qS('#sound_footstep_1'), qS('#sound_footstep_2')] as HTMLAudioElement[]
    // match player name
    playerNames.forEach(player => {
        if(player.dataset.playerName != playerTurn) return
        // reset notif timer
        notifTimer.textContent = ''
        // find current room info
        const findRoom = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
        const boardType = gameState.gameRoomInfo[findRoom].board
        const loseCondition = gameState.gameRoomInfo[findRoom].money_lose
        // find current player
        const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(playerTurn)
        const playerTurnData = gameState.gamePlayerInfo[findPlayer]
        // get tile element for stop by event
        let [tileInfo, tileElement]: [string, HTMLElement] = [null, null]

        // moving params
        let numberStep = 0
        let [numberLaps, throughStart, numberMinigame] = [playerTurnData.lap, 0, 0]
        const currentPos = +playerTurnData.pos.split('x')[0]
        // check next pos (only for board twoway)
        const tempDestinatedPos = (currentPos + playerDice) === 24 || (currentPos + playerDice) === 0 
                                ? 24 
                                : (currentPos + playerDice) % 24
        const checkDestinatedPos = checkBranchTiles('moving', tempDestinatedPos.toString())
        const checkNextPos = boardType == 'twoway' && +playerRNG[1] > 50
        // set destinated pos
        const destinatedPos = (currentPos + playerDice) === 24 || (currentPos + playerDice) === 0
                        ? `24${checkNextPos && checkDestinatedPos.length > 0 ? 'x' : ''}`
                        : `${(currentPos + playerDice) % 24}${checkNextPos && checkDestinatedPos.length > 0 ? 'x' : ''}`

        // get prison data for checking prison status
        const prisonNumber = playerTurnData.prison
        // special card container
        const specialCardCollection = {cards: [], effects: []}
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
        }, footstepSpeed);

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
                const fixedNextStep = tempStep === 24 || tempStep === 0 ? 24 : (tempStep % 24)
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
                        // +1 minigame every 3 laps
                        if(numberLaps % 3 === 0) numberMinigame = 1
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
                            .then(eventData => {
                                eventData && (eventData as any).type?.match(/(?<!.*,)^[move]+(?!.*,)/) ? null : resolve(eventData)
                            })
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
                        case 'start': 
                            stopByMinigame(playerTurnData, miscState, gameState)
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
            // close notif after 2 secs
            setTimeout(() => {
                gameState.setShowGameNotif(display => {
                    const newDisplay = display == 'card' || display =='normal' ? display : null
                    // if display = card | normal, then set animation true 
                    // to prevent no animation when closing notif
                    newDisplay ? miscState.setAnimation(true) : miscState.setAnimation(false)
                    return newDisplay
                })
                // hide mini game + reset answer list
                gameState.setShowMiniGame(false)
                gameState.setMinigameAnswerList([])
            }, 3000);
            // prevent other player from doing event
            if(playerTurn != gameState.myPlayerInfo.display_name) return
            // check sub player dice (removed after turn end)
            // rolled dice number saved here to prevent overwriting by move event from chance/community
            const subPlayerDice = localStorage.getItem('subPlayerDice')

            // get tax data
            const taxData = eventData?.event == 'pay_tax' 
                            ? {
                                owner: eventData.owner, 
                                visitor: eventData.visitor,
                                money: eventData.taxMoney,
                            } 
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
            // [0] = buff/debuff name, [1] = buff/debuff effect
            const reduceMoneyDebuff = eventMoney > 0 ? useBuffDebuff(
                {type: 'debuff', effect: 'reduce money', money: eventMoney},
                findPlayer, miscState, gameState
            ) as [string, number] : [null, null] as [string, number];
            // sum event money
            const sumEventMoney = eventMoney - (reduceMoneyDebuff[1] || 0)

            // add debuff reduce money & set notif message
            debuffCollection.push(reduceMoneyDebuff[0])
            notifMessage.textContent += reduceMoneyDebuff[0] ? `\n${translateUI({lang: miscState.language, text: '"debuff reduce money"'})}` : ''
            // get buff/debuff event data
            if((eventData as any)?.buff) buffCollection.push((eventData as any)?.buff)
            if((eventData as any)?.debuff) debuffCollection.push((eventData as any)?.debuff)

            // get prison accumulate number
            const isPrisonAccumulatePass = checkPrisonStatus({
                playerTurnData, 
                eventData, 
                playerDice, 
                diceAmount: gameState.gameRoomInfo[findRoom].dice
            })
            
            // check if player is losing
            const playerTurnEndMoney = (playerTurnData.money + (eventMoney - (reduceMoneyDebuff[1] || 0)))
            const playerTurnEndLose = playerTurnEndMoney < loseCondition
            // the void buff
            const playerVoidMoney = playerTurnEndLose 
                ? useBuffDebuff(
                    {type: 'buff', effect: 'the void', money: playerTurnData.money + sumEventMoney},
                    findPlayer, miscState, gameState
                ) as [string, number] 
                : [null, null] as [string, number];
            // add buff the void & set notif message
            buffCollection.push(playerVoidMoney[0])
            notifMessage.textContent += playerVoidMoney[0] ? `\n${translateUI({lang: miscState.language, text: '"buff the void"'})}` : ''
            // update buff/debuff list
            const buffLeft = updateBuffDebuffList(buffCollection, playerTurnData.buff)
            const debuffLeft = updateBuffDebuffList(debuffCollection, playerTurnData.debuff)
            // mini game data
            const tempMinigameChance: number = (eventData as any)?.mini_chance
            const minigameChance = typeof tempMinigameChance == 'number' 
                                // after play minigame + get minigame chance (lap multiple of 3)
                                ? tempMinigameChance + numberMinigame 
                                // check if player still have chance left
                                // else, default 0/1
                                : (playerTurnData.minigame || numberMinigame)
            const minigameData = (eventData as any)?.mini_data || []

            // input values container
            const inputValues: IGamePlay['turn_end'] & {action: string} = {
                action: 'game turn end',
                channel: `monopoli-gameroom-${gameState.gameRoomId}`,
                display_name: playerTurnData.display_name,
                // arrested (0) || debuff = stay current pos
                pos: prisonNumber !== -1 || debuffCollection.join(',').match('used-skip turn') 
                    ? currentPos.toString() 
                    : destinatedPos,
                lap: numberLaps.toString(),
                // money from event that occured
                event_money: (playerVoidMoney[1] || sumEventMoney).toString(),
                // history = rolled_dice: num;buy_city: str;pay_tax: str;sell_city: str;get_card: str;use_card: str
                // Math.abs to prevent move backward event cuz dice number gonna be minus
                history: setEventHistory(`rolled_dice: ${subPlayerDice || Math.abs(playerDice)}`, eventData),
                // nullable data: city, card, taxes, take money, buff, debuff
                city: playerTurnEndLose ? null : (eventData as any)?.city || playerTurnData.city,
                tax_owner: taxData?.owner || null,
                tax_visitor: taxData?.visitor || null,
                tax_money: taxData?.money.toString() || '0',
                card: specialCardLeft,
                buff: buffLeft,
                debuff: debuffLeft,
                // player losing status
                is_lose: playerTurnEndLose,
                // taking money from players
                take_money: (eventData as any)?.takeMoney || null,
                // prison accumulate
                prison: isPrisonAccumulatePass.toString(),
                // minigame
                minigame_chance: minigameChance.toString(),
                minigame_data: minigameData,
            }
            // remove sub data (event history)
            localStorage.removeItem('subPlayerDice')
            localStorage.removeItem('subEventData')
            localStorage.removeItem('parkingEventData')
            localStorage.removeItem('specialCardUsed')
            localStorage.removeItem('buffDebuffUsed')
            localStorage.removeItem('moreMoney')
            // set last turn money
            localStorage.setItem('lastTurnMoney', playerTurnData.money.toString())
            // fetch
            const playerTurnEndFetchOptions = fetcherOptions({method: 'PUT', credentials: true, body: JSON.stringify(inputValues)})
            const playerTurnEndResponse: IResponse = await (await fetcher('/game', playerTurnEndFetchOptions)).json()
            // response
            switch(playerTurnEndResponse.status) {
                case 200: 
                    // save access token
                    if(playerTurnEndResponse.data[0].token) {
                        localStorage.setItem('accessToken', playerTurnEndResponse.data[0].token)
                    }
                    // update player turns
                    localStorage.setItem('playerTurns', JSON.stringify(playerTurnEndResponse.data[0].playerTurns))
                    // reset disable buttons
                    miscState.setDisableButtons(null)
                    // set temp player info (if losing)
                    if(inputValues.is_lose) {
                        const newPlayerInfo = gameState.myPlayerInfo
                        newPlayerInfo.game_played += 1
                        newPlayerInfo.worst_money_lost = playerTurnEndMoney < newPlayerInfo.worst_money_lost
                                                        ? playerTurnEndMoney 
                                                        : newPlayerInfo.worst_money_lost
                        // save to local storage
                        localStorage.setItem('playerData', JSON.stringify(newPlayerInfo))
                    }
                    // save missing data to localStorage (only for checking)
                    setTimeout(() => {
                        // save if exist, remove if null
                        playerTurnEndResponse.data[0]?.missingData
                            ? localStorage.setItem('missingData', JSON.stringify(playerTurnEndResponse.data[0].missingData))
                            : localStorage.removeItem('missingData')
                    }, 3000);
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

interface IPrisonData {
    playerTurnData: IGameContext['gamePlayerInfo'][0], 
    eventData: EventDataType, 
    playerDice: number, 
    diceAmount: number,
}
function checkPrisonStatus(data: IPrisonData) {
    const {playerTurnData, eventData, playerDice, diceAmount} = data
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
    // const prisonAccumulateLimit = gameState.gameRoomInfo[findRoom].dice * 6
    const prisonAccumulateLimit = diceAmount * 6
    const isPrisonAccumulatePass = prisonAccumulate > prisonAccumulateLimit ? -1 : prisonAccumulate
    return isPrisonAccumulatePass
}

// ========== # CHECK BRANCH TILES ==========
// ========== # CHECK BRANCH TILES ==========
function checkBranchTiles(action: 'roll_dice'|'moving', pos: string) {
    const tempArray = []
    switch(pos) {
        // if action = roll dice, set the RNG so it continue move on right tiles
        // action = moving only run on non-x tiles case
        case '12': case '13': case '14': case '24': case '1': case '2': 
            action == 'roll_dice' ? tempArray.push(50) : tempArray.push('x')
            break
        // this x tiles only run on action = roll dice
        case '12x': case '13x': case '14x': case '24x': case '1x': case '2x': 
            action == 'roll_dice' ? tempArray.push(51) : null
            break
        // normal tiles number
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
            // buying city
            if(eventData.status) historyArray.push(`${eventData.event}: ${eventData.name} (${eventData.property})`)
            // not buy || property max
            else historyArray.push(`${eventData.event}: none`)
            return historyArray.join(';')
        case 'pay_tax': 
            historyArray.push(`${eventData.event}: ${moneyFormat(eventData.taxMoney)} to ${eventData.owner}`)
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
        case 'mini_game':
            historyArray.push(`${eventData.event}: Scattergories with oomfs 🥳`)
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
    // get alive players
    const alivePlayers = []
    for(let pd of playersData) {
        // check players money amount
        if(pd.money > loseCondition) 
            alivePlayers.push(pd.display_name)
    }
    if(gameMode.match(/survive/i)) {
        // if only 1 left, game over
        if(alivePlayers.length === 1) {
            // play sound
            playGameSounds('game_over', miscState)
            // set game stage
            gameState.setGameStages('over')
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
            if(pd.lap >= lapsLimit || alivePlayers.length === 1) {
                // play sound
                playGameSounds('game_over', miscState)
                // set game stage
                gameState.setGameStages('over')
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