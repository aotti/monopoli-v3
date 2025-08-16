import { PointerEvent } from "react";
import { FetchOptionsReturnType, FetchOptionsType, IGameContext, IMiscContext, InputIDType, IPlayer, IResponse, ITranslate, IVerifyTokenOnly, IVerifyTokenPayload, VerifyTokenReturn, VerifyTokenType } from "./types";
import translateUI_data from '../config/translate-ui.json'
import { createHash, randomBytes } from "crypto";
import { JWTPayload, jwtVerify } from "jose";

export function translateUI(params: ITranslate) {
    const { lang, text, lowercase, reverse } = params
    const translated = reverse
                    // if reverse translate = true
                    ? lang == 'indonesia'
                        // dont translate 
                        ? text
                        // translate text to english
                        : translateUI_data['indonesia'][text]
                    // if reverse translate = false
                    : lang == 'indonesia'
                        // translate text to indonesia
                        ? translateUI_data[lang][text]
                        // dont translate 
                        : text
    return lowercase ? translated.toLowerCase() : translated
}

export function questionMark() {
    return `after:font-mono after:content-['?'] after:px-1 after:border after:rounded-full`
}

/**
 * @param el element id/class/attribute 
 * @returns selected HTML element
 */
export function qS(el: string) {
    return document.querySelector(el)
}
/**
 * @param el element id/class/attribute 
 * @returns all selected HTML element
 */
export function qSA(el: string) {
    return document.querySelectorAll(el)
}
/**
 * @param el element tag
 * @returns new html element
 */
export function cE(el: string) {
    return document.createElement(el)
}

export function moneyFormat(number: number) {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        trailingZeroDisplay: 'stripIfInteger',
    })
    // format number to currency
    return formatter.format(number)
}

export function catchError<T=any>(promise: Promise<T>): Promise<[undefined, T] | [Error]> {
    return promise
        .then(data => {
            return [undefined, data] as [undefined, T]
        })
        .catch(error => {
            return [error]
        })
}

export function setInputValue(input: InputIDType, element: HTMLInputElement) {
    return element.id == input && filterInput(element.id, element.value)
}

export function errorLoginRegister(input: string, language: ITranslate['lang']) {
    switch (input) {
        case 'username':
            return `${input}: ${translateUI({lang: language, text: 'length must be 4 to 10 | only letter and number allowed'})}`
        case 'password': 
        case 'confirm_password':
            return `${input}: ${translateUI({lang: language, text: 'length must be 8 to 16 | only letter, number, spaces and symbols .,#-+@ allowed'})}`
        case 'display_name':
            return translateUI({lang: language, text: `name: length must be 4 to 12 | only letter, number and spaces allowed`})
        default: 
            return `unknown input: ${input}`
    }
}

export function errorCreateRoom(input: string, language: ITranslate['lang']) {
    switch(input) {
        case 'room_name':
            return translateUI({lang: language, text: `name: length must be 4 to 12 | only letter, number and spaces allowed`})
        case 'room_password':
            return `${input}: ${translateUI({lang: language, text: 'length must be 3 to 8 | only letter, number, spaces and symbols .,#-+@ allowed'})}`
        case 'room_id':
        case 'select_mode':
        case 'select_board':
        case 'select_dice':
        case 'select_money_start':
        case 'select_money_lose':
        case 'select_curse':
        case 'select_max_player':
        case 'select_character':
            return `${input}: ${translateUI({lang: language, text: 'value doesnt match'})}`
    }
}

/**
 * @returns encrypted text
 */
export function sha256(text: string) {
    const hash = createHash('sha256').update(text).digest('hex')
    return hash
}

