import { catchError, fetcher, fetcherOptions } from "../../../helper/helper";
import { IGamePlay, IResponse } from "../../../helper/types";
import Controller from "../Controller";

export default class MinigameController extends Controller {
    private async filters(action: string, payload: any) {
        let filterResult: IResponse = null
        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent, action)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // return success
        return filterResult = {
            status: 200,
            message: 'filter success',
            data: [{token, onlinePlayersData: onlinePlayers.data}]
        }
    }

    async answer(action: string, payload: IGamePlay['mini_game']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        // publish data
        const publishData = {
            display_name: payload.display_name,
            minigame_answer: payload.minigame_answer,
        }
        const isGamePublished = await this.monopoliPublish(payload.channel, {minigameAnswerData: publishData})
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // set result
        const resultData = {
            token: token
        }
        result = this.respond(200, `${action} success`, [resultData])
        // return result
        return result
    }

    async preparation(action: string, payload: IGamePlay['mini_game']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        // get word categories
        const [getCategoriesError, getCategories] = await catchError(this.getWordCategories())
        // stop on fetch error
        if(getCategoriesError) {
            return this.respond(400, `${getCategoriesError.name}: ${getCategoriesError.message}`, [])
        }
        console.log('get categories success')

        // filter unnecessary categories 
        const categoryList: string[] = getCategories.map(v => v.category)
                                    .filter(item => item != 'none' && item != 'provinsi indonesia')
        // pick 3-4 categories (random)
        const selectedCategories = this.pickCategories(categoryList)
        // (fetch) get all words for each selected category
        const [getWordsError, getWords] = await catchError(this.getWordsPerCategory(selectedCategories))
        // stop on fetch error
        if(getWordsError) {
            return this.respond(400, `${getWordsError.name}: ${getWordsError.message}`, [])
        }
        console.log('get words success')

        // get the first letter of each word
        const alphabets = getWords.map(v => v.slice(0,1)).filter((v,i,arr) => arr.indexOf(v) === i)
        // set game letters (random)
        const playerAmount = await this.redisGet(`playerTurns_${payload.room_id}`)
        const selectedLetters = this.pickLetters(playerAmount.length, alphabets)
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
        console.log('set letters & matched words success')

        // publish data
        const publishData = {
            categories: selectedCategories,
            words: getWords,
            letters: selectedLetters,
            matchedWords: matchedWords,
        }
        const gameroomChannel = `monopoli-gameroom-${payload.room_id}`
        const isGamePublished = await this.monopoliPublish(gameroomChannel, {minigamePreparedData: publishData})
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // set result
        const resultData = {
            token: token
        }
        result = this.respond(200, `${action} success`, [resultData])
        // return result
        return result
    }

    private getWordCategories() {
        return new Promise(async (resolve: (value: Record<'category', string>[])=>void) => {
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
                    resolve({
                        name: categoriesResponse.status,
                        message: categoriesResponse.message,
                    } as any)
                    break
            }
        })
    }

    private pickCategories(categoryList: string[]) {
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

    private getWordsPerCategory(categoryList: string[]) {
        return new Promise(async (resolve: (value: string[])=>void) => {
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
                        resolve({
                            name: wordsResponse.status,
                            message: wordsResponse.message,
                        } as any)
                        break
                }
            }
            // split words, ex: from [{id: 1, word: 'apple, apel'}] to ['apple', 'apel', 'japan', 'jepang']
            const tempWords = wordsContainer.map(v => v.word).join(', ').split(', ')
            return resolve(tempWords)
        })
    }

    private pickLetters(playerAmount: number, alphabets: string[]) {
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
}