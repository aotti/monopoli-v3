import { FormEvent, useState } from "react"
import { useGame } from "../context/GameContext"
import { useMisc } from "../context/MiscContext"
import { fetcher, fetcherOptions, qS, setInputValue, translateUI } from "../helper/helper"
import ResultMessage from "../app/home/components/ResultMessage"
import { IGameContext, IMiscContext, IResponse } from "../helper/types"

export default function FixBugs() {
    const miscState = useMisc()
    const gameState = useGame()
    // fix bugs state
    const [showFixBugs, setShowFixBugs] = useState(false)

    return (
        <>
            {/* button */}
            <div>
                <button type="button" className="-ml-4 active:opacity-75 hover:animate-pulse" onClick={() => setShowFixBugs(true)}> 
                    <img src="https://img.icons8.com/?size=50&id=11151&format=png&color=FFFFFF" alt="fix-bugs" className="!w-8 !h-8 lg:!w-10 lg:!h-10" draggable={false} /> 
                </button>
            </div>
            {/* fix bugs form */}
            <div className={`absolute -right-2 z-40 bg-black/30 
            ${showFixBugs ? 'flex' : 'hidden'} items-center justify-center
            h-[calc(100vh-1rem)] w-[calc(100vw-1rem)]`}>
                <div className="flex flex-col gap-2 justify-center bg-darkblue-1 border-8bit-text p-1">
                    <form onSubmit={ev => fixPlayerTurnsGameRoom(ev, miscState, gameState)}>
                        {/* head */}
                        <div className="border-b-2">
                            <span> fix bugs </span>
                        </div>
                        {/* body */}
                        <div className="flex flex-col gap-2 p-2 w-72 lg:w-96 min-h-20 max-h-40 lg:max-h-52 overflow-y-scroll">
                            <div className="my-auto">
                                <label htmlFor="bug_type"> type </label>
                                <select id="bug_type" className="px-1">
                                    <option value="player_turns" selected> player turns </option>
                                </select>
                            </div>
                            <div className="my-auto">
                                <label htmlFor="room_id"> room id </label>
                                <input type="text" id="room_id" className="px-1 w-[15vw]" maxLength={4} required />
                            </div>
                        </div>
                        {/* message */}
                        <ResultMessage id="result_fix_bugs" />
                        {/* buttons */}
                        <div className="flex justify-around border-t-2">
                            <button type="submit" className="text-green-400 active:opacity-75">
                                {translateUI({lang: miscState.language, text: 'Fix'})}
                            </button>
                            <button type="button" className="text-white px-2" onClick={() => setShowFixBugs(false)}> 
                                Close 
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

async function fixPlayerTurnsGameRoom(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()
    // result message
    const resultMessage = qS('#result_fix_bugs')
    resultMessage.className = 'mx-auto text-center text-2xs lg:text-[12px]'
    resultMessage.textContent = ''
    // input values container
    const inputValues = {
        action: 'game fix player turns',
        channel: null,
        display_name: gameState.myPlayerInfo.display_name
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // filter inputs
            if(setInputValue('room_id', input)) inputValues.channel = `monopoli-gameroom-${input.value.trim()}`
            // error
            else {
                resultMessage.classList.add('text-red-300')
                resultMessage.textContent = `${input.id} wrong`
                return
            }
        }
    }
    // set state to disable "back to room & surrender" buttons
    miscState.setDisableButtons('gameroom')
    // fetch
    const fixPlayerFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const fixPlayerResponse: IResponse = await (await fetcher('/game', fixPlayerFetchOptions)).json()
    // response
    switch(fixPlayerResponse.status) {
        case 200:
            // reset disable buttons
            miscState.setDisableButtons(null)
            // success message
            resultMessage.classList.add('text-green-400')
            resultMessage.textContent = `✅ bug fixed`
            return
        default:
            // reset disable buttons
            miscState.setDisableButtons(null)
            // error message
            resultMessage.classList.add('text-red-300')
            resultMessage.textContent = `❌ ${fixPlayerResponse.status}: ${fixPlayerResponse.message}`
            return
    }
}