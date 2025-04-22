import { FormEvent, MouseEvent, useEffect, useRef } from "react"
import { useGame } from "../context/GameContext"
import { useMisc } from "../context/MiscContext"
import { fetcher, fetcherOptions, qS, setInputValue, translateUI } from "../helper/helper"
import { IChat, IGameContext, IMiscContext, IResponse } from "../helper/types"
import emotes from "../config/emotes.json"
import { clickInsideElement } from "../helper/click-inside"
import PubNub, { Listener } from "pubnub"

interface IChatBox {
    page: 'room'|'game', 
    id?: number, 
    pubnubSetting: {monopoly: any, chatting: any}
}
export default function ChatBox({ page, id, pubnubSetting }: IChatBox) {
    const miscState = useMisc()
    const gameState = useGame()

    useEffect(() => {
        // scroll to bottom
        const chatContainer = qS('#chat_container')
        if(chatContainer) chatContainer.scrollTo({top: chatContainer.scrollHeight})
    }, [miscState.messageItems])

    // pubnub for chat
    const pubnubClient = new PubNub(pubnubSetting.chatting)
    useEffect(() => {
        const gameroomParam = page == 'game' ? +location.search.match(/id=\d+$/)[0].split('=')[1] : null
        // pubnub channels
        const chattingChannel = page == 'game' ? `monopoli-gameroom-${gameroomParam}` : 'monopoli-roomlist'
        // subscribe
        pubnubClient.subscribe({ 
            channels: [chattingChannel] 
        })
        // get published message
        const publishedMessage: Listener = {
            message: (data) => chatMessageListener(data, miscState, gameState)
        }
        pubnubClient.addListener(publishedMessage)
        // unsub and remove listener
        return () => {
            pubnubClient.unsubscribe({ 
                channels: [chattingChannel] 
            })
            pubnubClient.removeListener(publishedMessage)
        }
    }, [])
    
    return (
        page == 'room'
            // room list
            ? <ChatRoomList />
            // game room
            : <ChatGameRoom id={id} />
    )
}

function ChatRoomList() {
    return (
        <div id="chat_container" className="h-4/5 p-1 overflow-y-scroll bg-darkblue-1/60 border-b-2">
            <ChatContainer />
        </div>
    )
}

function ChatGameRoom({ id }: {id: number}) {
    const miscState = useMisc()
    const gameState = useGame()
    // chat emotes ref
    const chatEmotesRef = useRef()
    clickInsideElement(chatEmotesRef, () => miscState.showEmotes ? miscState.setShowEmotes(false) : null)

    useEffect(() => {
        if(gameState.gameSideButton == 'chat') {
            // scroll to bottom
            const chatContainer = qS('#chat_container')
            if(chatContainer) chatContainer.scrollTo({top: chatContainer.scrollHeight})
            // auto focus
            const chatInput = qS('#message_text') as HTMLInputElement
            chatInput.focus()
        }
    }, [gameState.gameSideButton])

    return (
        <div className={`${gameState.gameSideButton == 'chat' ? 'block' : 'hidden'}
        absolute top-[0vh] right-[calc(0rem+2.25rem)] lg:right-[calc(0rem+2.75rem)] 
        text-left [writing-mode:horizontal-tb] p-1 
        bg-darkblue-1 border-8bit-text w-[30vw] h-[calc(100%-1rem)]`}>
            <div id="chat_container" className="overflow-y-scroll h-[calc(100%-1.5rem)] lg:h-[calc(100%-3rem)]">
                <ChatContainer />
            </div>
            {/* chat form */}
            <form className="absolute bottom-0 flex items-center justify-center gap-2 w-full" 
            onSubmit={ev => sendChat(ev, miscState, gameState, id)}>
                {/* input chat */}
                <input type="text" id="message_text" className="w-4/5 lg:h-10 lg:p-1" minLength={1} maxLength={60}
                placeholder={translateUI({lang: miscState.language, text: 'chat here'})} autoComplete="off" required />
                {/* emote list */}
                {miscState.showEmotes ? <ChatEmotes isGameRoom={true} /> : null}
                {/* emote button */}
                <button ref={chatEmotesRef} type="button" className="w-6 h-6 lg:w-10 lg:h-10 active:opacity-50" onClick={() => miscState.setShowEmotes(true)}>
                    <img src="https://img.icons8.com/?size=100&id=120044&format=png&color=FFFFFF" alt="emot" draggable={false} />
                </button>
                {/* submit chat */}
                <button type="submit" className="w-6 h-6 lg:w-10 lg:h-10 active:opacity-50">
                    <img src="https://img.icons8.com/?size=100&id=2837&format=png&color=FFFFFF" alt="send" draggable={false} />
                </button>
            </form>
        </div>
    )
}

function ChatContainer() {
    const miscState = useMisc()

    return (
        <div>
            {miscState.messageItems.map((v,i) => 
                <div key={i} className={`${v.display_name == 'system' ? 'text-green-400' : ''} 
                hover:bg-darkblue-3/30 text-2xs lg:text-xs py-1`}>
                    <ChatItem messageData={v} />
                </div>
            )}
        </div>
    )
}

