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
    playerCount: number,
    joinedRoomId: number,
    leavePlayer: string,
    leaveRoomId: number,
    disabledCharacters: string[],
    roomGame: number,
    roomOverId: number,
    gameOverPlayers: {player: string, worst_money: number}[],
}

export type GameRoomListener = {
    joinPlayer: IGamePlayerInfo,
    leavePlayer: string,
    roomsLeft:  ICreateRoom['list'][],
    readyPlayers: string[],
    startGame: string,
    fixedPlayers: number,
    decidePlayers: Omit<IGamePlay['decide_player'], 'token'|'channel'>[],
    gameStage: IGameContext['gameStages'],
    playerTurn: string,
    playerDice: number,
    playerRNG: string[],
    playerSpecialCard: string,
    gameHistory: IGameHistory[],
    playerTurns: string[],
    surrendPlayer: string,
    playerTurnEnd: IGamePlayerInfo,
    gameOverPlayers: {
        player_name: string, 
        worst_money: number,
        player_coins: number,
    }[],
    taxes: {
        owner: string,
        visitor: string,
        money: number
    },
    citySeller: string,
    citySold: string,
    cityPrice: number,
    cityLeft: string,
    takeMoney: {
        from: string[],
        to: string,
        money: number
    },
    attackerName: string,
    attackType: string,
    targetCity: string,
    targetCityProperty: string,
    targetSpecialCard: string,
    quakeCity: string[],
    playerData: {
        display_name: string,
        city: string,
        money: number,
        card: string,
    }[],
    fixPlayerTurns: string[],
}

// context
export interface IMiscProvider {
    accessSecret: string, 
    savedLanguage: ITranslate['lang'], 
    children: React.ReactNode
}

type TutorialRoomList = 'tutorial_roomlist_1'|'tutorial_roomlist_2'|'tutorial_roomlist_3'|'tutorial_roomlist_4'
type TutorialGameRoom = 'tutorial_gameroom_1'|'tutorial_gameroom_2'|'tutorial_gameroom_3'
export interface IMiscContext {
    screenType: 'landscape'|'portrait',
    setScreenType: Dispatch<SetStateAction<IMiscContext['screenType']>>,
    language: ITranslate['lang'],
    setLanguage: Dispatch<SetStateAction<ITranslate['lang']>>,
    showModal: 'login'|'register'|'create room'|'join room'|'ranking'|'shop'|'daily',
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
    disableButtons: 'roomlist'|'gameroom',
    setDisableButtons: Dispatch<SetStateAction<'roomlist'|'gameroom'>>,
    showEmotes: boolean, 
    setShowEmotes: Dispatch<SetStateAction<boolean>>,
    showRoomListMenu: boolean, 
    setShowRoomListMenu: Dispatch<SetStateAction<boolean>>,
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
    pos: string,
    lap: number,
    money: number,
    card: string,
    city: string,
    prison: number,
    minigame: number,
    buff: string,
    debuff: string,
}

interface IGameHistory {
    room_id: number,
    display_name: string,
    history: string,
}

interface IMyShopItems {
    special_card: string[],
    buff: string[],
}

