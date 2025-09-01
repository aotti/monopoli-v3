import { FormEvent, useState } from "react"
import { useGame } from "../context/GameContext"
import { useMisc } from "../context/MiscContext"
import { fetcher, fetcherOptions, qS, setInputValue, translateUI } from "../helper/helper"
import ResultMessage from "../app/home/components/ResultMessage"
import { IGameContext, IMiscContext, IResponse } from "../helper/types"

export default function ReportBugs() {
    const miscState = useMisc()
    const gameState = useGame()
    // report bugs state
    const [showReportBugs, setShowReportBugs] = useState(false)
    const reportBugExample = translateUI({lang: miscState.language, text: 'ex: when playing, i have anti prison card but when i go to prison, theres no choices to use the card'})

    return (
        <>
            {/* button */}
            <div>
                <button type="button" className="active:opacity-75 hover:animate-pulse" onClick={() => setShowReportBugs(true)}> 
                    <img src="https://img.icons8.com/?size=50&id=TG3wNqGOHaIJ&format=png&color=FFFFFF" alt="report-bugs" className="!w-8 !h-8 lg:!w-10 lg:!h-10" draggable={false} /> 
                </button>
            </div>
            {/* fix bugs form */}
            <div className={`absolute -right-2 z-40 bg-black/30 
            ${showReportBugs ? 'flex' : 'hidden'} items-center justify-center
            h-[calc(100vh-1rem)] w-[calc(100vw-1rem)]`}>
                <div className="flex flex-col gap-2 justify-center bg-darkblue-1 border-8bit-text p-1">
                    <form onSubmit={ev => reportBugs(ev, miscState, gameState)}>
                        {/* head */}
                        <div className="border-b-2">
                            <span> {translateUI({lang: miscState.language, text: 'report bugs'})} </span>
                        </div>
                        {/* body */}
                        <div className="flex flex-col gap-2 p-2 w-[30rem] lg:w-[34rem] h-40 lg:h-52">
                            <div>
                                <span> {translateUI({lang: miscState.language, text: 'you can only report every 10 minutes, please send proper report'})} </span>
                            </div>
                            <div className="my-auto">
                                <label htmlFor="description"> {translateUI({lang: miscState.language, text: 'description'})}: </label>
                                <textarea id="description" className="w-[28rem] lg:w-[32rem] h-[5.5rem] lg:h-[7rem] resize-none bg-gray-200 text-black p-1" minLength={4} maxLength={256} placeholder={reportBugExample}></textarea>
                            </div>
                        </div>
                        {/* message */}
                        <ResultMessage id="result_report_bugs" />
                        {/* buttons */}
                        <div className="flex justify-around border-t-2 mt-1">
                            <button id="send_report_bugs" type="submit" className="text-green-400 active:opacity-75">
                                {translateUI({lang: miscState.language, text: 'Send'})}
                            </button>
                            <button type="button" className="text-white px-2" onClick={() => setShowReportBugs(false)}> 
                                Close 
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

async function reportBugs(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()
    // result message
    const resultMessage = qS('#result_report_bugs')
    resultMessage.className = 'mx-auto text-center text-2xs lg:text-[12px]'
    resultMessage.textContent = ''
    // submit button
    const sendButton = qS('#send_report_bugs') as HTMLInputElement
    // input values container
    const inputValues = {
        action: 'game report bugs',
        display_name: gameState.myPlayerInfo.display_name,
        description: null
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'TEXTAREA') {
            // filter inputs
            if(setInputValue('description', input)) inputValues.description = input.value.trim()
            // error
            else {
                resultMessage.classList.add('text-red-300')
                resultMessage.textContent = translateUI({lang: miscState.language, text: 'only letter, number, spaces and symbols .,#-+=@?! allowed'})
                return
            }
        }
    }
    // set state to disable "back to room & surrender" buttons
    sendButton.textContent = '...'
    sendButton.disabled = true
    miscState.setDisableButtons('gameroom')
    // fetch
    const reportBugsFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const reportBugsResponse: IResponse = await (await fetcher('/game', reportBugsFetchOptions)).json()
    // response
    switch(reportBugsResponse.status) {
        case 200:
            // reset disable buttons
            sendButton.textContent = 'done'
            miscState.setDisableButtons(null)
            // success message
            resultMessage.classList.add('text-green-400')
            resultMessage.textContent = translateUI({lang: miscState.language, text: '✅ report sent'})
            return
        default:
            // reset disable buttons
            miscState.setDisableButtons(null)
            // error message
            resultMessage.classList.add('text-red-300')
            resultMessage.textContent = `❌ ${reportBugsResponse.status}: ${reportBugsResponse.message}`
            return
    }
}