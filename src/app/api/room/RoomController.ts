import { ICreateRoom, IQueryInsert, IQuerySelect, IResponse } from "../../../helper/types";
import Controller from "../Controller";

export default class RoomController extends Controller {
    private static tempRoomList: string[] = []

    private filterRoomList(room_name: string) {
        // check if room name is already exist
        const isRoomNameExist = RoomController.tempRoomList.indexOf(room_name)
        if(isRoomNameExist !== -1) return this.respond(400, 'name: room name already exist', [])
        // push to temp room list
        RoomController.tempRoomList.push(room_name)
        return this.respond(200, 'room name ok', [])
    }

    async create(action: string, payload: ICreateRoom['input']) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // filter room name
        const filterRoomList = this.filterRoomList(payload.room_name)
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
            rules: `board: ${select_board};dice: ${select_dice};start: ${select_money_start};lose: ${select_money_lose};mode: ${select_mode};curse: ${select_curse};max: ${select_max_player}`
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
        const {data, error} = await this.dq.insert(queryObject as IQueryInsert)
        if(error) {
            // player not found error
            if(error.code == 'P0001') result = this.respond(403, 'forbidden', [])
            // other error
            else result = this.respond(500, error.message, [])
        }
        else {
            // renew log online player
            const onlinePlayers = await this.getOnlinePlayers(tpayload)
            // publish online players
            const createroomChannel = 'monopoli-createroom'
            const publishData = {
                ...data[0] as ICreateRoom['list'],
                onlinePlayers: JSON.stringify(onlinePlayers)
            }
            const isPublished = await this.pubnubPublish(createroomChannel, publishData)
            console.log(isPublished);
            
            if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
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
            selectColumn: this.dq.columnSelector('rooms', 1234567)
        }
        // run query
        const {data, error} = await this.dq.select(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // extract display_name from creator_id
            // convert object data to 2d array [[key, value]]
            const extractData = data.map(v => Object.entries(v))
            // convert extract data to object
            const extractedData = extractData.map(temp => {
                const tempExtractData = temp.map(v => v[1] && typeof v[1] == 'object' ? Object.entries(v[1]).flat() : v )
                const tempNewData = {}
                for(let [key, value] of tempExtractData) {
                    tempNewData[key] = value 
                    // push to temp room list to prevent duplicate room name
                    if(key == 'name') {
                        // filter room name
                        const filterRoomList = this.filterRoomList(value)
                        if(filterRoomList.status !== 200) continue
                    }
                }
                return tempNewData
            }) as ICreateRoom['list'][]
            // set result
            const resultData = {
                rooms: extractedData,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }
}