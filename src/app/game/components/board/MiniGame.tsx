import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"

export default function MiniGame() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className={`relative z-10 top-[15%] lg:top-[30%] flex-col gap-2 bg-darkblue-1 border-8bit-text w-2/3 lg:w-2/4 leading-relaxed
        ${gameState.showMiniGame ? 'flex' : 'flex'}
        ${miscState.animation ? 'animate-slide-down' : 'animate-slide-up'}`}>
            <p id="minigame_title" className="border-b-2 p-1"> Mini Game - ABC 5 Dasar </p>
            <p id="minigame_category"> Categories: X, Y, Z </p>
            <p id="minigame_question"> Name an object starting with the letter A or B based on categories! </p>

            <form className="flex items-center justify-center" onSubmit={ev => ev.preventDefault()}>
                <label htmlFor="minigame_answer"> answer: </label>
                <input type="text" id="minigame_answer" className="w-2/4 px-1" placeholder="type your answer" />
                <button type="submit" className="bg-blue-500 border-8bit-primary !mx-4"> send </button>
            </form>

            <div className="flex flex-col justify-center p-1">
                <p className="border-t-2"> answer list </p>
                <div className="grid grid-cols-3">
                    <span className="text-green-400"> wawan </span>
                    <span className="text-green-400"> apel </span>
                    <span className="text-green-400"> +Rp 10000 </span>
                    <span className="text-red-400"> bang yugo </span>
                    <span className="text-red-400"> burung </span>
                    <span className="text-red-400"> +Rp 5000 </span>
                </div>
            </div>
        </div>
    )
}