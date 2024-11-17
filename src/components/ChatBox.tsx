import { useGame } from "../context/GameContext"
import { useMisc } from "../context/MiscContext"
import { translateUI } from "../helper/helper"

export default function ChatBox({ page }: {page: 'room'|'game'}) {
    const miscState = useMisc()
    const gameState = useGame()
    
    return (
        page == 'room'
            // room list
            ? <div className="flex flex-col gap-2 h-4/5 p-1 overflow-y-scroll bg-darkblue-1/60 border-b-2">
                <ChatMessages />
            </div>
            // game room
            : <div className={`${gameState.gameSideButton == 'chat' ? 'block' : 'hidden'}
            absolute top-[0vh] right-[calc(0rem+2.25rem)] lg:right-[calc(0rem+2.75rem)] 
            text-left [writing-mode:horizontal-tb] p-1 
            flex flex-col gap-2 overflow-y-scroll overflow-x-hidden
            bg-darkblue-1 border-8bit-text w-[30vw] h-[calc(100%-1rem)]`}>
                <ChatMessages />
                {/* chat input */}
                <div className="absolute bottom-0 flex items-center justify-center gap-2 w-full">
                    <input type="text" className="w-4/5 lg:h-10 lg:p-1" 
                    placeholder={translateUI({lang: miscState.language, text: 'chat here'})} required />
                    <button type="submit" className="w-6 lg:w-10 active:opacity-50">
                        <img src="https://img.icons8.com/?size=100&id=2837&format=png&color=FFFFFF" alt="send" />
                    </button>
                </div>
            </div>
    )
}

function ChatMessages() {
    const miscState = useMisc()

    return (
        <>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs text-green-400">
                <span className="text-orange-200"> system: </span>
                <span> {translateUI({lang: miscState.language, text: 'only player in this room can see the chat'})} </span>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> lemao: </span>
                <span> mabar bang </span>
                <small className="text-green-400"> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> dengkul: </span>
                <span> terkadang sometimes </span>
                <small className="text-green-400"> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> lemao: </span>
                <span> mangsud? </span>
                <small className="text-green-400"> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> yugo oniichan: </span>
                <span> bismillah bts taun depan :pray: </span>
                <small className="text-green-400"> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
        </>
    )
}