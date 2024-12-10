import { Dispatch, SetStateAction } from "react";
import translateUI_data from '../config/translate-ui.json'
import { PostgrestError } from "@supabase/supabase-js";
import { JWTPayload } from "jose";
import PubNub from "pubnub";

// translate language
export interface ITranslate {
    lang: 'english' | 'indonesia',
    text: keyof typeof translateUI_data['indonesia'],
    lowercase?: boolean,
}

// tooltip
/**
 * @param key element id, ex: #test
 */
export interface ITooltip {
    text: string,
    key: string,
    pos: 'top'|'left'|'right'|'bottom',
    arrow: ['top'|'left'|'right'|'bottom', 'start'|'middle'|'end'],
}

// context
export interface IMiscProvider {
    accessSecret: string, 
    children: React.ReactNode
}

type TutorialRoomList = 'tutorial_roomlist_1'|'tutorial_roomlist_2'|'tutorial_roomlist_3'
type TutorialGameRoom = 'tutorial_gameroom_1'|'tutorial_gameroom_2'|'tutorial_gameroom_3'
export interface IMiscContext {
    language: ITranslate['lang'],
    setLanguage: Dispatch<SetStateAction<ITranslate['lang']>>,
    showModal: 'login'|'register'|'create room',
    setShowModal: Dispatch<SetStateAction<IMiscContext['showModal']>>,
    animation: boolean,
    setAnimation: Dispatch<SetStateAction<boolean>>,
    isChatFocus: 'on'|'off'|'stay',
    setIsChatFocus: Dispatch<SetStateAction<IMiscContext['isChatFocus']>>,
    showTutorial: TutorialRoomList | TutorialGameRoom,
    setShowTutorial: Dispatch<SetStateAction<IMiscContext['showTutorial']>>,
    secret: string,
    setSecret: Dispatch<SetStateAction<string>>,
    isLoading: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    messageItems: Omit<IChat, 'channel'|'token'>[],
    setMessageItems: Dispatch<SetStateAction<Omit<IChat, 'channel'|'token'>[]>>,
}

export interface IGameContext {
    // board
    showTileImage: 'city'|'other',
    setShowTileImage: Dispatch<SetStateAction<IGameContext['showTileImage']>>,
    showGameNotif: 'normal'|'with_button',
    setShowGameNotif: Dispatch<SetStateAction<IGameContext['showGameNotif']>>,
    rollNumber: 'dice'|'turn',
    setRollNumber: Dispatch<SetStateAction<IGameContext['rollNumber']>>,
    // side buttons
    gameSideButton: 'help' | 'players' | 'chat',
    setGameSideButton: Dispatch<SetStateAction<IGameContext['gameSideButton']>>,
    openPlayerSetting: boolean,
    setOpenPlayerSetting: Dispatch<SetStateAction<boolean>>,
    displaySettingItem: 'sell_city'|'game_history'|'attack_city',
    setDisplaySettingItem: Dispatch<SetStateAction<IGameContext['displaySettingItem']>>,
    showGameHistory: boolean,
    setShowGameHistory: Dispatch<SetStateAction<boolean>>,
    // player
    myPlayerInfo: IPlayer,
    setMyPlayerInfo: Dispatch<SetStateAction<IPlayer>>,
    otherPlayerInfo: IPlayer,
    setOtherPlayerInfo: Dispatch<SetStateAction<IPlayer>>,
    onlinePlayers: ILoggedUsers[],
    setOnlinePlayers: Dispatch<SetStateAction<ILoggedUsers[]>>,
    spectator: boolean,
    setSpectator: Dispatch<SetStateAction<boolean>>,
    // room 
    roomList: ICreateRoom['list'][],
    setRoomList: Dispatch<SetStateAction<ICreateRoom['list'][]>>,
    roomError: string,
    setRoomError: Dispatch<SetStateAction<string>>,
    roomInputPassword: string,
    setRoomInputPassword: Dispatch<SetStateAction<string>>,
    // game
    myCurrentGame: number,
    setMyCurrentGame: Dispatch<SetStateAction<number>>,
}

// ~~ POSTGREST RETURN TYPE PROMISE ~~
export type PG_PromiseType<Data> = Promise<{ data: Data[] | null, error: PostgrestError | null }>

// queries
/**
 * @param function function name
 * @param function_args function parameter {key: value}
 * @param order order data [column, orderBy]
 */
interface IQueryBuilder {
    table: 'users'|'players'|'rooms'|'games';
    selectColumn?: string;
    function?: string;
    function_args?: {[key: string]: string | number | boolean};
    order?: [string, 'asc' | 'desc']
}

/**
 * @param limit [min, max]
 */
