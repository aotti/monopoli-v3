import { FormEvent, MouseEvent, useEffect, useRef } from "react"
import { useGame } from "../context/GameContext"
import { useMisc } from "../context/MiscContext"
import { fetcher, fetcherOptions, qS, setInputValue, translateUI } from "../helper/helper"
import { IChat, IGameContext, IMiscContext, IResponse } from "../helper/types"
import emotes from "../config/emotes.json"
import PubNub, { Listener } from "pubnub"
import Image from "next/image"
import { claimDaily } from "../app/room/helper/functions"
import { clickOutsideElement } from "../helper/click-outside"

interface IChatBox {
    page: 'room'|'game', 
    pubnubSetting: {monopoly: any, chatting: any}
}
export default function ChatBox({ page, pubnubSetting }: IChatBox) {
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
            : <ChatGameRoom />
    )
}

function ChatRoomList() {
    const miscState = useMisc()
    
    return (
        <div id="chat_container" className={`h-4/5 p-1 overflow-y-scroll bg-darkblue-1/60 border-b-2
        ${miscState.isChatFocus == 'on' || miscState.isChatFocus == 'stay' ? 'block' : 'hidden'}`}>
            <ChatContainer />
        </div>
    )
}

function ChatGameRoom() {
    const miscState = useMisc()

    return (
        <div id="chat_container" className="overflow-y-scroll h-[calc(100%-1.5rem)] lg:h-[calc(100%-3rem)]">
            <ChatContainer />
        </div>
    )
}

function ChatContainer() {
    const miscState = useMisc()

    return (
        <div>
            {miscState.messageItems.map((v,i) => {
                const [systemCommand, systemParam] = getChatCommandsFromStorage('/sys')
                const [chatwithCommand, chatwithParam] = getChatCommandsFromStorage('/cw')
                console.log({chatwithCommand});
                
                // filter every new messages
                const filteredChatMessages = systemCommand || chatwithCommand
                                                // only display messages from system
                                                ? v.display_name === 'system' || chatwithParam.match(v.display_name)
                                                    ? v
                                                    : null
                                                // hide message with visibility 0
                                                : v.visibility == '0'
                                                    ? null
                                                    : v

                return filteredChatMessages
                    ? <div key={i} className={`${v.display_name == 'system' ? 'text-green-400' : ''} 
                    hover:bg-darkblue-3/30 text-2xs lg:text-xs py-1`}>
                        <ChatItem messageData={v} />
                    </div>
                    : null
            })}
        </div>
    )
}

function ChatItem({ messageData }: {messageData: Omit<IChat, 'channel'|'token'>}) {
    const {display_name, message_text, message_time, visibility} = messageData
    // emote message stuff
    const emoList = emotes.list
    const modifiedMessageText = []
    // find the emote
    const message_word = message_text.split(' ')
    message_word.forEach((word, i) => {
        // find emote format in message text
        const findEmote = emoList.map(emo => emo.alias).indexOf(word)
        findEmote !== -1
            // emote found, create img element
            ? modifiedMessageText.push(<img key={i} src={emoList[findEmote].url} alt={emoList[findEmote].alias} className={`${emoList[findEmote].class} !inline !h-5 lg:!h-6 mx-px`} />)
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
                return <Image key={i} src={v.url} alt={v.alias} width={50} height={50} title={v.name} className={`${v.class} !h-min my-auto hover:bg-darkblue-3`} priority={true} unoptimized onClick={handleChosenEmote} />
            })}
        </div>
    )
}

export function ChatCommands() {
    const miscState = useMisc()

    // chat commands ref
    const chatCommandsRef = useRef()
    clickOutsideElement(chatCommandsRef, () => miscState.showChatCommands ? miscState.setShowChatCommands(false) : null)

    const commands = [
        {key: '/on', purpose: 'to make chat box persist'},
        {key: '/off', purpose: 'to make chat box auto hide'},
        {key: '/sys', purpose: 'to show/hide player chats'},
        {key: '/myroom', purpose: 'to join your game room'},
        {key: '/chatwith name', purpose: 'to show chat from specific users'},
        {key: '/findroom name', purpose: 'to find room by name'},
        {
            key: 'shorthand', 
            purpose: `/mr is short for /myroom-
                    /fr is short for /findroom-
                    /cw is short for /chatwith`
        },
        {
            key: 'note', 
            purpose: `/fr * = display all rooms-
                    /cw abc = display chat from abc-
                    /cw abc,xyz = display chat from abc & xyz`
        },
    ]
    
    return (
        <div ref={chatCommandsRef} className="absolute z-10 bg-darkblue-1 border-8bit-text w-max text-2xs lg:text-xs leading-tight">
            <p className="border-b"> chat commands </p>
            <ul className="text-left">
                {commands.map((v,i) => 
                    v.key == 'shorthand' || v.key == 'note'
                        ? <li key={i} className={`${v.key == 'note' ? 'text-orange-400' : ''} lg:mt-2`}>
                            <p className="border-b text-center"> {v.key} </p>
                            <p className="whitespace-pre-line leading-none pt-1"> 
                                {v.purpose.trim().replaceAll('-', '\n')} 
                            </p>
                        </li>
                        : <li key={i}>
                            <span className="text-green-400"> {v.key}: </span>
                            <span> {v.purpose} </span>
                        </li>)}
            </ul>
        </div>
    )
}

