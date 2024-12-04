import { ICreateRoom, IQueryInsert, IResponse } from "../../../helper/types";
import Controller from "../Controller";

export default class RoomController extends Controller {

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
            await this.pubnubPublish(createroomChannel, publishData)
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