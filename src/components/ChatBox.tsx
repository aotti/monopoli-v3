import { useGame } from "../context/GameContext"

export default function ChatBox({ page }: {page: 'room'|'game'}) {
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
            text-left [writing-mode:horizontal-tb] p-1 overflow-y-scroll
            bg-darkblue-1 border-8bit-text w-[30vw] h-[calc(100%-1rem)]`}>
                <ChatMessages />
            </div>
    )
}

function ChatMessages() {
    return (
        <>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs text-green-400">
                <span className="text-orange-200"> system: </span>
                <span> only player in this room can see the chat </span>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> lemao: </span>
                <span> mabar bang </span>
                <small> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> dengkul: </span>
                <span> terkadang sometimes </span>
                <small> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> lemao: </span>
                <span> mangsud? </span>
                <small> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> yugo oniichan: </span>
                <span> bismillah bts taun depan :pray: </span>
                <small> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
        </>
    )
}