export function fetcherOptions<T extends FetchOptionsType>(args: T): FetchOptionsReturnType<T>
export function fetcherOptions(args: FetchOptionsType) {
    const { method, credentials, noCache, domain } = args
    // get access token
    const accessToken = domain ? null : localStorage.getItem('accessToken')
    // get identifier
    const getIdentifier = domain ? null : localStorage.getItem('identifier')
    // headers
    const headers = setCustomHeaders()
    // cache
    const cache = noCache ? { cache: 'no-store' } : {}
    // method
    switch(method) {
        case 'GET': 
            if(credentials) 
                return { method: method, headers: headers, ...cache }
            // public
            return { method: method, ...cache }
        case 'POST': 
        case 'PUT': 
        case 'PATCH': 
        case 'DELETE': 
            return { method: method, headers: headers, body: args.body }
    }

    function setCustomHeaders() {
        // with authorization header
        if(credentials) {
            // is method GET
            if(method === 'GET') {
                // fetching custom domain
                if(domain) {
                    return { 
                        'content-type': 'application/json',
                        'credentials': `include`, 
                    }
                }
                // fetching same origin
                else {
                    return { 
                        'authorization': `Bearer ${accessToken}`,
                        'X-IDENTIFIER': getIdentifier 
                    }
                }
            }
            // is method POST
            else if(method === 'POST') {
                // fetching custom domain
                if(domain) {
                    return { 
                        'content-type': 'application/json',
                        'authorization': process.env.MINIGAME_AUTH_TOKEN,
                        'credentials': `include`, 
                    }
                }
                // fetching same origin
                else {
                    return { 
                        'authorization': `Bearer ${accessToken}`,
                        'X-IDENTIFIER': getIdentifier 
                    }
                }
            }
            // method PUT, DELETE
            else {
                return { 
                    'content-type': 'application/json',
                    'authorization': `Bearer ${accessToken}`,
                    'X-IDENTIFIER': getIdentifier 
                }
            }
        }
        // without authorization header
        else {
            // for POST register/login
            return { 
                'content-type': 'application/json',
                'X-IDENTIFIER': getIdentifier 
            }
        }
    }
}

export function fetcher(endpoint: string, options: RequestInit, customEndpoint?: boolean) {
    // fetch with custom endpoint
    if(customEndpoint) {
        const url = endpoint
        return fetch(url, options)
    }
    // fetch same origin
    else {
        const host = `${window.location.origin}/api`
        const url = host + endpoint
        return fetch(url, options)
    }
}

export function resetAllData(gameState: IGameContext) {
    // remove all local storage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('onlinePlayers')
    localStorage.removeItem('playerData')
    localStorage.removeItem('cityOwnedList')
    localStorage.removeItem('playerCoins')
    localStorage.removeItem('playerShopItems')
    localStorage.removeItem('dailyStatus')
    localStorage.removeItem('dailyHistory')
    // remove player info
    gameState.setMyPlayerInfo({
        display_name: 'guest',
        game_played: 0,
        worst_money_lost: 0,
        avatar: null
    })
    // add guest mode
    gameState.setGuestMode(true)
    // reset online players
    gameState.setOnlinePlayers([])
    // remove room list
    gameState.setRoomList([])
    // remove game stage
    gameState.setGameStages('prepare')
    // remove player coins
    gameState.setMyCoins(0)
    // remove player shop items
    gameState.setMyShopItems(null)
    // remove daily states
    gameState.setDailyStatus(null)
    gameState.setLastDailyStatus(null)
    gameState.setDailyHistory(null)
}
/**
 * @returns [null, data] or [error]
 */
export function verifyAccessToken(args: IVerifyTokenOnly): Promise<[null, boolean] | [Error]>
export function verifyAccessToken(args: IVerifyTokenPayload): Promise<[null, IPlayer & JWTPayload] | [Error]>
export async function verifyAccessToken(args: VerifyTokenType) {
    // verify the token
    const encodedSecret = new TextEncoder().encode(args.secret)
    const [error, data] = await catchError(jwtVerify(args.token, encodedSecret))
    // result
    if(error) return [error]
    switch(args.action) {
        case 'verify-only': return [null, true]
        case 'verify-payload': return [null, data.payload]
    }
}