export async function sendChat(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext, id?: number, rewardData?: any) {
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
        message_time: `${getHours}:${getMinutes}`,
        visibility: '1',
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // toggle chat box (for room list)
            if(input.value.match(/\/on|\/off|\/ch|\/sys|\/myroom|\/mr|\/chatwith|\/cw|\/findroom|\/fr/))
                return chatCommandsListener(input, input.value, inputValues, miscState, gameState)
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
            const guestModeError = gameState.guestMode ? `❌ ${chatResponse.status}: ${translateUI({lang: miscState.language, text: 'login required'})}` : null
            const errorMessage = chatResponse.status === 429 
                                ? translateUI({lang: miscState.language, text: 'typing too fast'})
                                : chatResponse.message
            inputValues.display_name = 'system'
            inputValues.message_text = guestModeError || `${chatResponse.status} ${errorMessage}`
            miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
            return
    }
}

function chatCommandsListener(inputElement: HTMLInputElement, inputValue: string, inputValues: any, miscState: IMiscContext, gameState: IGameContext) {
    const [command, param] = inputValue.split(' ')
    switch(command) {
        case '/on':
            miscState.setIsChatFocus('stay')
            inputValues.display_name = 'system'
            inputValues.message_text = translateUI({lang: miscState.language, text: '✅ chat box will persist'})
            miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
            inputElement.value = ''
            return
        case '/off':
            miscState.setIsChatFocus('off')
            inputValues.display_name = 'system'
            inputValues.message_text = translateUI({lang: miscState.language, text: '❌ chat box back to normal'})
            miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
            inputElement.value = ''
            return
        case '/ch':
            inputValues.display_name = 'system'
            inputValues.message_text = inputValues.channel.split('-')[1]
            miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
            inputElement.value = ''
            return
        case '/sys':
            // filter messages after run the command
            miscState.setMessageItems(data => {
                const newData = [...data]
                // make sure the author is system
                const isAuthorSystem = newData.map(v => v.display_name).lastIndexOf('system')
                // has /sys command been triggered?
                const isTriggered = newData[isAuthorSystem].message_text == 'display system messages'
                // has'nt triggered yet
                if(isTriggered) {
                    inputValues.display_name = 'system'
                    inputValues.message_text = 'display everyone messages'
                    setChatCommandsToStorage('pop', command)
                    // show everyone messages
                    const showMessages = newData
                                        // remove system message
                                        .map(v => v.message_text == 'display system messages' ? null : v)
                                        .filter(i => i)
                                        // show all message
                                        .filter(v => v.visibility = '1')
                    return [...showMessages, inputValues]
                }
                else {
                    inputValues.display_name = 'system'
                    inputValues.message_text = 'display system messages'
                    // set command to local storage to filter every new chat comes in
                    setChatCommandsToStorage('push', command)
                    // hide player messages, show system messages
                    const hideMessages = newData
                                        // remove system message
                                        .map(v => v.message_text == 'display everyone messages' ? null : v)
                                        .filter(i => i)
                                        // show system message
                                        .filter(v => v.display_name == 'system' ? v.visibility = '1' : v.visibility = '0')
                    return [...hideMessages, inputValues]
                }
            })
            inputElement.value = ''
            return
        case '/myroom': case '/mr':
            inputValues.display_name = 'system'
            inputValues.message_text = `command ini belom jadi`
            miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
            inputElement.value = ''
            return
        case '/chatwith': case '/cw':
            // only allow if cw param has comma
            // param format wrong
            if(!param.match(/\*$|^[a-zA-Z0-9\s,]{4,}$/)) {
                inputValues.display_name = 'system'
                inputValues.message_text = `chat with ???`
                miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
                inputElement.value = ''
                return
            }
            // param format correct 
            // filter messages after run the command
            miscState.setMessageItems(data => {
                const newData = [...data]
                // make sure the author is system
                const isAuthorSystem = newData.map(v => v.display_name).lastIndexOf('system')
                // has /sys command been triggered?
                const isTriggered = newData[isAuthorSystem].message_text.match(/^chat with [a-zA-Z0-9\s,]{4,}$/)
                // has triggered
                if(isTriggered) {
                    // set system message
                    inputValues.display_name = 'system'
                    inputValues.message_text = param == '*' ? `chat with all` : null
                    // set command to local storage to filter every new chat comes in
                    setChatCommandsToStorage('pop', `/cw=${param}`)
                    // show everyone messages
                    const showMessages = newData
                                        // remove system message
                                        .map(v => v.display_name == 'system' && v.message_text.match(/^chat with [a-zA-Z0-9\s,]{4,}$/) ? null : v)
                                        .filter(i => i)
                                        // show all message
                                        .filter(v => v.visibility = '1')
                    return [...showMessages, inputValues]
                }
                // has'nt triggered
                else {
                    // add yourself to chat
                    const specificPlayers = `${gameState.myPlayerInfo.display_name},${param}`
                    // set system message
                    inputValues.display_name = 'system'
                    inputValues.message_text = `chat with ${specificPlayers}`
                    // set command to local storage to filter every new chat comes in
                    setChatCommandsToStorage('push', `/cw=${specificPlayers}`)
                    // hide player messages, show system messages
                    const hideMessages = newData
                                        // remove system message
                                        .map(v => v.display_name == 'system' && v.message_text == 'chat with *' ? null : v)
                                        .filter(i => i)
                                        // show specific player message
                                        .filter(v => specificPlayers.match(v.display_name) ? v.visibility = '1' : v.visibility = '0')
                    return [...hideMessages, inputValues]
                }
            })
            inputElement.value = ''
            return
        case '/findroom': case '/fr':
            if(!param) {
                inputValues.display_name = 'system'
                inputValues.message_text = `nothing to find`
                miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
                inputElement.value = ''
                return
            }
            inputValues.display_name = 'system'
            inputValues.message_text = param == '*' ? `display all rooms` : `display rooms starts with '${param}'`
            miscState.setMessageItems(data => data ? [...data, inputValues] : [inputValues])
            // setChatCommandsToStorage(command)
            // filter game rooms
            gameState.setRoomList(rooms => {
                const newRooms = [...rooms]
                // display all rooms
                if(param == '*') 
                    return newRooms.filter(v => v.visibility = '1')
                // filter rooms by name
                else 
                    return newRooms.filter(v => v.room_name.startsWith(param) ? v.visibility = '1' : v.visibility = '0')
            })
            inputElement.value = ''
            return
    }
}

