import { ICreateRoom, IGameContext, IGamePlay, IQuerySelect, IQueryUpdate, IResponse } from "../../../helper/types";
import Controller from "../Controller";

export default class GameController extends Controller {
    async filters(action: string, payload: any) {
        let filterResult: IResponse = null
        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload)
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
            selectColumn: this.dq.columnSelector('games', 3456789) + ',prison',
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
            const extractData = data.map(v => Object.entries(v))
            // convert data to array object
            const extractedData = extractData.map(temp => {
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
            // get game history
            const getGameHistory = await this.redisGet(`gameHistory_${payload.room_id}`)
            // set result
            const resultData = {
                gameStage: getGameStage.length > 0 ? getGameStage[0] : null,
                preparePlayers: getReadyPlayers.length > 0 ? getReadyPlayers.filter((v, i, arr) => arr.indexOf(v) === i) : null,
                decidePlayers: sortDecidePlayers.length > 0 ? sortDecidePlayers.filter((obj1, i, arr) => 
                    arr.findLastIndex(obj2 => obj2.display_name == obj1.display_name) === i
                ) : null,
                playerTurns: getPlayerTurns.length > 0 ? getPlayerTurns : null,
                gameHistory: getGameHistory,
                getPlayers: extractedData,
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
        // save ready players to redis
        const roomId = payload.channel.match(/\d+/)[0]
        const getReadyPlayers = await this.redisGet(`readyPlayers_${roomId}`)
        // check if the same player trying to ready
        const checkReadyPlayer = getReadyPlayers.indexOf(payload.display_name)
        if(checkReadyPlayer !== -1) return this.respond(403, 'fight me ni-', [])
        // set new ready player
        await this.redisSet(`readyPlayers_${roomId}`, [...getReadyPlayers, payload.display_name])
        // publish online players
        const publishData = {
            readyPlayers: [...getReadyPlayers, payload.display_name],
        }
        const isGamePublished = await this.pubnubPublish(payload.channel, publishData)
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // publish to roomlist
        const roomlistChannel = 'monopoli-roomlist'
        const isRoomPublished = await this.pubnubPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
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
            // publish online players
            const publishData = {
                startGame: 'start',
                fixedPlayers: getReadyPlayers.length,
            }
            const isGamePublished = await this.pubnubPublish(payload.channel, publishData)
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // publish to roomlist
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.pubnubPublish(roomlistChannel, {startGame: 'start', roomGame: +roomId})
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
        // set player turns if game stage == play
        if(sortDecidePlayers.length === getFixedPlayers.length)
            await this.redisSet(`playerTurns_${roomId}`, sortDecidePlayers.map(v => v.display_name))
        // publish online players
        const publishData = {
            decidePlayers: sortDecidePlayers,
            gameStage: sortDecidePlayers.length === getFixedPlayers.length ? 'play' : 'decide',
        }
        const isGamePublished = await this.pubnubPublish(payload.channel, publishData)
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // publish to roomlist
        const roomlistChannel = 'monopoli-roomlist'
        const isRoomPublished = await this.pubnubPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
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
        // check player turn
        const roomId = payload.channel.match(/\d+/)[0]
        const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
        if(getPlayerTurns[0] != payload.display_name) 
            return this.respond(400, 'its not your turn', [])
        // update player turns to empty
        getPlayerTurns.splice(0, 1, '')
        await this.redisSet(`playerTurns_${roomId}`, getPlayerTurns)
        // publish data
        const publishData = {
            playerTurn: payload.display_name,
            playerDice: +payload.rolled_dice,
        }
        const isGamePublished = await this.pubnubPublish(payload.channel, publishData)
        console.log(isGamePublished);
        
        if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // publish to roomlist
        const roomlistChannel = 'monopoli-roomlist'
        const isRoomPublished = await this.pubnubPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
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
            const isGamePublished = await this.pubnubPublish(payload.channel, publishData)
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // publish to roomlist
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.pubnubPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
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
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]
        // check taxes
        const isTaxes = payload.tax_owner && payload.tax_visitor
        // set payload for db query
        const queryObject: Partial<IQueryUpdate> = {
            table: 'games',
            function: 'mnp_turn_end',
            function_args: {
                tmp_display_name: payload.display_name,
                tmp_pos: +payload.pos,
                tmp_lap: +payload.lap,
                tmp_event_money: +payload.event_money,
                tmp_city: payload.city,
                tmp_taxes: isTaxes ? `${payload.tax_visitor};${payload.tax_owner}` : null,
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
            // update game history (buy city, get cards, etc)
            const roomId = payload.channel.match(/\d+/)[0]
            const getGameHistory = await this.redisGet(`gameHistory_${roomId}`)
            // fill game history
            const gameHistory: IGameContext['gameHistory'] = []
            // history = rolled_dice: num;buy_city: str;sell_city: str;get_card: str;use_card: str
            for(let ph of payload.history.split(';')) {
                const tempHistory = {
                    room_id: +roomId, 
                    display_name: payload.display_name, 
                    history: ph
                }
                // push
                gameHistory.push(tempHistory)
            }
            // save game history to redis
            await this.redisSet(`gameHistory_${roomId}`, [...getGameHistory, ...gameHistory])
            // push end turn player to playerTurns
            const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
            // remove empty
            getPlayerTurns.splice(0, 1)
            // push player
            getPlayerTurns.push(payload.display_name)
            await this.redisSet(`playerTurns_${roomId}`, getPlayerTurns)
            // publish online players
            const publishData = {
                playerTurnEnd: newPlayerTurnEndData,
                // ### tambah data pajak & uang
                taxes: isTaxes ? {
                    owner: payload.tax_owner, 
                    visitor: payload.tax_visitor, 
                    money: +payload.event_money
                } : null,
                playerTurns: getPlayerTurns,
                gameHistory: [...getGameHistory, ...gameHistory]
            }
            const isGamePublished = await this.pubnubPublish(payload.channel, publishData)
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set result
            const resultData = {
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }
}