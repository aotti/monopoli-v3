import { FormEvent } from "react";
import { catchError, fetcher, fetcherOptions, qS, qSA, setInputValue, simpleDecrypt, translateUI } from "../../../helper/helper";
import { EventDataType, GameRoomListener, IGameContext, IMiscContext, IResponse } from "../../../helper/types";

export function stopByMinigame(playerTurnData: IGameContext['gamePlayerInfo'][0], miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        // check if player has minigame chance
        if(playerTurnData.minigame <= 0) {
            return resolve(null)
        }

        // show mini game modal
        miscState.setAnimation(true)
        gameState.setShowMiniGame(true)
        // set info
        minigameInfo('success', 'preparing categories and letters..')
        
        // only for player turn
        if(playerTurnData.display_name == gameState.myPlayerInfo.display_name) {
            // prepare minigame data
            const [preparedDataError, preparedData] = await catchError(preparingMinigame(gameState))
            if(preparedDataError) {
                minigameInfo('error', `${preparedDataError.name}: ${preparedDataError.message} (exit in 3sec)`)
                return setTimeout(() => resolve(null), 3000);
            }
            // set timer
            const playerAmount = gameState.gamePlayerInfo.length
            let minigameCounter = playerAmount === 2 ? 20 : 25 // seconds 
            const minigameInterval = setInterval(() => {
                // counter < 0 = stop at -1 | counter < -1 = stop at -2
                if(minigameCounter < -1) {
                    clearInterval(minigameInterval)
                    // get answer list to update minigame players (player turn)
                    const answerList = getAnswerList(gameState)
                    return setTimeout(() => resolve({
                        event: 'mini_game',
                        mini_chance: playerTurnData.minigame - 1,
                        mini_data: answerList,
                        money: 0
                    }), 3000)
                }
                minigameCounter--
            }, 1000);
        }
    })
}

function preparingMinigame(gameState: IGameContext) {
    interface IPrepareMinigame {
        categories: string[],
        words: string[],
        letters: string[],
        matchedWords: string[],
    }

    return new Promise(async (resolve: (value: IPrepareMinigame)=>void) => {
        // fetching
        const roomId = gameState.gameRoomId
        const prepareFetchOptions = fetcherOptions({method: 'GET', credentials: true, noCache: true})
        const prepareResponse: IResponse = await (await fetcher(`/minigame?id=${roomId}`, prepareFetchOptions)).json()
        // response
        switch(prepareResponse.status) {
            case 200:
                // save access token
                if(prepareResponse.data[0].token) {
                    localStorage.setItem('accessToken', prepareResponse.data[0].token)
                    delete prepareResponse.data[0].token
                }
                resolve(prepareResponse.data[0])
                break
            default:
                // minigame canceled
                resolve({
                    name: prepareResponse.status,
                    message: prepareResponse.message,
                } as any)
                break
        }
    })
}