/**
 * @param action push = add command, pop = remove command
 * @param command chat command
 */
function setChatCommandsToStorage(action: 'push'|'pop', command: string) {
    const getChatCommands = localStorage.getItem('chatCommands') || '[]'
    const parseChatCommands = JSON.parse(getChatCommands) as string[]
    if(parseChatCommands.length === 0) {
        // empty local storage
        if(action == 'push') localStorage.setItem('chatCommands', JSON.stringify([command]))
        else localStorage.setItem('chatCommands', JSON.stringify(parseChatCommands.filter(v => !v.match(command))))
    }
    else {
        // local storage with some values
        if(action == 'push') {
            // prevent duplicate commands
            localStorage.setItem('chatCommands', JSON.stringify([...parseChatCommands, command]))
        }
        else localStorage.setItem('chatCommands', JSON.stringify(parseChatCommands.filter(v => !v.match(command))))
    }
}

function getChatCommandsFromStorage(command: string): [string, string] {
    const getChatCommands = localStorage.getItem('chatCommands') || '[]'
    const parseChatCommands = JSON.parse(getChatCommands) as string[]
    const findCommand = parseChatCommands.filter(v => v.match(command))

    if(findCommand.length > 0) {
        // split command and param
        const [tempCommand, tempParam] = findCommand[0]?.split('=')
        return [tempCommand, tempParam]
    }
    return [null, null]
}

export function chatMessageListener(data: PubNub.Subscription.Message, miscState: IMiscContext, gameState: IGameContext) {
    const getMessage = data.message as PubNub.Payload & IChat & {onlinePlayers: string}
    // add chat
    if(getMessage.message_text) {
        const chatData: Omit<IChat, 'channel'|'token'> = {
            display_name: getMessage.display_name,
            message_text: getMessage.message_text,
            message_time: getMessage.message_time,
            visibility: getMessage.visibility,
        }
        miscState.setMessageItems(data => {
            // filter chat data if exceed 200 messages
            const chats = data
            if(chats.length > 200) 
                return [...chats.slice(-200), chatData]
            return [...chats, chatData]
        })
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