import { FormEvent } from "react";
import { catchError, fetcher, fetcherOptions, qS, qSA, setInputValue, translateUI } from "../../../helper/helper";
import { EventDataType, GameRoomListener, IGameContext, IMiscContext, IResponse } from "../../../helper/types";

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
        // (fetch) get all words for each selected category
        const [getWordsError, getWords] = await catchError(getWordsPerCategory(selectedCategories, miscState, gameState))
        // stop on fetch error
        if(getWordsError) return
        gameState.setMinigameWords(getWords)
        // get the first letter of each word
        const alphabets = getWords.map(v => v.slice(0,1)).filter((v,i,arr) => arr.indexOf(v) === i)
        // set game letters (random)
        const selectedLetters = pickLetters(alphabets, gameState)
        // filter words that only match with selected letters
        const matchedWords: string[] = []
        // match the splitted words with letters
        for(let letter of selectedLetters) {
            getWords.map(v => {
                v.startsWith(letter) 
                    // push to matched words
                    ? matchedWords.push(v) 
                    // else do nothing
                    : null
            })
        }
        gameState.setMinigameMatchedWords(matchedWords)
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
        // set info
        minigameInfo('success', '')
        // show mini game modal
        miscState.setAnimation(true)
        gameState.setShowMiniGame(true)
    })
}

function minigameInfo(type: 'error'|'success', message: string) {
    const minigameResult = qS('#minigame_result')
    minigameResult.className = type == 'error' ? 'text-red-400' : 'text-green-400'
    minigameResult.textContent = message
}

function getWordCategories(miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: Record<'category', string>[])=>void) => {
        const minigameQuestion = qS('#minigame_question')
        // set fetching info
        minigameInfo('success', 'getting categories..')
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
        // set fetching info
        minigameInfo('success', 'getting words..')
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
        // split words, ex: from [{id: 1, word: 'apple, apel'}] to ['apple', 'apel', 'japan', 'jepang']
        const tempWords = wordsContainer.map(v => v.word).join(', ').split(', ')
        return resolve(tempWords)
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

export async function minigameAnswer(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()

    // set info
    minigameInfo('success', '')
    // submit button
    const answerButton = qS('#minigame_answer_submit') as HTMLInputElement
    // input value container
    const inputValues = {
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
        minigame_answer: null,
    }
    
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // filter inputs
            if(setInputValue('minigame_answer', input)) inputValues.minigame_answer = input.value.trim().toLowerCase()
            else {
                // set error
                const translateAnswer = translateUI({lang: miscState.language, text: 'answer'})
                const translateError = translateUI({lang: miscState.language, text: 'only letters and spaces allowed'})
                return minigameInfo('error', `${translateAnswer}: ${translateError}`)
            }
        }
    }
    // if answer empty, show error
    if(inputValues.minigame_answer === '') 
        return minigameInfo('error', `answer cannot be empty`)
    // check if player has answered
    const isAnswered = gameState.minigameAnswerList.map(v => v?.display_name).indexOf(inputValues.display_name)
    if(isAnswered !== -1) 
        return minigameInfo('error', `you has answered`)
    // answer button loading
    answerButton.textContent = '.'
    let counter = 0
    const sendingAnswer = setInterval(() => {
        if(counter === 3) {
            answerButton.textContent = ''
            counter = 0
        }
        answerButton.textContent += '.'
        counter++
    }, 1000);
    answerButton.disabled = true
    answerButton.classList.add('saturate-0')
    // fetching
    const answerFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const answerResponse: IResponse = await (await fetcher(`/minigame`, answerFetchOptions)).json()
    // response
    switch(answerResponse.status) {
        case 200:
            // stop interval
            clearInterval(sendingAnswer)
            // save access token
            if(answerResponse.data[0].token) 
                localStorage.setItem('accessToken', answerResponse.data[0].token)
            return
        default:
            // stop interval
            clearInterval(sendingAnswer)
            answerButton.textContent = 'error'
            // set info
            minigameInfo('error', `${answerResponse.status}: ${answerResponse.message}`)
            return
    }
}

export function minigameAnswerCorrection(minigameData: GameRoomListener['minigameData'], miscState: IMiscContext, gameState: IGameContext) {
    const {display_name, minigame_answer} = minigameData
    // match the answer
    const isCorrect = gameState.minigameMatchedWords?.map(v => {
        // answer match
        if(v === minigame_answer) return v
    }).filter(i=>i)[0]
    // check if the answer exist
    const isExist = gameState.minigameWords?.map(v => {
        // answer match
        if(v === minigame_answer) return v
    }).filter(i=>i)[0]
    // match result
    const answerData = {display_name, answer: minigame_answer, status: null, event_money: null}
    if(isCorrect) {
        console.log('correct answer')
        // set info
        minigameInfo('success', 'correct answer')
        // add to answer list
        answerData.status = true
        answerData.event_money = 10_000
        gameState.setMinigameAnswerList(data => [...data, answerData])
    }
    // wrong answer
    else if(isExist) {
        console.log('wrong answer')
        // set info
        minigameInfo('error', 'wrong answer')
        // add to answer list
        answerData.status = false
        answerData.event_money = 5_000
        gameState.setMinigameAnswerList(data => [...data, answerData])
    }
    // word doesnt exist
    else {
        console.log('word unknown')
        // set info
        minigameInfo('error', 'word unknown')
        // add to answer list
        answerData.status = false
        answerData.event_money = 5_000
        gameState.setMinigameAnswerList(data => [...data, answerData])
    }
}