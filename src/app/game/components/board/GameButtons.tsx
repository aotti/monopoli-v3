import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"

export default function GameButtons() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <>
            {/* username + laps */}
            <div className="flex justify-around mx-auto w-52 lg:w-72">
                <p> dengkul </p>
                <p> {translateUI({lang: miscState.language, text: 'lap'})}: 1 </p>
            </div>
            {/* ready + leave */}
            <div className="relative z-10 flex gap-6 mx-auto w-52 lg:w-72">
                <button type="button" className="min-w-24 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'ready'})} </button>
                <button type="button" className="min-w-24 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'leave'})} </button>
            </div>
            {/* roll dice + roll turn */}
            {/* <div className="relative z-10 flex gap-6 mx-auto w-52 lg:w-72">
                <button type="button" className="min-w-24 bg-primary border-8bit-primary active:opacity-75"
                onClick={() => gameState.setRollNumber('dice')}> 
                    {translateUI({lang: miscState.language, text: 'roll dice'})} 
                </button>
                <button type="button" className="min-w-24 bg-primary border-8bit-primary active:opacity-75"
                onClick={() => gameState.setRollNumber('turn')}> 
                    {translateUI({lang: miscState.language, text: 'roll turn'})} 
                </button>
            </div> */}
            {/* roll dice + surrend */}
            {/* <div className="relative z-10 flex gap-6 mx-auto w-52 lg:w-72">
                <button type="button" className="min-w-24 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'roll dice'})} </button>
                <button type="button" className="min-w-24 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'surrender'})} </button>
            </div> */}
            {/* player turn notif */}
            <div className="mx-auto">
                <span> {miscState.language == 'english' ? `dengkul turn` : `giliran dengkul`} </span>
            </div>
        </>
    )
}