import { useGame } from "../../../../context/GameContext"

export default function PlayerSection() {
    const gameState = useGame()

    return (
        <div className={`${gameState.gameSideButton == 'players' ? 'block' : 'hidden'}
        absolute top-[0vh] right-[calc(0rem+2.25rem)] lg:right-[calc(0rem+2.75rem)] 
        [writing-mode:horizontal-tb] p-1 overflow-y-scroll
        bg-darkblue-1 border-8bit-text w-[35vw] h-[calc(100%-1rem)]`}>
            <p className="text-xs lg:text-sm border-b-2 pb-1 mb-1"> players </p>
            <div className="flex flex-col gap-1">
                {/* player 1 */}
                <div className="flex items-stretch text-center gap-1">
                    <div className="flex items-center w-[17vw] bg-darkblue-2">
                        <span className="w-full"> dengkul lele </span>
                    </div>
                    <div className="flex items-center w-[15vw] bg-darkblue-2">
                        <span className="w-full"> Rp 750.000 </span>
                    </div>
                    <div className="flex items-center bg-darkblue-2">
                        <img src="https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=FFFFFF" alt="note" className="w-8 lg:w-14" />
                    </div>
                </div>
                {/* player 2 */}
                <div className="flex items-stretch text-center gap-1">
                    <div className="flex items-center w-[17vw] bg-darkblue-2">
                        <span className="w-full"> tersometimes </span>
                    </div>
                    <div className="flex items-center w-[15vw] bg-darkblue-2">
                        <span className="w-full"> Rp 50.000 </span>
                    </div>
                    <div className="flex items-center bg-darkblue-2">
                        <img src="https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=FFFFFF" alt="note" className="w-8 lg:w-14" />
                    </div>
                </div>
            </div>
        </div>
    )
}