export interface IGameContext {
    // board
    showTileImage: 'city'|'other',
    setShowTileImage: Dispatch<SetStateAction<IGameContext['showTileImage']>>,
    showGameNotif: 'normal'|'with_button'|'card'|'card_with_button',
    setShowGameNotif: Dispatch<SetStateAction<IGameContext['showGameNotif']>>,
    showMiniGame: boolean,
    setShowMiniGame: Dispatch<SetStateAction<boolean>>,
    rollNumber: 'dice'|'turn',
    setRollNumber: Dispatch<SetStateAction<IGameContext['rollNumber']>>,
    // side buttons
    gameSideButton: 'help' | 'players' | 'chat',
    setGameSideButton: Dispatch<SetStateAction<IGameContext['gameSideButton']>>,
    openPlayerSetting: boolean,
    setOpenPlayerSetting: Dispatch<SetStateAction<boolean>>,
    displaySettingItem: 'sell_city'|'attack_city',
    setDisplaySettingItem: Dispatch<SetStateAction<IGameContext['displaySettingItem']>>,
    showGameHistory: boolean,
    setShowGameHistory: Dispatch<SetStateAction<boolean>>,
    expandGameHistory: boolean,
    setExpandGameHistory: Dispatch<SetStateAction<boolean>>,
    // player
    myPlayerInfo: IPlayer,
    setMyPlayerInfo: Dispatch<SetStateAction<IPlayer>>,
    otherPlayerInfo: IPlayer,
    setOtherPlayerInfo: Dispatch<SetStateAction<IPlayer>>,
    guestMode: boolean,
    setGuestMode: Dispatch<SetStateAction<boolean>>,
    onlinePlayers: ILoggedUsers[],
    setOnlinePlayers: Dispatch<SetStateAction<ILoggedUsers[]>>,
    spectator: boolean,
    setSpectator: Dispatch<SetStateAction<boolean>>,
    rankingInfo: {display_name: string, worst_money_lost: number}[],
    setRankingInfo: Dispatch<SetStateAction<IGameContext['rankingInfo']>>,
    dailyStatus: 'claimed'|'unclaim',
    setDailyStatus: Dispatch<SetStateAction<IGameContext['dailyStatus']>>,
    lastDailyStatus: string,
    setLastDailyStatus: Dispatch<SetStateAction<string>>,
    dailyHistory: Record<'reward_type'|'reward_item'|'reward_date', string>[],
    setDailyHistory: Dispatch<SetStateAction<IGameContext['dailyHistory']>>,
    myCoins: number,
    setMyCoins: Dispatch<SetStateAction<number>>,
    myShopItems: IMyShopItems[], 
    setMyShopItems: Dispatch<SetStateAction<IGameContext['myShopItems']>>,
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
    gamePlayerTurns: string[], 
    setGamePlayerTurns: Dispatch<SetStateAction<IGameContext['gamePlayerTurns']>>,
    gameQuakeCity: string[], 
    setGameQuakeCity: Dispatch<SetStateAction<IGameContext['gameQuakeCity']>>,
    diceMode: 'off'|'odd'|'even', 
    setDiceMode: Dispatch<SetStateAction<IGameContext['diceMode']>>,
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
    get insertColumn(): Partial<IPlayer> | Partial<ICreateRoom['list']>
}

export interface IQueryUpdate extends IQueryBuilder {
    whereColumn?: string;
    whereValue?: string | number;
    get updateColumn(): Partial<IPlayer> | Partial<ICreateRoom['list']>
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
type IdentifierType = 'identifier'
type PlayerType = 'uuid'|'username'|'password'|'confirm_password'|'display_name'|'avatar'
type ChatType = 'channel'|'message_text'|'message_time'
type CreateRoomType = 'room_id'|'creator'|'room_name'|'room_password'|'select_mode'|'select_board'|'select_dice'|'select_money_start'|'select_money_lose'|'select_curse'|'select_max_player'|'select_character'
type JoinRoomType = 'money_start'|'confirm_room_password'|'rules'
type DecideTurnType = 'rolled_number'
type RollDiceType = 'rolled_dice'|'rng'|'special_card'
type TurnEndType = 'pos'|'lap'|'history'|'event_money'|'city'|'tax_owner'|'tax_visitor'|'card'|'take_money'|'prison'|'buff'|'debuff'|'is_lose'
type SurrenderType = 'money'
type GameOverType = 'all_player_stats'
type SellCityType = 'city_left'|'sell_city_name'|'sell_city_price'
type DeclareAttackCityType = 'target_city_owner'|'target_city_left'|'target_city_property'|'target_city'|'target_card'|'target_special_card'|'attack_type'|'attacker_name'|'attacker_city'
type ShopType = 'item_type'|'item_name'
type DailyType = 'week'
export type InputIDType = IdentifierType|PlayerType|ChatType|CreateRoomType|JoinRoomType|DecideTurnType|RollDiceType|TurnEndType|SurrenderType|GameOverType|SellCityType|DeclareAttackCityType|ShopType|DailyType|'language'|'user_agent'

// user
export interface ILoggedUsers {
    display_name: string,
    status: 'online'|'playing'
    timeout_token: string,
    user_agent: string,
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
    user_agent?: string
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

export interface IDaily extends ITokenPayload {
    display_name: string,
    week: string,
    item_name: string,
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
    } & ITokenPayload,
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
        game_played_list: string,
        worst_money_list: string,
    }
}

