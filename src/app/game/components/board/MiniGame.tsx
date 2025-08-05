import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"
import { stopByMinigame } from "../../helper/game-tile-event-minigame"

export default function MiniGame() {
    const miscState = useMisc()
    const gameState = useGame()

    const answerListDummy = [
        {display_name: 'wawan', answer: 'apel', status: 'correct', event_money: 10_000},
        {display_name: 'bang yugo', answer: 'burung', status: 'wrong', event_money: 5_000},
    ]

    return (
        <div className={`relative z-10 top-[15%] lg:top-[30%] flex-col gap-2 bg-darkblue-1 border-8bit-text w-2/3 lg:w-2/4 leading-relaxed
        ${gameState.showMiniGame ? 'flex' : 'flex'}
        ${miscState.animation ? 'animate-slide-down' : 'animate-slide-up'}`}>
            <p id="minigame_title" className="border-b-2 p-1"> 
                Mini Game - {translateUI({lang: miscState.language, text: 'Scattergories'})} 
                <button className="absolute right-1" onClick={() => stopByMinigame(miscState, gameState)}> test </button>
            </p>
            <p> 
                <span> {translateUI({lang: miscState.language, text: 'Categories: '})} </span>
                <span className="minigame_category text-green-400"> category_1 </span>
                <span className="minigame_category text-green-400"> category_2 </span>
                <span className="minigame_category text-green-400"> category_3 </span>
            </p>
            <p id="minigame_question"> 
                <span> {translateUI({lang: miscState.language, text: 'Name an object starting with the letter '})} </span>
                <span className="minigame_letter text-green-400"> letter_1 </span>
                <span className="minigame_letter text-green-400"> letter_2 </span>
                <span className="minigame_letter text-green-400"> letter_3 </span>
                <span> {translateUI({lang: miscState.language, text: ' based on categories!'})} </span>
            </p>

            <form className="flex items-center justify-center" onSubmit={ev => ev.preventDefault()}>
                <label htmlFor="minigame_answer">
                    {translateUI({lang: miscState.language, text: 'answer'})}:
                </label>
                <input type="text" id="minigame_answer" className="w-2/4 px-1" placeholder="type your answer" />
                <button type="submit" className="bg-blue-500 border-8bit-primary !mx-4">
                    {translateUI({lang: miscState.language, text: 'send'})}
                </button>
            </form>

            <div className="flex flex-col justify-center p-1">
                <p className="border-t-2">
                    {translateUI({lang: miscState.language, text: 'answer list'})}
                </p>
                <div id="minigame_answer_list">
                    {answerListDummy.map((v,i) => {
                        const answerStatusClass = v.status === 'correct' ? 'text-green-400' : 'text-red-400'

                        return (
                            <div key={i} className="grid grid-cols-3">
                                <span className={answerStatusClass}> {v.display_name} </span>
                                <span className={answerStatusClass}> {v.answer} </span>
                                <span className={answerStatusClass}> +Rp {v.event_money} </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}