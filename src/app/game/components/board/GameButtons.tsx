import { FormEvent } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { fetcher, fetcherOptions, qS, translateUI } from "../../../../helper/helper"
import { IGameContext, IMiscContext, IResponse } from "../../../../helper/types"

export default function GameButtons() {
    const miscState = useMisc()
    const gameState = useGame()
    // get my lap
    const findLap = gameState.gamePlayerInfo?.map(v => v.display_name).indexOf(gameState.myPlayerInfo?.display_name)
    const myLap = gameState.gamePlayerInfo[findLap]?.lap

    return (
        <>
            {/* username + laps */}
            <div className="flex justify-around mx-auto w-52 lg:w-72">
                <p> {gameState.myPlayerInfo?.display_name} </p>
                <p> {translateUI({lang: miscState.language, text: 'lap'})}: {myLap} </p>
            </div>
            {/* ready + leave */}
            <div className="relative z-10 flex justify-around gap-6 mx-auto w-52 lg:w-72">
                <div>
                    <button type="button" id="ready_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'ready'})} </button>
                </div>
                <form onSubmit={ev => leaveGameRoom(ev, miscState, gameState)}>
                    <button type="submit" id="leave_button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'leave'})} </button>
                </form>
            </div>
            {/* roll dice + roll turn */}
            {/* <div className="relative z-10 flex gap-6 mx-auto w-52 lg:w-72">
                <button type="button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"
                onClick={() => gameState.setRollNumber('dice')}> 
                    {translateUI({lang: miscState.language, text: 'roll dice'})} 
                </button>
                <button type="button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"
                onClick={() => gameState.setRollNumber('turn')}> 
                    {translateUI({lang: miscState.language, text: 'roll turn'})} 
                </button>
            </div> */}
            {/* roll dice + surrend */}
            {/* <div className="relative z-10 flex gap-6 mx-auto w-52 lg:w-72">
                <button type="button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'roll dice'})} </button>
                <button type="button" className="min-w-20 bg-primary border-8bit-primary active:opacity-75"> {translateUI({lang: miscState.language, text: 'surrender'})} </button>
            </div> */}
            {/* player turn notif */}
            <div className="mx-auto">
                <span> {miscState.language == 'english' ? `dengkul turn` : `giliran dengkul`} </span>
            </div>
        </>
    )
}

async function leaveGameRoom(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()
    
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // submit button
    const leaveButton = qS('#leave_button') as HTMLInputElement
    // input value container
    const inputValues = {
        action: 'room leave',
        room_id: gameState.gameRoomId.toString(),
        display_name: gameState.myPlayerInfo.display_name
    }
    // check is player creator
    const isCreatorLeave = gameState.gameRoomInfo.map(v => v.creator).indexOf(inputValues.display_name)
    if(isCreatorLeave !== -1) {
        // show notif
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        // error message
        notifTitle.textContent = `error 400`
        notifMessage.textContent = `creator cannot leave this way, please delete the room to leave`
        return
    }
    // loading button
    const tempButtonText = leaveButton.textContent
    leaveButton.textContent = 'Loading'
    leaveButton.disabled = true
    // fetch
    const leaveGameFetchOptions = fetcherOptions({method: 'DELETE', credentials: true, body: JSON.stringify(inputValues)})
    const leaveGameResponse: IResponse = await (await fetcher('/room', leaveGameFetchOptions)).json()
    // response
    switch(leaveGameResponse.status) {
        case 200: 
            // move to room list
            const link = qS('#gotoRoom') as HTMLAnchorElement
            link.click()
            // set my current game
            gameState.setMyCurrentGame(null)
            // enable submit buttons
            leaveButton.textContent = tempButtonText
            leaveButton.removeAttribute('disabled')
            return
        default:
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${leaveGameResponse.status}`
            notifMessage.textContent = `${leaveGameResponse.message}`
            // enable submit buttons
            leaveButton.textContent = tempButtonText
            leaveButton.removeAttribute('disabled')
            return
    }
}