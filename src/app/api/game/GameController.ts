import { IQuerySelect, IResponse } from "../../../helper/types";
import Controller from "../Controller";

export default class GameController extends Controller {

    async getPlayers(action: string, payload: any) {
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
            selectColumn: this.dq.columnSelector('games', 345678),
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
            result = this.respond(200, `${action} success`, extractedData)
        }
        // return result
        return result
    }
}