import { useMisc } from "../../context/MiscContext";
import { applyTooltipEvent, fetcher, fetcherOptions, qS, translateUI, verifyAccessToken } from "../../helper/helper";
import ChatBox, { sendChat } from "../../components/ChatBox";
import CreateRoom from "./components/CreateRoom";
import PlayerList from "./components/PlayerList";
import PlayerStats from "./components/PlayerStats";
import RoomCard from "./components/RoomCard";
import { useEffect, useRef } from "react";
import TutorialRoomList from "./components/TutorialRoomList";
import { useGame } from "../../context/GameContext";
import { IChat, ICreateRoom, IGameContext, IResponse } from "../../helper/types";
import { clickOutsideElement } from "../../helper/click-outside";
import PubNub, { Listener } from "pubnub";

export default function RoomContent({ pubnubSetting }) {
    const miscState = useMisc()
    const gameState = useGame()
    const { myPlayerInfo, otherPlayerInfo, onlinePlayers } = gameState

    // chat input ref
    const chatFocusRef = useRef()
    clickOutsideElement(chatFocusRef, () => miscState.isChatFocus == 'stay' ? null : miscState.setIsChatFocus('off'))

    // pubnub
    const pubnubClient = new PubNub(pubnubSetting)
    // pubnub subscribe
    const roomlistChannel = 'monopoli-roomlist'
    const onlineplayerChannel = 'monopoli-onlineplayer'
    const createroomChannel = 'monopoli-createroom'
    const deleteroomChannel = 'monopoli-deleteroom'
    // tooltip event, get room list, pubnub subscribe
    useEffect(() => {
        // tooltip (the element must have position: relative)
        applyTooltipEvent()
        // get room list
        getRoomList(gameState)

        // subscribe
        pubnubClient.subscribe({ 
            channels: [roomlistChannel, onlineplayerChannel, createroomChannel, deleteroomChannel] 
        })
        // get published message
        const publishedMessage: Listener = {
            message: (data) => {
                type GetMessageType = {onlinePlayers: string, roomCreated: ICreateRoom['list'], roomsLeft:  ICreateRoom['list'][]}
                const getMessage = data.message as PubNub.Payload & IChat & GetMessageType
                // add chat
                const soundMessageNotif = qS('#sound_message_notif') as HTMLAudioElement
                if(getMessage.message_text) {
                    const chatData: Omit<IChat, 'channel'|'token'> = {
                        display_name: getMessage.display_name,
                        message_text: getMessage.message_text,
                        message_time: getMessage.message_time
                    }
                    miscState.setMessageItems(data => [...data, chatData])
                    // play notif sound
                    if(getMessage.display_name != gameState.myPlayerInfo.display_name) 
                        soundMessageNotif.play()
                }
                // update online player
                if(getMessage.onlinePlayers) {
                    const onlinePlayersData = getMessage.onlinePlayers
                    localStorage.setItem('onlinePlayers', onlinePlayersData)
                    gameState.setOnlinePlayers(JSON.parse(onlinePlayersData))
                }
                // room created
                if(getMessage.roomCreated) {
                    // set to room list
                    gameState.setRoomList(room => [...room, getMessage.roomCreated])
                }
                // room deleted
                if(getMessage.roomsLeft) {
                    // set rooms left
                    gameState.setRoomList(getMessage.roomsLeft)
                }
            }
        }
        pubnubClient.addListener(publishedMessage)
        // unsub and remove listener
        return () => {
            pubnubClient.unsubscribe({ 
                channels: [roomlistChannel, onlineplayerChannel, createroomChannel, deleteroomChannel] 
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
    
            // listener for update player lsit
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
                    <span className="border-b-2">
                        { miscState.isChatFocus == 'on' || miscState.isChatFocus == 'stay'
                            ? translateUI({lang: miscState.language, text: 'chat box'}) 
                            : translateUI({lang: miscState.language, text: 'player list'})  }
                    </span>
                    <div className="w-full h-[calc(100%-1rem)]">
                        {
                            miscState.isChatFocus == 'on' || miscState.isChatFocus == 'stay'
                                // chat box
                                ? <ChatBox page="room" />
                                // list of online players
                                : <PlayerList onlinePlayers={onlinePlayers} />
                        }
                        {/* chat input */}
                        <form ref={chatFocusRef} className="flex items-center gap-2 mt-2" onSubmit={ev => sendChat(ev, miscState)}>
                            <input type="hidden" id="display_name" value={gameState.myPlayerInfo?.display_name} />
                            <input type="text" id="message_text" className="w-4/5 lg:h-10 lg:p-1" minLength={1} maxLength={60}
                            placeholder={translateUI({lang: miscState.language, text: 'chat here'})} autoComplete="off" required 
                            onFocus={() => miscState.isChatFocus == 'stay' ? null : miscState.setIsChatFocus('on')} />
                            <button type="submit" className="w-6 lg:w-10 active:opacity-50">
                                <img src="https://img.icons8.com/?size=100&id=2837&format=png&color=FFFFFF" alt="send" draggable={false} />
                            </button>
                        </form>
                    </div>
                </div>
                {/* player stats */}
                {/* tutorial: relative z-10 */}
                <div className={`${miscState.showTutorial == 'tutorial_roomlist_2' ? 'relative z-10' : ''}
                h-[calc(100vh-65vh)] lg:h-[calc(100vh-60vh)] p-1`}>
                    <PlayerStats playerData={otherPlayerInfo || myPlayerInfo} onlinePlayers={onlinePlayers} />
                </div>
            </div>
            {/* room list */}
            {/* tutorial: relative z-10 */}
            <div className={`${miscState.showTutorial == 'tutorial_roomlist_3' ? 'relative z-10' : ''}
            flex flex-col w-[calc(100vw-30vw)]`}>
                {/* 1rem gap, 3.5rem title, 0.5rem margin bot */}
                <div className="flex gap-4 w-full h-fit text-center p-2">
                    {/* tutorial button */}
                    <div data-tooltip="tutorial" className="w-8 my-auto">
                        <button type="button" className="active:opacity-75" onClick={() => miscState.setShowTutorial('tutorial_roomlist_1')}>
                            <img src="https://img.icons8.com/?id=3656&format=png&color=FFFFFF" alt="📖" draggable={false} />
                        </button>
                    </div>
                    {/* title */}
                    <div className="flex items-center justify-end mr-10 w-3/5">
                        <p> {translateUI({lang: miscState.language, text: 'Room List'})} </p>
                    </div>
                    {/* create room button */}
                    <div className="text-right w-2/5">
                        <button type="button" className="border-8bit-primary bg-primary active:opacity-75"
                        onClick={() => {
                            // to give zoom-in animate class
                            miscState.setAnimation(true); 
                            // show the modal
                            miscState.setShowModal('create room') 
                        }}> 
                            {translateUI({lang: miscState.language, text: 'Create Room'})}
                        </button>
                    </div>
                    {/* create room modal */}
                    <div className={`absolute z-20 bg-black/50
                    ${miscState.showModal === null ? 'hidden' : 'flex'} items-center justify-center text-left
                    h-[calc(100vh-4.25rem)] w-[calc(65vw+1rem)] lg:w-[calc(65vw+2.5rem)]`}>
                        <CreateRoom />
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
                            <img src="https://img.icons8.com/?id=-70EdELqFxwn&format=png&color=000000" className="inline w-10" loading="lazy" />
                        </div>
                    }
                </div>
            </div>
            
            {/* tutorial */}
            <div className={`${miscState.showTutorial ? 'block' : 'hidden'} 
            absolute mt-1.5 bg-black/75 h-[calc(100vh-4rem)] w-[calc(100vw-1rem)] leading-6 lg:leading-8`}>
                <TutorialRoomList />
            </div>
        </div>
    )
}

async function getRoomList(gameState: IGameContext) {
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
            const rooms = getRoomResponse.data[0].rooms as ICreateRoom['list'][]
            // set room list
            for(let room of rooms) {
                gameState.setRoomList(data => [...data, room])
            }
            // set my current game
            gameState.setMyCurrentGame(getRoomResponse.data[0].currentGame)
            return
        default: 
            resultMessage.textContent = `❌ ${getRoomResponse.status}: ${getRoomResponse.message}`
            return
    }
}