function ChatItem({ messageData }: {messageData: Omit<IChat, 'channel'|'token'>}) {
    const {display_name, message_text, message_time} = messageData
    // emote message stuff
    const emoList = emotes.list
    const modifiedMessageText = []
    // find the emote
    const message_word = message_text.split(' ')
    message_word.forEach((word, i) => {
        // (FE) Find Emote format in message text
        const FE = emoList.map(emo => emo.alias).indexOf(word)
        FE !== -1
            // emote found, create img element
            ? modifiedMessageText.push(<img key={i} src={emoList[FE].url} alt={emoList[FE].alias} className="!inline !h-5 lg:!h-6 mx-px" />)
            // normal word, create span element
            : modifiedMessageText.push(<span key={i}> {word} </span>)
    })

    return (
        <>
            <span className="text-orange-200"> {display_name}: </span>
            {modifiedMessageText.map(v => v)}
            <small className={display_name == 'system' ? 'text-white' : 'text-green-400'}> {message_time} </small>
        </>
    )
}

export function ChatEmotes({ isGameRoom }: {isGameRoom: boolean}) {
    const miscState = useMisc()

    const emoteList = emotes.list
    const emoteListPos = isGameRoom
                            ? `right-0 -top-40`
                            : `-right-36 -top-10`
    const handleChosenEmote = (ev: MouseEvent<HTMLImageElement>) => {
        // get emote alias
        const emoteAlias = ev.currentTarget.alt
        // put into chat input
        const chatInput = qS('#message_text') as HTMLInputElement
        chatInput.value += ` ${emoteAlias} `
        chatInput.value = chatInput.value.trim()
        chatInput.focus()
        // close emote box
        miscState.setShowEmotes(false)
    }

    return (
        <div className={`absolute ${emoteListPos} top z-40 grid grid-cols-5 gap-2 bg-darkblue-1 border-8bit-text w-40`}>
            {emoteList.map((v, i) => {
                return <img key={i} src={v.url} alt={v.alias} title={v.name} className="!h-min my-auto hover:bg-darkblue-3" onClick={handleChosenEmote} />
            })}
        </div>
    )
}

export async function sendChat(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext, id?: number) {
    ev.preventDefault()

    const messageInput = qS('#message_text') as HTMLInputElement
    // set manual time
    const date = new Date()
    const getHours = date.getHours().toString().length == 1 ? `0${date.getHours()}` : date.getHours()
    const getMinutes = date.getMinutes().toString().length == 1 ? `0${date.getMinutes()}` : date.getMinutes()
    // input value container
    const inputValues: IChat = {
        channel: id ? `monopoli-gameroom-${id}` : 'monopoli-roomlist',
        display_name: gameState.myPlayerInfo.display_name,
        message_text: null,
        message_time: `${getHours}:${getMinutes}`
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // toggle chat box (for room list)
            if(input.value == '/on') {
                miscState.setIsChatFocus('stay')
                inputValues.display_name = 'system'
                inputValues.message_text = translateUI({lang: miscState.language, text: '✅ chat box will persist'})
                miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
                messageInput.value = ''
                return
            }
            else if(input.value == '/off') {
                miscState.setIsChatFocus('off')
                inputValues.display_name = 'system'
                inputValues.message_text = translateUI({lang: miscState.language, text: '❌ chat box back to normal'})
                miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
                messageInput.value = ''
                return
            }
            else if(input.value == '/ch') {
                inputValues.display_name = 'system'
                inputValues.message_text = inputValues.channel.split('-')[1]
                miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
                messageInput.value = ''
                return
            }
            // filter message
            else if(setInputValue('message_text', input)) inputValues.message_text = input.value.trim()
            // error
            else {
                inputValues.display_name = 'system'
                inputValues.message_text = translateUI({lang: miscState.language, text: 'only letter, number, spaces and symbols .,#-+=@?! allowed'})
                miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
                messageInput.value = ''
                return
            }
        }
    }
    // empty input
    messageInput.value = ''
    // fetch
    const chatFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const chatResponse: IResponse = await (await fetcher('/player/chat', chatFetchOptions)).json()
    // response
    switch(chatResponse.status) {
        case 200: 
            // save access token
            if(chatResponse.data[0].token) {
                localStorage.setItem('accessToken', chatResponse.data[0].token)
                delete chatResponse.data[0].token
            }
            return
        default: 
            inputValues.display_name = 'system'
            inputValues.message_text = `${chatResponse.status} ${chatResponse.message}`
            miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
            return
    }
}

export function chatMessageListener(data: PubNub.Subscription.Message, miscState: IMiscContext, gameState: IGameContext) {
    const getMessage = data.message as PubNub.Payload & IChat & {onlinePlayers: string}
    // add chat
    if(getMessage.message_text) {
        const chatData: Omit<IChat, 'channel'|'token'> = {
            display_name: getMessage.display_name,
            message_text: getMessage.message_text,
            message_time: getMessage.message_time
        }
        miscState.setMessageItems(data => [...data, chatData])
        // play notif sound
        const soundMessageNotif = qS('#sound_message') as HTMLAudioElement
        if(getMessage.display_name != gameState.myPlayerInfo.display_name) 
            soundMessageNotif.play()
    }
    // update online player
    if(getMessage.onlinePlayers) {
        const onlinePlayersData = getMessage.onlinePlayers
        localStorage.setItem('onlinePlayers', onlinePlayersData)
        gameState.setOnlinePlayers(JSON.parse(onlinePlayersData))
    }
}