import { FormEvent, FunctionComponent } from "react"
import { errorCreateRoom, fetcher, fetcherOptions, qS, resetAllData, setInputValue, translateUI } from "../../../helper/helper"
import { IAnimate, ICreateRoom, IGameContext, IMiscContext, IPlayer, IResponse, IShiftRoom } from "../../../helper/types"
import { startAnimation } from "../../game/components/board/RollNumber"
import anime from "animejs"

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
            // set last daily status
            gameState.setLastDailyStatus(getRoomResponse.data[0].lastDailyStatus)
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

export async function viewRanking(miscState: IMiscContext, gameState: IGameContext, refresh?: boolean) {
    // result message
    const resultMessageRanking = qS('#result_message_ranking')
    const rankingLastUpdated = qS('#last_updated_ranking')
    // loading
    gameState.setRankingInfo([])
    // get ranking from localStorage if exist
    const getRankingStale = localStorage.getItem('rankingInfo')
    const [lastRankingUpdate, rankingStaleData] = getRankingStale ? getRankingStale.split(';') : [null, null]
    if(!refresh && getRankingStale) {
        rankingLastUpdated.textContent = `${new Date(+lastRankingUpdate * 1000)
                                        .toLocaleString('id-ID', {dateStyle: 'short', timeStyle: 'short'})}`
        gameState.setRankingInfo(JSON.parse(rankingStaleData))
        return
    }
    // fetch
    const getRankingFetchOptions = fetcherOptions({method: 'GET', credentials: true, noCache: true})
    const getRankingResponse: IResponse = await (await fetcher('/player/ranking', getRankingFetchOptions)).json()
    // response
    switch(getRankingResponse.status) {
        case 200:
            const rankingData: IGameContext['rankingInfo'] = getRankingResponse.data
            // no data found
            if(!rankingData || rankingData.length === 0) {
                return resultMessageRanking.textContent = 'no ranking 😢'
            }
            // sort ranking
            const sortRankingInfo = []
            const worstMoneyLoses: number[] = rankingData.map(v => v.worst_money_lost).sort((a, b) => a - b)
            for(let i in worstMoneyLoses) {
                const findPlayer = rankingData.map(v => v.worst_money_lost).indexOf(worstMoneyLoses[i])
                sortRankingInfo.push(rankingData[findPlayer])
            }
            // unix timestamp
            const lastUpdated = Math.floor(Date.now() / 1000)
            // save to localStorage
            localStorage.setItem('rankingInfo', `${lastUpdated};${JSON.stringify(sortRankingInfo)}`)
            // set ranking
            rankingLastUpdated.textContent = `${new Date(lastUpdated * 1000)
                                            .toLocaleString('ja-JA', {dateStyle: 'short', timeStyle: 'short'})}`
            gameState.setRankingInfo(sortRankingInfo)
            return
        default:
            const guestModeError = gameState.guestMode ? `❌ ${getRankingResponse.status}: ${translateUI({lang: miscState.language, text: 'login required'})}` : null
            resultMessageRanking.textContent = guestModeError ||`❌ ${getRankingResponse.status}: ${getRankingResponse.message}`
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
    avatarImg.alt = 'Loading..'
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
            avatarImg.alt = 'avatar'
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
            // home button
            const gotoHome = qS('#gotoHome') as HTMLAnchorElement
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
    // result message
    const resultMessage: Element = qS(`#result_room_${roomId}`)
    // input value container
    const inputValues: IShiftRoom = {
        action: 'room join',
        room_id: roomId.toString(),
        room_password: null, // from player input
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
    const getRoomInfo = gameState.roomList.map(v => v.room_id == roomId ? v : null).filter(i => i)[0]
    const confirmRoomPassword = getRoomInfo.room_password
    // password doesnt match
    if(roomPassword.value != '' && roomPassword.value != confirmRoomPassword) {
        gameState.setRoomError(inputValues.room_id)
        setTimeout(() => gameState.setRoomError(null), 2000);
        resultMessage.textContent = translateUI({lang: miscState.language, text: 'wrong password'})
        return
    }
    inputValues.room_password = roomPassword.value == '' ? null : roomPassword.value
    // submit button loading
    const tempButtonText = joinButton.textContent
    joinButton.textContent = 'Loading'
    joinButton.disabled = true
    // disable all buttons
    miscState.setDisableButtons('roomlist')
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
            // reset disable buttons
            miscState.setDisableButtons(null)
            // set joined room
            gameState.setMyCurrentGame(roomId)
            // get room info
            const findRoomData = gameState.roomList.map(v => v.room_id).indexOf(roomId)
            const { room_id, room_name, creator, rules } = gameState.roomList[findRoomData]
            // split rules
            const splitRules = rules.match(/^board: (normal|twoway);dice: (1|2);start: (50000|75000|100000);lose: (-25000|-50000|-75000);mode: (5_laps|7_laps|survive);curse: (5|10|15)$/)
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
            // set loading screen
            miscState.setIsLoading(true)
            // enable submit buttons
            joinButton.textContent = tempButtonText
            joinButton.removeAttribute('disabled')
            return
        default: 
            // reset disable buttons
            miscState.setDisableButtons(null)
            // error message
            gameState.setRoomError(inputValues.room_id)
            setTimeout(() => gameState.setRoomError(null), 3000);
            const translateError = translateUI({lang: miscState.language, text: joinRoomResponse.message as any})
            resultMessage.textContent = `${joinRoomResponse.status}: ${translateError || joinRoomResponse.message}`
            // enable submit buttons
            joinButton.textContent = tempButtonText
            joinButton.removeAttribute('disabled')
            // set join button type back to BUTTON
            joinButton.type = 'button'
            return
    }
}

export function spectateRoom(roomId: number, miscState: IMiscContext, gameState: IGameContext) {
    // disable all buttons
    miscState.setDisableButtons('roomlist')
    // set player as spectator
    gameState.setSpectator(true)
    // move to game room
    const link = qS(`#gotoGame${roomId}`) as HTMLAnchorElement
    link.click()
    // set loading screen
    miscState.setIsLoading(true)
    // reset disable buttons
    setTimeout(() => miscState.setDisableButtons(null), 1500)
}

export async function deleteRoom(formInputs: HTMLFormControlsCollection, roomId: number, miscState: IMiscContext, gameState: IGameContext) {
    // submit buttons
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
    // disable all buttons
    miscState.setDisableButtons('roomlist')
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
            // reset disable buttons
            miscState.setDisableButtons(null)
            // enable submit buttons
            deleteButton.textContent = tempButtonText
            deleteButton.removeAttribute('disabled')
            return
        default: 
            // reset disable buttons
            miscState.setDisableButtons(null)
            deleteButton.classList.add('text-red-600')
            deleteButton.textContent = `err${deleteRoomResponse.status}`
            // enable submit buttons
            deleteButton.removeAttribute('disabled')
            return
    }
}

