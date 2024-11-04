import { useRef } from "react"
import { clickOutsideElement } from "../../../../helper/helper"
import { useGame } from "../../../../context/GameContext"

export default function PlayerSettingGameHistory() {
    const gameState = useGame()
    const gameHistoryRef = useRef()
    clickOutsideElement(gameHistoryRef, () => gameState.setShowGameHistory(false))

    return (
        <div ref={gameHistoryRef} className={`${gameState.displaySettingItem == 'game_history' ? 'visible' : 'invisible'} text-2xs lg:text-xs`}>
            {/* history container */}
            <div className={`absolute left-2 bottom-8 flex flex-col items-center transition-all ease-in-out duration-500
            w-[14vw] ${gameState.showGameHistory ? 'h-[55vh]' : 'h-[5vh]'} bg-darkblue-1 border-2`}>
                {/* history content */}
                <div className="h-[45vh] overflow-y-scroll p-1">
                    <div className="border-b-2 border-dashed">
                        <p className="text-green-400"> dengkul </p>
                        <p> roll dice 6 </p>
                    </div>
                    <div className="border-b-2 border-dashed">
                        <p className="text-green-400"> dengkul </p>
                        <p> buy jakarta city </p>
                    </div>
                    <div className="border-b-2 border-dashed">
                        <p className="text-green-400"> lele </p>
                        <p> roll dice 3 </p>
                    </div>
                    <div className="border-b-2 border-dashed">
                        <p className="text-green-400"> lele </p>
                        <p> go to jail </p>
                    </div>
                    <div className="border-b-2 border-dashed">
                        <p className="text-green-400"> dengkul </p>
                        <p> roll dice 6 </p>
                    </div>
                </div>
                <p className="absolute bottom-0 z-20 w-full text-[1vw] text-center py-1 lg:py-2 cursor-pointer bg-darkblue-1 border-t-2"
                onClick={() => gameState.setShowGameHistory(b => !b)} > 
                    game history 
                </p>
            </div>
        </div>
    )
}