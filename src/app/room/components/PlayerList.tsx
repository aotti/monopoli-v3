import { FormEvent } from "react";
import { useMisc } from "../../../context/MiscContext";
import { fetcher, fetcherOptions, qS, setInputValue, translateUI } from "../../../helper/helper";
import { IGameContext, ILoggedUsers, IPlayer, IResponse } from "../../../helper/types";
import { useGame } from "../../../context/GameContext";

export default function PlayerList({ onlinePlayers }: {onlinePlayers: ILoggedUsers[]}) {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className="flex flex-col gap-2 h-4/5 p-1 overflow-y-scroll border-b-2">
            {/* player */}
            {onlinePlayers.map((v, i) => 
                <form key={i} className="flex justify-between" onSubmit={ev => viewPlayerStats(ev, gameState)}>
                    <input type="text" id="display_name" value={v.display_name} className="w-3/5 lg:w-3/4 bg-transparent text-white pointer-events-none" readOnly />
                    <button type="submit" className="bg-primary border-8bit-primary active:opacity-75"> 
                        {translateUI({lang: miscState.language, text: 'view'})} 
                    </button>
                </form>
            )}
        </div>
    )
}

async function viewPlayerStats(ev: FormEvent<HTMLFormElement>, gameState: IGameContext) {
    ev.preventDefault()

    // input element
    let playerInput: HTMLInputElement
    // input value container
    const inputValues: Partial<IPlayer> = {
        display_name: null
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // filter inputs
            if(setInputValue('display_name', input)) {
                inputValues.display_name = input.value.trim()
                playerInput = input
            }
            // error
            else {
                input.value = input.value + '⚠'
                return
            }
        }
    }
    // check player name
    if(gameState.myPlayerInfo.display_name == inputValues.display_name) {
        // set other player info
        gameState.setOtherPlayerInfo(null)
        return
    }
    // fetch
    const viewFetchOptions = fetcherOptions({method: 'GET', credentials: true})
    const viewResponse: IResponse = await (await fetcher(`/player/?display_name=${inputValues.display_name}`, viewFetchOptions)).json()
    // response
    switch(viewResponse.status) {
        case 200: 
            // save access token
            if(viewResponse.data[0].token) {
                localStorage.setItem('accessToken', viewResponse.data[0].token)
                delete viewResponse.data[0].token
            }
            // set other player info
            gameState.setOtherPlayerInfo(viewResponse.data[0].player)
            return
        default: 
            playerInput.value += viewResponse.status
            return
    }
}