export interface IShiftRoom extends ITokenPayload {
    action?: 'room join'|'room leave',
    room_id: string,
    room_password: string,
    display_name: string,
    money_start: string,
    select_character: string,
}

// game
export interface IRollDiceData {
    playerTurn: string, 
    playerDice: number, 
    playerRNG: string[],
    playerSpecialCard?: string,
}

export interface IGamePlay {
    get_players: {
        room_id: number,
    } & ITokenPayload,
    ready_player: {
        channel: string,
        display_name: string,
    } & ITokenPayload,
    decide_player: {
        channel: string,
        display_name: string,
        rolled_number: string,
    } & ITokenPayload,
    roll_dice: {
        channel: string,
        display_name: string,
        rolled_dice: string,
        rng: string,
        special_card: string,
    } & ITokenPayload,
    surrender: {
        channel: string,
        display_name: string,
        money: string,
    } & ITokenPayload,
    sell_city: {
        channel: string,
        display_name: string,
        sell_city_name: string,
        sell_city_price: string,
        city_left: string,
    } & ITokenPayload,
    declare_attack_city: {
        channel: string,
        attacker_name: string,
        attacker_city: null,
        attack_type: string,
        special_card: string,
        card: string,
        target_city_owner: string,
        target_city_left: string,
        target_city_property: string,
        target_city: string,
        target_special_card: string,
        target_card: string,
        event_money: string,
    } & ITokenPayload,
    turn_end: {
        channel: string,
        display_name: string,
        pos: string,
        lap: string,
        event_money: string,
        card: string,
        city: string,
        prison: string,
        buff: string,
        debuff: string,
        history: string,
        is_lose: boolean,
        tax_visitor: string,
        tax_owner: string,
        take_money: string,
    } & ITokenPayload,
    game_over: {
        room_id: string,
        room_name: string,
        all_player_stats: string,
    } & ITokenPayload,
    fix_player_turns: {
        channel: string,
        display_name: string,
    } & ITokenPayload,
}

// stop by event
interface IEventBuyCity_Yes {
    event: 'buy_city'
    status: true,
    display_name: string,
    city: string,
    name: string,
    property: string,
    money: number,
    buff?: string,
}
interface IEventBuyCity_No {
    event: 'buy_city'
    status: false,
    money: number,
}
export interface IBuyCityButtonEvent {
    buyCityInterval: NodeJS.Timeout, 
    findPlayer: number, 
    buyButtons: HTMLInputElement[],
    buyCityData: string[], 
    miscState: IMiscContext, 
    gameState: IGameContext
}
type IEventBuyCity = IEventBuyCity_Yes | IEventBuyCity_No

interface IEventPayTax {
    event: 'pay_tax',
    owner: string,
    visitor: string,
    money: number,
    card?: string,
    debuff?: string,
}

interface IEventCards {
    event: 'get_card',
    rank: string,
    type: string,
    tileName: string,
    money: number,
    city?: string,
    card?: string,
    takeMoney?: string,
}

interface IEventPrison {
    event: 'get_arrested',
    accumulate: number,
    money: number,
    card?: string,
}

interface IEventParking {
    event: 'parking',
    destination: number,
    money: number,
    card?: string,
}