export function shuffle(array: any[]) {
    let currentIndex = array.length,  
        randomIndex;
  
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
  
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

/**
 * @description generate id to replace browser tabId, 
 * only re-generate on logout
 */
export function generateIdentifier(isLogout?: boolean) {
    const getIdentifier = localStorage.getItem('identifier')
    // identifier not exist, generate new one
    if(!getIdentifier || isLogout) {
        const randomId = randomBytes(8).toString('hex')
        localStorage.setItem('identifier', randomId)
    }
}

/* LONG FUNCTIONS == LONG FUNCTIONS == LONG FUNCTIONS == LONG FUNCTIONS */
/* LONG FUNCTIONS == LONG FUNCTIONS == LONG FUNCTIONS == LONG FUNCTIONS */

export function filterInput(input: InputIDType, value: string) {
    // username = 4~10 | password = 8~16 | display_name = 4~12
    switch(input) {
        case 'identifier':
            return value ? value.match(/^[a-zA-Z0-9]+$/) : null
        case 'language':
            return value ? value.match(/english$|indonesia$/) : null
        case 'description':
            return value ? value.match(/^[a-zA-Z0-9\s.,#\-+=@?!]{4,}$/) : null

        // ====== PLAYER TYPE ======
        // filter uuid
        case 'uuid': 
            const uuidv4_regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
            return value ? value.match(uuidv4_regex) : null
        // letter & number
        case 'username': 
            return value ? value.match(/^[a-zA-Z0-9]{4,10}$/) : null
        // letter, number, whitespace, symbol (.,#-+@) 
        case 'password': 
        case 'confirm_password':
            return value ? value.match(/^[a-zA-Z0-9\s.,#\-+@]{8,72}$/) : null
        // letter, number, whitespace
        case 'creator':
        case 'room_name': // create room 'name'
        case 'display_name': 
            return value ? value.match(/^[a-zA-Z0-9\s]{4,12}$/) : null
        // img url must have monopoli-profiles
        case 'avatar': 
            return value ? value.match(/monopoli-profiles/) : null

        // ====== CHAT TYPE ======
        // websocket message channel
        case 'channel': 
            return value ? value.match(/monopoli-roomlist$|monopoli-gameroom-\d{1,3}$/) : null
        // message text can have letter, number, whitespace, symbol (.,#-+@)
        case 'message_text': 
            return value ? value.match(/^[a-zA-Z0-9\s.,#\-+=@?!]{1,60}$/) : null
        // time of chat
        case 'message_time': 
            return value ? value.match(/^[\d{2}:\d{2}]{4,5}$/) : null

        // ====== CREATE ROOM TYPE ======
        case 'room_id': 
            return value ? value.match(/\d+/) : null
        case 'room_password':
            const optionalPassword = value == '' || value === null || value.match(/^[a-zA-Z0-9\s.,#\-+@]{3,8}$/) ? true : false
            return optionalPassword
        case 'select_mode':
            return value ? value.match(/^survive$|^5_laps$|^7_laps$/) : null
        case 'select_board':
            return value ? value.match(/^normal$|^twoway$/i) : null
        case 'select_dice':
            return value ? value.match(/^1$|^2$/) : null
        case 'money_start':
        case 'select_money_start':
            return value ? value.match(/^50000$|^75000$|^100000$/) : null
        case 'select_money_lose':
            return value ? value.match(/^25000$|^50000$|^75000$/) : null
        case 'select_curse':
            return value ? value.match(/^5$|^10$|^15$/) : null
        case 'select_max_player':
            return value ? value.match(/^2$|^3$|^4$/) : null
        case 'select_character':
            return value ? value.match(/lvu1slpqdkmigp40.public.blob.vercel-storage.com\/characters/) : null

        // ====== JOIN ROOM TYPE ======
        case 'rules': 
            return value ? value.match(/^board: (normal|twoway);dice: (1|2);start: (50000|75000|100000);lose: (-25000|-50000|-75000);mode: (5_laps|7_laps|survive);curse: (5|10|15)$/) : null
        
        // ====== ROLL TURN TYPE ======
        case 'rolled_number': 
            return value ? value.match(/^[\d]{3}$/) : null

        // ====== ROLL DICE TYPE ======
        case 'rolled_dice': 
            return value ? value.match(/^[\d]{1,2}$/) : null
        case 'rng':
            return value ? value.match(/^[\d]{1,2},[\d]{1,2}$|^100,[\d]{1,2}$|^[\d]{1,2},100$/) : null
        case 'special_card': 
        case 'target_special_card': 
            const optionalSpecialCard = value === null || value.match(/used\W.*/) ? true : false
            return optionalSpecialCard

        // ====== DECLARE ATTACK CITY TYPE ======
        case 'target_city':
        case 'target_city_property':
        case 'target_city_left':
        case 'target_city_owner':
        case 'target_card':
        case 'attacker_name':
        case 'attacker_city':
            const optionalAttackCity = value === null || value.match(/^[a-zA-Z0-9,;\-*\s]+$/) ? true : false
            return optionalAttackCity
        case 'attack_type':
            return value ? value.match(/^[a-z_]+$/) : null

        // ====== TURN END TYPE ======
        case 'pos': 
            return value ? value.match(/^[1-9]$|^[1-2][x]$|^1[0-9]$|^1[2-4][x]$|^2[0-4]$|^24[x]$/) : null
        case 'lap': 
            return value ? value.match(/^[0-9]{1,2}$/) : null
        case 'history': 
            // set regex
            const [rolledDiceRegex, buyCityRegex, payTaxRegex, getCardRegex, getArrestedRegex, parkingRegex, cursedRegex, specialCityRegex, specialCardRegex, buffRegex, debuffRegex, minigameRegex] = [
                'rolled_dice: ([0-9]|1[0-2])',
                'buy_city: .* \\(\\w+\\)|buy_city: none',
                'pay_tax: .* to \\w+',
                'get_card: .* \\(chance \\w\\)|get_card: .* \\(community \\w\\)',
                'get_arrested: lemao 😂',
                'parking: tile \\d+ 😎',
                'cursed: .* 💀',
                'special_city: .* 💸',
                'special_card: .* 💳',
                'get_buff: .* 🙏',
                'get_debuff: .* 🙏',
                'mini_game: Scattergories with oomfs 🥳',
            ]
            const historyRegex = new RegExp(`${rolledDiceRegex}|${getCardRegex}|${buyCityRegex}|${payTaxRegex}|${getArrestedRegex}|${parkingRegex}|${cursedRegex}|${specialCityRegex}|${specialCardRegex}|${buffRegex}|${debuffRegex}|${minigameRegex}`, 'g')
            // set length
            // used to verify the regex, if client send 2 history 
            // but only match 1, something is wrong 
            const historyLength = value ? value.split(';').length : 0
            // match regex
            const isValueMatch = value.match(historyRegex) && value.match(historyRegex).length === historyLength
            return isValueMatch
        case 'money': 
        case 'event_money':
        case 'sell_city_price':
            return value ? value.match(/^[\d]+$|^-[\d]+$/) : null
        case 'city': 
        case 'card':
        case 'take_money':
        case 'buff':
        case 'debuff':
            const optionalBuyCity = value === null || value.match(/^[a-zA-Z0-9,;\-*_%\s]+$/) ? true : false
            return optionalBuyCity
        case 'is_lose': 
            return typeof value == 'boolean' ? true : false
        case 'sell_city_name':
        case 'city_left':
            const optionalSellCity = value === null || value == '' || value.match(/^[a-zA-Z0-9,;\-*\s]+$/) ? true : false
            return optionalSellCity
        case 'tax_owner': 
        case 'tax_visitor': 
            const optionalTax = value === null || value.match(/^[a-zA-Z0-9\s]+$/) ? true : false
            return optionalTax
        case 'prison': 
            return value ? value.match(/^[\d]+$|^-[\d]+$/) : null

        // ====== GAME OVER TYPE ======
        case 'all_player_stats': 
            const splitValue = value.split(';')
            for(let sv of splitValue)
                if(!sv.match(/\w+,\d+|\w+,-\d+/)) return null
            return value 
            
        // ====== SHOP TYPE ======
        case 'item_type':
            return value ? value.match(/buff$|special_card$/) : null
        case 'item_name':
            return value ? value.match(/coin$|nerf tax$|anti prison$|gaming dice$|dice controller$|the shifter$|attack city$|upgrade city$|curse reverser$|reduce price$|the void$|the twond$/) : null
        
        // ====== DAILY TYPE ======
        case 'week':
            return value ? value.match(/1$|2$/) : null
        // ====== MINIGAME TYPE ======
        case 'minigame_answer':
            return value ? value.match(/^[a-z\s]+$/) : null
        case 'minigame_chance':
            return value ? value.match(/^[0-9]+$/) : null
        case 'minigame_data':
            // is array
            if(Array.isArray(value)) {
                // loop array, match element with regex
                const minigameData = value as string[]
                for(let data of minigameData) {
                    // display name, answer, status, money
                    const [display_name, answer, status, event_money] = data.split(',')
                    // value not match regex
                    switch(true) {
                        case !display_name.match(/^[a-zA-Z0-9\s]{4,12}$/):
                        case !answer.match(/^[a-z\s]+$/):
                        case !status.match(/correct$|wrong$|unknown$|null$/):
                        case !event_money.match(/^[0-9]{4,5}$/):
                            return null
                    }
                }
                // value match regex
                return minigameData
            }
            // not array
            return null
        // ====== MISC TYPE ======
        case 'user_agent': 
            return value ? value.match(/firefox|chrome|safari|edg|opera/i) : null
    }
}

/**
 * @description only used for checking access token on auto login
 */
export async function checkAccessToken(miscState: IMiscContext, gameState: IGameContext) {
    // get access token
    const accessToken = localStorage.getItem('accessToken')
    // get online players
    const onlinePlayers = localStorage.getItem('onlinePlayers')
    // verify access token
    const [error, data] = await verifyAccessToken({action: 'verify-payload', secret: miscState.secret, token: accessToken})    
    // access token expired / not exist
    if(error || !accessToken) {
        // renew with refresh token
        const renewFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify('')})
        const renewResponse: IResponse = await (await fetcher('/login', renewFetchOptions)).json()
        // response
        switch(renewResponse.status) {
            case 200: 
                const {token, player, onlinePlayers, playerCoins, playerShopItems, dailyStatus, lastDailyStatus, dailyHistory} = renewResponse.data[0]
                // save access token
                localStorage.setItem('accessToken', token)
                // set my player data
                gameState.setMyPlayerInfo(player)
                // save player data to localStorage to make sure its updated
                // cuz data from jwt is not (game_played & worst_money)
                localStorage.setItem('playerData', JSON.stringify(player))
                // set online players
                gameState.setOnlinePlayers(onlinePlayers)
                localStorage.setItem('onlinePlayers', JSON.stringify(onlinePlayers))
                // update daily status
                localStorage.setItem('dailyStatus', dailyStatus)
                gameState.setDailyStatus(dailyStatus)
                // set last daily status
                gameState.setLastDailyStatus(lastDailyStatus)
                // update daily history
                localStorage.setItem('dailyHistory', JSON.stringify(dailyHistory))
                gameState.setDailyHistory(dailyHistory)
                // set player coins
                localStorage.setItem('playerCoins', JSON.stringify(playerCoins))
                gameState.setMyCoins(playerCoins)
                // update my shop items
                localStorage.setItem('playerShopItems', JSON.stringify(playerShopItems))
                gameState.setMyShopItems(playerShopItems)
                // remove guest mode
                gameState.setGuestMode(false)
                break
            default: 
                // set dummy myPlayerInfo
                gameState.setMyPlayerInfo({
                    display_name: 'guest',
                    game_played: 0,
                    worst_money_lost: 0,
                    avatar: null
                })
                // remove local storages
                localStorage.removeItem('accessToken')
                localStorage.removeItem('onlinePlayers')
                break
        }
        miscState.setIsLoading(false)
    }
    // auto login access token
    else {
        // check local storage
        // set my player info if local storage exist
        const getPlayerData = localStorage.getItem('playerData')
        if(getPlayerData) {
            gameState.setMyPlayerInfo(JSON.parse(getPlayerData))
        }
        else {
            // set my player info
            gameState.setMyPlayerInfo({
                display_name: data.display_name,
                game_played: data.game_played,
                worst_money_lost: data.worst_money_lost,
                avatar: data.avatar
            })
        }
        // set online players
        gameState.setOnlinePlayers(JSON.parse(onlinePlayers))
        // remove guest mode
        gameState.setGuestMode(false)
        miscState.setIsLoading(false)
    }
}

/**
 * @description hover event for desktop & mobile
 */
export function applyTooltipEvent() {
    qSA('[data-tooltip]').forEach((el: HTMLElement) => {
        // mouse event
        el.onpointerover = ev => applyTooltip(ev as any)
        el.onpointerout = ev => applyTooltip(ev as any)
        // touch event
        el.ontouchstart = ev => applyTooltip(ev as any)
        el.ontouchend = ev => applyTooltip(ev as any)
    })
}

export function applyTooltip(ev: PointerEvent<HTMLElement>) {
    // get element position
    const elementRects = ev.currentTarget.getBoundingClientRect()
    const [top, left, right, bottom] = [elementRects.top, elementRects.left, elementRects.right, elementRects.bottom]
    // window size
    const [winWidth, winHeight] = [window.innerWidth, window.innerHeight]
    // element pos
    // winWidth/winHeight are used to check if element close to the wall
    // right + bottom values would be > 1000 if element is on far right/bottom
    const elementPos = {
        top: +top.toFixed(),
        left: +left.toFixed(),
        right: +(winWidth - right).toFixed(),
        bottom: +(winHeight - bottom).toFixed()
    }
    // check text length
    const text = ev.currentTarget.dataset['tooltip']
    // text is undefined, return
    if(!text) return
    switch(true) {
        // 27 = 2 rows (round to 30)
        case text.length <= 30 * 1: applyTooltipStyle(2); break
        case text.length <= 30 * 2: applyTooltipStyle(4); break
        case text.length <= 30 * 3: applyTooltipStyle(6); break
        // 8 rows
        case text.length <= 30 * 4: applyTooltipStyle(8); break
    }

    function applyTooltipStyle(rows: number) {
        // check Y axis first
        // ### LALU CEK X AXIS, LALU CEK JUMLAH ROWS
        // ### JIKA ROWS <= 2, MAKA PILIH KANAN/KIRI, SELAIN ITU ATAS/BAWAH 
        switch(true) {
            case elementPos.bottom >= 190:
                // place left / right if rows == 2
                if(elementPos.right >= 190 && rows == 2)
                    ['tooltip-right-50', 'tooltip-right-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                else if(elementPos.left >= 190 && rows == 2) 
                    ['tooltip-left-50', 'tooltip-left-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                // place bottom if rows > 2
                else {
                    // bottom | bottom-lg
                    ['tooltip-bottom', 'tooltip-bottom-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                }
                return
            case elementPos.top >= 190:
                // place left / right if rows == 2
                if(elementPos.right >= 190 && rows == 2)
                    ['tooltip-right-50', 'tooltip-right-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                else if(elementPos.left >= 190 && rows == 2) 
                    ['tooltip-left-50', 'tooltip-left-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                // place top if rows > 2
                else {
                    // top-25 | top-50 | top-75 | top-100
                    if(rows === 2) ['tooltip-top-25', 'tooltip-top-25-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                    if(rows === 4) ['tooltip-top-50', 'tooltip-top-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                    if(rows === 6) ['tooltip-top-75', 'tooltip-top-75-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                    if(rows === 8) ['tooltip-top-100', 'tooltip-top-100-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                }
                return
            default: 
                // place left / right if rows == 2
                if(elementPos.right >= 190 && rows == 2)
                    ['tooltip-right-50', 'tooltip-right-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                else if(elementPos.left >= 190 && rows == 2) 
                    ['tooltip-left-50', 'tooltip-left-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                // bottom | bottom-lg
                else ['tooltip-bottom', 'tooltip-bottom-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                return
        }
    }
}