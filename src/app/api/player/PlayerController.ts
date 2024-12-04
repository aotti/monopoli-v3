import { IChat, ILoggedUsers, IPlayer, IQuerySelect, IQueryUpdate, IResponse } from "../../../helper/types";
import Controller from "../Controller";

export default class PlayerController extends Controller {

    async viewPlayer(action: string, payload: IPlayer) {
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
            // renew log online player
            const onlinePlayers = await this.getOnlinePlayers(tpayload)
            // publish online players
            const onlineplayerChannel = 'monopoli-onlineplayer'
            await this.pubnubPublish(onlineplayerChannel, {onlinePlayers: JSON.stringify(onlinePlayers)})
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
    
    async avatarUpload(action: string, payload: IPlayer) {
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
            // renew log online player
            const onlinePlayers = await this.getOnlinePlayers(tpayload)
            // publish online players
            const publishData = { onlinePlayers: JSON.stringify(onlinePlayers) }
            const onlineplayerChannel = 'monopoli-onlineplayer'
            await this.pubnubPublish(onlineplayerChannel, publishData)
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

        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload)
        // publish chat
        const publishData = {
            ...payload, 
            onlinePlayers: JSON.stringify(onlinePlayers)
        }
        const isPublished = await this.pubnubPublish(payload.channel, publishData)
        console.log(isPublished);
        
        // set result
        const resultData = {
            token: token
        }
        result = this.respond(200, `${action} success`, [resultData])
        // return result
        return result
    }
}