import { IChat, IDaily, IGameContext, IPlayer, IQuerySelect, IQueryUpdate, IResponse } from "../../../helper/types";
import Controller from "../Controller";
import daily_rewards from "../../room/config/daily-rewards.json"
import { cookies } from "next/headers";

const rateLimitAvatar = Controller.createRateLimit(1, '10m')
const rateLimitRanking = Controller.createRateLimit(1, '5s')
const rateLimitLanguage = Controller.createRateLimit(2, process.env.MAINTENANCE_STATUS === 'true' ? '1d' : '5m')
const rateLimitChat = Controller.createRateLimit(1, '1s')

export default class PlayerController extends Controller {
    async setLanguage(action: string, payload: IPlayer & {language: string}) {
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload

        // check language rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitLanguage.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }

        // save language to cookies
        cookies().set('language', payload.language)

        return this.respond(200, `${action} success`, [])
    }

    async viewPlayer(action: string, payload: IPlayer) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload

        // get logged player stats
        const playerStatsCache = await this.logPlayerStats('get', payload)
        if(playerStatsCache) {
            // set result
            const resultData = {
                player: playerStatsCache,
            }
            result = this.respond(200, `${action} success`, [resultData])
            return result
        }

        // set payload for db query
        const queryObject: IQuerySelect = {
            table: 'players',
            selectColumn: this.dq.columnSelector('players', 3456),
            whereColumn: 'display_name',
            whereValue: payload.display_name
        }
        // run query
        const {data, error} = await this.dq.select(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // log player stats in redis
            await this.logPlayerStats('push', data[0])
            // publish realtime data
            const roomlistChannel = 'monopoli-roomlist'
            const isPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayers.data)})
            console.log(isPublished);
            
            if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set result
            const resultData = {
                player: data[0],
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async viewRanking(action: string, payload) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        
        // check avatar rate limit
        const rateLimitID = `${payload.display_name}_${payload.user_agent}`
        const rateLimitResult = await rateLimitRanking.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }

        // set payload for db query
        const queryObject: IQuerySelect = {
            table: 'players',
            function: 'mnp_ranking'
        }
        // run query
        const {data, error} = await this.dq.select(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            result = this.respond(200, `${action} success`, data)
            return result
        }
    }
    
    async avatarUpload(action: string, payload: IPlayer) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]

        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        
        // check avatar rate limit
        const rateLimitID = `${payload.display_name}_${payload.user_agent}`
        const rateLimitResult = await rateLimitAvatar.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }
        // set payload for db query
        const queryObject: IQueryUpdate = {
            table: 'players',
            selectColumn: this.dq.columnSelector('players', 6),
            whereColumn: 'display_name',
            whereValue: payload.display_name,
            get updateColumn() {
                return { avatar: payload.avatar }
            }
        }
        // run query
        const {data, error} = await this.dq.update<IPlayer>(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // publish realtime data
            const publishData = {onlinePlayers: JSON.stringify(onlinePlayers.data)}
            const roomlistChannel = 'monopoli-roomlist'
            const isPublished = await this.monopoliPublish(roomlistChannel, publishData)
            console.log(isPublished);
            
            if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set result
            const resultData = {
                avatar: data[0].avatar,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async sendChat(action: string, payload: IChat) {
        let result: IResponse
        
        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]

        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        
        // check avatar rate limit
        const rateLimitID = `${payload.display_name}_${payload.user_agent}`
        const rateLimitResult = await rateLimitChat.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }

        // publish chat
        const publishData = {
            ...payload, 
            onlinePlayers: JSON.stringify(onlinePlayers.data)
        }
        const isPublished = await this.chattingPublish(payload.channel, publishData)
        console.log(isPublished);
        
        if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // set result
        const resultData = {
            token: token
        }
        result = this.respond(200, `${action} success`, [resultData])
        // return result
        return result
    }

    async claimDaily(action: string, payload: IDaily) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]

        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload

        const todayDate = new Date().toLocaleString('en', {day: 'numeric', month: 'numeric', year: 'numeric', weekday: 'long', timeZone: 'Asia/Jakarta'})
        const currentDay = todayDate.split(', ')[0]
        const currentDayUnix = Math.floor(new Date(todayDate).getTime() / 1000)
        // get player daily status
        const getPlayerDaily = await this.redisGet(`${payload.display_name}_dailyStatus`)
        const playerDailyUnix = getPlayerDaily.length > 0 
                                ? Math.floor(new Date(getPlayerDaily[0].split('; ')[0]).getTime() / 1000)
                                : 0
        const getPlayerDailyHistory = await this.redisGet(`${payload.display_name}_dailyHistory`)
        // have user claimed today's reward
        if(getPlayerDaily.length === 0 || (getPlayerDaily.length > 0 && currentDayUnix > playerDailyUnix)) {
            // player havent claim reward
            // get daily rewards data
            const dailyRewards = daily_rewards.data
            const getPlayerCoins = await this.redisGet(`${payload.display_name}_coins`)
            // set day number
            const dayOfWeek = {
                week_1: ['Monday-1', 'Tuesday-2', 'Wednesday-3', 'Thursday-4', 'Friday-5', 'Saturday-6', 'Sunday-7'],
                week_2: ['Monday-8', 'Tuesday-9', 'Wednesday-10', 'Thursday-11', 'Friday-12', 'Saturday-13', 'Sunday-14'],
            }
            const getWeekValues: string[] = dayOfWeek[`week_${payload.week}`]
            const dayNumber = getWeekValues 
                            ? getWeekValues.map(v => v.match(currentDay) ? v.split('-')[1] : null).filter(i => i)[0]
                            // day 0 so player can get any day, if day 1 player cant get monday
                            : 0
            // claim date (Monday, 6/22/2029; 1-1)
            const claimDate = `${todayDate}; ${dayNumber}-${payload.week}`
            // reward item is coin
            if(payload.item_name.match(/10$|20$|30$/)) {
                // update player coins
                const gainCoins = getPlayerCoins[0] + +payload.item_name
                await this.redisSet(`${payload.display_name}_coins`, [gainCoins])
                // update player daily status
                await this.redisSet(`${payload.display_name}_dailyStatus`, [claimDate])
                // update player daily history
                const newRewardHistory = {
                    reward_type: `coin`, 
                    reward_item: payload.item_name, 
                    reward_date: todayDate
                }
                // save daily history
                const setDailyHistory = [...getPlayerDailyHistory, newRewardHistory]
                // if history length > 30, remove 1st index
                if(setDailyHistory.length > 30) setDailyHistory.splice(0, 1)
                await this.redisSet(`${payload.display_name}_dailyHistory`, setDailyHistory)
                // set result data
                const resultData = {
                    token: token,
                    dailyStatus: 'claimed',
                    dailyHistory: [...getPlayerDailyHistory, newRewardHistory],
                    playerCoins: gainCoins,
                }
                result = this.respond(200, `${action} success`, [resultData])
            }
            // reward item is shop items
            else {
                const findWeek = dailyRewards.map(v => v.week).indexOf(+payload.week)
                // match prize of week
                if(findWeek !== -1) {
                    const dr = dailyRewards[findWeek]
                    // loop reward data
                    for(let data of dr.list) {
                        // is item exist in json data
                        const isItemDataExist = data.items.indexOf(payload.item_name)
                        if(isItemDataExist !== -1) {
                            const specialCardRegex = /nerf tax$|anti prison$|gaming dice$|dice controller$|attack city$|upgrade city$|curse reverser$/
                            const buffRegex = /reduce price$|the void$|the twond$/
                            // get player shop items
                            const getPlayerShopItems: IGameContext['myShopItems'] = await this.redisGet(`${payload.display_name}_shopItems`)
                            // shop items has value
                            if(getPlayerShopItems.length > 0) {
                                // is item exist in player shop items
                                let isItemShopExist = []
                                getPlayerShopItems.forEach(v => {
                                    const isBuff = v.buff?.indexOf(payload.item_name)
                                    const isSpecialCard = v.special_card?.indexOf(payload.item_name)
                                    // ignore null/undefined
                                    // duplicate buff/special card push to array
                                    if(isBuff && isBuff !== -1) isItemShopExist.push(true)
                                    if(isSpecialCard && isSpecialCard !== -1) isItemShopExist.push(true)
                                })
                                // filter array
                                isItemShopExist = isItemShopExist.filter(i=>i)[0]
                                // item exist, replace with coins
                                if(isItemShopExist) {
                                    // update player coins
                                    const gainCoins = getPlayerCoins[0] + 10
                                    await this.redisSet(`${payload.display_name}_coins`, [gainCoins])
                                    // update player daily status
                                    await this.redisSet(`${payload.display_name}_dailyStatus`, [claimDate])
                                    // update player daily history
                                    const newRewardHistory = {
                                        reward_type: `convert`, 
                                        reward_item: `10 coins`, 
                                        reward_date: todayDate
                                    }
                                    // save daily history
                                    const setDailyHistory = [...getPlayerDailyHistory, newRewardHistory]
                                    // if history length > 30, remove 1st index
                                    if(setDailyHistory.length > 30) setDailyHistory.splice(0, 1)
                                    await this.redisSet(`${payload.display_name}_dailyHistory`, setDailyHistory)
                                    // set result data
                                    const resultData = {
                                        token: token,
                                        dailyStatus: 'claimed',
                                        dailyHistory: [...getPlayerDailyHistory, newRewardHistory],
                                        playerCoins: gainCoins
                                    }
                                    result = this.respond(200, `${action} success`, [resultData])
                                    // stop loop after found the item
                                    break
                                }

                                // item not exist but shop items has value
                                else {
                                    // check item
                                    let itemType = null
                                    if(data.items[isItemDataExist].match(specialCardRegex)) itemType = 'special_card'
                                    else if(data.items[isItemDataExist].match(buffRegex)) itemType = 'buff'
                                    // wtf this card not exist
                                    else return this.respond(400, 'puella magi madocka madicka 3', [])
                                    // store stop items
                                    const ownedItems = await this.storeShopItems(getPlayerShopItems, {
                                        displayName: payload.display_name, 
                                        itemType: itemType, 
                                        itemName: data.items[isItemDataExist]
                                    })
                                    // update player daily status
                                    await this.redisSet(`${payload.display_name}_dailyStatus`, [claimDate])
                                    // update player daily history
                                    const newRewardHistory = {
                                        reward_type: `${data.type}`, 
                                        reward_item: `${data.items[isItemDataExist]}`, 
                                        reward_date: todayDate
                                    }
                                    // save daily history
                                    const setDailyHistory = [...getPlayerDailyHistory, newRewardHistory]
                                    // if history length > 30, remove 1st index
                                    if(setDailyHistory.length > 30) setDailyHistory.splice(0, 1)
                                    await this.redisSet(`${payload.display_name}_dailyHistory`, setDailyHistory)
                                    // set result data
                                    const resultData = {
                                        token: token,
                                        dailyStatus: 'claimed',
                                        dailyHistory: [...getPlayerDailyHistory, newRewardHistory],
                                        playerShopItems: ownedItems
                                    }
                                    result = this.respond(200, `${action} success`, [resultData])
                                    // stop loop after found the item
                                    break
                                }
                            }
                            // shop items empty
                            else {
                                // check item
                                let itemType = null
                                if(data.items[isItemDataExist].match(specialCardRegex)) itemType = 'special_card'
                                else if(data.items[isItemDataExist].match(buffRegex)) itemType = 'buff'
                                // wtf this card not exist
                                else return this.respond(400, 'puella magi madocka madicka 3', [])
                                // store stop items
                                const ownedItems = await this.storeShopItems(getPlayerShopItems, {
                                    displayName: payload.display_name, 
                                    itemType: itemType, 
                                    itemName: data.items[isItemDataExist]
                                })
                                // update player daily status
                                await this.redisSet(`${payload.display_name}_dailyStatus`, [claimDate])
                                // update player daily history
                                const newRewardHistory = {
                                    reward_type: `${data.type}`, 
                                    reward_item: `${data.items[isItemDataExist]}`, 
                                    reward_date: todayDate
                                }
                                // save daily history
                                const setDailyHistory = [...getPlayerDailyHistory, newRewardHistory]
                                // if history length > 30, remove 1st index
                                if(setDailyHistory.length > 30) setDailyHistory.splice(0, 1)
                                await this.redisSet(`${payload.display_name}_dailyHistory`, setDailyHistory)
                                // set result data
                                const resultData = {
                                    token: token,
                                    dailyStatus: 'claimed',
                                    dailyHistory: [...getPlayerDailyHistory, newRewardHistory],
                                    playerShopItems: ownedItems
                                }
                                result = this.respond(200, `${action} success`, [resultData])
                                // stop loop after found the item
                                break
                            }
                        }
                        else {
                            // item not exist in json data
                            result = this.respond(400, 'puella magi madocka madicka 2', [])
                        }
                    }
                }
                else {
                    // prize of week not found
                    result = this.respond(400, 'puella magi madocka madicka 1', [])
                }
            }
            
            return result
        }
        else {
            // player has claimed reward
            return this.respond(400, 'you have claimed today reward', [])
        }
    }

    private async storeShopItems(playerShopItems: any[], storeData: Record<'displayName'|'itemType'|'itemName', string>) {
        const {displayName, itemType, itemName} = storeData
        // set player shop items
        const setPlayerShopItems = [...playerShopItems] 
        // get shop item types
        const shopItemTypes = setPlayerShopItems.map(v => Object.keys(v)).flat()
        const isItemTypeExist = shopItemTypes.indexOf(itemType)
        // item type not exist
        if(isItemTypeExist === -1) {
            setPlayerShopItems.push({[itemType]: [itemName]})
        }
        // item type exist
        else {
            const itemList = setPlayerShopItems[isItemTypeExist][itemType]
            // filter duplicate items
            const filteredShopItems = [...itemList, itemName].filter((v,i,arr) => arr.indexOf(v) === i)
            setPlayerShopItems[isItemTypeExist][itemType] = filteredShopItems
        }
        // update player shop items
        await this.redisSet(`${displayName}_shopItems`, setPlayerShopItems)

        return setPlayerShopItems
    }
}