export async function minigameAnswer(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()

    // set info
    minigameInfo('success', '')
    // submit button
    const answerButton = qS('#minigame_answer_submit') as HTMLInputElement
    // input value container
    const inputValues = {
        action: 'minigame answer',
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
            if(setInputValue('minigame_answer', input)) {
                inputValues.minigame_answer = input.value.trim().toLowerCase()
                input.blur()
            }
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

export function minigameAnswerCorrection(minigameAnswerData: GameRoomListener['minigameAnswerData'], miscState: IMiscContext, gameState: IGameContext) {
    const {display_name, minigame_answer} = minigameAnswerData
    // check if player has answered
    const isAnswered = gameState.minigameAnswerList.map(v => v?.display_name).indexOf(display_name)
    if(isAnswered !== -1) 
        return minigameInfo('error', `you has answered`)
    
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
    const answerData = {display_name, answer: minigame_answer, status: null, event_money: null} as IGameContext['minigameAnswerList'][0]
    if(isCorrect) {
        // check if someone have the same answer as prev player
        const isDupeAnswer = getPrevAnswers().indexOf(minigame_answer)
        // answer duplicate, set to wrong
        if(isDupeAnswer !== -1) {
            // set info
            minigameInfo('error', 'wrong answer')
            // add to answer list
            setAnswerData('wrong', 7_000)
        }
        else {
            // set info
            minigameInfo('success', 'correct answer')
            // add to answer list
            setAnswerData('correct', 15_000)
        }
        gameState.setMinigameAnswerList(data => [...data, answerData])
    }
    // wrong answer
    else if(isExist) {
        // set info
        minigameInfo('error', 'wrong answer')
        // add to answer list
        setAnswerData('wrong', 7_000)
        gameState.setMinigameAnswerList(data => [...data, answerData])
    }
    // word doesnt exist
    else {
        // set info
        minigameInfo('error', 'word unknown')
        // add to answer list
        setAnswerData('unknown', 1_000)
        gameState.setMinigameAnswerList(data => [...data, answerData])
        // fetch answer to database (only fetch for the answerer)
        if(display_name == gameState.myPlayerInfo.display_name)
            saveUnknownAnswer(display_name, minigame_answer)
    }

    type AnswerStatusType = IGameContext['minigameAnswerList'][0]['status']
    function setAnswerData(status: AnswerStatusType, event_money: number) {
        answerData.status = status
        answerData.event_money = event_money
    }

    function getPrevAnswers() {
        const tempPrevAnswers: string[] = []
        // get answer list element
        const answerListElement = qS('#minigame_answer_list') as HTMLElement
        for(let element of answerListElement.children) {
            const answerData = element as HTMLElement
            const decAnswerData = simpleDecrypt(answerData.dataset.answer, miscState.simpleKey).split(',')
            const [display_name, answer, status, event_money] = decAnswerData
            // push answer to array
            tempPrevAnswers.push(answer)
        }
        // return answers
        return tempPrevAnswers
    }
}

export function getAnswerList(gameState: IGameContext) {
    // get player amount and answer list
    const playerInfo = gameState.gamePlayerInfo
    // 2 array container for answer
    // temp = client-side data | payload = server-side data
    const tempAnswerList: IGameContext['minigameAnswerList'] = []
    const payloadAnswerList: string[] = []
    const answerListElement = qS('#minigame_answer_list') as HTMLElement

    // if no one answer
    if(answerListElement.children.length === 0) {
        for(let player of playerInfo) {
            const answerData: IGameContext['minigameAnswerList'][0] = {
                display_name: player.display_name, 
                answer: null, 
                status: null, 
                event_money: 1_000,
            }
            tempAnswerList.push(answerData)
            // push to payload answer list
            payloadAnswerList.push(`${player.display_name},null,null,1000`)
        }
    }
    // if answer amount != player amount
    // auto input player who not answered
    else if(playerInfo.length > answerListElement.children.length) {
        // not answered player container
        let notAnsweredList: string[] = null
        // find player who not answered
        for(let element of answerListElement.children) {
            const answerElement = element as HTMLElement
            const [display_name, answer, status, event_money] = answerElement.dataset.answer.split(',')

            // get player data
            const isAnswered = playerInfo.map(v => v.display_name).indexOf(display_name)
            notAnsweredList = playerInfo.map(v => v.display_name == display_name ? null : v.display_name).filter(i=>i)
            // answered player
            if(isAnswered !== -1) {
                const answerData: IGameContext['minigameAnswerList'][0] = {
                    display_name: display_name, 
                    answer: answer, 
                    status: status as any, 
                    event_money: +event_money
                }
                tempAnswerList.push(answerData)
                // push to payload answer list
                payloadAnswerList.push(answerElement.dataset.answer)
            }
        }
        // not answered player
        notAnsweredList.forEach(v => {
            const answerData: IGameContext['minigameAnswerList'][0] = {
                display_name: v, 
                answer: null, 
                status: null, 
                event_money: 1_000,
            }
            tempAnswerList.push(answerData)
            // push to payload answer list
            payloadAnswerList.push(`${v},null,null,1000`)
        })
    }
    else {
        for(let element of answerListElement.children) {
            const answerElement = element as HTMLElement
            const [display_name, answer, status, event_money] = answerElement.dataset.answer.split(',')
            // push to temp answer list
            const answerData: IGameContext['minigameAnswerList'][0] = {
                display_name: display_name, 
                answer: answer, 
                status: status as any, 
                event_money: +event_money
            }
            tempAnswerList.push(answerData)
            // push to payload answer list
            payloadAnswerList.push(answerElement.dataset.answer)
        }
    }
    // update answer list state
    gameState.setMinigameAnswerList(tempAnswerList)
    // return answer list
    return payloadAnswerList
}

async function saveUnknownAnswer(displayName: string, minigameAnswer: string) {
    const minigameUnknownStatus = qS('#minigame_unknown_status')
    // payload
    const inputValues = {
        action: 'minigame unknown answer',
        display_name: displayName,
        minigame_answer: minigameAnswer
    }
    // fetching
    const unknownAnswerFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const unknownAnswerResponse: IResponse = await (await fetcher(`/minigame`, unknownAnswerFetchOptions)).json()
    // response
    switch (unknownAnswerResponse.status) {
        case 200:
            minigameUnknownStatus.textContent = '✅'
            break
        default:
            minigameUnknownStatus.textContent = '❌'
            break
    }
}

export function minigameInfo(type: 'error'|'success', message: string) {
    const minigameResult = qS('#minigame_result')
    minigameResult.className = type == 'error' ? 'text-red-400' : 'text-green-400'
    minigameResult.textContent = message
}

export function setCategoriesAndLetters(categories: string[], letters: string[], miscState: IMiscContext) {
    const minigameCategories = qSA('.minigame_category')
    const minigameLetters = qSA('.minigame_letter')

    for(let i=0; i<3; i++) {
        const translateCategory = translateUI({lang: miscState.language, text: categories[i] as any, reverse: true})
        minigameCategories[i].textContent = i == 2 
                                        ? `${translateCategory}` 
                                        : `${translateCategory}, `
        minigameLetters[i].textContent = i == 2 
                                        ? `${letters[i].toUpperCase()}` 
                                        : `${letters[i].toUpperCase()}, `
    }
}