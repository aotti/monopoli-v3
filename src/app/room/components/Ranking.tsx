import { useGame } from "../../../context/GameContext"
import { useMisc } from "../../../context/MiscContext"
import { moneyFormat, translateUI } from "../../../helper/helper"
import { viewRanking } from "../helper/functions"

export default function Ranking() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div id="ranking_modal" className={`relative z-20 bg-darkblue-3 border-8bit-modal px-2 w-[45vw] lg:w-[35vw]
        ${miscState.showModal == 'ranking' ? 'block' : 'hidden'} 
        ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'}`}>
            {/* modal head */}
            <div className="flex justify-between border-b-2 mb-2">
                <span> {translateUI({lang: miscState.language, text: 'Ranking'})} </span>
                <span id="last_updated_ranking"></span>
            </div>
            {/* modal body */}
            <div className="flex flex-col gap-2 lg:gap-4">
                {/* ranking head */}
                <div className="grid grid-cols-6">
                    <span> No. </span>
                    <div className="col-span-5 grid grid-cols-2">
                        <span> Player </span>
                        <span> Worst Lose </span>
                    </div>
                </div>
                {/* ranking body */}
                {gameState.rankingInfo.length > 0 
                    ? gameState.rankingInfo.map((v,i) => 
                        <div key={i} className={`grid grid-cols-6 ${i < 3 ? 'text-rose-300' : 'text-gray-200'}`}>
                            <span> {i+1}. </span>
                            <div className="col-span-5 grid grid-cols-2">
                                <span> {v.display_name} </span>
                                <span> {moneyFormat(v.worst_money_lost)} </span>
                            </div>
                        </div>)
                    : <div className="text-center">
                        <span id="result_message_ranking">getting ranking..</span>
                    </div>
                }
            </div>
            {/* modal footer */}
            <div className="flex justify-around mt-2 border-t-2">
                <button type="button" className="text-green-300 p-1 active:opacity-75 hover:animate-jump" onClick={() => viewRanking(gameState, true)}>
                    Refresh
                </button>
                <button type="button" className="text-red-300 p-1 active:opacity-75 hover:animate-jump" onClick={() => { 
                    // set false to give zoom-out animate class
                    miscState.setAnimation(false); 
                    // timeout to wait the animation zoom-out
                    setTimeout(() => miscState.setShowModal(null), 200) 
                }}> 
                    {translateUI({lang: miscState.language, text: 'Close'})} 
                </button>
            </div>
        </div>
    )
}