import { FormEvent } from "react"
import { errorCreateRoom, fetcher, fetcherOptions, qS, resetAllData, setInputValue, translateUI } from "../../../helper/helper"
import { ICreateRoom, IGameContext, IMiscContext, IPlayer, IResponse, IShiftRoom } from "../../../helper/types"

export async function getRoomList(gameState: IGameContext) {
    // result message
    const resultMessage = qS('#result_message')
    // fetch
    const getRoomFetchOptions = fetcherOptions({method: 'GET', credentials: true, noCache: true})
    const getRoomResponse: IResponse = await (await fetcher('/room', getRoomFetchOptions)).json()
    // response
    switch(getRoomResponse.status) {
        case 200: 
            // save access token
            if(getRoomResponse.data[0].token) {
                localStorage.setItem('accessToken', getRoomResponse.data[0].token)
                delete getRoomResponse.data[0].token
            }
            // get rooms data
            const rooms = getRoomResponse.data[0].roomList as ICreateRoom['list'][]
            // set room list
            for(let room of rooms) {
                gameState.setRoomList(data => [...data, room].filter((obj1, i, arr) => 
                    arr.findLastIndex(obj2 => obj2.room_name == obj1.room_name) === i
                ))
            }
            // set my current game
            gameState.setMyCurrentGame(getRoomResponse.data[0].currentGame)
            // set game room info
            gameState.setGameRoomInfo(getRoomResponse.data[0].roomListInfo)
            return
        default: 
            resultMessage.textContent = `❌ ${getRoomResponse.status}: ${getRoomResponse.message}`
            return
    }
}

export async function createRoom(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext, setCreateRoomPage) {
    ev.preventDefault()
    // result message
    const resultMessage = qS('#result_message')
    resultMessage.className = 'mx-auto text-center text-2xs lg:text-[12px]'
    resultMessage.textContent = ''
    // submit button
    const createButton = qS('#create_room') as HTMLInputElement
    // input value container
    const inputValues: ICreateRoom['input'] = {
        creator: gameState.myPlayerInfo.display_name,
        room_name: null,
        room_password: null,
        select_mode: null,
        select_board: null,
        select_dice: null,
        select_money_start: null,
        select_money_lose: null,
        select_curse: null,
        select_max_player: null,
        select_character: null
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName.match(/INPUT|SELECT/) && input.type != 'radio') {
            // filter inputs
            if(setInputValue('room_name', input)) {
                // check room list 
                if(gameState.roomList.length > 0) {
                    const roomName = input.value.trim().toLowerCase()
                    const isRoomNameExist = gameState.roomList.map(v => v.room_name).indexOf(roomName)
                    // room name exist
                    if(isRoomNameExist !== -1) {
                        resultMessage.classList.add('text-red-300')
                        resultMessage.textContent = translateUI({lang: miscState.language, text: 'name: room name already exist'})
                        return
                    }
                }
                inputValues.room_name = input.value.trim().toLowerCase()
            }
            else if(setInputValue('room_password', input)) inputValues.room_password = input.value == '' ? null : input.value.trim()
            else if(setInputValue('select_mode', input)) inputValues.select_mode = input.value.trim().toLowerCase()
            else if(setInputValue('select_board', input)) inputValues.select_board = input.value.trim().toLowerCase()
            else if(setInputValue('select_dice', input)) inputValues.select_dice = `${input.value}`
            else if(setInputValue('select_money_start', input)) inputValues.select_money_start = `${input.value}`
            else if(setInputValue('select_money_lose', input)) inputValues.select_money_lose = `${input.value}`
            else if(setInputValue('select_curse', input)) inputValues.select_curse = `${input.value}`
            else if(setInputValue('select_max_player', input)) inputValues.select_max_player = `${input.value}`
            // dont lowercase link
            else if(setInputValue('select_character', input)) inputValues.select_character = input.value.trim()
            // error
            else {
                resultMessage.classList.add('text-red-300')
                resultMessage.textContent = errorCreateRoom(input.id, miscState.language)
                return
            }
        }
    }
    // submit button loading
    const tempButtonText = createButton.textContent
    createButton.textContent = 'Loading'
    createButton.disabled = true
    // fetch
    const createRoomFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const createRoomResponse: IResponse = await (await fetcher('/room', createRoomFetchOptions)).json()
    // response
    switch(createRoomResponse.status) {
        case 200: 
            // save access token
            if(createRoomResponse.data[0].token) {
                localStorage.setItem('accessToken', createRoomResponse.data[0].token)
                delete createRoomResponse.data[0].token
            }
            // set create room page
            setCreateRoomPage(1)
            // set my current game
            gameState.setMyCurrentGame(createRoomResponse.data[0].currentGame)
            // hide the modal & tutorial
            miscState.setShowModal(null)
            miscState.setShowTutorial(null)
            // submit button normal
            createButton.textContent = tempButtonText
            createButton.removeAttribute('disabled')
            return
        default: 
            // submit button normal
            createButton.textContent = tempButtonText
            createButton.removeAttribute('disabled')
            // special for room name error
            if(typeof createRoomResponse.message == 'string' && createRoomResponse.message.match('name:')) {
                resultMessage.classList.add('text-red-300')
                resultMessage.textContent = translateUI({lang: miscState.language, text: createRoomResponse.message as any})
                return
            }
            // result message
            const translateError = translateUI({lang: miscState.language, text: createRoomResponse.message as any})
            resultMessage.classList.add('text-red-300')
            resultMessage.textContent = `❌ ${createRoomResponse.status}: ${translateError || createRoomResponse.message}`
            return
    }
}