export async function buyShopitem(ev: FormEvent<HTMLFormElement>, itemData, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()

    // result message
    const resultMessage = qS('#result_shop')

    interface IItemData {name: string, type: string, description: string, price: number}
    const {name, type, description, price} = itemData as IItemData
    // buy item data
    const buyItemData = {
        display_name: gameState.myPlayerInfo.display_name,
        item_type: type,
        item_name: name,
    }
    // warning
    const buyItemWarning = `"${description}"\nare you sure wanna buy this item?`
    if(!confirm(buyItemWarning)) return
    // fetch
    const buyItemFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(buyItemData)})
    const buyItemResponse: IResponse = await (await fetcher('/shop', buyItemFetchOptions)).json()
    // response
    switch(buyItemResponse.status) {
        case 200:
            const {token, coinsLeft, playerShopItems} = buyItemResponse.data[0]
            // save access token
            if(token) localStorage.setItem('accessToken', token)
            // update my coins
            localStorage.setItem('playerCoins', JSON.stringify(coinsLeft))
            gameState.setMyCoins(coinsLeft)
            // update my shop items
            localStorage.setItem('playerShopItems', JSON.stringify(playerShopItems))
            gameState.setMyShopItems(playerShopItems)
            // result message
            resultMessage.textContent = translateUI({lang: miscState.language, text: 'item bought'})
            // display notif
            resultMessage.classList.remove('hidden')
            setTimeout(() => resultMessage.classList.add('hidden'), 3000);
            return
        default:
            // result message
            const translateError = translateUI({lang: miscState.language, text: buyItemResponse.message as any})
            resultMessage.textContent = `${buyItemResponse.status}: ${translateError || buyItemResponse.message}`
            // display notif
            resultMessage.classList.remove('hidden')
            setTimeout(() => resultMessage.classList.add('hidden'), 3000);
            return
    }
}
    
