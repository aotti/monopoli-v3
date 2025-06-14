import { useMisc } from "../../context/MiscContext";
import { applyTooltipEvent, translateUI, verifyAccessToken } from "../../helper/helper";
import ChatBox, { ChatEmotes, sendChat } from "../../components/ChatBox";
import CreateRoom from "./components/CreateRoom";
import PlayerList from "./components/PlayerList";
import PlayerStats from "./components/PlayerStats";
import RoomCard from "./components/RoomCard";
import { useEffect, useRef } from "react";
import TutorialRoomList from "./components/TutorialRoomList";
import { useGame } from "../../context/GameContext";
import PubNub, { Listener } from "pubnub";
import { roomMessageListener } from "./helper/published-message";
import GameSounds from "../../components/GameSounds";
import { getRoomList, viewRanking } from "./helper/functions";
import { clickOutsideElement } from "../../helper/click-outside";
import { clickInsideElement } from "../../helper/click-inside";
import Ranking from "./components/Ranking";
import Shop from "./components/Shop";

export default function RoomContent({ pubnubSetting }: {pubnubSetting: {monopoly: any, chatting: any}}) {
    const miscState = useMisc()
    const gameState = useGame()
    const playerData = gameState.otherPlayerInfo || gameState.myPlayerInfo

    // chat input ref
    const chatFocusRef = useRef()
    clickOutsideElement(chatFocusRef, () => miscState.isChatFocus == 'stay' ? null : miscState.setIsChatFocus('off'))
    // chat emotes ref
    const chatEmotesRef = useRef()
    clickInsideElement(chatEmotesRef, () => miscState.showEmotes ? miscState.setShowEmotes(false) : null)

    // pubnub
    const pubnubClient = new PubNub(pubnubSetting.monopoly)
    // tooltip event, get room list, pubnub subscribe
    useEffect(() => {
        // start room list tutorial for 1st login (1st browser)
        const isRoomListTutorialDone = localStorage.getItem('roomListTutorial')
        if(!isRoomListTutorialDone) {
            miscState.setShowTutorial('tutorial_roomlist_1')
            localStorage.setItem('roomListTutorial', 'true')
        }
        // tooltip (the element must have position: relative)
        applyTooltipEvent()
        // get room list
        getRoomList(gameState)

        // pubnub subscribe
        const roomlistChannel = 'monopoli-roomlist'
        pubnubClient.subscribe({ 
            channels: [roomlistChannel] 
        })
        // get published message
        const publishedMessage: Listener = {
            message: data => roomMessageListener(data, miscState, gameState)
        }
        pubnubClient.addListener(publishedMessage)
        // unsub and remove listener
        return () => {
            pubnubClient.unsubscribe({ 
                channels: [roomlistChannel] 
            })
            pubnubClient.removeListener(publishedMessage)
        }
    }, [])

    // remove player from player list if token expired
    useEffect(() => {
        if(gameState.onlinePlayers && miscState.secret) {
            const updatePlayerList = async () => {
                const getPlayersToken = gameState.onlinePlayers.map(v => v.timeout_token)
                for(let token of getPlayersToken) {
                    const [error, verify] = await verifyAccessToken({action: 'verify-only', token: token, secret: miscState.secret})
                    if(error) {
                        gameState.setOnlinePlayers(data => {
                            const newOnlinePlayers = data.filter(v => v.timeout_token != token)
                            return newOnlinePlayers
                        })
                    }
                }
            }
    
            // listener for update player list
            document.body.tabIndex = 0
            document.body.addEventListener('click', updatePlayerList)
            document.body.addEventListener('keyup', updatePlayerList)
            document.body.addEventListener('blur', updatePlayerList)
    
            return () => {
                document.body.removeEventListener('click', updatePlayerList)
                document.body.removeEventListener('keyup', updatePlayerList)
                document.body.removeEventListener('blur', updatePlayerList)
            }
        }
    }, [gameState.onlinePlayers])

    return (
        <div className="flex gap-2">
            {/* player list, chat box, player stats */}
            <div className="flex flex-col w-[calc(100vw-70vw)]">
                {/* player list + chat */}
                {/* tutorial: relative z-10 */}
                <div className={`${miscState.showTutorial == 'tutorial_roomlist_1' ? 'relative z-10' : ''}
                h-[calc(100vh-52vh)] lg:h-[calc(100vh-50vh)] p-1`}>
                    {/* player list + chat title */}
                    <span className="border-b-2">
                        { miscState.isChatFocus == 'on' || miscState.isChatFocus == 'stay'
                            ? translateUI({lang: miscState.language, text: 'chat box'}) 
                            : translateUI({lang: miscState.language, text: 'player list'})  }
                    </span>
                    <div className={`${miscState.showTutorial ? '' : 'relative z-10'} w-full h-[calc(100%-1rem)] animate-fade-down`}>
                        {/* player list */}
                        <PlayerList onlinePlayers={gameState.onlinePlayers} />
                        {/* chat box */}
                        <ChatBox page="room" pubnubSetting={pubnubSetting} />
                        {/* chat form */}
                        <form ref={chatFocusRef} className="relative flex items-center gap-2 mt-2" onSubmit={ev => sendChat(ev, miscState, gameState)}>
                            {/* inputs */}
                            <input type="text" id="message_text" className="w-4/5 lg:h-10 lg:p-1" minLength={1} maxLength={60}
                            placeholder={translateUI({lang: miscState.language, text: 'chat here'})} autoComplete="off" required 
                            onFocus={() => miscState.isChatFocus == 'stay' ? null : miscState.setIsChatFocus('on')} />
                            {/* emote list */}
                            {miscState.showEmotes ? <ChatEmotes isGameRoom={false} /> : null}
                            {/* emote button */}
                            <button ref={chatEmotesRef} type="button" className="relative w-6 h-6 lg:w-10 lg:h-10 active:opacity-50" onClick={() => miscState.setShowEmotes(true)}>
                                <img src="https://img.icons8.com/?size=100&id=120044&format=png&color=FFFFFF" alt="emot" width={100} height={100} draggable={false} />
                            </button>
                            {/* submit chat */}
                            <button type="submit" className="w-6 h-6 lg:w-10 lg:h-10 active:opacity-50">
                                <img src="https://img.icons8.com/?size=100&id=2837&format=png&color=FFFFFF" alt="send" width={100} height={100} draggable={false} />
                            </button>
                        </form>
                    </div>
                </div>
                {/* player stats */}
                {/* tutorial: relative z-10 */}
                <div className={`${miscState.showTutorial == 'tutorial_roomlist_2' ? 'relative z-10' : ''}
                h-[calc(100vh-65vh)] lg:h-[calc(100vh-60vh)] p-1`}>
                    <PlayerStats playerData={playerData} onlinePlayers={gameState.onlinePlayers} />
                </div>
            </div>

            {/* room list */}
            {/* tutorial: relative z-10 */}
            <div className={`${miscState.showTutorial == 'tutorial_roomlist_3' ? 'relative z-10' : ''}
            flex flex-col w-[calc(100vw-30vw)]`}>
                {/* room list header
                    1rem gap, 3.5rem title, 0.5rem margin bot */}
                <div className="flex justify-between gap-4 w-full h-fit text-center p-2">
                    {/* tutorial button */}
                    <div data-tooltip="tutorial" className="w-8 my-auto">
                        <button type="button" className="invert active:opacity-75" onClick={() => miscState.setShowTutorial('tutorial_roomlist_1')}>
                            <img src="https://img.icons8.com/?id=3656&format=png" alt="📖" width={100} height={100} draggable={false} />
                        </button>
                    </div>
                    {/* title */}
                    <div className="flex items-center justify-center w-3/5">
                        <p> {translateUI({lang: miscState.language, text: 'Room List'})} </p>
                    </div>
                    {/* menu & create room button */}
                    <div className="flex gap-2">
                        {/* create room button */}
                        <CreateRoomButton />
                        {/* menu button */}
                        <MenuButton />
                        {/* menu item */}
                        <div className={`${miscState.showRoomListMenu ? 'flex' : 'hidden'} flex-col gap-2 absolute z-10 right-16 border-8bit-text bg-darkblue-1 w-max`}>
                            {/* ranking button */}
                            <RankingButton />
                            {/* shop button */}
                            <ShopButton />
                            {/* daily button */}
                            <DailyButton />
                        </div>
                    </div>
                    {/* create room, ranking, shop, calendar modal */}
                    <div className={`absolute z-20 bg-black/50
                    ${miscState.showModal === null ? 'hidden' : 'flex'} items-center justify-center text-left
                    h-[calc(100vh-4.25rem)] w-[calc(65vw+1rem)] lg:w-[calc(65vw+2.5rem)]`}>
                        {/* create room */}
                        <CreateRoom />
                        {/* ranking */}
                        <Ranking />
                        {/* shop */}
                        <Shop />
                        {/* calendar */}
                    </div>
                </div>
                {/* room list cards 
                    100vh - 3.75rem (header) - 5rem (room list title) */}
                <div className="flex flex-wrap gap-2 justify-between 
                    text-xs w-[calc(100%-1rem)] h-[calc(100vh-7.25rem)] lg:h-[calc(100vh-8.25rem)]
                    overflow-y-scroll p-2 bg-darkblue-1/60 border-8bit-text">
                    {/* card */}
                    {gameState.roomList.length > 0
                        ? gameState.roomList.map((room, i) => <RoomCard key={i} roomData={room} />)
                        : <div className="m-auto">
                            <span id="result_message"> there is no game </span>
                            <img src="https://img.icons8.com/?id=-70EdELqFxwn&format=png" className="inline !w-10 !h-10" loading="lazy" />
                        </div>
                    }
                </div>
            </div>
            
            {/* tutorial */}
            <div className={`${miscState.showTutorial ? 'block' : 'hidden'} 
            absolute mt-1.5 bg-black/75 h-[calc(100vh-4rem)] w-[calc(100vw-1rem)] leading-6 lg:leading-8`}>
                <TutorialRoomList />
            </div>
            
            {/* game sounds */}
            <GameSounds />
        </div>
    )
}

