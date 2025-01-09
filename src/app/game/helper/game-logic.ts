import { fetcher, fetcherOptions, moneyFormat, qS, qSA, setInputValue, translateUI } from "../../../helper/helper"
import { EventDataType, IGameContext, IGamePlay, IMiscContext, IResponse } from "../../../helper/types"

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
            const { getPlayers, gameStage, decidePlayers, preparePlayers, gameHistory } = getPlayerResponse.data[0]
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
        rolled_dice: null
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

/**
 * @param numberTarget dice result number
 */
export function playerMoving(playerTurn: string, numberTarget: number, miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
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
        // find current player
        const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(playerTurn)
        // get tile element for stop by event
        let [tileInfo, tileElement]: [string, HTMLElement] = [null, null]
        // moving params
        let numberStep = 0
        let numberLaps = gameState.gamePlayerInfo[findPlayer].lap
        const currentPos = gameState.gamePlayerInfo[findPlayer].pos
        const nextPos = (currentPos + numberTarget) === playerPaths.length 
                        ? playerPaths.length 
                        : (currentPos + numberTarget) % playerPaths.length
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
                // stop by event
                stopByEvent()
                // ====== ONLY MOVING PLAYER WILL FETCH ======
                .then(eventData => turnEnd(eventData))
                return
            }
            // moving
            playerPaths.forEach(path => {
                // prevent tile number == 0
                const tempStep = currentPos + numberStep
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

        function stopByEvent() {
            return new Promise((resolve: (value: EventDataType)=>void ) => {
                // match tile info
                // ### EVENT LIST COMPLETE: city, tax
                // ### EVENT LIST NOT COMPLETE: special, curse, community card, chance card, prison, free park, buff, debuff
                switch(tileInfo) {
                    case 'city': 
                        stopByCity(findPlayer, tileElement, miscState, gameState)
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
            // get tax data
            const taxData = eventData?.event == 'pay_tax' 
                            ? {owner: eventData.owner, visitor: eventData.visitor} 
                            : null
            // input values container
            const inputValues: IGamePlay['turn_end'] | {action: string} = {
                action: 'game turn end',
                channel: `monopoli-gameroom-${gameState.gameRoomId}`,
                display_name: gameState.gamePlayerInfo[findPlayer].display_name,
                pos: nextPos.toString(),
                lap: numberLaps.toString(),
                // money from event that occured
                event_money: eventData?.money.toString() || '0',
                // history = rolled_dice: num;buy_city: str;pay_tax: str;sell_city: str;get_card: str;use_card: str
                history: setEventHistory(`rolled_dice: ${numberTarget}`, eventData),
                // nullable data: city, card, taxes
                city: gameState.gamePlayerInfo[findPlayer].city,
                tax_owner: taxData?.owner || null,
                tax_visitor: taxData?.visitor || null,
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

export async function gameOver(miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // get room name
    const findRoom = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
    // data for update all player stats
    const allPlayerStats = []
    for(let player of gameState.gamePlayerInfo) 
        allPlayerStats.push(`${player.display_name},${player.money}`)
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

// ============= EVENT FUNCTIONS =============
// ============= EVENT FUNCTIONS =============

function stopByCity(findPlayer: number, tileElement: HTMLElement, miscState: IMiscContext, gameState: IGameContext) {
    return new Promise((resolve: (value: EventDataType)=>void) => {
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        const notifTimer = qS('#result_notif_timer')
        // event text container
        let [eventTitle, eventContent]: [string, string] = [null, null]
        // get city info
        const getCityInfo = tileElement.dataset.cityInfo.split(',')
        let [buyCityName, buyCityProperty, buyCityPrice, buyCityOwner] = [null, null, null, null] as string[];
        // set city info
        if(getCityInfo.length === 4) [buyCityName, buyCityProperty, buyCityPrice, buyCityOwner] = getCityInfo
        else if(getCityInfo.length === 3) [buyCityName, buyCityProperty, buyCityPrice] = getCityInfo
        // if city owner not current player
        // === paying taxes ===
        const isCityMine = buyCityOwner != gameState.gamePlayerInfo[findPlayer].display_name
        if(isCityMine === false) return payingTaxes()
    
        // if city property is maxed, stop
        if(buyCityProperty == 'realestate') {
            return {
                event: 'buy_city',
                status: false
            } as EventDataType
        }
        // show notif (must be on top the buttons to prevent undefined)
        miscState.setAnimation(true)
        gameState.setShowGameNotif('with_button-2')
        // set timer
        let buyCityTimer = 5
        const buyCityInterval = setInterval(() => {
            notifTimer.textContent = `${buyCityTimer}`
            buyCityTimer--
            // event buttons (2 buttons)
            const [nopeButton, ofcourseButton] = [qS('#nope_button'), qS('#ofcourse_button')] as HTMLInputElement[]
            // if timer run out, auto cancel
            if(buyCityTimer < 0) {
                clearInterval(buyCityInterval)
                notifTimer.textContent = ''
                nopeButton.click()
            }
            // prevent other player from doing event
            if(gameState.gamePlayerInfo[findPlayer].display_name == gameState.myPlayerInfo.display_name) {
                // show buttons
                ofcourseButton?.classList.remove('hidden')
                nopeButton?.classList.remove('hidden')
                // choice click event
                ofcourseButton.onclick = () => {
                    clearInterval(buyCityInterval)
                    notifTimer.textContent = ''
                    // update game player info
                    const myCity = gameState.gamePlayerInfo[findPlayer].city
                    gameState.setGamePlayerInfo(players => {
                        const buyCityPlayers = [...players]
                        buyCityPlayers[findPlayer].city = updateCityList(myCity, buyCityName, buyCityProperty)
                        return buyCityPlayers
                    })
                    // turn off notif
                    miscState.setAnimation(false)
                    gameState.setShowGameNotif(null)
                    // hide buttons
                    ofcourseButton.classList.add('hidden')
                    nopeButton.classList.add('hidden')
                    // set event data
                    const eventData: EventDataType = {
                        event: 'buy_city',
                        status: true,
                        display_name: gameState.gamePlayerInfo[findPlayer].display_name,
                        city: buyCityName,
                        property: buyCityProperty == '2house1hotel' ? '1hotel' : buyCityProperty,
                        money: -buyCityPrice
                    }
                    // return event data
                    return resolve(eventData)
                }
                nopeButton.onclick = () => {
                    clearInterval(buyCityInterval)
                    notifTimer.textContent = ''
                    // turn off notif
                    miscState.setAnimation(false)
                    gameState.setShowGameNotif(null)
                    // hide buttons
                    ofcourseButton.classList.add('hidden')
                    nopeButton.classList.add('hidden')
                    // set event data
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
        // set event text for notif
        [eventTitle, eventContent] = [
            isCityMine ? 'Upgrade City' : 'Buy City', 
            isCityMine 
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
    
        function payingTaxes() {
            // set event text for notif
            [eventTitle, eventContent] = [
                'Paying Taxes', 
                translateUI({lang: miscState.language, text: `xxx paid taxes of xxx`})
            ]
            // show notif (tax)
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            notifTitle.textContent = eventTitle
            notifMessage.textContent = eventContent
                                    .replace('xxx', gameState.gamePlayerInfo[findPlayer].display_name) // player name
                                    .replace('xxx', moneyFormat(+buyCityPrice)) // city price
            // set event data
            const eventData: EventDataType = {
                event: 'pay_tax', 
                owner: buyCityOwner, 
                visitor: gameState.gamePlayerInfo[findPlayer].display_name,
                money: -buyCityPrice
            }
            // return event history
            return resolve(eventData)
        }
    })
}

// ============= MISC FUNCTIONS =============
// ============= MISC FUNCTIONS =============

function updateCityList(currentCity: string, buyCityName: string, buyCityProperty: string) {
    // check if player own the city
    const isCityOwned = currentCity?.match(buyCityName)
    // city owned
    if(isCityOwned) {
        // find city
        const splitCurrentCity = currentCity.split(';')
        const findCity = splitCurrentCity.map(v => v.match(buyCityName)).flat().indexOf(buyCityName)
        // update property
        splitCurrentCity[findCity] += `,${buyCityProperty}`
        return splitCurrentCity.join(';')
    }
    // city not owned
    else {
        const addNewCity = currentCity ? `${currentCity};${buyCityName}*${buyCityProperty}` : `${buyCityName}*${buyCityProperty}`
        return addNewCity
    }
}

function setEventHistory(rolled_dice: string, eventData: EventDataType) {
    const historyArray = [rolled_dice]
    // check event data
    switch(eventData?.event) {
        case 'buy_city': 
            // check status
            if(eventData.status) {
                // buying city
                historyArray.push(`${eventData.event}: ${eventData.city} (${eventData.property})`)
            }
            else {
                // not buy || property max
                historyArray.push(`${eventData.event}: none`)
            }
            return historyArray.join(';')
        case 'pay_tax': 
            historyArray.push(`${eventData.event}: ${moneyFormat(eventData.money)} to ${eventData.owner}`)
            return historyArray.join(';')
        default: 
            return historyArray.join(';')
    }
}