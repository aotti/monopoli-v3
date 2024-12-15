import { cookies } from "next/headers";
import { ICreateRoom, IJoinRoom, IQueryInsert, IQuerySelect, IQueryUpdate, IResponse } from "../../../helper/types";
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
            select_mode, select_curse, select_max_player } = payload
        // alter input to match db function
        const payloadValues: Omit<ICreateRoom['payload'], 'player_count'> = {
            creator: payload.creator,
            room_name: payload.room_name,
            room_password: payload.room_password,
            money_start: +select_money_start,
            rules: `board: ${select_board};dice: ${select_dice};start: ${select_money_start};lose: ${-select_money_lose};mode: ${select_mode};curse: ${select_curse};max: ${select_max_player}`
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
                tmp_rules: payloadValues.rules
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
                status: data[0].status
            }
            // publish realtime data
            const createroomChannel = 'monopoli-createroom'
            const publishData = {
                roomCreated: newRoomData,
                onlinePlayers: JSON.stringify(onlinePlayers.data)
            }
            const isPublished = await this.pubnubPublish(createroomChannel, publishData)
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
        const {data, error} = await this.dq.select<ICreateRoom['server']>(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // modify extracted data
            for(let d of data) {
                // split max player from rules
                const playerMax = d.rules.match(/max: \d/)[0].split(': ')[1]
                const rules = d.rules.match(/.*(?=;max)/)[0]
                // add player max & modify rules
                d.player_max = +playerMax
                d.rules = rules
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
            // set joined room if exist
            let isMyGameExist: number = null
            if(!getJoinedRoom) {
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
            console.log(isMyGameExist, getJoinedRoom, isJoinedRoomExist);
            
            // set result
            const resultData = {
                currentGame: isJoinedRoomExist !== -1 ? data[isJoinedRoomExist].room_id : null,
                rooms: data,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async joinRoom(action: string, payload: IJoinRoom['input']) {
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
        // set payload for db query , , , 
        const queryObject: Partial<IQueryInsert> = {
            table: 'games',
            function: 'mnp_join_room',
            function_args: {
                tmp_room_id: +payload.room_id,
                tmp_room_password: payload.room_password,
                tmp_display_name: payload.display_name,
                tmp_money_start: +payload.money_start,
            }
        }
        // run query
        const {data, error} = await this.dq.insert<ICreateRoom['list']>(queryObject as IQueryInsert)
        if(error) {
            // player already join / wrong password
            if(error.code == 'P0001') result = this.respond(403, error.message, [])
            // other error
            else result = this.respond(500, error.message, [])
        }
        else {
            // publish realtime data
            const joinplayerChannel = 'monopoli-joinplayer'
            const publishData = {
                joinedPlayers: data[0].player_count,
                joinedRoomId: data[0].room_id,
                onlinePlayers: JSON.stringify(onlinePlayers.data)
            }
            const isPublished = await this.pubnubPublish(joinplayerChannel, publishData)
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
                joinData: data[0],
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
            // new rooms left data
            const newRoomsLeft: ICreateRoom['list'][] = []
            data.forEach(v => {
                // split max player from rules
                const playerMax = v.rules.match(/max: \d/)[0].split(': ')[1]
                const rules = v.rules.match(/.*(?=;max)/)[0]
                // push data
                newRoomsLeft.push({
                    room_id: v.room_id,
                    creator: v.creator,
                    room_name: v.room_name,
                    room_password: v.room_password,
                    player_count: v.player_count,
                    player_max: +playerMax,
                    rules: rules,
                    status: v.status
                })
            })
            // publish realtime data
            const deleteroomChannel = 'monopoli-deleteroom'
            const publishData = {
                roomsLeft: newRoomsLeft,
                onlinePlayers: JSON.stringify(onlinePlayers.data)
            }
            const isPublished = await this.pubnubPublish(deleteroomChannel, publishData)
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