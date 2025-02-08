import { FormEvent } from "react"
import { catchError, fetcher, fetcherOptions, moneyFormat, qS, qSA, setInputValue, shuffle, translateUI } from "../../../helper/helper"
import { EventDataType, IGameContext, IGamePlay, IMiscContext, IResponse, IRollDiceData, SpecialCardEventType, UpdateCityListType, UpdateSpecialCardListType } from "../../../helper/types"
import chance_cards_list from "../config/chance-cards.json"
import community_cards_list from "../config/community-cards.json"

/*
    TABLE OF CONTENTS
    - GAME PREPARE
    - GAME PLAYING
    - GAME TILE EVENT
        # NORMAL CITY EVENT
        # SPECIAL CITY EVENT
            > SELL CITY
            > UPDATE CITY
        # CARD EVENT
        # PRISON EVENT
        # PARKING EVENT
        # CURSED CITY EVENT
        # SPECIAL CARD EVENT
            > UPDATE SPECIAL CARD
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
            const { getPlayers, gameStage, decidePlayers, preparePlayers, gameHistory, cityOwnedList } = getPlayerResponse.data[0]
            // set city owned list
            localStorage.setItem('cityOwnedList', JSON.stringify(cityOwnedList))
            // set game stage
            gameState.setGameStages(gameStage)
            // set player list
            gameState.setGamePlayerInfo(getPlayers)
            // set game history
            gameState.setGameHistory(gameHistory)
            // set decide players
            if(decidePlayers) {
                // change game stage
                const isGameStage = decidePlayers.length === preparePlayers.length
                if(isGameStage) gameState.setGameStages('play')
                else gameState.setGameStages('decide')
                // set fixed players
                gameState.setGameFixedPlayers(preparePlayers.length)
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

export async function rollDiceGameRoom(formInputs: HTMLFormControlsCollection, tempButtonText: string, miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // roll dice button
    const rollDiceButton = qS('#roll_dice_button') as HTMLInputElement
    // input values container
    const inputValues = {
        action: 'game roll dice',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
        rolled_dice: null,
        // Math.floor(Math.random() * 101).toString()
        rng: [
            Math.floor(Math.random() * 101), 
            Math.floor(Math.random() * 101)
        ].toString() 
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
            notifTitle.textContent = `error ${rollDiceResponse.status}`
            notifMessage.textContent = `${rollDiceResponse.message}`
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
            notifTitle.textContent = `Game Over`
            notifMessage.textContent = `${alivePlayers[0]} has won the game!\nback to room list in 15 seconds`
            setTimeout(() => {
                // set notif to null
                gameState.setShowGameNotif(null)
                const gotoRoom = qS('#gotoRoom') as HTMLAnchorElement
                gotoRoom ? gotoRoom.click() : null
            }, 15_000)
            // run game over
            return gameOver(alivePlayers[0], miscState, gameState)
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
                notifTitle.textContent = `Game Over`
                notifMessage.textContent = `${highestMoneyPlayer[0].split(',')[1]} has won the game!\nback to room list in 15 seconds`
                setTimeout(() => {
                    // set notif to null
                    gameState.setShowGameNotif(null)
                    const gotoRoom = qS('#gotoRoom') as HTMLAnchorElement
                    gotoRoom ? gotoRoom.click() : null
                }, 15_000)
                return gameOver(highestMoneyPlayer[0].split(',')[1], miscState, gameState)
            }
        }
    }
}

/**
 * @param playerDice dice result number
 */
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
    // footstep sounds
    const [soundFootstep1, soundFootstep2] = [qS('#sound_footstep_1'), qS('#sound_footstep_2')] as HTMLAudioElement[]
    // match player name
    playerNames.forEach(player => {
        if(player.dataset.playerName != playerTurn) return
        // reset notif timer
        notifTimer.textContent = ''
        // find current room info
        const findRoomInfo = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
        // find current player
        const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(playerTurn)
        const playerTurnData = gameState.gamePlayerInfo[findPlayer]
        // get tile element for stop by event
        let [tileInfo, tileElement]: [string, HTMLElement] = [null, null]
        // moving params
        let numberStep = 0
        let [numberLaps, throughStart] = [playerTurnData.lap, 0]
        const currentPos = playerTurnData.pos
        const nextPos = (currentPos + playerDice) === playerPaths.length 
                        ? playerPaths.length 
                        : (currentPos + playerDice) % playerPaths.length
        const prisonNumber = playerTurnData.prison
        // special card container
        const specialCardCollection = {cards: [], effects: []}
        // move function
        const stepInterval = setInterval(() => {
            // check if player is arrested / get debuff (skip turn)
            if(prisonNumber !== -1) {
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
                const fixedNextStep = tempStep === playerPaths.length ? playerPaths.length : (tempStep % playerPaths.length)
                // match paths & move
                if(+path.dataset.playerPath === fixedNextStep) {
                    [tileInfo, tileElement] = [path.dataset.tileInfo, path]
                    // update player pos
                    gameState.setGamePlayerInfo(players => {
                        const newPosInfo = [...players]
                        newPosInfo[findPlayer].pos = fixedNextStep
                        return newPosInfo
                    })
                    // update laps for moving player
                    if(fixedNextStep === 1) {
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
                // ### EVENT LIST COMPLETE: city, tax, chance card
                // ### EVENT LIST NOT COMPLETE: special, curse, community card, prison, free park, buff, debuff
                switch(tileInfo) {
                    case 'city': 
                    case 'special':
                        stopByCity(tileInfo, findPlayer, tileElement, miscState, gameState)
                        .then(eventData => resolve(eventData))
                        .catch(err => console.log(err))
                        break
                    case 'chance': 
                        stopByCards('chance', findPlayer, playerRNG, miscState, gameState)
                        // only match type "move" if the card is a single effect
                        .then(eventData => (eventData as any).type?.match(/(?<!.*,)^[move]+(?!.*,)/) ? null : resolve(eventData))
                        .catch(err => console.log(err))
                        break
                    case 'community': 
                        stopByCards('community', findPlayer, playerRNG, miscState, gameState)
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
                        stopByCursedCity(tileElement, miscState, gameState)
                        .then(eventData => resolve(eventData))
                        .catch(err => console.log(err))
                        break
                    default: 
                        resolve(null)
                        break
                }
            })
        }

        async function turnEnd(eventData: EventDataType) {
            playerTurnNotif.textContent = `${playerTurn} turn ending..`
            // prevent other player from doing event
            if(playerTurn != gameState.myPlayerInfo.display_name) return
            // check sub player dice
            const subPlayerDice = localStorage.getItem('subPlayerDice')
            // get tax data
            const taxData = eventData?.event == 'pay_tax' 
                            ? {owner: eventData.owner, visitor: eventData.visitor} 
                            : null
            const specialCardMoney = specialCardCollection.effects.filter(v => typeof v == 'number')
                                    .reduce((accumulate, current) => accumulate + current, 0)
            const eventMoney = throughStart 
                            ? Math.round(eventData.money + specialCardMoney + throughStart) 
                            : Math.round(eventData.money + specialCardMoney)
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
            // update special card list
            const isSpecialCardUsed = updateSpecialCardList(specialCardCollection.cards, playerTurnData.card)
            // input values container
            const inputValues: IGamePlay['turn_end'] | {action: string} = {
                action: 'game turn end',
                channel: `monopoli-gameroom-${gameState.gameRoomId}`,
                display_name: playerTurnData.display_name,
                // arrested (0) = stay current pos
                pos: prisonNumber === -1 ? nextPos.toString() : currentPos.toString(),
                lap: numberLaps.toString(),
                // money from event that occured
                event_money: eventMoney.toString(),
                // history = rolled_dice: num;buy_city: str;pay_tax: str;sell_city: str;get_card: str;use_card: str
                history: setEventHistory(`rolled_dice: ${subPlayerDice || playerDice}`, eventData),
                // nullable data: city, card, taxes, take money
                city: (eventData as any)?.city || playerTurnData.city,
                tax_owner: taxData?.owner || null,
                tax_visitor: taxData?.visitor || null,
                card: (eventData as any)?.card || playerTurnData.card,
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

function setEventHistory(rolled_dice: string, eventData: EventDataType) {
    // check sub event
    const subEventData = localStorage.getItem('subEventData')
    // check parking event
    const parkingEventData = localStorage.getItem('parkingEventData')
    // check special card used
    const specialCardUsed = localStorage.getItem('specialCardUsed')
    // history container
    const historyArray = [rolled_dice, specialCardUsed, parkingEventData, subEventData].filter(i=>i)
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
            historyArray.push(`${eventData.event}: ${eventData.type} (${eventData.tileName})`)
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
        default: 
            return historyArray.join(';')
    }
}

export async function gameOver(winPlayer: string, miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // get room name
    const findRoom = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
    // data for update all player stats
    const allPlayerStats = []
    for(let player of gameState.gamePlayerInfo) {
        // win player set to -999_999 to prevent updating worst money lose
        if(player.display_name == winPlayer)
            allPlayerStats.push(`${player.display_name},${-999999}`)
        // lose player will update worst money lose
        else 
            allPlayerStats.push(`${player.display_name},${player.money}`)
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
    
        // if you own the city and its special & bought, get money
        if(tileInfo == 'special' && buyCityProperty == '1house') {
            // notif message
            notifTitle.textContent = 'Special City'
            notifMessage.textContent = `You get ${moneyFormat(+buyCityPrice)} when visiting your grandma`
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
        // set event text for notif
        let [eventTitle, eventContent] = [
            !isCityNotMine ? 'Upgrade City' : 'Buy City', 
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
                                .replace('xxx', moneyFormat(+buyCityPrice)) // price
        // show notif (must be on top the buttons to prevent undefined)
        miscState.setAnimation(true)
        gameState.setShowGameNotif(`with_button-2` as any)
        // set timer
        let buyCityTimer = 6
        const buyCityInterval = setInterval(() => {
            notifTimer.textContent = `${buyCityTimer}`
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
                // hide notif
                miscState.setAnimation(false)
                gameState.setShowGameNotif(null)
                nopeButton ? nopeButton.click() : null
                return
            }
            // prevent other player from doing event
            if(nopeButton && playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
                // show buttons
                ofcourseButton.classList.remove('hidden')
                // modify button 
                ofcourseButton.textContent = 'Of course'
                ofcourseButton.classList.add('text-green-300')
                // click event
                ofcourseButton.onclick = () => {
                    clearInterval(buyCityInterval)
                    notifTimer.textContent = ''
                    // hide buttons
                    ofcourseButton.classList.add('hidden')
                    nopeButton.classList.add('hidden')
                    // is money enough
                    const isMoneyEnough = playerTurnData.money > +buyCityPrice
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
                        money: -buyCityPrice
                    }
                    // return event data
                    return resolve(eventData)
                }
                // show buttons
                nopeButton.classList.remove('hidden')
                // modify button 
                nopeButton.textContent = 'Nope'
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
            // check if special card exist
            const [specialCard, specialEffect] = await useSpecialCard(
                {type: 'city', price: +buyCityPrice}, findPlayer, miscState, gameState
            ) as [string, number];
            // set event data (for history)
            const eventData: EventDataType = {
                event: 'pay_tax', 
                owner: buyCityOwner, 
                visitor: playerTurnData.display_name,
                money: -specialEffect || -buyCityPrice,
                card: specialCard
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
            // check property
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
        // loop cards
        for(let cards of cardsList) {
            const [minRange, maxRange] = cards.chance
            // match rng
            if(+rng[0] >= minRange && +rng[0] <= maxRange) {
                const cardRNG = +rng[0] % cards.data.length
                // notif content
                // ### BELUM ADA CARD BORDER RANK
                notifTitle.textContent = translateUI({lang: miscState.language, text: 'Chance Card'})
                notifMessage.textContent = translateUI({lang: miscState.language, text: cards.data[cardRNG].description as any})
                notifImage.src = cards.data[cardRNG].img
                // run card effect
                const cardData = {
                    tileName: card,
                    rank: cards.category,
                    effectData: cards.data[cardRNG].effect
                }
                return resolve(await cardEffects(cardData, findPlayer, rng, miscState, gameState))
            }
        }
    })
}

function cardEffects(cardData: Record<'tileName'|'rank'|'effectData', string>, findPlayer: number, rng: string[], miscState: IMiscContext, gameState: IGameContext) {
    // notif timer
    const notifTimer = qS('#result_notif_timer')
    // ### rank will be used for rarity border
    const {tileName, rank, effectData} = cardData
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
            // player choose the optional effect
            if(getPrefix[0] == 'button') {
                // get optional effect
                const getOptionalEffect = getPrefix[1].split('|')
                const optionalTypes = getOptionalEffect.map(v => v.split('_')[0])
                const optionalEffects = getOptionalEffect.map(v => v.split('_')[1])
                // run effect
                const eventData = await executeOptionalCard(6, optionalTypes, optionalEffects)
                resolve(eventData)
            }
            // system choose the optional effect
            else if(getPrefix[0] == 'random') {
                // get optional effect
                const getOptionalEffect = getPrefix[1].split('|')
                const optionalTypes = getOptionalEffect.map(v => v.split('_')[0])
                const optionalEffects = getOptionalEffect.map(v => v.split('_')[1])
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
                            // hide notif
                            miscState.setAnimation(false)
                            gameState.setShowGameNotif(null)
                            // show number on selected coin
                            coinButtons[0] ? coinButtons[0].textContent = `${coinPrizes[0]}` : null
                            // set timeout to hide all buttons
                            return setTimeout(() => {
                                for(let coin of coinButtons) coin ? coin.classList.add('hidden') : null
                                // return event data
                                resolve({
                                    event: 'get_card',
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
                            type: type,
                            tileName: tileName,
                            money: playerTurnData.money + moreMoney
                        })
                    }
                    // return event data
                    resolve({
                        event: 'get_card',
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
                        type: type,
                        tileName: tileName,
                        money: -(playerTurnData.money * +effect.split('%')[0] / 100)
                    } 
                    : {
                        event: 'get_card',
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
                // get all players except current player
                const otherPlayerNames = gameState.gamePlayerInfo.map(v => v.display_name).join(',')
                resolve({
                    event: 'get_card',
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
                    localStorage.setItem('subEventData', `get_card: ${type} (${tileName})`)
                // set dice number
                const diceNumber = type == 'move forward' ? +effect : -effect
                const rollDiceData = {
                    playerTurn: playerTurnData.display_name,
                    playerDice: diceNumber,
                    playerRNG: rng
                }
                // move player
                playerMoving(rollDiceData, miscState, gameState)
                // return event data
                resolve({
                    event: 'get_card',
                    type: type,
                    tileName: tileName,
                    money: 0
                })
            }
            else if(type == 'move place') {
                // set additional event data for history (only for moving cards, upgrade, take card)
                if(separator != 'AND' && playerTurnData.display_name == gameState.myPlayerInfo.display_name)
                    localStorage.setItem('subEventData', `get_card: ${type} (${tileName})`)
                // get tile data (tile number)
                const getTileList = getMovePlaceTiles(effect, separator)
                // if tile data empty, just resolve
                if(getTileList.length === 0) {
                    return setTimeout(() => {
                        notifTimer.textContent = 'nowhere to go'
                        resolve({
                            event: 'get_card',
                            type: type,
                            tileName: tileName,
                            money: 0
                        })
                    }, 1000);
                }
                // set timer
                let movePlaceTimer = prefix == 'button' 
                                    ? separator == 'OR' 
                                        ? 1 // optional effect \w button (instant)
                                        : 6 // 1 effect \w button prefix
                                    : 2 // random prefix
                let chosenButton: HTMLElement = null
                const movePlaceInterval = setInterval(() => {
                    // no need timer for multiple effect card
                    notifTimer.textContent = !separator ? `${movePlaceTimer}` : ''
                    movePlaceTimer--
                    // if timer run out, auto cancel
                    if(movePlaceTimer < 0) {
                        clearInterval(movePlaceInterval)
                        notifTimer.textContent = ''
                        // hide notif
                        miscState.setAnimation(false)
                        gameState.setShowGameNotif(null)
                        // set choosen button
                        if(!separator) chosenButton.classList.add('bg-green-600')
                        // set player dice
                        const chosenSquare = +chosenButton.dataset.destination
                        const setChosenDice = playerTurnData.pos > chosenSquare 
                                            ? (24 + chosenSquare) - playerTurnData.pos
                                            : chosenSquare - playerTurnData.pos
                        const rollDiceData = {
                            playerTurn: playerTurnData.display_name,
                            playerDice: setChosenDice,
                            playerRNG: rng
                        }
                        // move to chosen place
                        playerMoving(rollDiceData, miscState, gameState)
                        // return event data
                        resolve({
                            event: 'get_card',
                            type: type,
                            tileName: tileName,
                            money: 0
                        })
                    }
                    // check if button created
                    const checkNotifButton = qS('[data-id=notif_button_0]')
                    if(checkNotifButton) {
                        // buttons created, then modify buttons
                        const notifButtons = qSA('[data-id^=notif_button]') as NodeListOf<HTMLElement>
                        // set chosen button
                        const chosenIndex = +rng[0] % notifButtons.length
                        // separator null means only card \w single effect can modify the button
                        // destination random / choice
                        if(!separator) {
                            for(let i=0; i<notifButtons.length; i++) {
                                const button = notifButtons[i]
                                button.classList.remove('hidden')
                                button.classList.add('border')
                                button.textContent = getTileList[i]
                                button.dataset.destination = getTileList[i]
                                // set event click for prefix button + single effect
                                if(prefix == 'button') {
                                    button.onclick = () => {
                                        clearInterval(movePlaceInterval)
                                        notifTimer.textContent = ''
                                        // set player dice
                                        const chosenSquare = +button.dataset.destination
                                        const setChosenDice = playerTurnData.pos > chosenSquare 
                                                            ? (24 + chosenSquare) - playerTurnData.pos
                                                            : chosenSquare - playerTurnData.pos
                                        const rollDiceData = {
                                            playerTurn: playerTurnData.display_name,
                                            playerDice: setChosenDice,
                                            playerRNG: rng
                                        }
                                        // move to chosen place
                                        playerMoving(rollDiceData, miscState, gameState)
                                        // return event data
                                        resolve({
                                            event: 'get_card',
                                            type: type,
                                            tileName: tileName,
                                            money: 0
                                        })
                                    }
                                    break
                                }
                            }
                            chosenButton = notifButtons[chosenIndex]
                        }
                        // destination already set, so it only has 1 array element
                        else {
                            notifButtons[chosenIndex].dataset.destination = getTileList[0]
                            chosenButton = notifButtons[chosenIndex]
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
                            localStorage.setItem('subEventData', `get_card: ${type} (${tileName})`)
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
                        type: type,
                        tileName: tileName,
                        money: 0,
                        city: null
                    })
                }, 2000)
            }
            else if(type == 'sell city') {
                // set additional event data for history (only for moving cards, upgrade/sell city, take card)
                if(playerTurnData.display_name == gameState.myPlayerInfo.display_name)
                    localStorage.setItem('subEventData', `get_card: ${type} (${tileName})`)
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
                        notifTimer.textContent = `${chosenSellCity} city sold`
                        // hide notif
                        miscState.setAnimation(false)
                        gameState.setShowGameNotif(null)
                        // selling city
                        const cityLeft = updateCityList({
                            action: 'sell', 
                            currentCity: playerTurnData.city,
                            cityName: chosenSellCity
                        })
                        const getCityInfo = (qS(`[data-city-info^=${chosenSellCity}]`) as HTMLElement).dataset.cityInfo.split(',')
                        const [cityName, cityProperty, cityPrice, cityOwner] = getCityInfo
                        // return event data
                        resolve({
                            event: 'get_card',
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
                const isDestroyed = updateCityList({
                    action: 'destroy', 
                    currentCity: playerTurnData.city,
                    rng: +rng[1]
                })
                // get destroyed city
                const getDestroyedCity = isDestroyed ? isDestroyed.split(';') : null
                const destroyedCity = getDestroyedCity ? getDestroyedCity[getDestroyedCity.length-1].split('*')[0] : null
                // use notif timer as addition message
                notifTimer.textContent = destroyedCity ? `"${destroyedCity} city collapse"` : '"go get a house, homeless"'
                // show notif
                miscState.setAnimation(true)
                gameState.setShowGameNotif('card')
                // return event data
                resolve({
                    event: 'get_card',
                    tileName: tileName,
                    type: type,
                    money: 0,
                    city: isDestroyed || null
                })
            }
            else if(type == 'take card') {
                // set additional event data for history (only for moving cards, upgrade, take card)
                if(playerTurnData.display_name == gameState.myPlayerInfo.display_name)
                    localStorage.setItem('subEventData', `get_card: ${type} (${tileName})`)
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
                    type: type,
                    tileName: tileName,
                    money: 0,
                    card: `add-${effect}`
                })
            }
        })
    }

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
                    // hide notif
                    miscState.setAnimation(false)
                    gameState.setShowGameNotif(null)
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
                    // modify button 
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
                    // modify button 
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
     */
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
            // show notif with buttons
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
    return new Promise((resolve: (value: EventDataType)=>void) => {
        // get current player
        const playerTurnData = gameState.gamePlayerInfo[findPlayer]
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        const notifTimer = qS('#result_notif_timer')
        // notif message
        notifTitle.textContent = 'Free Parking'
        notifMessage.textContent = 'select tile number'
        // show notif 
        miscState.setAnimation(true)
        gameState.setShowGameNotif('with_button-24' as any)
        // parking interval
        let parkingTimer = 10
        const parkingInterval = setInterval(() => {
            notifTimer.textContent = `${parkingTimer}`
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
                    money: 0
                })
            }
            // check button exist
            const parkingButton = qS(`[data-id=notif_button_0]`)
            if(parkingButton && playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
                // modify button
                const parkingButtons = qSA(`[data-id^=notif_button]`) as NodeListOf<HTMLInputElement>
                for(let i=0; i<parkingButtons.length; i++) {
                    // skip prison (tile 10, i 9) & parking (tile 22, i 21) 
                    if(i === 9 || i === 21) continue

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
                        const setChosenDice = playerTurnData.pos > chosenSquare 
                                            ? (24 + chosenSquare) - playerTurnData.pos
                                            : chosenSquare - playerTurnData.pos
                        const rollDiceData: IRollDiceData = {
                            playerTurn: playerTurnData.display_name,
                            playerDice: setChosenDice,
                            playerRNG: rng
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
function stopByCursedCity(tileElement: HTMLElement, miscState: IMiscContext, gameState: IGameContext) {
    return new Promise((resolve: (value: EventDataType)=>void) => {
        const getCityInfo = tileElement.dataset.cityInfo.split(',')
        const [cityName, cityProperty, cityPrice, cityOwner] = getCityInfo as string[];
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        // notif message
        notifTitle.textContent = 'Cursed City'
        notifMessage.textContent = `The city curse you for ${moneyFormat(+cityPrice)}`
        // show notif 
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        // return event data
        resolve({
            event: 'cursed',
            money: -cityPrice
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
            const {price} = data;
            // set event text for notif
            const [eventTitle, eventContent] = [
                'Paying Taxes', 
                translateUI({lang: miscState.language, text: `xxx paid taxes of xxx`})
            ]
            notifTitle.textContent = eventTitle
            notifMessage.textContent = eventContent
                                    .replace('xxx', playerTurnData.display_name) // player name
                                    .replace('xxx', moneyFormat(price)) // city price
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // no card, show normal notif
            if(!splitSpecialCard) {
                // show notif (tax)
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                return resolve([null, null])
            }
            // show notif (tax)
            miscState.setAnimation(true)
            gameState.setShowGameNotif('with_button-2' as any)
            // get card
            const specialCard = splitSpecialCard.map(v => v.match(/anti tax|nerf tax/i)).flat().filter(i=>i)
            // match special card
            for(let sc of specialCard) {
                // player has card
                if(sc == 'nerf tax') {
                    setSpecialCardHistory(sc)
                    const newPrice = price - (price * .35)
                    return resolve(await specialCardConfirmation({sc, newValue: newPrice, eventContent}))
                }
                else if(sc == 'anti tax') {
                    setSpecialCardHistory(sc)
                    const newPrice = 0
                    return resolve(await specialCardConfirmation({sc, newValue: newPrice, eventContent}))
                }
            }
        }
        else if(data.type == 'start') {
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // no card
            if(!splitSpecialCard) {
                return resolve([null, null])
            }
            // get card
            const specialCard = splitSpecialCard.map(v => v.match(/fortune block/i)).flat().filter(i=>i)
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
                'Prison',
                `${gameState.gamePlayerInfo[findPlayer].display_name} get arrested for being silly. accumulate > ${prisonAccumulateLimit} dice number to be free.`
            ]
            // notif message
            notifTitle.textContent = eventTitle
            notifMessage.textContent = eventContent
            // show notif 
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // no card, show normal notif
            if(!splitSpecialCard) {
                // show notif (tax)
                miscState.setAnimation(true)
                gameState.setShowGameNotif('normal')
                return resolve([null, null])
            }
            // show notif (tax)
            miscState.setAnimation(true)
            gameState.setShowGameNotif('with_button-2' as any)
            // get card
            const specialCard = splitSpecialCard.map(v => v.match(/anti prison/i)).flat().filter(i=>i)
            if(specialCard[0]) {
                setSpecialCardHistory(specialCard[0])
                return resolve(await specialCardConfirmation({sc: specialCard[0], newValue: 'free', eventContent}))
            }
            return resolve([null, null])
        }
        else if(data.type == 'dice') {
            const {diceNumber} = data
            // split card
            const splitSpecialCard = playerTurnData.card?.split(';')
            // no card
            if(!splitSpecialCard) {
                return resolve([null, null])
            }
            // get card
            const specialCard = splitSpecialCard.map(v => v.match(/gaming dice/i)).flat().filter(i=>i)
            if(specialCard[0]) {
                setSpecialCardHistory(specialCard[0])
                const newMoney = diceNumber * 10_000
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
                notifTimer.textContent = `"wanna use ${sc} card?" ${specialCardTimer}`
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
                    // hide notif
                    miscState.setAnimation(false)
                    gameState.setShowGameNotif(null)
                    nopeButton ? nopeButton.click() : null
                    return
                }
                // choice event
                if(nopeButton && playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
                    // show buttons
                    ofcourseButton.classList.remove('hidden')
                    // modify button 
                    ofcourseButton.textContent = 'Of course'
                    ofcourseButton.classList.add('text-green-300')
                    // click event
                    ofcourseButton.onclick = () => {
                        clearInterval(specialCardInterval)
                        notifTimer.textContent = ''
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
                    nopeButton.textContent = 'Nope'
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

    function setSpecialCardHistory(specialCard: string) {
        if(playerTurnData.display_name == gameState.myPlayerInfo.display_name)
            localStorage.setItem('specialCardUsed', `special_card: ${specialCard}`)
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
            if(isSpecialCardOwned === -1) {
                const splitCurrentSpecialCard = currentSpecialCard.split(';')
                splitCurrentSpecialCard.push(specialCard)
                tempSpecialCardArray.push(...splitCurrentSpecialCard.filter(i => i))
            }
        }
        else if(action == 'used') {
            // remove the card
            const filteredSpecialCard = tempSpecialCardArray.filter(v => v != specialCard)
            tempSpecialCardArray.push(...filteredSpecialCard)
        }
    }
    return tempSpecialCardArray.join(';')
}