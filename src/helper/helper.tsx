import { PointerEvent } from "react";
import { FetchOptionsReturnType, FetchOptionsType, IGameContext, IMiscContext, IPlayer, IResponse, ITranslate, IVerifyTokenOnly, IVerifyTokenPayload, VerifyTokenReturn, VerifyTokenType } from "./types";
import translateUI_data from '../config/translate-ui.json'
import { createHash } from "crypto";
import { JWTPayload, jwtVerify } from "jose";

export function translateUI(params: ITranslate) {
    const { lang, text, lowercase } = params
    const translated = lang == 'indonesia' ? translateUI_data[lang][text] : text
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

type InputType = 'uuid'|'username'|'password'|'confirm_password'|'display_name'|'avatar'|'channel'|'message_text'|'message_time'
export function setInputValue(input: InputType, element: HTMLInputElement) {
    return element.id == input && filterInput(element.id, element.value)
}

export function filterInput(input: InputType, value: string) {
    // username = 4~10 | password = 8~16 | display_name = 4~12
    switch(input) {
        // filter uuid
        case 'uuid': 
            const uuidv4_regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
            return value.match(uuidv4_regex)
        // letter & number
        case 'username': 
            return value.match(/^[a-zA-Z0-9]{4,10}$/)
        // letter, number, whitespace, symbol (.,#-+@) 
        case 'password': 
        case 'confirm_password':
            return value.match(/^[a-zA-Z0-9\s.,#\-+@]{8,16}$/)
        // letter, number, whitespace
        case 'display_name': 
            return value.match(/^[a-zA-Z0-9\s]{4,12}$/)
        // must have monopoli-profiles url
        case 'avatar': 
            return value.match(/monopoli-profiles/)
        // websocket message channel
        case 'channel': 
            return value.match(/monopoli-roomlist|monopoli-gameroom-\d{1,3}$/)
        // message text can have letter, number, whitespace, symbol (.,#-+@)
        case 'message_text': 
            return value.match(/^[a-zA-Z0-9\s.,#\-+=@?!]{1,60}$/)
        // time of chat
        case 'message_time': 
            return value.match(/^[\d{2}:\d{2}]{4,5}$/)
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
    const { method, credentials } = args
    // get access token
    const accessToken = localStorage.getItem('accessToken')
    // headers
    const headers = credentials 
                    // auth
                    ? method == 'GET'
                        // GET will only have authorization
                        ? { 'authorization': `Bearer ${accessToken}` }
                        // POST, PUT, DELETE with auth
                        : { 'content-type': 'application/json',
                            'authorization': `Bearer ${accessToken}` }
                    // POST, PUT, DELETE register/login
                    : { 'content-type': 'application/json' }
    switch(method) {
        case 'GET': 
            if(credentials) 
                return { method: method, headers: headers }
            // public
            return { method: method }
        case 'POST': return { method: method, headers: headers, body: args.body }
        case 'PUT': return { method: method, headers: headers, body: args.body }
        case 'DELETE': return { method: method, headers: headers, body: args.body }
    }
}

export function fetcher(endpoint: string, options: RequestInit) {
    const host = `${window.location.origin}/api`
    const url = host + endpoint
    return fetch(url, options)
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

/* LONG FUNCTIONS == LONG FUNCTIONS == LONG FUNCTIONS == LONG FUNCTIONS */
/* LONG FUNCTIONS == LONG FUNCTIONS == LONG FUNCTIONS == LONG FUNCTIONS */
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
                // save access token
                localStorage.setItem('accessToken', renewResponse.data[0].token)
                delete renewResponse.data[0].token
                // set my player data
                gameState.setMyPlayerInfo(renewResponse.data[0].player)
                // set online players
                gameState.setOnlinePlayers(renewResponse.data[0].onlinePlayers)
                localStorage.setItem('onlinePlayers', JSON.stringify(renewResponse.data[0].onlinePlayers))
                break
            default: 
                // remove local storages
                localStorage.removeItem('accessToken')
                localStorage.removeItem('onlinePlayers')
                break
        }
        miscState.setIsLoading(false)
    }
    // auto login access token
    else {
        // set my player info
        gameState.setMyPlayerInfo({
            display_name: data.display_name,
            game_played: data.game_played,
            worst_money_lost: data.worst_money_lost,
            avatar: data.avatar
        })
        // set online players
        gameState.setOnlinePlayers(JSON.parse(onlinePlayers))
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
            case elementPos.top >= 200:
                // place left / right if rows == 2
                if(elementPos.right >= 200 && rows == 2)
                    ['tooltip-right-50', 'tooltip-right-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                else if(elementPos.left >= 200 && rows == 2) 
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
            case elementPos.bottom >= 200:
                // place left / right if rows == 2
                if(elementPos.right >= 200 && rows == 2)
                    ['tooltip-right-50', 'tooltip-right-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                else if(elementPos.left >= 200 && rows == 2) 
                    ['tooltip-left-50', 'tooltip-left-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                // place bottom if rows > 2
                else {
                    // bottom | bottom-lg
                    ['tooltip-bottom', 'tooltip-bottom-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                }
                return
            default: 
                // place left / right if rows == 2
                if(elementPos.right >= 200 && rows == 2)
                    ['tooltip-right-50', 'tooltip-right-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                else if(elementPos.left >= 200 && rows == 2) 
                    ['tooltip-left-50', 'tooltip-left-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                // bottom | bottom-lg
                else ['tooltip-bottom', 'tooltip-bottom-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                return
        }
    }
}