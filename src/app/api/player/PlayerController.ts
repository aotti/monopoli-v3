import { ILoggedUsers, IPlayer, IQueryUpdate, IResponse } from "../../../helper/types";
import Controller from "../Controller";

export default class PlayerController extends Controller {
    
    async avatarUpload(action: string, payload: any) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload['token'] })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        const { tpayload, token } = tokenPayload.data[0]

        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // set payload for db query
        const queryObject: IQueryUpdate = {
            table: 'players',
            selectColumn: this.dq.columnSelector('players', 4),
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
            // ### TRY SEND LOGGED PLAYERS WITH PUBNUB
            // ### TRY SEND LOGGED PLAYERS WITH PUBNUB
            // renew log online player
            const logData: Omit<ILoggedUsers, 'timeout_token'> = {
                display_name: tpayload.display_name,
                status: 'online'
            }
            const onlinePlayers = await this.logOnlineUsers('renew', logData)
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
}