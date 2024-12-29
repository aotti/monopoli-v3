import { cookies } from "next/headers";
import { ICreateRoom, IGameContext, IShiftRoom, IQueryInsert, IQuerySelect, IQueryUpdate, IResponse } from "../../../helper/types";
import Controller from "../Controller";

export default class RoomController extends Controller {
    
    private async filterRoomList(action: 'push'|'out', room_name: string) {
        // get room list
        const getRoomList = await this.redisGet('roomList')
        let tempRoomList = getRoomList.length > 0 ? getRoomList : []
        // check if room name is already exist
        const isRoomNameExist = tempRoomList.indexOf(room_name)
        if(isRoomNameExist !== -1) {
            // remove selected room name
            if(action == 'out') {
                tempRoomList = tempRoomList.filter(name => name != room_name)
                // save to redis
                await this.redisSet('roomList', tempRoomList)
            }
            return this.respond(400, 'name: room name already exist', [])
        }
        // push to temp room list
        if(action == 'push') tempRoomList.push(room_name)
        // save to redis
        await this.redisSet('roomList', tempRoomList)
        // return data
        return this.respond(200, 'room name ok', tempRoomList)
    }

    async create(action: string, payload: ICreateRoom['input']) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // filter room name
        const filterRoomList = await this.filterRoomList('push', payload.room_name)
        if(filterRoomList.status !== 200) return filterRoomList
        // destruct rules props
        const { select_board, select_dice, select_money_start, select_money_lose, 
            select_mode, select_curse, select_max_player, select_character } = payload
        // alter input to match db function
        const payloadValues: Omit<ICreateRoom['payload'], 'player_count'> = {
            creator: payload.creator,
            room_name: payload.room_name,
            room_password: payload.room_password,
            money_start: +select_money_start,
            rules: `board: ${select_board};dice: ${select_dice};start: ${select_money_start};lose: ${-select_money_lose};mode: ${select_mode};curse: ${select_curse};max: ${select_max_player}`,
            character: payload.select_character
        }
        // set payload for db query
        const queryObject: Partial<IQueryInsert> = {
            table: 'rooms',
            function: 'mnp_create_room',
            function_args: {
                tmp_creator: payloadValues.creator,
                tmp_name: payloadValues.room_name,
                tmp_password: payloadValues.room_password,
                tmp_money_start: payloadValues.money_start,
                tmp_rules: payloadValues.rules,
                tmp_character: payloadValues.character
            }
        }
        // run query
        const {data, error} = await this.dq.insert<ICreateRoom['list']>(queryObject as IQueryInsert)
        if(error) {
            // player not found error / already created room
            if(error.code == 'P0001') result = this.respond(403, error.message, [])
            // other error
            else result = this.respond(500, error.message, [])
        }
        else {
            // disable selected character
            await this.redisSet(`disabledCharacters_${data[0].room_id}`, [payload.select_character])
            // split max player from rules
            const playerMax = data[0].rules.match(/max: \d/)[0].split(': ')[1]
            const rules = data[0].rules.match(/.*(?=;max)/)[0]
            // create new room data
            const newRoomData: ICreateRoom['list'] = {
                room_id: data[0].room_id,
                creator: data[0].creator,
                room_name: data[0].room_name,
                room_password: data[0].room_password,
                player_count: data[0].player_count,
                player_max: +playerMax,
                rules: rules,
                status: data[0].status,
                characters: [payload.select_character],
            }
            // split rules
            const splitRules = rules.match(/^board: (normal|delta|2 way);dice: (1|2);start: (50000|75000|100000);lose: (-25000|-50000|-75000);mode: (5_laps|7_laps|survive);curse: (5|10|15)$/)
            // remove main rules
            splitRules.splice(0, 1)
            const [board, dice, money_start, money_lose, mode, curse] = [
                splitRules[0], // board
                +splitRules[1], // dice
                +splitRules[2], // money start
                +splitRules[3], // money lose
                splitRules[4], // mode
                +splitRules[5], // curse
            ]
            // data for gameRoomInfo
            const newGameRoomInfo: IGameContext['gameRoomInfo'][0] = {
                room_id: data[0].room_id,
                room_name: data[0].room_name,
                creator: data[0].creator,
                board, dice, money_lose, mode, curse
            }
            // publish realtime data
            const roomlistChannel = 'monopoli-roomlist'
            const publishData = {
                roomCreated: newRoomData,
                roomInfo: newGameRoomInfo,
                onlinePlayers: JSON.stringify(onlinePlayers.data)
            }
            const isPublished = await this.pubnubPublish(roomlistChannel, publishData)
            console.log(isPublished);
            
            if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set joined room 
            cookies().set('joinedRoom', data[0].room_id.toString(), {
                path: '/',
                maxAge: 604800 * 2, // 1 week * 2
                httpOnly: true,
                sameSite: 'strict',
            })
            // set result
            const resultData = {
                currentGame: data[0].room_id,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async getRooms(action: string, payload: ICreateRoom['input']) {
        console.log(action);
        
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]

        // no need filter, no payload
        // set payload for db query
        const queryObject: IQuerySelect = {
            table: 'rooms',
            function: 'mnp_get_rooms_and_mygame'
        }
        // run query
        type GetRoomsType = ICreateRoom['server'] & ICreateRoom['list']
        const {data, error} = await this.dq.select<GetRoomsType>(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            const roomListInfo: IGameContext['gameRoomInfo'] = []
            // modify data
            for(let d of data) {
                const { room_id, room_name, creator } = d
                // split max player from rules
                const playerMax = d.rules.match(/max: \d/)[0].split(': ')[1]
                const rules = d.rules.match(/.*(?=;max)/)[0]
                // get disabled characters
                const getDisabledCharacters = await this.redisGet(`disabledCharacters_${room_id}`)
                // add player max & modify rules
                d.player_max = +playerMax
                d.rules = rules
                // update room list characters data
                d.characters = getDisabledCharacters
                // modify room info for gameRoomInfo
                // split rules
                const splitRules = rules.match(/^board: (normal|delta|2 way);dice: (1|2);start: (50000|75000|100000);lose: (-25000|-50000|-75000);mode: (5_laps|7_laps|survive);curse: (5|10|15)$/)
                // remove main rules
                splitRules.splice(0, 1)
                const [board, dice, money_start, money_lose, mode, curse] = [
                    splitRules[0], // board
                    +splitRules[1], // dice
                    +splitRules[2], // money start
                    +splitRules[3], // money lose
                    splitRules[4], // mode
                    +splitRules[5], // curse
                ]
                // fill gameRoomInfo data
                roomListInfo.push(Object.assign({}, {
                    room_id, room_name, creator, 
                    board, dice, money_lose, mode, curse
                }))
                // push to temp room list to prevent duplicate room name
                for(let [key, value] of Object.entries(d)) {
                    if(key == 'room_name') {
                        // filter room name
                        const filterRoomList = await this.filterRoomList('push', value as string)
                        if(filterRoomList.status !== 200) continue
                    }
                }
            }
            // get joined room from cookie
            const getJoinedRoom = cookies().get('joinedRoom')?.value
            // check if player has joined room
            let isMyGameExist: number = null
            if(!getJoinedRoom) {
                // find in player list
                isMyGameExist = data.map((v, i) => v.player_list.match(tpayload.display_name) ? i : null).filter(i => i !== null)[0]
                if(typeof isMyGameExist == 'number' && isMyGameExist !== -1) 
                    cookies().set('joinedRoom', data[isMyGameExist].room_id.toString(), {
                        path: '/',
                        maxAge: 604800 * 2, // 1 week * 2
                        httpOnly: true,
                        sameSite: 'strict',
                    })
            }
            // match joined room with room list
            const isJoinedRoomExist = data.map(v => v.room_id).indexOf(data[isMyGameExist]?.room_id || +getJoinedRoom)
            // set result
            const resultData = {
                currentGame: isJoinedRoomExist !== -1 ? data[isJoinedRoomExist].room_id : null,
                roomListInfo: roomListInfo,
                roomList: data,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async joinRoom(action: string, payload: IShiftRoom) {
        let result: IResponse
        
        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // check disabled characters
        const getDisabledCharacters = await this.redisGet(`disabledCharacters_${payload.room_id}`)
        const isCharacterDisabled = getDisabledCharacters.indexOf(payload.select_character)
        if(isCharacterDisabled !== -1) return this.respond(400, 'someone has chosen this character', [])
        // set payload for db query
        const queryObject: Partial<IQueryInsert> = {
            table: 'games',
            function: 'mnp_join_room',
            function_args: {
                tmp_room_id: +payload.room_id,
                tmp_room_password: payload.room_password,
                tmp_display_name: payload.display_name,
                tmp_money_start: +payload.money_start,
                tmp_character: payload.select_character,
            }
        }
        // run query
        type JoinRoomType = ICreateRoom['list'] & IGameContext['gamePlayerInfo'][0]
        const {data, error} = await this.dq.insert<JoinRoomType>(queryObject as IQueryInsert)
        if(error) {
            // player already join / wrong password
            if(error.code == 'P0001') result = this.respond(403, error.message, [])
            // other error
            else result = this.respond(500, error.message, [])
        }
        else {
            // update disabled characters
            await this.redisSet(`disabledCharacters_${payload.room_id}`, [...getDisabledCharacters, payload.select_character])
            // publish realtime data
            const roomlistChannel = 'monopoli-roomlist'
            const publishData = {
                joinedPlayers: data[0].player_count,
                joinedRoomId: data[0].room_id,
                disabledCharacters: [...getDisabledCharacters, payload.select_character],
                onlinePlayers: JSON.stringify(onlinePlayers.data)
            }
            // roomlist publish
            const isRoomPublished = await this.pubnubPublish(roomlistChannel, publishData)
            console.log(isRoomPublished);
            
            if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // gameroom publish
            const gameroomChannel = `monopoli-gameroom-${data[0].room_id}`
            const joinPlayer: IGameContext['gamePlayerInfo'][0] = {
                display_name: data[0].display_name,
                character: (data[0] as any).player_character,
                pos: data[0].pos,
                money: data[0].money,
                lap: data[0].lap,
                card: data[0].card,
                city: data[0].city,
                prison: data[0].prison
            }
            const isGamePublished = await this.pubnubPublish(gameroomChannel, {joinPlayer})
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set joined room 
            cookies().set('joinedRoom', data[0].room_id.toString(), {
                path: '/',
                maxAge: 604800 * 2, // 1 week * 2
                httpOnly: true,
                sameSite: 'strict',
            })
            // set result
            const resultData = {
                joinData: data[0],
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async leaveRoom(action: string, payload: IShiftRoom) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // set payload for db query
        const queryObject: IQuerySelect = {
            table: 'games',
            function: 'mnp_leave_room',
            function_args: {
                tmp_room_id: payload.room_id,
                tmp_display_name: payload.display_name,
            }
        }
        // run query
        const {data, error} = await this.dq.select(queryObject)
        if(error) {
            // player / room not found
            if(error.code == 'P0001') result = this.respond(403, error.message, [])
            // other error
            else result = this.respond(500, error.message, [])
        }
        else {
            // publish online players
            const roomlistChannel = 'monopoli-roomlist'
            const publishData = {
                onlinePlayers: JSON.stringify(onlinePlayers.data),
                leavePlayer: payload.display_name
            }
            const isPublished = await this.pubnubPublish(roomlistChannel, publishData)
            console.log(isPublished);
            
            if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // gameroom publish
            const gameroomChannel = `monopoli-gameroom-${payload.room_id}`
            const isGamePublished = await this.pubnubPublish(gameroomChannel, {leavePlayer: payload.display_name})
            console.log(isGamePublished);
            
            if(!isGamePublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // remove chosen character
            const getDisabledCharacters = await this.redisGet(`disabledCharacters_${payload.room_id}`)
            const removeChosenCharacter = getDisabledCharacters.filter(char => char != payload.select_character)
            await this.redisSet(`disabledCharacters_${payload.room_id}`, removeChosenCharacter)
            // remove joined room cookie
            cookies().set('joinedRoom', '', {
                path: '/',
                maxAge: 0, // expire & remove in 0 seconds
                httpOnly: true,
                sameSite: 'strict',
            })
            // set result
            const resultData = {
                data: data,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }
    
    async softDelete(action: string, payload: ICreateRoom['input']) {
        let result: IResponse
        
        // return result
        return result
    }

    async hardDelete(action: string, payload: ICreateRoom['input'] & {display_name}) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // check the creator and the deletor (lemao)
        if(payload.creator != payload.display_name) return this.respond(403, 'forbidden', [])
        // set payload for db query
        const queryObject: IQuerySelect = {
            table: 'rooms',
            function: 'mnp_delete_room',
            function_args: {
                tmp_creator: payload.creator,
                tmp_name: payload.room_name
            }
        }
        // run query
        const {data, error} = await this.dq.select<ICreateRoom['list']>(queryObject)
        if(error) {
            // room not found
            if(error.code == 'P0001') result = this.respond(403, error.message, [])
            // other error
            else result = this.respond(500, error.message, [])
        }
        else {
            // remove room name from list
            await this.filterRoomList('out', payload.room_name)
            // remove disabled characters
            await this.redisReset(`disabledCharacters_${payload.room_id}`)
            // new rooms left data
            const newRoomsLeft: ICreateRoom['list'][] = []
            for(let d of data) {
                // get disabled characters
                const getDisabledCharacters = await this.redisGet(`disabledCharacters_${d.room_id}`)
                // split max player from rules
                const playerMax = d.rules.match(/max: \d/)[0].split(': ')[1]
                const rules = d.rules.match(/.*(?=;max)/)[0]
                // push data
                newRoomsLeft.push({
                    room_id: d.room_id,
                    creator: d.creator,
                    room_name: d.room_name,
                    room_password: d.room_password,
                    player_count: d.player_count,
                    player_max: +playerMax,
                    rules: rules,
                    status: d.status,
                    characters: getDisabledCharacters
                })
            }
            // publish realtime data
            const roomlistChannel = 'monopoli-roomlist'
            const publishData = {
                roomsLeft: newRoomsLeft,
                onlinePlayers: JSON.stringify(onlinePlayers.data)
            }
            const isPublished = await this.pubnubPublish(roomlistChannel, publishData)
            console.log(isPublished);
            
            if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set result
            const resultData = {
                deleted_room: payload.room_name,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }
}