export async function viewPlayerStats(ev: FormEvent<HTMLFormElement>, gameState: IGameContext) {
    ev.preventDefault()

    // input element
    let playerInput: HTMLInputElement
    // input value container
    const inputValues: Partial<IPlayer> = {
        display_name: null
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // filter inputs
            if(setInputValue('display_name', input)) {
                inputValues.display_name = input.value.trim()
                playerInput = input
            }
            // error
            else {
                input.value = input.value + '⚠'
                return
            }
        }
    }
    // check player name
    if(gameState.myPlayerInfo.display_name == inputValues.display_name) {
        // set other player info
        gameState.setOtherPlayerInfo(null)
        return
    }
    // fetch
    const viewFetchOptions = fetcherOptions({method: 'GET', credentials: true, noCache: true})
    const viewResponse: IResponse = await (await fetcher(`/player/?display_name=${inputValues.display_name}`, viewFetchOptions)).json()
    // response
    switch(viewResponse.status) {
        case 200: 
            // save access token
            if(viewResponse.data[0].token) {
                localStorage.setItem('accessToken', viewResponse.data[0].token)
                delete viewResponse.data[0].token
            }
            // set other player info
            gameState.setOtherPlayerInfo(viewResponse.data[0].player)
            return
        default: 
            playerInput.value += viewResponse.status
            return
    }
}

/**
 * @param display_name player in game name
 * @param publicId avatar pathname
 * @description update player avatar
 */
export async function avatarUpdate(display_name: string, avatar_url: string, gameState: IGameContext) {
    const avatarImg = qS('#avatar') as HTMLImageElement
    const uploadButton = qS('#upload_avatar') as HTMLInputElement
    // input value container
    const inputValues = {
        display_name: display_name,
        avatar: avatar_url
    }
    // disable upload button
    uploadButton.disabled = true
    // fetch
    const avatarFetchOptions = fetcherOptions({method: 'PUT', credentials: true, body: JSON.stringify(inputValues)})
    const avatarResponse: IResponse = await (await fetcher('/player/avatar', avatarFetchOptions)).json()
    // response
    switch(avatarResponse.status) {
        case 200: 
            // save access token
            if(avatarResponse.data[0].token) {
                localStorage.setItem('accessToken', avatarResponse.data[0].token)
                delete avatarResponse.data[0].token
            }
            // set my player data
            gameState.setMyPlayerInfo(info => {
                const newAvatar: IPlayer = {
                    ...info,
                    avatar: avatarResponse.data[0].avatar,
                }
                return newAvatar
            })
            // submit button normal
            uploadButton.removeAttribute('disabled')
            return
        default: 
            // submit button normal
            uploadButton.removeAttribute('disabled')
            // result message
            avatarImg.alt = `${avatarResponse.status}: ${avatarResponse.message}`
            return
    }
}

export async function userLogout(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()

    // home button
    const gotoHome = qS('#gotoHome') as HTMLAnchorElement
    // submit button
    const logoutButton = qS('#logout_button') as HTMLInputElement
    logoutButton.textContent = '.'
    let counter = 0
    const loggingOut = setInterval(() => {
        if(counter === 3) {
            logoutButton.textContent = '.'
            counter = 0
        }
        logoutButton.textContent += '.'
        counter++
    }, 1000);
    
    // fetch
    const logoutFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify({})})
    const logoutResponse: IResponse = await (await fetcher('/logout', logoutFetchOptions)).json()
    // response
    switch(logoutResponse.status) {
        case 200: 
            // stop interval
            clearInterval(loggingOut)
            logoutButton.textContent = 'logout'
            // reset all data
            resetAllData(gameState)
            // set modal to null
            miscState.setShowModal(null)
            // go to home
            gotoHome.click()
            return
        default: 
            logoutButton.textContent = `error${logoutResponse.status}`
            return
    }
}

