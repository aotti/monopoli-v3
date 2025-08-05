import { catchError, fetcher, fetcherOptions, qS, qSA, translateUI } from "../../../helper/helper";
import { EventDataType, IGameContext, IMiscContext, IResponse } from "../../../helper/types";

export function stopByMinigame(miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        const minigameQuestion = qS('#minigame_question')
        const minigameCategories = qSA('.minigame_category')
        const minigameLetters = qSA('.minigame_letter')
        // get word categories
        const [getCategoriesError, getCategories] = await catchError(getWordCategories(miscState, gameState))
        // stop on fetch error
        if(getCategoriesError) return
        // filter unnecessary categories 
        const categoryList: string[] = getCategories.map(v => v.category)
                                    .filter(item => item != 'none' && item != 'provinsi indonesia')
        // pick 3-4 categories (random)
        const selectedCategories = pickCategories(categoryList)
        console.log(selectedCategories);
        
        // (fetch) get all words for each selected category
        const [getWordsError, getWords] = await catchError(getWordsPerCategory(selectedCategories, miscState, gameState))
        // stop on fetch error
        if(getWordsError) return
        // get the first letter of each word
        const alphabets = getWords.map(v => v.slice(0,1)).filter((v,i,arr) => arr.indexOf(v) === i)
        // set game letters (random)
        const selectedLetters = pickLetters(alphabets, gameState)
        console.log(selectedLetters);
        
        // set categories and letters
        for(let i=0; i<3; i++) {
            const translateCategory = translateUI({lang: miscState.language, text: selectedCategories[i] as any, reverse: true})
            minigameCategories[i].textContent = i == 2 
                                            ? `${translateCategory}` 
                                            : `${translateCategory}, `
            minigameLetters[i].textContent = i == 2 
                                            ? `${selectedLetters[i].toUpperCase()}` 
                                            : `${selectedLetters[i].toUpperCase()}, `
        }
        // show mini game modal
        miscState.setAnimation(true)
        gameState.setShowMiniGame(true)
    })
}

export function minigameAnswer() {
    
}

function getWordCategories(miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: Record<'category', string>[])=>void) => {
        const minigameQuestion = qS('#minigame_question')
        // categories api
        const wordCategoriesAPI = 'https://abc-5-dasar-api.vercel.app/api/word/categories'
        // fetching
        const categoriesFetchOptions = fetcherOptions({method: 'GET', credentials: true, domain: wordCategoriesAPI})
        const categoriesResponse: IResponse = await (await fetcher(wordCategoriesAPI, categoriesFetchOptions, true)).json()
        // response
        switch(categoriesResponse.status) {
            case 200:
                resolve(categoriesResponse.data)
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

function pickCategories(categoryList: string[]) {
    const selectedCategories: string[] = []
    // set category amount to 3
    const categoryAmount = 3
    // select random categories
    for(let i=0; i<categoryAmount; i++) {
        const randomCategory = Math.floor(Math.random() * categoryList.length)
        selectedCategories.push(categoryList.splice(randomCategory, 1)[0])
    }
    // return categories
    return selectedCategories
}

function getWordsPerCategory(categoryList: string[], miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: string[])=>void) => {
        const minigameQuestion = qS('#minigame_question')
        // get words from database
        const wordsContainer: {id: number; word: string}[] = []
        for(let category of categoryList) {
            // get words 
            const wordsAPI = `https://abc-5-dasar-api.vercel.app/api/word/${category}`
            const wordsFetchOptions = fetcherOptions({method: 'GET', credentials: true, domain: wordsAPI})
            const wordsResponse: IResponse = await (await fetcher(wordsAPI, wordsFetchOptions, true)).json()
            switch(wordsResponse.status) {
                case 200:
                    // push id and word to container
                    // ### id wont be any use
                    wordsResponse.data.map(v => wordsContainer.push({id: v.id, word: v.word}))
                    // split each word, ex: from [{id: 1, word: 'apple, apel'}] to ['apple', 'apel', 'japan', 'jepang']
                    const splitEachWord = wordsContainer.map(v => v.word).join(', ').split(', ')
                    resolve(splitEachWord)
                    break
                default:
                    // error message, minigame canceled
                    minigameQuestion.textContent = `❌ ${wordsResponse.status}: ${wordsResponse.message}. mini game will be canceled in 3 sec`
                    setTimeout(() => {
                        // hide mini game modal
                        miscState.setAnimation(false)
                        gameState.setShowMiniGame(false)
                        // end turn
                        resolve(null)
                    }, 3000);
                    break
            }
        }
    })
}

function pickLetters(alphabets: string[], gameState: IGameContext) {
    // find game player info
    const playerAmount = gameState.gamePlayerInfo.map(v => v.display_name).length
    // pick letter
    const selectedLetters: string[] = []
    // set total fingers, 10 fingers per player
    const totalFingers = playerAmount * 10
    // set letter amount
    const letterAmount = 3
    // select letter by total finger
    for(let i=0; i<letterAmount; i++) {
        // set random fingers
        const randFingers = Math.floor(Math.random() * totalFingers)
        // modulus the finger
        const selectedFinger = randFingers % alphabets.length
        // push the letter
        selectedLetters.push(alphabets.splice(selectedFinger, 1)[0])
    }
    // return the selected letters
    return selectedLetters
}