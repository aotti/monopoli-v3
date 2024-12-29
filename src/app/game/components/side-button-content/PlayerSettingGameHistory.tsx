import { qS, translateUI } from "../../../../helper/helper"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { useEffect } from "react"

export default function PlayerSettingGameHistory() {
    const miscState = useMisc()
    const gameState = useGame()

    useEffect(() => {
        // scroll to bottom when new history appear
        const historyContainer = qS('#history_container')
        if(historyContainer) historyContainer.scrollTo({top: historyContainer.scrollHeight})
    }, [gameState.gameHistory])

    return (
        <div className={`absolute -left-2 bottom-8 flex flex-col items-center transition-all ease-in-out duration-500
        w-[14vw] ${gameState.showGameHistory ? 'h-[55vh]' : 'h-[5vh]'} bg-darkblue-1 border-2`}>
            {/* history content */}
            <div id="history_container" className="flex flex-col gap-2 w-full h-[45vh] overflow-y-scroll scrollbar-none p-1">
                {gameState.gameHistory.map((v,i) => v.room_id != gameState.gameRoomId ? null : 
                    <div key={i} className="border-b-2 border-dashed">
                        <p className="text-green-400"> {v.display_name} </p>
                        <p> {v.history.replace(':', '')} </p>
                    </div>
                )}
            </div>
            <p className="absolute bottom-0 z-20 w-full text-[1vw] text-center py-1 lg:py-2 cursor-pointer bg-darkblue-1 border-t-2"
            onClick={() => gameState.setShowGameHistory(b => !b)} > 
                {translateUI({lang: miscState.language, text: 'Game History', lowercase: true})} 
            </p>
        </div>
    )
}