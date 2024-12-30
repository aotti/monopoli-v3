import { FormEvent } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { fetcher, fetcherOptions, qS, setInputValue, translateUI } from "../../../../helper/helper"
import { IGameContext, IMiscContext, IResponse } from "../../../../helper/types"

export default function GameButtons() {
    const miscState = useMisc()
    const gameState = useGame()
    // get my lap
    const findLap = gameState.gamePlayerInfo?.map(v => v.display_name).indexOf(gameState.myPlayerInfo?.display_name)
    const myLap = gameState.gamePlayerInfo[findLap]?.lap

    return (
        <form className="flex flex-col gap-2 lg:gap-3 mx-auto w-fit px-2 text-center" onSubmit={ev => manageFormSubmits(ev, miscState, gameState)}>
            {/* username + laps */}
            <div className="flex justify-around mx-auto w-52 lg:w-72">
                <p> {gameState.myPlayerInfo?.display_name} </p>
                <p> {translateUI({lang: miscState.language, text: 'lap'})}: {myLap} </p>
            </div>
            {/* ready + leave */}
            {gameState.gameStages == 'prepare' ? <PreparationButtons /> : null}
            {/* roll dice + roll turn */}
            {gameState.gameStages == 'decide' ? <DecideTurnButtons /> : null}
            {/* roll dice + surrend */}
            {gameState.gameStages == 'play' ? <RollTurnButtons /> : null}
            {/* player turn notif */}
            <div className="mx-auto">
                <span id="player_turn_notif" className="whitespace-pre"></span>
            </div>
        </form>
    )
}

function PreparationButtons() {
    const miscState = useMisc()

    return (
        <div className="relative z-10 flex justify-around gap-6 mx-auto w-52 lg:w-72">
            <div>
                <button type="submit" id="ready_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'ready'})} </button>
            </div>
            <div>
                <button type="submit" id="leave_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'leave'})} </button>
            </div>
        </div>
    )
}

function DecideTurnButtons() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className="relative z-10 flex justify-around gap-6 mx-auto w-52 lg:w-72">
            <div>
                <button type="button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0" disabled> 
                    {translateUI({lang: miscState.language, text: 'roll dice'})} 
                </button>
            </div>
            <div>
                <input type="hidden" id="rolled_number" />
                <button type="submit" id="roll_turn_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"
                onClick={() => gameState.setRollNumber('turn')}> 
                    {translateUI({lang: miscState.language, text: 'roll turn'})} 
                </button>
            </div>
        </div>
    )
}

function RollTurnButtons() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className="relative z-10 flex justify-around gap-6 mx-auto w-52 lg:w-72">
            <div>
                <input type="hidden" id="rolled_dice" />
                <button type="submit" id="roll_dice_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"
                onClick={() => gameState.setRollNumber('dice')}> 
                    {translateUI({lang: miscState.language, text: 'roll dice'})} 
                </button>
            </div>
            <div>
                <button type="button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"> 
                    {translateUI({lang: miscState.language, text: 'surrender'})} 
                </button>
            </div>
        </div>
    )
}

function manageFormSubmits(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()
    // submitter
    const submitterId = (ev.nativeEvent as any).submitter.id
    // form inputs
    const formInputs = ev.currentTarget.elements

    switch(submitterId) {
        // leave room function
        case `leave_button`: leaveGameRoom(miscState, gameState); break
        // ready game function
        case `ready_button`: readyGameRoom(miscState, gameState); break
        // start game function
        case `start_button`: startGameRoom(miscState, gameState); break
        // roll turn function
        case `roll_turn_button`: setTimeout(() => rollTurnGameRoom(formInputs, miscState, gameState), 2500); break
        // roll dice function
        case `roll_dice_button`: setTimeout(() => rollDiceGameRoom(formInputs, miscState, gameState), 2500); break
    }
}

async function leaveGameRoom(miscState: IMiscContext, gameState: IGameContext) {
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

async function readyGameRoom(miscState: IMiscContext, gameState: IGameContext) {
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

async function startGameRoom(miscState: IMiscContext, gameState: IGameContext) {
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

async function rollTurnGameRoom(formInputs: HTMLFormControlsCollection, miscState: IMiscContext, gameState: IGameContext) {
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
    // loading button
    const tempButtonText = rollTurnButton.textContent
    rollTurnButton.textContent = 'Loading'
    rollTurnButton.disabled = true
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

async function rollDiceGameRoom(formInputs: HTMLFormControlsCollection, miscState: IMiscContext, gameState: IGameContext) {
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
    // loading button
    const tempButtonText = rollDiceButton.textContent
    rollDiceButton.textContent = 'Loading'
    rollDiceButton.disabled = true
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