export async function joinRoom(formInputs: HTMLFormControlsCollection, roomId: number, miscState: IMiscContext, gameState: IGameContext) {
    // submit buttons
    const joinButton = qS(`#join_button_${roomId}`) as HTMLButtonElement
    const spectateButton = qS(`#spectate_button_${roomId}`) as HTMLButtonElement
    const deleteButton = qS(`#delete_button_${roomId}`) as HTMLButtonElement
    // result message
    const resultMessage: Element = qS(`#result_room_${roomId}`)
    // input value container
    const inputValues: IShiftRoom = {
        action: 'room join',
        room_id: roomId.toString(),
        room_password: null, // from player input
        confirm_room_password: null, // from input value
        display_name: gameState.myPlayerInfo.display_name,
        money_start: null,
        select_character: null
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
            else if(input.id.match(/room_id|room_name|room_password_\d+|player_count|player_max|creator|select_character/)) continue
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
    // set character value
    const selectCharacter = qS(`#select_character_${roomId}`) as HTMLInputElement
    inputValues.select_character = selectCharacter.value
    // matching password
    const roomPassword = qS(`#room_password_${inputValues.room_id}`) as HTMLInputElement
    // password doesnt match
    if(roomPassword.value != '' && roomPassword.value != inputValues.confirm_room_password) {
        gameState.setRoomError(inputValues.room_id)
        setTimeout(() => gameState.setRoomError(null), 2000);
        resultMessage.textContent = translateUI({lang: miscState.language, text: 'wrong password'})
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
            // save access token
            if(joinRoomResponse.data[0].token) {
                localStorage.setItem('accessToken', joinRoomResponse.data[0].token)
                delete joinRoomResponse.data[0].token
            }
            // set joined room
            gameState.setMyCurrentGame(roomId)
            // get room info
            const findRoomData = gameState.roomList.map(v => v.room_id).indexOf(roomId)
            const { room_id, room_name, creator, rules } = gameState.roomList[findRoomData]
            // split rules
            const splitRules = rules.match(/^board: (normal|delta|2_way);dice: (1|2);start: (50000|75000|100000);lose: (-25000|-50000|-75000);mode: (5_laps|7_laps|survive);curse: (5|10|15)$/)
            // remove main rules
            splitRules.splice(0, 1)
            const [board, dice, money_start, money_lose, mode, curse] = [
                splitRules[0], // board
                +splitRules[1], // dice
                +splitRules[2], // money start
                +splitRules[3], // money lose
                splitRules[4], // mode
                +splitRules[5], // curse
            ]
            // set room info & filter to prevent duplicate
            gameState.setGameRoomInfo(rooms => [...rooms, {
                room_id, room_name, creator, 
                board, mode, money_lose, curse, dice
            }].filter((obj1, i, arr) => 
                arr.findLastIndex(obj2 => obj2.room_name == obj1.room_name) === i
            ))
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
            const translateError = translateUI({lang: miscState.language, text: joinRoomResponse.message as any})
            resultMessage.textContent = `${joinRoomResponse.status}: ${translateError || joinRoomResponse.message}`
            // enable submit buttons
            joinButton.textContent = tempButtonText
            joinButton.removeAttribute('disabled')
            spectateButton ? spectateButton.removeAttribute('disabled') : null
            deleteButton ? deleteButton.removeAttribute('disabled') : null
            // set join button type back to BUTTON
            joinButton.type = 'button'
            return
    }
}

export function spectateRoom(roomId: number, gameState: IGameContext) {
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

export async function deleteRoom(formInputs: HTMLFormControlsCollection, roomId: number, gameState: IGameContext) {
    // submit buttons
    const joinButton = qS(`#join_button_${roomId}`) as HTMLButtonElement
    const spectateButton = qS(`#spectate_button_${roomId}`) as HTMLButtonElement
    const deleteButton = qS(`#delete_button_${roomId}`) as HTMLButtonElement
    // input value container
    const inputValues = {
        action: 'room hard delete',
        display_name: gameState.myPlayerInfo.display_name,
        creator: null,
        room_id: null,
        room_name: null
    }
    // get input elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName.match(/INPUT/)) {
            // filter inputs
            if(setInputValue('room_id', input)) inputValues.room_id = input.value.trim().toLowerCase()
            else if(setInputValue('room_name', input)) inputValues.room_name = input.value.trim().toLowerCase()
            else if(setInputValue('creator', input)) inputValues.creator = input.value.trim().toLowerCase()
            // skip other inputs
            else if(input.id.match(/room_password|player_count|player_max|rules|select_character/)) continue
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