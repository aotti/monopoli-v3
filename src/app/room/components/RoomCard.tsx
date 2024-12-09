import { FormEvent, useEffect, useState } from "react"
import { useMisc } from "../../../context/MiscContext"
import { applyTooltipEvent, fetcher, fetcherOptions, qS, setInputValue, translateUI } from "../../../helper/helper"
import { ICreateRoom, IGameContext, IJoinRoom, IPlayer, IResponse } from "../../../helper/types"
import { useGame } from "../../../context/GameContext"
import Link from "next/link"

export default function RoomCard({ roomData }: {roomData: ICreateRoom['list']}) {
    const miscState = useMisc()
    const gameState = useGame()
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    const roomId = (roomData as any).id as number || roomData.room_id
    const roomConfirmPassword = (roomData as any).password as string || roomData.room_password
    const roomCreator = (roomData as any).display_name as string || roomData.creator
    // check if room have password
    const isRoomLocked = roomConfirmPassword ? `🔒` : ''
    // modify curse text
    const getCurse = roomData.rules.match(/curse: \d{1,2}/)[0].split(': ')[1]
    const setCurseRange = +getCurse > 5 ? `curse: 5~${getCurse}%` : `curse: ${getCurse}%`
    const modifiedRules = roomData.rules.replace(/curse: \d{1,2}/, setCurseRange)
    // room status
    const roomStatusColor = roomData.status == 'prepare' ? 'bg-green-500/30' : 'bg-orange-500/30'

    // player input password
    const [showInputPassword, setShowInputPassword] = useState(false)

    return (
        <div className={`relative w-[calc(100%-52.5%)] h-56 lg:h-60 border-2 ${roomStatusColor}`}>
            <form onSubmit={ev => manageFormSubmits(ev, roomId, gameState)}>
                {/* room id */}
                <input type="hidden" id="room_id" defaultValue={roomId} />
                <input type="hidden" id={`room_password_${roomId}`} />
                <input type="hidden" id="confirm_room_password" defaultValue={roomConfirmPassword} />
                {/* room name */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Name'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="room_name" className="bg-transparent text-white w-3/5 border-b border-b-white" 
                    defaultValue={(roomData as any).name || roomData.room_name} readOnly />
                </div>
                {/* rules */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Rules'})} </span>
                        <span> : </span>
                    </label>
                    <div className="w-3/5 border-b border-b-white">
                        {/* hover rules */}
                        <p data-tooltip={modifiedRules.replaceAll(';', '\n')} className="relative w-full text-center bg-transparent" > 
                            ??? 
                        </p>
                        {/* input */}
                        <input type="hidden" id="rules" defaultValue={roomData.rules} readOnly />
                    </div>
                </div>
                {/* player count */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Count'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="player_count" className="bg-transparent text-white w-3/5 border-b border-b-white" defaultValue={`${roomData.player_count} player(s)`} readOnly />
                </div>
                {/* max player */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Max'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="player_max" className="bg-transparent text-white w-3/5 border-b border-b-white" defaultValue={`${roomData.player_max} player(s)`} readOnly />
                </div>
                {/* creator */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Creator'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="creator" className="bg-transparent text-white w-3/5 border-b border-b-white" 
                    defaultValue={roomCreator} readOnly />
                </div>
                <div className="flex text-right p-2 lg:mt-2">
                    {/* join button */}
                    <JoinRoomButton isRoomLocked={isRoomLocked} roomId={roomId} setShowInputPassword={setShowInputPassword} />
                    {/* spectate button */}
                    <SpectateRoomButton roomId={roomId} roomCreator={roomCreator} />
                    {/* delete button */}
                    <DeleteRoomButton roomId={roomId} roomCreator={roomCreator} />
                    <Link id={`gotoGame${roomId}`} href={{ pathname: '/game', query:{id: roomId} }} hidden={true}></Link>
                </div>
            </form>
            {/* result message */}
            <div className={`${gameState.roomError == `${roomId}` ? 'block' : 'hidden'} absolute top-[15vh] lg:top-[10vh] left-[5vw] 
            w-[20vw] lg:p-1 text-center bg-darkblue-1 border-8bit-text`}>
                <p id={`result_room_${roomId}`}></p>
            </div>
            {/* input password */}
            <div className={`${showInputPassword ? 'flex' : 'hidden'} flex-col gap-1 absolute top-[15vh] lg:top-[10vh] left-[5vw] w-[20vw] 
            lg:p-1 text-center bg-darkblue-1 border-8bit-text`}>
                <p> input room password: </p>
                <div className="flex gap-1">
                    <input type="text" id={`input_password_${roomId}`} className="w-full px-1" minLength={3} maxLength={8} placeholder="password" />
                    <button type="button" className="w-10 lg:w-16" 
                    onClick={() => getInputPassword(roomId, setShowInputPassword)}> ok </button>
                </div>
            </div>
        </div>
    )
}

function JoinRoomButton(
    {isRoomLocked, roomId, setShowInputPassword}: 
    {isRoomLocked: string, roomId: number, setShowInputPassword}
) {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        gameState.myCurrentGame == roomId
        ? <Link href={{ pathname: '/game', query:{id: roomId} }} className="w-16 lg:w-24 text-2xs lg:text-xs text-center bg-success border-8bit-success active:opacity-75">
            {translateUI({lang: miscState.language, text: 'Join'})}
        </Link>
        : <button type="button" id={`join_button_${roomId}`} className="w-16 lg:w-24 text-2xs lg:text-xs bg-success border-8bit-success active:opacity-75" onClick={() => isRoomLocked == '🔒' ? setShowInputPassword(true) : getInputPassword(roomId, setShowInputPassword)}>
            {translateUI({lang: miscState.language, text: 'Join'})} {isRoomLocked}
        </button>
    )
}

function SpectateRoomButton({roomId, roomCreator}: {roomId: number, roomCreator: string}) {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        // only show for rooms that not mine
        gameState.myPlayerInfo.display_name == roomCreator
            ? null
            : <button type="submit" id={`spectate_button_${roomId}`} 
            className="w-16 lg:w-24 text-2xs lg:text-xs bg-primary border-8bit-primary active:opacity-75">
                {translateUI({lang: miscState.language, text: 'Spectate'})}
            </button>
    )
}

function DeleteRoomButton({roomId, roomCreator}: {roomId: number, roomCreator: string}) {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        // only show for my room
        gameState.myPlayerInfo.display_name == roomCreator
            ? <button type="submit" id={`delete_button_${roomId}`} className="w-16 lg:w-24 text-2xs lg:text-xs bg-darkblue-1 border-8bit-text active:opacity-75">
                {translateUI({lang: miscState.language, text: 'Delete'})}
            </button>
            : null
    )
}

function getInputPassword(roomId: number, setShowInputPassword) {
    // get input password
    const inputPassword = qS(`#input_password_${roomId}`) as HTMLInputElement
    const roomPassword = qS(`#room_password_${roomId}`) as HTMLInputElement
    // fill input value
    roomPassword.value = inputPassword.value
    // join button
    const joinButton = qS(`#join_button_${roomId}`) as HTMLInputElement
    joinButton.type = 'submit' // to trigger form submit
    joinButton.click()
    // close input password
    setShowInputPassword(false)
}

function manageFormSubmits(ev: FormEvent<HTMLFormElement>, roomId: number, gameState: IGameContext) {
    ev.preventDefault()
    // submitter
    const submitterId = (ev.nativeEvent as any).submitter.id
    // form inputs
    const formInputs = ev.currentTarget.elements
    // join room without fetch
    if(gameState.myCurrentGame === roomId) {
        // move to game room
        const link = qS(`#gotoGame${roomId}`) as HTMLAnchorElement
        link.click()
        return
    }

    switch(submitterId) {
        // join room function
        case `join_button_${roomId}`: joinRoom(formInputs, roomId, gameState); break
        // spectate room function
        case `spectate_button_${roomId}`: spectateRoom(roomId, gameState); break
        // delete room function
        case `delete_button_${roomId}`: deleteRoom(formInputs, roomId, gameState); break
    }
}

function spectateRoom(roomId: number, gameState: IGameContext) {
    // submit buttons
    const joinButton = qS(`#join_button_${roomId}`) as HTMLButtonElement
    const spectateButton = qS(`#spectate_button_${roomId}`) as HTMLButtonElement
    const deleteButton = qS(`#delete_button_${roomId}`) as HTMLButtonElement
    // disable buttons
    spectateButton.disabled = true
    joinButton ? joinButton.disabled = true : null
    deleteButton ? deleteButton.disabled = true : null
    // set player as spectator
    gameState.setSpectator(true)
    // move to game room
    const link = qS(`#gotoGame${roomId}`) as HTMLAnchorElement
    link.click()
    // enable buttons
    joinButton.removeAttribute('disabled')
    spectateButton ? spectateButton.removeAttribute('disabled') : null
    deleteButton ? deleteButton.removeAttribute('disabled') : null
}

async function joinRoom(formInputs: HTMLFormControlsCollection, roomId: number, gameState: IGameContext) {
    // submit buttons
    const joinButton = qS(`#join_button_${roomId}`) as HTMLButtonElement
    const spectateButton = qS(`#spectate_button_${roomId}`) as HTMLButtonElement
    const deleteButton = qS(`#delete_button_${roomId}`) as HTMLButtonElement
    // result message
    const resultMessage: Element = qS(`#result_room_${roomId}`)
    // input value container
    const inputValues: IJoinRoom['input'] = {
        action: 'room join',
        room_id: roomId.toString(),
        room_password: null, // from player input
        confirm_room_password: null, // from input value
        display_name: gameState.myPlayerInfo.display_name,
        money_start: null
    }
    // get input elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName.match(/INPUT/)) {
            // filter inputs
            if(setInputValue('rules', input)) {
                // get money start
                const moneyStart = input.value.match(/start: \d+/)[0].split(': ')[1]
                inputValues.money_start = moneyStart
            }
            else if(setInputValue('confirm_room_password', input)) inputValues.confirm_room_password = input.value.trim().toLowerCase()
            // skip other inputs
            else if(input.id.match(/room_id|room_name|room_password_\d+|player_count|player_max|creator/)) continue
            // error
            else {
                if(resultMessage) {
                    gameState.setRoomError(inputValues.room_id)
                    setTimeout(() => gameState.setRoomError(null), 2000);
                    resultMessage.textContent = `${input.id} error`
                    return
                }
                joinButton.classList.add('text-red-600')
                joinButton.textContent = 'err400'
                return
            }
        }
    }
    // matching password
    const roomPassword = qS(`#room_password_${inputValues.room_id}`) as HTMLInputElement
    // password doesnt match
    if(roomPassword.value != '' && roomPassword.value != inputValues.confirm_room_password) {
        gameState.setRoomError(inputValues.room_id)
        setTimeout(() => gameState.setRoomError(null), 2000);
        resultMessage.textContent = 'wrong password'
        return
    }
    inputValues.room_password = roomPassword.value == '' ? null : roomPassword.value
    delete inputValues.confirm_room_password
    // submit button loading
    const tempButtonText = joinButton.textContent
    joinButton.textContent = 'Loading'
    joinButton.disabled = true
    // disable other buttons
    spectateButton ? spectateButton.disabled = true : null
    deleteButton ? deleteButton.disabled = true : null
    // fetch
    const joinRoomFetchOptions = fetcherOptions({method: 'PUT', credentials: true, body: JSON.stringify(inputValues)})
    const joinRoomResponse: IResponse = await (await fetcher('/room', joinRoomFetchOptions)).json()
    // response
    switch(joinRoomResponse.status) {
        case 200: 
            // set joined room
            localStorage.setItem('joinedRoom', roomId.toString())
            gameState.setMyCurrentGame(roomId)
            // move to game room
            const link = qS(`#gotoGame${roomId}`) as HTMLAnchorElement
            link.click()
            // enable submit buttons
            joinButton.textContent = tempButtonText
            joinButton.removeAttribute('disabled')
            spectateButton ? spectateButton.removeAttribute('disabled') : null
            deleteButton ? deleteButton.removeAttribute('disabled') : null
            return
        default: 
            // error message
            gameState.setRoomError(inputValues.room_id)
            setTimeout(() => gameState.setRoomError(null), 3000);
            resultMessage.textContent = `${joinRoomResponse.status}: ${joinRoomResponse.message}`
            // enable submit buttons
            joinButton.textContent = tempButtonText
            joinButton.removeAttribute('disabled')
            spectateButton ? spectateButton.removeAttribute('disabled') : null
            deleteButton ? deleteButton.removeAttribute('disabled') : null
            return
    }
}

