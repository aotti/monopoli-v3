import { useGame } from "../../../../context/GameContext"

export default function PlayerSettingGameHistory() {
    const gameState = useGame()

    return (
        <div className={`${gameState.displaySettingItem == 'game_history' ? 'block' : 'hidden'}
        absolute top-9 bg-darkblue-2 
        w-[calc(100%-.5rem)] h-[calc(100%-2.5rem)]`}>
            <div className="flex flex-col p-1">
                {/* title */}
                <div className="mb-1">
                    <span className="border-b-2 pb-1"> game history </span>
                </div>
                {/* history list */}
                <div className="flex flex-col gap-2 h-36 lg:h-[17rem] overflow-y-scroll">
                    <div className="flex justify-between">
                        <span> dengkul </span>
                        <span> roll dice 6 </span>
                    </div>
                    <div className="flex justify-between">
                        <span> dengkul </span>
                        <span> buy jakarta city </span>
                    </div>
                </div>
                {/* close button */}
                <div className="w-[calc(100%-.5rem)] p-1 border-t-2">
                    <button type="button" onClick={() => gameState.setDisplaySettingItem(null)}> Close </button>
                </div>
            </div>
        </div>
    )
}