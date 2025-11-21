import { useMisc } from "../../context/MiscContext";
import { applyTooltipEvent, qS, translateUI, verifyAccessToken } from "../../helper/helper";
import ChatBox, { ChatEmotes, sendChat } from "../../components/ChatBox";
import PlayerList from "./components/other/PlayerList";
import PlayerStats from "./components/other/PlayerStats";
import { useEffect, useRef } from "react";
import TutorialRoomList from "./components/other/TutorialRoomList";
import { useGame } from "../../context/GameContext";
import PubNub, { Listener } from "pubnub";
import { roomMessageListener } from "./helper/published-message";
import GameSounds from "../../components/GameSounds";
import { getRoomList } from "./helper/functions";
import { clickOutsideElement } from "../../helper/click-outside";
import { clickInsideElement } from "../../helper/click-inside";
import { getCurrentWeek } from "./components/other/Daily";
import daily_rewards from "./config/daily-rewards.json"
import RoomList from "./components/room-list/RoomList";

export default function RoomContent({ pubnubSetting }: {pubnubSetting: {monopoly: any, chatting: any}}) {
    const miscState = useMisc()
    const gameState = useGame()
    const playerData = gameState.otherPlayerInfo || gameState.myPlayerInfo

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
                        <RoomlistChatForm />
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
            <RoomList />
            
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

function RoomlistChatForm() {
    const miscState = useMisc()
    const gameState = useGame()

    // chat input ref
    const chatFocusRef = useRef()
    clickOutsideElement(chatFocusRef, () => miscState.isChatFocus == 'stay' ? null : miscState.setIsChatFocus('off'))
    // chat emotes ref
    const chatEmotesRef = useRef()
    clickInsideElement(chatEmotesRef, () => miscState.showEmotes ? miscState.setShowEmotes(false) : null)

    const scrollToBottom = () => {
        const chatContainer = qS('#chat_container')
        if(chatContainer) chatContainer.scrollTo({top: chatContainer.scrollHeight})
    }

    // claim daily stuff
    const dailyRewards = daily_rewards.data
    const today = new Date().toLocaleString('en', {weekday: 'long', timeZone: 'Asia/Jakarta'})
    const currentWeek = getCurrentWeek(gameState)

    interface IRewardList {
        type: string,
        name: string,
        items: string[],
    }
    const [rewardList, rewardDays] = dailyRewards.map(v => 
        v.week === currentWeek 
            ? [v.list, v.days] 
            : null
    ).filter(i=>i)[0] as [IRewardList[], string[]]
    const todayReward = rewardDays.indexOf(today)
    const rewardData = {
        week: currentWeek,
        day: today,
        name: rewardList[todayReward].name,
        type: rewardList[todayReward].type,
        items: rewardList[todayReward].items,
    }
    
    return (
        <form ref={chatFocusRef} className="relative flex items-center gap-2 mt-2" 
        onSubmit={ev => sendChat(ev, miscState, gameState, null, rewardData)}>
            {/* inputs */}
            <input type="text" id="message_text" className="w-4/5 lg:h-10 lg:p-1" minLength={1} maxLength={80}
            placeholder={translateUI({lang: miscState.language, text: 'chat here'})} autoComplete="off" required 
            onFocus={() => {
                setTimeout(() => scrollToBottom(), 500); 
                miscState.isChatFocus == 'stay' ? null : miscState.setIsChatFocus('on')
            }} />
            {/* emote list */}
            {miscState.showEmotes ? <ChatEmotes isGameRoom={false} /> : null}
            {/* emote button */}
            <button ref={chatEmotesRef} type="button" className="relative w-6 h-6 lg:w-10 lg:h-10 active:opacity-50" onClick={() => miscState.setShowEmotes(true)}>
                <img src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/emotes-eELgB3Y1hxTzcKafprENtp2VNeI84I.png" alt="emot" width={100} height={100} draggable={false} />
            </button>
            {/* submit chat */}
            <button type="submit" className="w-6 h-6 lg:w-10 lg:h-10 active:opacity-50">
                <img src="https://img.icons8.com/?size=100&id=2837&format=png&color=FFFFFF" alt="send" width={100} height={100} draggable={false} />
            </button>
        </form>
    )
}