async function deleteRoom(formInputs: HTMLFormControlsCollection, roomId: number, gameState: IGameContext) {
    // submit buttons
    const joinButton = qS(`#join_button_${roomId}`) as HTMLButtonElement
    const spectateButton = qS(`#spectate_button_${roomId}`) as HTMLButtonElement
    const deleteButton = qS(`#delete_button_${roomId}`) as HTMLButtonElement
    // input value container
    const inputValues = {
        display_name: gameState.myPlayerInfo.display_name,
        creator: null,
        room_name: null
    }
    // get input elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName.match(/INPUT/)) {
            // filter inputs
            if(setInputValue('room_name', input)) inputValues.room_name = input.value.trim().toLowerCase()
            else if(setInputValue('creator', input)) inputValues.creator = input.value.trim().toLowerCase()
            // skip other inputs
            else if(input.id.match(/room_id|room_password|player_count|player_max|rules/)) continue
            // error
            else {
                deleteButton.classList.add('text-red-600')
                deleteButton.textContent = 'err400'
                return
            }
        }
    }
    // confirm delete room dialog
    if(!confirm(`Are you sure wanna delete "${inputValues.room_name}"?`)) return
    // submit button loading
    const tempButtonText = deleteButton.textContent
    deleteButton.textContent = 'Loading'
    deleteButton.disabled = true
    // disable other buttons
    spectateButton ? spectateButton.disabled = true : null
    joinButton ? joinButton.disabled = true : null
    // fetch
    const deleteRoomFetchOptions = fetcherOptions({method: 'DELETE', credentials: true, body: JSON.stringify(inputValues)})
    const deleteRoomResponse: IResponse = await (await fetcher('/room', deleteRoomFetchOptions)).json()
    // response
    switch(deleteRoomResponse.status) {
        case 200: 
            // save access token
            if(deleteRoomResponse.data[0].token) {
                localStorage.setItem('accessToken', deleteRoomResponse.data[0].token)
                delete deleteRoomResponse.data[0].token
            }
            // enable submit buttons
            deleteButton.textContent = tempButtonText
            deleteButton.removeAttribute('disabled')
            spectateButton ? spectateButton.removeAttribute('disabled') : null
            joinButton ? joinButton.removeAttribute('disabled') : null
            return
        default: 
            deleteButton.classList.add('text-red-600')
            deleteButton.textContent = `err${deleteRoomResponse.status}`
            // enable submit buttons
            deleteButton.removeAttribute('disabled')
            spectateButton ? spectateButton.removeAttribute('disabled') : null
            joinButton ? joinButton.removeAttribute('disabled') : null
            return
    }
}