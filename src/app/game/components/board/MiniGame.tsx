import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"
import { minigameAnswer } from "../../helper/game-tile-event-minigame"

export default function MiniGame() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className={`relative z-10 top-[15%] lg:top-[25%] flex-col gap-2 bg-darkblue-1 border-8bit-text w-2/3 lg:w-2/4 leading-relaxed
        ${gameState.showMiniGame ? 'flex' : 'hidden'}
        ${miscState.animation ? 'animate-slide-down' : 'animate-slide-up'}`}>
            <p className="border-b-2 p-1"> 
                <span> Mini Game - {translateUI({lang: miscState.language, text: 'Scattergories'})} </span>
                <span id="minigame_unknown_status" className="absolute right-1"></span>
            </p>

            {/* question */}
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
                <span id="minigame_timer" className="block"></span>
            </p>

            {/* answer form */}
            {gameState.minigameAnswerList
                .map(v => v.display_name)
                .indexOf(gameState.myPlayerInfo.display_name) !== -1
                // remove form after send answer
                ? null
                // display form
                : <form className="flex flex-col items-center justify-center" onSubmit={ev => minigameAnswer(ev, miscState, gameState)}>
                    <div>
                        <label htmlFor="minigame_answer">
                            {translateUI({lang: miscState.language, text: 'answer'})}:
                        </label>
                        <input type="text" id="minigame_answer" className="w-2/4 px-1" minLength={3} placeholder="type your answer" />
                        <button type="submit" id="minigame_answer_submit" className="min-w-8 bg-blue-500 border-8bit-primary !mx-4">
                            {translateUI({lang: miscState.language, text: 'send'})}
                        </button>
                    </div>
                </form>
            }

            {/* result info */}
            <p id="minigame_result"></p>

            {/* answer list */}
            <div className="flex flex-col justify-center p-1 border-t-2">
                <p> {translateUI({lang: miscState.language, text: 'answer list'})} </p>
                <div id="minigame_answer_list">
                    {gameState.minigameAnswerList.map((v,i) => {
                        const answerStatusClass = v.status == 'correct' ? 'text-green-400' 
                                                : v.status == 'wrong' ? 'text-red-400'
                                                                        : 'text-gray-400'

                        return (
                            <div key={i} className="grid grid-cols-3" data-answer={`${v.display_name},${v.answer},${v.status},${v.event_money}`}>
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