function MenuButton() {
    const miscState = useMisc()

    return (
        <div data-tooltip="menu" className="w-8 my-auto text-right">
            <button type="button" className="invert active:opacity-75" onClick={() => miscState.setShowRoomListMenu(true)}>
                <img src="https://img.icons8.com/?id=95245&format=png" alt="📅" width={100} height={100} draggable={false} />
            </button>
        </div>
    )
}

function RankingButton() {
    const miscState = useMisc()
    const gameState = useGame()
    
    return (
        <div className="my-auto text-right hover:bg-darkblue-2 active:bg-darkblue-2">
            <button type="button" className="flex items-center gap-2 w-full invert" onClick={() => {
                // close join modal
                miscState.setShowJoinModal(null)
                // close room list menu
                miscState.setShowRoomListMenu(false)
                // to give zoom-in animate class
                miscState.setAnimation(true); 
                // show the modal
                miscState.setShowModal('ranking') 
                // get ranking
                viewRanking(miscState, gameState)
            }}>
                <img src="https://img.icons8.com/?id=6yiQUAER3NXc&format=png" alt="👑" className="!w-8 !h-8" width={100} height={100} draggable={false} />
                <span className="invert"> ranking </span>
            </button>
        </div>
    )
}

function ShopButton() {
    const miscState = useMisc()

    return (
        <div className="my-auto text-right hover:bg-darkblue-2 active:bg-darkblue-2">
            <button type="button" className="flex items-center gap-2 w-full invert" onClick={() => {
                // close join modal
                miscState.setShowJoinModal(null)
                // close room list menu
                miscState.setShowRoomListMenu(false)
                // to give zoom-in animate class
                miscState.setAnimation(true); 
                // show the modal
                miscState.setShowModal('shop') 
            }}>
                <img src="https://img.icons8.com/?id=rkVMQqdC1O9B&format=png" alt="🛍" className="!w-8 !h-8" width={100} height={100} draggable={false} />
                <span className="invert"> shop (soon) </span>
            </button>
        </div>
    )
}

function DailyButton() {
    const miscState = useMisc()

    return (
        <div className="my-auto text-right hover:bg-darkblue-2 active:bg-darkblue-2">
            <button type="button" className="flex items-center gap-2 w-full invert" onClick={() => {
                // close room list menu
                miscState.setShowRoomListMenu(false)
            }}>
                <img src="https://img.icons8.com/?id=23&format=png" alt="📅" className="!w-8 !h-8" width={100} height={100} draggable={false} />
                <span className="invert"> daily (soon) </span>
            </button>
        </div>
    )
}

function CreateRoomButton() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div data-tooltip={translateUI({lang: miscState.language, text: 'Create Room'})} 
        className={`${gameState.guestMode ? 'invisible' : ''} w-8 my-auto text-right`}>
            <button type="button" className="invert active:opacity-75"
            onClick={() => {
                // close join modal
                miscState.setShowJoinModal(null)
                // to give zoom-in animate class
                miscState.setAnimation(true); 
                // show the modal
                miscState.setShowModal('create room') 
            }}> 
                <img src="https://img.icons8.com/?id=113116&format=png" alt="🚪" width={100} height={100} draggable={false} />
            </button>
        </div>
    )
}