export interface IQuerySelect extends IQueryBuilder {
    whereColumn?: string;
    whereValue?: string | number;
    limit?: [number, number];
}

export interface IQueryInsert extends IQueryBuilder {
    get insertColumn(): Partial<IPlayer>
}

export interface IQueryUpdate extends IQueryBuilder {
    whereColumn?: string;
    whereValue?: string | number;
    get updateColumn(): Partial<IPlayer>
}

// fetch
export type RequestInitMod = Omit<RequestInit, 'method'> & {method: 'GET'|'POST'|'PUT'|'DELETE'}

interface IFetchWithoutBody {
    method: Extract<RequestInitMod['method'], 'GET'>,
    credentials?: boolean,
    noCache?: boolean,
}
interface IFetchWithBody {
    method: Exclude<RequestInitMod['method'], 'GET'>,
    body?: RequestInitMod['body'],
    credentials?: boolean,
    noCache?: boolean,
}
interface IFetchOptions {
    without: Omit<IFetchWithoutBody, 'credentials'> & {headers?: RequestInitMod['headers']},
    with: Omit<IFetchWithBody, 'credentials'> & {headers: RequestInitMod['headers']},
}
export type FetchOptionsType = IFetchWithBody | IFetchWithoutBody
export type FetchOptionsReturnType<T> = ReturnType<() => T extends IFetchWithoutBody ? IFetchOptions['without'] : IFetchOptions['with']>

// token
export type TokenPayloadType = ExcludeOptionalKeys<IUser> | ExcludeOptionalKeys<IPlayer>

interface ITokenAccess {
    type: 'access',
    payload: TokenPayloadType,
    expire: string, 
}

interface ITokenRefresh {
    type: 'refresh',
    payload: TokenPayloadType,
}

export type IToken = ITokenAccess | ITokenRefresh

export interface IVerifyTokenOnly {
    action: 'verify-only', 
    secret: string, 
    token: string,
}

export interface IVerifyTokenPayload {
    action: 'verify-payload', 
    secret: string, 
    token: string,
}

export type VerifyTokenType = IVerifyTokenOnly | IVerifyTokenPayload
export type VerifyTokenReturn = ReturnType<() => (VerifyTokenType extends IVerifyTokenOnly ? [null, boolean] : [null, IPlayer & JWTPayload]) | [Error]>

// response
export interface IResponse<T = any> {
    status: number;
    message: string | object;
    data: T[];
}

// input ID
type PlayerType = 'uuid'|'username'|'password'|'confirm_password'|'display_name'|'avatar'
type ChatType = 'channel'|'message_text'|'message_time'
type CreateRoomType = 'room_id'|'creator'|'room_name'|'room_password'|'select_mode'|'select_board'|'select_dice'|'select_money_start'|'select_money_lose'|'select_curse'|'select_max_player'
type JoinRoomType = 'money_start'|'confirm_room_password'|'rules'
export type InputIDType = PlayerType|ChatType|CreateRoomType|JoinRoomType

// user
export interface ILoggedUsers {
    display_name: string,
    status: 'online'|'playing'
    timeout_token: string,
}

export interface IUser {
    username: string,
    password?: string,
    confirm_password?: string,
    display_name: string,
    photo: string,
}

// player
interface ITokenPayload {
    token?: string
}

export interface IPlayer extends ITokenPayload {
    display_name: string,
    game_played: number,
    worst_money_lost: number,
    avatar: string,
}

export interface IChat extends ITokenPayload {
    channel: 'monopoli-roomlist',
    display_name: string,
    message_text: string,
    message_time: string
}

// room
export interface ICreateRoom {
    input: {
        room_id?: number,
        creator: string,
        room_name: string,
        room_password: string,
        select_mode: string,
        select_board: string,
        select_dice: string,
        select_money_start: string,
        select_money_lose: string,
        select_curse: string,
        select_max_player: string,
        token?: string,
    },
    payload: {
        creator: string,
        room_name: string,
        room_password: string,
        money_start: number,
        rules: string,
    },
    list: {
        room_id: number,
        creator: string,
        room_name: string,
        room_password: string,
        player_count: number,
        player_max: number,
        rules: string,
        status: 'prepare'|'playing',
    }
}

export interface IJoinRoom {
    input: {
        action?: 'room join',
        room_id: string,
        room_password: string,
        confirm_room_password?: string,
        display_name: string,
        money_start: string,
        token?: string,
    }
}

// helper
type RequiredKeys<T> = { [K in keyof T]-?:
    ({} extends { [P in K]: T[K] } ? never : K)
}[keyof T]

type ExcludeOptionalKeys<T> = Pick<T, RequiredKeys<T>>