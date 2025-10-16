import { fetcher, fetcherOptions } from "../../../helper/helper";
import { ICreateRoom, IGameContext, IGamePlay, IMissingData, IQuerySelect, IQueryUpdate, IResponse } from "../../../helper/types";
import Controller from "../Controller";

const rateLimitReadyPlayer = Controller.createRateLimit(1, '5s')
const rateLimitDecideTurn = Controller.createRateLimit(1, '5s')
const rateLimitRollDice = Controller.createRateLimit(1, '3s')
const rateLimitSurrender = Controller.createRateLimit(1, '5s')
const rateLimitTurnEnd = Controller.createRateLimit(1, '5s')
const rateLimitSellCity = Controller.createRateLimit(1, '5s')
const rateLimitUpgradeCity = Controller.createRateLimit(1, '5s')
const rateLimitAttackCity = Controller.createRateLimit(1, '5s')
const rateLimitSendReportBugs = Controller.createRateLimit(1, '10m')

export default class GameController extends Controller {
    private async filters(action: string, payload: any) {
        let filterResult: IResponse
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

    // main method
    async getPlayers(action: string, payload: IGamePlay['get_players']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]
        // set payload for db query
        const queryObject: IQuerySelect = {
            table: 'games',
            selectColumn: this.dq.columnSelector('games', 3456789) + ',prison,minigame,buff,debuff',
            whereColumn: 'room_id',
            whereValue: payload.room_id
        }
        // run query
        const {data, error} = await this.dq.select(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // extract data
            const extractPlayerData = data.map(v => Object.entries(v))
            // convert data to array object
            const extractedPlayerData = extractPlayerData.map(temp => {
                // extract nested object to array
                const tempExtractedData = temp.map(v => v[1] && typeof v[1] == 'object' ? Object.entries(v[1]).flat() : v)
                // set new data
                const tempNewData = {}
                for(let [key, value] of tempExtractedData) {
                    tempNewData[key] = value
                }
                return tempNewData
            })
            // get game stage
            const getGameStage = await this.redisGet(`gameStage_${payload.room_id}`)
            // get ready players
            const getReadyPlayers = await this.redisGet(`readyPlayers_${payload.room_id}`)
            // get decide players
            const getDecidePlayers = await this.redisGet(`decidePlayers_${payload.room_id}`)
            // sort highest > lowest
            const sortDecidePlayers = getDecidePlayers.sort((a,b) => b.rolled_number - a.rolled_number)
            // get player turns
            const getPlayerTurns = await this.redisGet(`playerTurns_${payload.room_id}`)
            // get quake city
            const getQuakeCity = await this.redisGet(`gameQuakeCity_${payload.room_id}`)
            // get game history
            const getGameHistory = await this.redisGet(`gameHistory_${payload.room_id}`)
            // get missing data
            const getMissingData = await this.redisGet(`missingData_${payload.room_id}`)
            // check missing data limit for every player
            const missingLimitPlayers = []
            for(let playerName of getMissingData) {
                const getMissingLimit = await this.redisGet(`missingLimit_${playerName}`)
                // push player that on limit
                if(getMissingLimit.length > 0 && getMissingLimit[0] === 3) missingLimitPlayers.push(playerName)
            }

            // set result
            const resultData = {
                gameStage: getGameStage.length > 0 ? getGameStage[0] : null,
                preparePlayers: getReadyPlayers.length > 0 ? getReadyPlayers.filter((v, i, arr) => arr.indexOf(v) === i) : null,
                decidePlayers: sortDecidePlayers.length > 0 ? sortDecidePlayers.filter((obj1, i, arr) => 
                    arr.findLastIndex(obj2 => obj2.display_name == obj1.display_name) === i
                ) : null,
                playerTurns: getPlayerTurns.length > 0 ? getPlayerTurns : null,
                quakeCity: getQuakeCity.length > 0 ? getQuakeCity : null,
                gameHistory: getGameHistory,
                getPlayers: extractedPlayerData,
                allMissingData: getMissingData.length > 0 ? getMissingData : null,
                missingLimitPlayers: missingLimitPlayers,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }
    
    async readyPlayer(action: string, payload: IGamePlay['ready_player']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        // check create rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitReadyPlayer.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }

        // save ready players to redis
        const roomId = payload.channel.match(/\d+/)[0]
        const getReadyPlayers = await this.redisGet(`readyPlayers_${roomId}`)
        // check if the same player trying to ready
        const checkReadyPlayer = getReadyPlayers.indexOf(payload.display_name)
        if(checkReadyPlayer !== -1) return this.respond(403, 'fight me ni-', [])
        // player must join the game to click ready
        if(!payload.player_joined.match(payload.display_name)) return this.respond(403, 'who r u??!?!', [])
        // set new ready player
        await this.redisSet(`readyPlayers_${roomId}`, [...getReadyPlayers, payload.display_name])
        
        // publish online players
        const publishData = {
            readyPlayers: [...getReadyPlayers, payload.display_name],
        }
        const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // publish to roomlist
        const roomlistChannel = 'monopoli-roomlist'
        const isRoomPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
        console.log(isRoomPublished);
        
        if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // set result
        const resultData = {
            token: token
        }
        result = this.respond(200, `${action} success`, [resultData])
        // return result
        return result
    }

    async startGame(action: string, payload: IGamePlay['ready_player']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        // check player amount
        const roomId = payload.channel.match(/\d+/)[0]
        const getReadyPlayers = await this.redisGet(`readyPlayers_${roomId}`)
        if(getReadyPlayers.length < 2) return this.respond(403, 'go get frens', [])
        
        // prevent game start if player turn redis is exist
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        if(getPlayerTurns.length > 0) return this.respond(403, 'wat da dog doin', [])

        // set payload for db query
        type UpdateColumnType = Partial<ICreateRoom['list'] & {updated_at: string}>
        const queryObject: IQueryUpdate = {
            table: 'rooms',
            selectColumn: this.dq.columnSelector('rooms', 7),
            whereColumn: 'id',
            whereValue: roomId,
            get updateColumn(): UpdateColumnType {
                return {
                    status: 'playing',
                    updated_at: new Date().toISOString()
                }
            }
        }
        // run query
        const {data, error} = await this.dq.update(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // set game stage
            await this.redisSet(`gameStage_${roomId}`, ['decide'])
            // loop players
            for(let playerName of getReadyPlayers) {
                // check shop items for missing data
                const getShopItems: IGameContext['myShopItems'] = await this.redisGet(`${playerName}_shopItems`)
                const shopItemList = {
                    special_card: [],
                    buff: [],
                }
                // fill shop item list
                const shopItemKeys = Object.keys(shopItemList)
                for(let key of shopItemKeys) {
                    const isKeyExist = getShopItems.map(v => Object.keys(v)).flat().indexOf(key)
                    // shop item exist, set value
                    if(isKeyExist !== -1) 
                        shopItemList[key] = getShopItems[isKeyExist][key]
                }
                // reset player shop items
                await this.redisReset(`${playerName}_shopItems`)

                // get missing data
                const getMissingData: IMissingData[] = await this.redisGet(`missingData_${roomId}`)
                // set missing data
                const tempMissingData: IMissingData = {
                    display_name: playerName, 
                    city: null, 
                    card: shopItemList.special_card.length > 0 ? shopItemList.special_card.join(';') : null, 
                    buff: shopItemList.buff.length > 0 ? shopItemList.buff.join(';') : null, 
                    debuff: null,
                }
                // save missing data
                await this.redisSet(`missingData_${roomId}`, [...getMissingData, tempMissingData])
                // reset missing limit
                await this.redisReset(`missingLimit_${playerName}`)
            }
            // publish online players
            const publishData = {
                startGame: 'start',
                fixedPlayers: getReadyPlayers.length,
            }
            const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // publish to roomlist
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.monopoliPublish(roomlistChannel, {startGame: 'start', roomGame: +roomId})
            console.log(isRoomPublished);
            
            if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set result
            const resultData = {
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async decideTurn(action: string, payload: IGamePlay['decide_player']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        // check create rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitDecideTurn.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }

        // get decide players
        const roomId = payload.channel.match(/\d+/)[0]
        const getDecidePlayers = await this.redisGet(`decidePlayers_${roomId}`)
        // check if player have rolled turn
        const isPlayerRolledTurn = getDecidePlayers.map(v => v.display_name).indexOf(payload.display_name)
        if(isPlayerRolledTurn !== -1) return this.respond(403, 'stop rolling', [])
        // set new roll turn player
        await this.redisSet(`decidePlayers_${roomId}`, [...getDecidePlayers, {
            display_name: payload.display_name,
            rolled_number: +payload.rolled_number
        }])
        // sort highest > lowest
        const sortDecidePlayers = [...getDecidePlayers, {
            display_name: payload.display_name,
            rolled_number: +payload.rolled_number
        }].sort((a,b) => b.rolled_number - a.rolled_number)
        // get fixed players
        const getFixedPlayers = await this.redisGet(`readyPlayers_${roomId}`)
        // set player turns if ready players == roll turn players
        if(sortDecidePlayers.length === getFixedPlayers.length)
            await this.redisSet(`playerTurns_${roomId}`, sortDecidePlayers.map(v => v.display_name))

        // publish online players
        const publishData = {
            decidePlayers: sortDecidePlayers,
            gameStage: sortDecidePlayers.length === getFixedPlayers.length ? 'play' : 'decide',
        }
        const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // publish to roomlist
        const roomlistChannel = 'monopoli-roomlist'
        const isRoomPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
        console.log(isRoomPublished);
        
        if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // set result
        const resultData = {
            token: token
        }
        result = this.respond(200, `${action} success`, [resultData])
        // return result
        return result
    }

    async rollDice(action: string, payload: IGamePlay['roll_dice']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        // check create rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitRollDice.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }

        // check player turn
        const roomId = payload.channel.match(/\d+/)[0]
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        if(getPlayerTurns[0] != payload.display_name) 
            return this.respond(400, 'its not your turn', [])
        // check missing data
        const getMissingData: IMissingData[] = await this.redisGet(`missingData_${roomId}`)
        const findPlayer = getMissingData.map(v => v.display_name).indexOf(payload.display_name)
        const playerMissingData = JSON.stringify(getMissingData[findPlayer])
        // if player game data not match with missing data, then theres missing data
        if(payload.game_data !== playerMissingData)
            return this.respond(400, 'there is missing data', [])

        // update player turns to empty
        getPlayerTurns.splice(0, 1, '')
        await this.redisSet(`playerTurns_${roomId}`, getPlayerTurns)
        // publish data
        const publishData = {
            playerTurn: payload.display_name,
            playerDice: +payload.rolled_dice,
            playerRNG: payload.rng.split(','), // send back as array
            playerSpecialCard: payload.special_card
        }
        const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // publish to roomlist
        const roomlistChannel = 'monopoli-roomlist'
        const isRoomPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
        console.log(isRoomPublished);
        
        if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // set result
        const resultData = {
            token: token
        }
        result = this.respond(200, `${action} success`, [resultData])
        // return result
        return result
    }

    async surrender(action: string, payload: IGamePlay['surrender']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        // check create rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitSurrender.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }

        // check player turn
        const roomId = payload.channel.match(/\d+/)[0]
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        if(getPlayerTurns[0] == payload.display_name) 
            return this.respond(400, 'cant surrend when its your turn', [])
        // set payload for db query
        const queryObject: Partial<IQueryUpdate> = {
            table: 'games',
            function: 'mnp_surrender',
            function_args: {
                tmp_display_name: payload.display_name
            }
        }
        // run query
        const {data, error} = await this.dq.update<IGamePlay['surrender']>(queryObject as IQueryUpdate)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // remove player from playerTurns
            await this.redisSet(`playerTurns_${roomId}`, getPlayerTurns.filter(v => v != payload.display_name))
            // publish online players
            const publishData = {
                surrendPlayer: data[0].display_name,
            }
            const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // publish to roomlist
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
            console.log(isRoomPublished);
            
            if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set result
            const resultData = {
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async turnEnd(action: string, payload: IGamePlay['turn_end']) {
        let result: IResponse
        
        // get room id
        const roomId = payload.channel.match(/\d+/)[0]
        // filter payload
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]
        
        // log query args to redis
        const getGameLogs = await this.redisGet(`gameLog_${roomId}`)
        await this.redisSet(`gameLog_${roomId}`, [...getGameLogs, payload])

        // check create rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitTurnEnd.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }
        
        // get player turns
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        // update game history (buy city, get cards, etc)
        const getGameHistory = await this.redisGet(`gameHistory_${roomId}`)

        // check payload.history, if it contain get_card with multiple effects (one of them is move type)
        // dont end player turn, if only 1 effect this part will be skipped
        if(payload.history.match('get_card')) {
            const getCardType = payload.history.match(/(?<=get_card: ).*,.*(?=\s)/)
            const splitCardType = getCardType ? getCardType[0].split(',') : []
            // card with multiple effects & check if move type exist
            if(splitCardType.length === 2 && getCardType && getCardType[0].match(/move/)) {
                // save card event money to redis (temporary)
                // to prevent early turn end, cuz player still moving
                await this.redisSet(`tempEventMoney_${payload.display_name}_${roomId}`, [payload.event_money])
                // update game history
                // game history container
                const tempGameHistory: IGameContext['gameHistory'] = []
                // history = rolled_dice: num;buy_city: str;sell_city: str;get_card: str;use_card: str
                for(let history of payload.history.split(';')) {
                    const tempHistory = {
                        room_id: +roomId, 
                        display_name: payload.display_name, 
                        history: history
                    }
                    // push to game history
                    tempGameHistory.push(tempHistory)
                }
                // save game history to redis
                await this.redisSet(`gameHistory_${roomId}`, [...getGameHistory, ...tempGameHistory])
                // set result
                const resultData = {
                    token: token,
                    playerTurns: getPlayerTurns
                }
                result = this.respond(200, `${action} success`, [resultData])
                return result
            }
        }
        // get temp event money
        const getTempEventMoney = await this.redisGet(`tempEventMoney_${payload.display_name}_${roomId}`)
        let tempEventMoney: number = 0
        if(getTempEventMoney.length > 0) {
            tempEventMoney = +getTempEventMoney[0]
            // remove after used
            await this.redisReset(`tempEventMoney_${payload.display_name}_${roomId}`)
        }
        
        // check taxes
        const isTaxes = payload.tax_owner && payload.tax_visitor
        const taxes = isTaxes ? {
            owner: payload.tax_owner, 
            visitor: payload.tax_visitor, 
            money: +payload.tax_money + tempEventMoney
        } : null
        // transfer money
        const isTakeMoney = payload.take_money ? payload.take_money.split(';') : null
        const takeMoney = isTakeMoney ? {
            from: isTakeMoney[1].split(',').filter(v => v != payload.display_name),
            to: payload.display_name,
            money: +isTakeMoney[0]
        } : null

        // set payload for db query
        const queryObject: Partial<IQueryUpdate> = {
            table: 'games',
            function: 'mnp_turn_end',
            function_args: {
                tmp_display_name: payload.display_name,
                tmp_pos: payload.pos,
                tmp_lap: +payload.lap,
                tmp_event_money: +payload.event_money + tempEventMoney,
                tmp_city: payload.city,
                tmp_taxes: isTaxes ? `${payload.tax_visitor};${payload.tax_owner}` : null,
                tmp_tax_money: isTaxes ? +payload.tax_money + +payload.event_money + tempEventMoney : null,
                tmp_card: payload.card,
                tmp_take_money: payload.take_money,
                tmp_prison: payload.prison,
                tmp_minigame: +payload.minigame_chance,
                tmp_buff: payload.buff,
                tmp_debuff: payload.debuff,
                tmp_minigame_result: payload.minigame_data,
            }
        }
        // run query
        const {data, error} = await this.dq.update<IGameContext['gamePlayerInfo'][0]>(queryObject as IQueryUpdate)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // modify player turn end data
            const newPlayerTurnEndData: IGameContext['gamePlayerInfo'][0] = {
                ...data[0],
                character: (data[0] as any).player_character
            }
            delete (newPlayerTurnEndData as any).player_character
            
            // game history container
            const gameHistory: IGameContext['gameHistory'] = []
            // history = rolled_dice: num;buy_city: str;sell_city: str;get_card: str;use_card: str
            for(let history of payload.history.split(';')) {
                const tempHistory = {
                    room_id: +roomId, 
                    display_name: payload.display_name, 
                    history: history
                }
                // push to game history
                gameHistory.push(tempHistory)
            }
            // save game history to redis
            await this.redisSet(`gameHistory_${roomId}`, [...getGameHistory, ...gameHistory])
            
            // push end turn player to playerTurns
            // check if turn end player is playing in this game
            const getDecidePlayers = await this.redisGet(`decidePlayers_${roomId}`)
            const isTurnEndPlayerInGame = getDecidePlayers.map(v => v.display_name).indexOf(payload.display_name)
            if(isTurnEndPlayerInGame !== -1) {
                // player is playing in this game
                // now check if it exist in player turns (walking player should not exist)
                if(getPlayerTurns.indexOf(payload.display_name) === -1) {
                    // player doesnt exist, now remove empty player turns
                    getPlayerTurns.splice(0, 1)
                    // check is player losing, if lose then dont push the player
                    payload.is_lose ? null : getPlayerTurns.push(payload.display_name)
                    await this.redisSet(`playerTurns_${roomId}`, getPlayerTurns)
                }
            }
            // set minigame data for others
            const minigameResultData = payload.minigame_data.map(v => {
                const [display_name, answer, status, event_money] = v.split(',')
                return {display_name, event_money: +event_money}
            })

            // publish turn end data 
            const publishData = {
                playerTurns: getPlayerTurns,
                gameHistory: [...getGameHistory, ...gameHistory],
                playerTurnEnd: newPlayerTurnEndData,
                taxes: taxes,
                takeMoney: takeMoney,
                minigameResult: minigameResultData,
            }
            const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
            console.log(isGamePublished);
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
                
            // save missing data
            const savedMissingData = await this.saveMissingData(+roomId, newPlayerTurnEndData)

            // set result
            const resultData = {
                token: token,
                playerTurns: getPlayerTurns,
                // ### SEND MISSING DATA AS RESPONSE 
                // ### TO WARN PLAYER IF THERES MISSING DATA
                missingData: savedMissingData,
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    // event method
    async sellCity(action: string, payload: IGamePlay['sell_city']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        // check create rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitSellCity.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }

        const roomId = payload.channel.match(/\d+/)[0]
        // check player turn
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        if(getPlayerTurns[0] != payload.display_name) 
            return this.respond(400, 'only allowed on your turn', [])
        // set payload for db query
        const queryObject: Partial<IQueryUpdate> = {
            table: 'games',
            function: 'mnp_sell_city',
            function_args: {
                tmp_display_name: payload.display_name,
                tmp_sell_city: payload.sell_city_name,
                tmp_city: payload.city_left == '' ? null : payload.city_left,
                tmp_price: +payload.sell_city_price
            }
        }
        // run query
        const {data, error} = await this.dq.update<IGameContext['gamePlayerInfo'][0]>(queryObject as IQueryUpdate)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // update game history
            const getGameHistory = await this.redisGet(`gameHistory_${roomId}`)
            const gameHistory: IGameContext['gameHistory'] = [{
                display_name: payload.display_name,
                room_id: +roomId,
                history: `sell_city: ${payload.sell_city_name}`
            }]
            await this.redisSet(`gameHistory_${roomId}`, [...getGameHistory, ...gameHistory])
            // publish data
            const publishData = {
                citySeller: payload.display_name,
                citySold: payload.sell_city_name,
                cityPrice: +payload.sell_city_price,
                cityLeft: payload.city_left == '' ? null : payload.city_left,
                gameHistory: [...getGameHistory, ...gameHistory]
            }
            const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // publish to roomlist
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
            console.log(isRoomPublished);
            
            if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
                
            // save missing data
            const savedMissingData = await this.saveMissingData(+roomId, data[0])

            // set result
            const resultData = {
                token: token,
                // ### SEND MISSING DATA AS RESPONSE 
                // ### TO WARN PLAYER IF THERES MISSING DATA
                missingData: savedMissingData,
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async upgradeCity(action: string, payload: IGamePlay['upgrade_city']) {
        let result: IResponse
        
        const roomId = payload.channel.match(/\d+/)[0]
        // filter payload
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]
        
        // log query args to redis
        const getGameLogs = await this.redisGet(`gameLog_${roomId}`)
        await this.redisSet(`gameLog_${roomId}`, [...getGameLogs, payload])

        // check create rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitUpgradeCity.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }
        
        // check player turn
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        if(getPlayerTurns[0] != payload.display_name) 
            return this.respond(400, 'only allowed on your turn', [])
        // set payload for db query
        const queryObject: Partial<IQueryUpdate> = {
            table: 'games',
            function: 'mnp_upgrade_city',
            function_args: {
                tmp_display_name: payload.display_name,
                tmp_city: payload.city,
                tmp_event_money: +payload.event_money,
                tmp_card: payload.card,
                tmp_special_card: payload.special_card.split('-')[1], // origin 'used-upgrade city'
            }
        }
        // run query
        // return [display name, money, city, card, buff, debuff]
        const {data, error} = await this.dq.update<IGameContext['gamePlayerInfo'][0]>(queryObject as IQueryUpdate)
        if(error) {
            // upgrade failed
            if(error.code == 'P0001') result = this.respond(403, error.message, [])
            // other error
            else result = this.respond(500, error.message, [])
        }
        else {
            // set upgrade history
            const getGameHistory = await this.redisGet(`gameHistory_${roomId}`)
            const upgradeHistory: IGameContext['gameHistory'] = [
                {
                    display_name: payload.display_name,
                    room_id: +roomId,
                    history: `special_card: ${payload.special_card.split('-')[1]} 💳`
                },
                {
                    display_name: payload.display_name,
                    room_id: +roomId,
                    history: payload.target_city 
                            ? `buy_city: ${payload.target_city} (${payload.target_city_property})`
                            : `buy_city: none`
                },
            ]
            // update game history
            await this.redisSet(`gameHistory_${roomId}`, [...getGameHistory, ...upgradeHistory])

            // publish data
            const publishData = {
                upgradeCity: data[0],
                targetCity: payload.target_city,
                targetCityProperty: payload.target_city_property,
                gameHistory: [...getGameHistory, ...upgradeHistory]
            }
            const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // publish to roomlist
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
            console.log(isRoomPublished);
            
            if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
                
            // save missing data
            const savedMissingData = await this.saveMissingData(+roomId, data[0])

            // set result
            const resultData = {
                token: token,
                // ### SEND MISSING DATA AS RESPONSE 
                // ### TO WARN PLAYER IF THERES MISSING DATA
                missingData: savedMissingData,
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async attackCity(action: string, payload: IGamePlay['declare_attack_city']) {
        let result: IResponse
        
        const roomId = payload.channel.match(/\d+/)[0]
        // filter payload
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]
        
        // log query args to redis
        const getGameLogs = await this.redisGet(`gameLog_${roomId}`)
        await this.redisSet(`gameLog_${roomId}`, [...getGameLogs, payload])

        // check create rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitAttackCity.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }
        
        // get attack type
        const attackType = payload.attack_type.match(/quake|meteor|steal/i)[0]
        // check player turn
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        if(getPlayerTurns[0] != payload.attacker_name) 
            return this.respond(400, 'only allowed on your turn', [])
        // set payload for db query
        const queryObject: Partial<IQueryUpdate> = {
            table: 'games',
            function: 'mnp_attack_city',
            function_args: {
                tmp_attacker_name: payload.attacker_name,
                tmp_attacker_city: payload.attacker_city,
                tmp_attack_type: attackType,
                tmp_special_card: payload.special_card.split('-')[1], // origin 'used-attack city'
                tmp_card: payload.card,
                tmp_target_city_owner: payload.target_city_owner,
                tmp_target_city_left: payload.target_city_left,
                tmp_target_card: payload.target_card,
                tmp_event_money: +payload.event_money,
            }
        }
        // run query
        const {data, error} = await this.dq.update<IGameContext['gamePlayerInfo'][0]>(queryObject as IQueryUpdate)
        if(error) {
            // attack failed
            if(error.code == 'P0001') result = this.respond(403, error.message, [])
            // other error
            else result = this.respond(500, error.message, [])
        }
        else {
            // set attack history
            const getGameHistory = await this.redisGet(`gameHistory_${roomId}`)
            const attackHistory: IGameContext['gameHistory'] = [{
                display_name: payload.attacker_name,
                room_id: +roomId,
                history: `attack_city: ${payload.target_city} city attacked by ${payload.attacker_name} (${attackType})`
            }]
            // set attack shifted history (the shifter card)
            const shiftedHistory: IGameContext['gameHistory'] = !payload.target_special_card ? [] : [{
                display_name: payload.target_city_owner,
                room_id: +roomId,
                history: `special_card: ${payload.target_special_card} 💳`
            }]
            // update game history
            await this.redisSet(`gameHistory_${roomId}`, [...getGameHistory, ...attackHistory, ...shiftedHistory])
            // get quake city data
            const getQuakeCity = await this.redisGet(`gameQuakeCity_${roomId}`)
            let filteredQuakeCity = null
            // set redis for attack type QUAKE
            if(attackType == 'quake') {
                filteredQuakeCity = [...getQuakeCity, payload.target_city].filter((v, i, arr) => arr.indexOf(v) == i)
                await this.redisSet(`gameQuakeCity_${roomId}`, filteredQuakeCity)
            }
                
            // save missing data (multiple data)
            const multiSavedMissingData: IMissingData[] = []
            for(let d of data) {
                const temp = await this.saveMissingData(+roomId, d)
                multiSavedMissingData.push(temp)
            }

            // publish data
            const publishData = {
                attackerName: payload.attacker_name,
                attackType: attackType,
                targetCity: payload.target_city,
                targetCityProperty: payload.target_city_property,
                targetSpecialCard: payload.target_special_card?.split('-')[1] || null, // origin 'used-the shifter
                quakeCity: filteredQuakeCity,
                playerData: data,
                gameHistory: [...getGameHistory, ...attackHistory, ...shiftedHistory],
                // ### SEND MISSING DATA AS RESPONSE 
                // ### TO WARN PLAYER IF THERES MISSING DATA
                multiMissingData: multiSavedMissingData,
            }
            const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // publish to roomlist
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
            console.log(isRoomPublished);
            
            if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])

            // set result
            const resultData = {
                token: token,
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    // other method
    async getLogs(action: string, payload: IGamePlay['get_players']) {
        const getGameLog = await this.redisGet(`gameLog_${payload.room_id}`)
        return {
            status: 200,
            message: `${action} for room ${payload.room_id}`,
            data: getGameLog
        }
    }

    async fixPlayerTurns(action: string, payload: IGamePlay['fix_player_turns']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]
        // check player name
        if(payload.display_name !== 'gandesblood') 
            return result = this.respond(200, `${action} success`, [])
        
        const roomId = payload.channel.match(/\d+/)[0]
        // get player turns
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        // check empty player turns
        if(getPlayerTurns.indexOf('') === -1) {
            // theres no empty, publish player turns
            const publishData = {
                fixPlayerTurns: getPlayerTurns,
            }
            const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // return result
            return result = this.respond(200, `${action} success`, [1])
        }
        // empty player found
        // get game history
        const getGameHistory: IGameContext['gameHistory'] = await this.redisGet(`gameHistory_${roomId}`)
        const gameHistoryPlayers = getGameHistory.map(v => v.display_name).filter((v, i, arr) => arr.indexOf(v) === i)
        // compare playerTurns with historyPlayers to get the missing player
        const findMissingPlayer = gameHistoryPlayers.map(player => {
            const isPlayerMissing = getPlayerTurns.indexOf(player)
            return isPlayerMissing === -1 ? player : null
        }).filter(i => i)[0]
        // set fixed player turns
        await this.redisSet(`playerTurns_${roomId}`, [findMissingPlayer, ...getPlayerTurns].filter(i => i))
        // publish player turns
        const publishData = {
            // filter to remove the empty value
            fixPlayerTurns: [findMissingPlayer, ...getPlayerTurns].filter(i => i),
        }
        const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // set result
        result = this.respond(200, `${action} success`, [1])
        // return result
        return result
    }

    async getMissingData(action: string, payload: IGamePlay['mini_game']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        const roomId = payload.channel.match(/\d+/)[0]
        // check player turn
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        if(getPlayerTurns[0] != payload.display_name) 
            return this.respond(400, 'only allowed on your turn', [])
        // check limit
        const getMissingLimit = await this.redisGet(`missingLimit_${payload.display_name}`)
        if(getMissingLimit.length > 0 && getMissingLimit[0] === 3)
            return this.respond(400, 'missing data has reached limit', [])
        // set limit
        const missingLimit: number = getMissingLimit.length > 0 ? getMissingLimit[0] + 1 : 0
        await this.redisSet(`missingLimit_${payload.display_name}`, [missingLimit])

        // get missing data
        const getMissingData: IMissingData[] = await this.redisGet(`missingData_${roomId}`)
        // set missing data for turn end player
        const findPlayer = getMissingData.map(v => v.display_name).indexOf(payload.display_name)
        const playerMissingData = getMissingData[findPlayer]
        // game history container
        const getGameHistory = await this.redisGet(`gameHistory_${roomId}`)
        const missingHistory = {
            room_id: roomId,
            display_name: payload.display_name,
            history: 'missing data: retrieved 🥺',
        }
        // save game history to redis
        await this.redisSet(`gameHistory_${roomId}`, [...getGameHistory, missingHistory])

        // publish data
        const publishData = {
            missingData: playerMissingData,
        }
        const isGamePublished = await this.monopoliPublish(payload.channel, publishData)
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        
        result = this.respond(200, `${action} success`, [])
        return result
    }
    
    private async saveMissingData(roomId: number, playerData: IGameContext['gamePlayerInfo'][0]) {
        // get missing data
        const getMissingData: IMissingData[] = await this.redisGet(`missingData_${roomId}`)
        // set missing data for turn end player
        const findPlayer = getMissingData.map(v => v.display_name).indexOf(playerData.display_name)
        getMissingData[findPlayer].city = playerData.city
        getMissingData[findPlayer].card = playerData.card
        getMissingData[findPlayer].buff = playerData.buff
        getMissingData[findPlayer].debuff = playerData.debuff
        // save missing data
        await this.redisSet(`missingData_${roomId}`, [...getMissingData])
        // if missing data is limit, return null but still save the data
        const getMissingLimit = await this.redisGet(`missingLimit_${playerData.display_name}`)
        if(getMissingLimit.length > 0 && getMissingLimit[0] === 3)
            return null
        // return missing data
        return getMissingData[findPlayer]
    }

    async sendReportBugs(action: string, payload: IGamePlay['report_bugs']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]

        // check create rate limit
        const rateLimitID = payload.user_agent
        const rateLimitResult = await rateLimitSendReportBugs.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }
        
        // fetching
        const reportBugsWebhook = process.env.REPORT_BUGS_WEBHOOK
        const reportBugsContent = {
            content: `${process.env.REPORT_BUGS_TARGET}\n**Bug Report**\n${payload.display_name} - ${payload.description}`
        }
        const reportBugsFetchOptions = fetcherOptions({method: 'POST', credentials: true, domain: reportBugsWebhook, body: JSON.stringify(reportBugsContent)})
        const reportBugsResponse: Response = await fetcher(reportBugsWebhook, reportBugsFetchOptions, true)
        // response
        switch(true) {
            case reportBugsResponse.status < 300: 
                result = this.respond(200, `${action} success`, [])
                break
            default:
                result = this.respond(reportBugsResponse.status, reportBugsResponse.statusText, [])
                break
        }
        return result
    }
}