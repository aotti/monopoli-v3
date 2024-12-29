import { IGameContext, IGamePlay, IQuerySelect, IQueryUpdate, IResponse } from "../../../helper/types";
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
            // get game history
            const getGameHistory = await this.redisGet(`gameHistory_${payload.room_id}`)
            // get ready players
            const getReadyPlayers = await this.redisGet(`readyPlayers_${payload.room_id}`)
            // get decide players
            const getDecidePlayers = await this.redisGet(`decidePlayers_${payload.room_id}`)
            // sort highest > lowest
            const sortDecidePlayers = getDecidePlayers.sort((a,b) => b.rolled_number - a.rolled_number)
            // get player turns
            const getPlayerTurns = await this.redisGet(`playerTurns_${payload.room_id}`)
            // set result
            const resultData = {
                gameHistory: getGameHistory,
                preparePlayers: getReadyPlayers.length > 0 ? getReadyPlayers.filter((v, i, arr) => arr.indexOf(v) === i) : null,
                decidePlayers: sortDecidePlayers.length > 0 ? sortDecidePlayers.filter((obj1, i, arr) => 
                    arr.findLastIndex(obj2 => obj2.display_name == obj1.display_name) === i
                ) : null,
                playerTurns: getPlayerTurns.length > 0 ? getPlayerTurns : null,
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
            onlinePlayers: JSON.stringify(onlinePlayersData)
        }
        const isPublished = await this.pubnubPublish(payload.channel, publishData)
        console.log(isPublished);
        
        if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
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
        if(getReadyPlayers.length < 2) {
            return this.respond(403, 'go get frens', [])
        }
        // publish online players
        const publishData = {
            startGame: 'start',
            fixedPlayers: getReadyPlayers.length,
            onlinePlayers: JSON.stringify(onlinePlayersData)
        }
        const isPublished = await this.pubnubPublish(payload.channel, publishData)
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
            onlinePlayers: JSON.stringify(onlinePlayersData)
        }
        const isPublished = await this.pubnubPublish(payload.channel, publishData)
        console.log(isPublished);
        
        if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
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
        // publish data
        const publishData = {
            playerTurn: payload.display_name,
            playerDice: +payload.rolled_dice,
            onlinePlayers: JSON.stringify(onlinePlayersData)
        }
        const isPublished = await this.pubnubPublish(payload.channel, publishData)
        console.log(isPublished);
        
        if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
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

    async turnEnd(action: string, payload: IGamePlay['turn_end']) {
        let result: IResponse
        
        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]
        // set payload for db query
        const queryObject: Partial<IQueryUpdate> = {
            table: 'games',
            function: 'mnp_turn_end',
            function_args: {
                tmp_display_name: payload.display_name,
                tmp_pos: payload.pos,
                tmp_lap: payload.lap
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
            for(let ph of payload.history.split(';')) {
                const tempHistory = {
                    room_id: +roomId, 
                    display_name: payload.display_name, 
                    history: ph
                }
                // save game history to redis
                gameHistory.push(tempHistory)
                await this.redisSet(`gameHistory_${roomId}`, [...getGameHistory, tempHistory])
            }
            // update player turns
            const getPlayerTurns = await this.redisGet(`playerTurns_${roomId}`)
            const shiftPlayerToBack = getPlayerTurns.splice(0, 1)[0] as string
            await this.redisSet(`playerTurns_${roomId}`, [...getPlayerTurns, shiftPlayerToBack])
            // publish online players
            const publishData = {
                playerTurnEnd: newPlayerTurnEndData,
                playerTurns: [...getPlayerTurns, shiftPlayerToBack],
                gameHistory: [...getGameHistory, ...gameHistory],
                onlinePlayers: JSON.stringify(onlinePlayersData)
            }
            const isPublished = await this.pubnubPublish(payload.channel, publishData)
            console.log(isPublished);
            
            if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // publish to roomlist
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.pubnubPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayersData)})
            console.log(isRoomPublished);
            
            if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set result
            const resultData = {
                // turnEndData: data[0],
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }
}