import { FormEvent, useEffect } from "react"
import { useGame } from "../context/GameContext"
import { useMisc } from "../context/MiscContext"
import { cE, fetcher, fetcherOptions, qS, setInputValue, translateUI } from "../helper/helper"
import { IChat, IMiscContext, IResponse } from "../helper/types"

export default function ChatBox({ page }: {page: 'room'|'game'}) {
    const miscState = useMisc()
    const gameState = useGame()

    // scroll to bottom
    useEffect(() => {
        const chatContainer = qS('#chat_container')
        if(chatContainer) chatContainer.scrollTo({top: chatContainer.scrollHeight})
    }, [miscState.messageItems])
    
    return (
        page == 'room'
            // room list
            ? <div id="chat_container" className="h-4/5 p-1 overflow-y-scroll bg-darkblue-1/60 border-b-2">
                <ChatContainer />
            </div>
            // game room
            : <div id="chat_container" className={`${gameState.gameSideButton == 'chat' ? 'block' : 'hidden'}
            absolute top-[0vh] right-[calc(0rem+2.25rem)] lg:right-[calc(0rem+2.75rem)] 
            text-left [writing-mode:horizontal-tb] p-1 overflow-y-scroll overflow-x-hidden
            bg-darkblue-1 border-8bit-text w-[30vw] h-[calc(100%-1rem)]`}>
                <ChatContainer />
                {/* chat input */}
                <form className="absolute bottom-0 flex items-center justify-center gap-2 w-full" onSubmit={ev => ev.preventDefault()}>
                    <input type="hidden" id="display_name" value={gameState.myPlayerInfo?.display_name} />
                    <input type="text" id="message_text" className="w-4/5 lg:h-10 lg:p-1" minLength={1} maxLength={60}
                    placeholder={translateUI({lang: miscState.language, text: 'chat here'})} autoComplete="off" required />
                    <button type="submit" className="w-6 lg:w-10 active:opacity-50">
                        <img src="https://img.icons8.com/?size=100&id=2837&format=png&color=FFFFFF" alt="send" />
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
    const {display_name, message_text, time} = messageData

    return (
        <>
            <span className="text-orange-200"> {display_name}: </span>
            <span> {message_text} </span>
            <small className={display_name == 'system' ? 'text-white' : 'text-green-400'}> {time} </small>
        </>
    )
}

export async function sendChat(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext) {
    ev.preventDefault()

    const messageInput = qS('#message_text') as HTMLInputElement
    // input value container
    const inputValues: IChat = {
        channel: 'monopoli-roomlist',
        display_name: null,
        message_text: null,
        time: new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // toggle chat box (for room list)
            if(input.value == '/on') {
                miscState.setIsChatFocus('stay')
                messageInput.value = ''
                return
            }
            else if(input.value == '/off') {
                miscState.setIsChatFocus('off')
                messageInput.value = ''
                return
            }
            // filter message
            else if(setInputValue('display_name', input)) inputValues.display_name = input.value.trim()
            else if(setInputValue('message_text', input)) inputValues.message_text = input.value.trim()
            // error
            else {
                console.log('error', inputValues);
                
                inputValues.display_name = 'system'
                inputValues.message_text = 'only letter, number, spaces and symbols .,#-+=@?! allowed'
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