interface IEventCursed {
    event: 'cursed',
    money: number,
    takeMoney?: string,
    card?: string,
}

interface IEventSpecial {
    event: 'special_city',
    money: number,
}

interface IEventBuff {
    event: 'get_buff',
    type: string,
    tileName: string,
    money: number,
    card?: string,
    buff?: string,
}

interface IEventDebuff {
    event: 'get_debuff',
    type: string,
    tileName: string,
    money: number,
    card?: string,
    debuff?: string,
}

export type EventDataType = IEventBuyCity | IEventPayTax | IEventCards | IEventPrison | IEventParking | IEventCursed | IEventSpecial | IEventBuff | IEventDebuff

interface IBuyCity {
    action: 'buy',
    currentCity: string, 
    cityName: string, 
    cityProperty: string,
}
interface ISellCity {
    action: 'sell',
    currentCity: string, 
    cityName: string, 
}
interface IDestroyCity {
    action: 'destroy',
    currentCity: string, 
    rng: number,
}
export type UpdateCityListType = IBuyCity | ISellCity | IDestroyCity

interface ISpecialCardCity {
    type: 'city',
    price: number,
    debuff: string,
}
interface ISpecialCardStart {
    type: 'start',
}
interface ISpecialCardPrison {
    type: 'prison',
}
interface ISpecialCardDice {
    type: 'dice',
    diceNumber: number,
}
interface ISpecialCardParking {
    type: 'parking',
}
interface ISpecialCardCursed {
    type: 'cursed',
    price: number,
}
export type SpecialCardEventType = ISpecialCardCity | ISpecialCardStart | ISpecialCardPrison | ISpecialCardDice | ISpecialCardParking | ISpecialCardCursed

interface IBuffDebuffReducePrice {
    type: 'buff',
    effect: 'reduce price',
    price: number,
}
interface IBuffDebuffPickRarity {
    type: 'buff',
    effect: 'pick rarity',
}
interface IBuffDebuffTheVoid {
    type: 'buff',
    effect: 'the void',
    money: number,
}
interface IBuffDebuffSkipTurn {
    type: 'debuff',
    effect: 'skip turn',
}
interface IBuffDebuffTaxMore {
    type: 'debuff',
    effect: 'tax more',
    price: number,
}
interface IBuffDebuffReduceMoney {
    type: 'debuff',
    effect: 'reduce money',
    money: number,
}
export type BuffDebuffEventType = IBuffDebuffReducePrice | IBuffDebuffPickRarity | IBuffDebuffTheVoid | IBuffDebuffSkipTurn | IBuffDebuffTaxMore | IBuffDebuffReduceMoney

// attack city
export interface IAttackCityList {
    cityOwner: string,
    currentCity: string,
    cityList: string[],
}

export interface IAttackAnimationData {
    attackTimer: number, 
    attackType: string, 
    targetCity: string, 
    targetCityProperty: string,
}

// shop
export interface IShop {
    buy_item: {
        display_name: string,
        item_type: 'buff'|'special_card',
        item_name: string,
    } & ITokenPayload,
    buying_data: {
        action: string, 
        displayName: string,
        itemName: string, 
        playerCoins: number,
    }
}

// helper
type RequiredKeys<T> = { [K in keyof T]-?:
    ({} extends { [P in K]: T[K] } ? never : K)
}[keyof T]

type ExcludeOptionalKeys<T> = Pick<T, RequiredKeys<T>>

export interface IAnimate {
    targets: string | Element,
    translateX?: number | any[],
    translateY?: number | any[],
    scaleX?: number | any[],
    scaleY?: number | any[],
    opacity?: number[],
    backgroundColor?: string,
    rotate?: string | any[],
    duration?: number,
    easing?: 'easeInOutSine'|'linear',
    direction?: 'normal'|'reverse'|'alternate',
    delay?: number,
    loop?: boolean,
}