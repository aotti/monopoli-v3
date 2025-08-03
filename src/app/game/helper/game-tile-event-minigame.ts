import { fetcher, fetcherOptions, qS } from "../../../helper/helper";
import { EventDataType, IGameContext, IMiscContext, IResponse } from "../../../helper/types";

export function stopByMinigame(miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        const minigameQuestion = qS('#minigame_question')
        // get word categories
        const miniGameDomain = 'https://abc-5-dasar-api.vercel.app'
        const categoriesFetchOptions = fetcherOptions({method: 'GET', credentials: true, domain: miniGameDomain})
        console.log(categoriesFetchOptions);
        
        const categoriesResponse: IResponse = await (await fetcher(`${miniGameDomain}/api/word/categories`, categoriesFetchOptions, true)).json()
        // response
        switch(categoriesResponse.status) {
            case 200:
                console.log(categoriesResponse);
                
                // set fingers (random)
                // set question
                // show mini game modal
                miscState.setAnimation(true)
                gameState.setShowMiniGame(true)
                break
            default:
                // error message, minigame canceled
                minigameQuestion.textContent = `❌ ${categoriesResponse.status}: ${categoriesResponse.message}. mini game will be canceled in 3 sec`
                setTimeout(() => {
                    // hide mini game modal
                    miscState.setAnimation(false)
                    gameState.setShowMiniGame(false)
                    // end turn
                    resolve(null)
                }, 3000);
                break
        }
    })
}

export function minigameAnswer() {
    
}