export async function claimDaily(ev: FormEvent<HTMLFormElement>, rewardData: any, miscState: IMiscContext, gameState: IGameContext) {
    ev ? ev.preventDefault() : null
    
    const chatInput = qS('#message_text') as HTMLInputElement

    const today = new Date().toLocaleString('en', {weekday: 'long', timeZone: 'Asia/Jakarta'})
    const {week, day, name, type, items} = rewardData
    // result message
    const resultMessage = qS('#result_daily')
    // claim button
    const claimButton = qS(`#daily_claim_button_${day}`) as HTMLButtonElement
    // if player click other day reward OR the reward has been claimed, only play animation
    if(day !== today || gameState.dailyStatus === 'claimed') {
        // start animation
        const test = await claimAnimation()
        chatInput.value = test as any
        return `${today} daily reward has been claimed`
    }
    // if type is pack, start roll animation
    let chosenPackItem: string = null
    if(type == 'pack') {
        const rollPack = qS('#roll_pack')
        rollPack.classList.toggle('flex')
        rollPack.classList.toggle('hidden')
        startAnimation(items, miscState, gameState)
        chosenPackItem = qS('.roll-result').textContent
        setTimeout(() => {
            rollPack.classList.toggle('flex')
            rollPack.classList.toggle('hidden')
        }, 5000);
    }

    // claim data
    const rewardValue = {
        display_name: gameState.myPlayerInfo.display_name,
        week: week.toString(),
        item_name: type === 'coin' ? 'coin' : chosenPackItem,
    }
    // loading claim button
    let loadingIncrement = 3
    claimButton ? claimButton.disabled = true : null
    const loadingClaimInterval = setInterval(() => {
        // only set loading if claim button exist
        if(claimButton) {
            if(loadingIncrement === 3) {
                claimButton.textContent = '.'
                loadingIncrement = 0
            }
            else if(loadingIncrement < 3) {
                claimButton.textContent += '.'
                loadingIncrement++
            }
        }
    }, 1000);

    chatInput.value = 'fetching reward..'
    // fetch
    const claimDailyFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(rewardValue)})
    const claimDailyResponse: IResponse = await (await fetcher('/player/daily', claimDailyFetchOptions)).json()
    // response
    switch(claimDailyResponse.status) {
        case 200: 
            // stop loading claim
            chatInput.value = ''
            clearInterval(loadingClaimInterval)
            // destruct data
            const {token, dailyStatus, dailyHistory, playerCoins, playerShopItems} = claimDailyResponse.data[0]
            // save access token
            if(token) localStorage.setItem('accessToken', token)
            // update daily status
            localStorage.setItem('dailyStatus', dailyStatus)
            gameState.setDailyStatus(dailyStatus)
            // update daily history
            localStorage.setItem('dailyHistory', JSON.stringify(dailyHistory))
            gameState.setDailyHistory(dailyHistory)
            // update player coins if exist
            if(playerCoins) {
                // set player coins
                localStorage.setItem('playerCoins', JSON.stringify(playerCoins))
                gameState.setMyCoins(playerCoins)
            }
            // update my shop items
            if(playerShopItems) {
                // update my shop items
                localStorage.setItem('playerShopItems', JSON.stringify(playerShopItems))
                gameState.setMyShopItems(playerShopItems)
            }
            // start animation and sound
            const soundClaimReward = qS('#sound_claim_reward') as HTMLAudioElement
            soundClaimReward.play()
            await claimAnimation()
            return `${today} daily reward has been claimed`
        default: 
            // stop loading claim
            clearInterval(loadingClaimInterval)
            claimButton ? claimButton.textContent = 'claim' : null
            // result message, only if element exist
            if(resultMessage) {
                resultMessage.textContent = `${claimDailyResponse.status}: ${claimDailyResponse.message}`
                // display notif
                resultMessage.classList.remove('hidden')
                setTimeout(() => resultMessage.classList.add('hidden'), 3000);
            }
            return `${claimDailyResponse.status}: ${claimDailyResponse.message}`
    }
}

export function claimAnimation() {
    return new Promise(resolve => {
        const chatInput = qS('#message_text') as HTMLInputElement

        const animate: FunctionComponent<IAnimate> = anime
        const today = new Date().toLocaleString('en', {weekday: 'long', timeZone: 'Asia/Jakarta'})
        const rewardImg = qS(`#reward_${today}`) as HTMLImageElement
        const rotateValue = rewardImg.style.transform.match('360deg') ? 0 : 360

        chatInput.value = 'start animation..'
        animate({
            targets: rewardImg,
            // Properti yang dianimasikan
            translateY: [
                { value: -10, duration: 300, easing: 'easeOutQuad' }, // Lompat ke atas (y negatif)
                { value: 0, duration: 600, easing: 'easeOutBounce', delay: 100 } // Jatuh kembali (y nol)
            ],
            // spin animation
            rotate: [
                {value: rotateValue, duration: 500, easing: 'linear'},
            ],
            // Animasi tambahan untuk efek squish (optional, tapi membuat lebih hidup)
            scaleY: [
                { value: 0.6, duration: 100, easing: 'easeOutQuad' }, // Sedikit memendek sebelum melompat
                { value: 1.2, duration: 200, easing: 'easeOutQuad' }, // Sedikit memanjang saat di udara
                { value: 1, duration: 300, easing: 'easeOutBounce', delay: 200 } // Kembali normal saat mendarat
            ]
        })
        setTimeout(() => {
            chatInput.value = 'end animation..'
            resolve('done')
        }, 1000);
    })
} 