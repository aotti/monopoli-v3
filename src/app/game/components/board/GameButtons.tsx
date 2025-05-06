import { FormEvent } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { qS, translateUI } from "../../../../helper/helper"
import { IGameContext, IMiscContext } from "../../../../helper/types"
import { leaveGameRoom, readyGameRoom, rollDiceGameRoom, rollTurnGameRoom, startGameRoom, surrenderGameRoom } from "../../helper/game-prepare-playing-logic"
import { GameNotifPlayerTurn } from "./GameNotif"

export default function GameButtons() {
    const miscState = useMisc()
    const gameState = useGame()
    // get my lap
    const findLap = gameState.gamePlayerInfo?.map(v => v.display_name).indexOf(gameState.myPlayerInfo?.display_name)
    const myLap = gameState.gamePlayerInfo[findLap]?.lap

    return (
        <form className="flex flex-col gap-2 lg:gap-3 mx-auto w-fit px-2 text-center animate-fade animate-delay-100" onSubmit={ev => manageFormSubmits(ev, miscState, gameState)}>
            {/* username + laps */}
            <div className="flex justify-around mx-auto w-52 lg:w-72">
                <p> {gameState.myPlayerInfo?.display_name} </p>
                <p> {translateUI({lang: miscState.language, text: 'lap'})}: {myLap} </p>
            </div>
            {/* game over will result in null */}
            {/* ready + leave */}
            {gameState.gameStages == 'prepare' ? <PreparationButtons /> : null}
            {/* roll dice + roll turn */}
            {gameState.gameStages == 'decide' ? <DecideTurnButtons /> : null}
            {/* roll dice + surrend */}
            {gameState.gameStages == 'play' ? <RollTurnButtons /> : null}
            {/* player turn notif */}
            <GameNotifPlayerTurn />
        </form>
    )
}

function PreparationButtons() {
    const miscState = useMisc()

    return (
        <div className="relative z-10 flex justify-around gap-6 mx-auto w-52 lg:w-72">
            <div>
                <button type="submit" id="ready_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'ready'})} </button>
            </div>
            <div>
                <button type="submit" id="leave_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'leave'})} </button>
            </div>
        </div>
    )
}

function DecideTurnButtons() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className="relative z-10 flex justify-around gap-6 mx-auto w-52 lg:w-72">
            <div>
                <button type="button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0" disabled> 
                    {translateUI({lang: miscState.language, text: 'roll dice'})} 
                </button>
            </div>
            <div>
                <input type="hidden" id="rolled_number" />
                <button type="submit" id="roll_turn_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"
                onClick={() => gameState.setRollNumber('turn')}> 
                    {translateUI({lang: miscState.language, text: 'roll turn'})} 
                </button>
            </div>
        </div>
    )
}

function RollTurnButtons() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className="relative z-10 flex justify-around gap-6 mx-auto w-52 lg:w-72">
            <div>
                <input type="hidden" id="rolled_dice" />
                <button type="submit" id="roll_dice_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"
                onClick={() => gameState.setRollNumber('dice')}> 
                    {translateUI({lang: miscState.language, text: 'roll dice'})} 
                </button>
            </div>
            <div>
                <button type="submit" id="surrender_button" className={`min-w-20 bg-primary border-8bit-primary active:opacity-75
                ${miscState.disableButtons == 'gameroom' ? 'saturate-0' : ''}`}
                disabled={miscState.disableButtons == 'gameroom' ? true : false}> 
                    {translateUI({lang: miscState.language, text: 'surrender'})} 
                </button>
            </div>
        </div>
    )
}

function manageFormSubmits(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()
    // submitter
    const submitterId = (ev.nativeEvent as any).submitter.id
    // form inputs
    const formInputs = ev.currentTarget.elements

    switch(submitterId) {
        // leave room function
        case `leave_button`: leaveGameRoom(miscState, gameState); break
        // ready game function
        case `ready_button`: readyGameRoom(miscState, gameState); break
        // start game function
        case `start_button`: startGameRoom(miscState, gameState); break
        // surrender function
        case 'surrender_button': surrenderGameRoom(miscState, gameState); break
        // roll turn function
        case `roll_turn_button`: 
            // submit button
            const rollTurnButton = qS('#roll_turn_button') as HTMLInputElement
            // loading button
            const tempRollTurnText = rollTurnButton.textContent
            rollTurnButton.textContent = 'Loading'
            rollTurnButton.disabled = true
            setTimeout(() => rollTurnGameRoom(formInputs, tempRollTurnText, miscState, gameState), 2500); break
        // roll dice function
        case `roll_dice_button`: 
            // roll dice button
            const rollDiceButton = qS('#roll_dice_button') as HTMLInputElement
            // loading button
            const tempRollDiceText = rollDiceButton.textContent
            rollDiceButton.textContent = 'Loading'
            rollDiceButton.disabled = true
            setTimeout(() => rollDiceGameRoom(formInputs, tempRollDiceText, miscState, gameState), 2500); break
    }
}