import { useGame } from "../../../../context/GameContext"

export default function PlayerSettingAttackCity() {
    const gameState = useGame()

    return (
        <div className={`${gameState.displaySettingItem == 'attack_city' ? 'block' : 'hidden'}
        absolute top-9 bg-darkblue-2 
        w-[calc(100%-.5rem)] h-[calc(100%-2.5rem)]`}>
            <div className="flex flex-col p-1">
                {/* title */}
                <div className="mb-1">
                    <span className="border-b-2 pb-1"> attack city </span>
                </div>
                {/* history list */}
                <div className="flex flex-col gap-2 h-36 lg:h-[17rem] overflow-y-scroll">
                    <span> coming not soon 😂 </span>
                </div>
                {/* close button */}
                <div className="w-[calc(100%-.5rem)] p-1 border-t-2 active:opacity-75">
                    <button type="button" onClick={() => gameState.setDisplaySettingItem(null)}> Close </button>
                </div>
            </div>
        </div>
    )
}