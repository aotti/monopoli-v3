import { Dispatch, SetStateAction } from "react";
import translateUI_data from '../config/translate-ui.json'
import { PostgrestError } from "@supabase/supabase-js";
import { JWTPayload } from "jose";

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

// pubnub message
export type RoomListListener = {
    onlinePlayers: string, 
    roomCreated: ICreateRoom['list'], 
    roomInfo: IGameRoomInfo,
    roomsLeft:  ICreateRoom['list'][],
    joinedPlayers: number,
    joinedRoomId: number,
    leavePlayer: string,
    disabledCharacters: string[],
}

export type GameRoomListener = {
    joinPlayer: IGamePlayerInfo,
    leavePlayer: string,
    readyPlayers: string[],
    startGame: string,
    fixedPlayers: number,
    decidePlayers: Omit<IGamePlay['decide_player'], 'token'|'channel'>[],
    gameStage: IGameContext['gameStages'],
    playerTurn: string,
    playerDice: number,
    gameHistory: IGameHistory[],
    playerTurns: string[],
    playerTurnEnd: IGamePlayerInfo,
}

// context
export interface IMiscProvider {
    accessSecret: string, 
    children: React.ReactNode
}

type TutorialRoomList = 'tutorial_roomlist_1'|'tutorial_roomlist_2'|'tutorial_roomlist_3'
type TutorialGameRoom = 'tutorial_gameroom_1'|'tutorial_gameroom_2'|'tutorial_gameroom_3'
export interface IMiscContext {
    screenType: 'landscape'|'portrait',
    setScreenType: Dispatch<SetStateAction<IMiscContext['screenType']>>,
    language: ITranslate['lang'],
    setLanguage: Dispatch<SetStateAction<ITranslate['lang']>>,
    showModal: 'login'|'register'|'create room'|'join room',
    setShowModal: Dispatch<SetStateAction<IMiscContext['showModal']>>,
    showJoinModal: string, 
    setShowJoinModal: Dispatch<SetStateAction<IMiscContext['showJoinModal']>>,
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

interface IGameRoomInfo {
    room_id: number,
    room_name: string,
    creator: string,
    mode: string,
    board: string,
    dice: number,
    money_lose: number,
    curse: number,
}

interface IGamePlayerInfo {
    display_name: string,
    character: string,
    pos: number,
    lap: number,
    money: number,
    card: string,
    city: string,
    prison: boolean,
}

interface IGameHistory {
    room_id: number,
    display_name: string,
    history: string,
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
    gameRoomId: number,
    setGameRoomId: Dispatch<SetStateAction<number>>,
    gameRoomInfo: IGameRoomInfo[],
    setGameRoomInfo: Dispatch<SetStateAction<IGameRoomInfo[]>>,
    gamePlayerInfo: IGamePlayerInfo[],
    setGamePlayerInfo: Dispatch<SetStateAction<IGamePlayerInfo[]>>,
    gameStages: 'prepare'|'decide'|'play'|'over',
    setGameStages: Dispatch<SetStateAction<IGameContext['gameStages']>>,
    gameFixedPlayers: number,
    setGameFixedPlayers: Dispatch<SetStateAction<IGameContext['gameFixedPlayers']>>,
    gamePlayerTurns: string[], 
    setGamePlayerTurns: Dispatch<SetStateAction<IGameContext['gamePlayerTurns']>>,
    gameHistory: IGameHistory[], 
    setGameHistory: Dispatch<SetStateAction<IGameContext['gameHistory']>>,
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
    body: RequestInitMod['body'],
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
    message: string;
    data: T[];
}

// input ID
type PlayerType = 'uuid'|'username'|'password'|'confirm_password'|'display_name'|'avatar'
type ChatType = 'channel'|'message_text'|'message_time'
type CreateRoomType = 'room_id'|'creator'|'room_name'|'room_password'|'select_mode'|'select_board'|'select_dice'|'select_money_start'|'select_money_lose'|'select_curse'|'select_max_player'|'select_character'
type JoinRoomType = 'money_start'|'confirm_room_password'|'rules'
type DecideTurnType = 'rolled_number'
type RollDiceType = 'rolled_dice'
type TurnEndType = 'pos'|'lap'|'history'
export type InputIDType = PlayerType|ChatType|CreateRoomType|JoinRoomType|DecideTurnType|RollDiceType|TurnEndType

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
    channel: string,
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
        select_character: string,
        token?: string,
    },
    payload: {
        creator: string,
        room_name: string,
        room_password: string,
        money_start: number,
        rules: string,
        character: string,
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
        characters: string[],
    },
    server: {
        room_id: number,
        creator: string,
        room_name: string,
        room_password: string,
        player_count: number,
        player_max: number,
        rules: string,
        status: 'prepare'|'playing',
        player_list: string,
    }
}

export interface IShiftRoom {
    action?: 'room join'|'room leave',
    room_id: string,
    room_password: string,
    confirm_room_password?: string,
    display_name: string,
    money_start: string,
    select_character: string,
    token?: string,
}

// game
export interface IGamePlay {
    get_players: {
        token?: string,
        room_id: number,
    },
    ready_player: {
        token?: string,
        channel: string,
        display_name: string,
    },
    decide_player: {
        token?: string,
        channel: string,
        display_name: string,
        rolled_number: string,
    },
    roll_dice: {
        token?: string,
        channel: string,
        display_name: string,
        rolled_dice: string,
    },
    turn_end: {
        token?: string,
        channel: string,
        display_name: string,
        pos: string,
        lap: string,
        money: string,
        card: string,
        city: string,
        prison: string,
        history: string,
    }
}

// helper
type RequiredKeys<T> = { [K in keyof T]-?:
    ({} extends { [P in K]: T[K] } ? never : K)
}[keyof T]

type ExcludeOptionalKeys<T> = Pick<T, RequiredKeys<T>>