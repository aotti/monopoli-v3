import { IChat, IPlayer, IQuerySelect, IQueryUpdate, IResponse } from "../../../helper/types";
import Controller from "../Controller";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimitAvatar = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(1, '10m'),
    prefix: '@upstash/ratelimit',
})

export default class PlayerController extends Controller {

    async viewPlayer(action: string, payload: IPlayer) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent)
        if(onlinePlayers.status !== 200) return onlinePlayers
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
            // publish realtime data
            const roomlistChannel = 'monopoli-roomlist'
            const isPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayers.data)})
            console.log(isPublished);
            
            if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
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

    async viewRanking(action: string, payload) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload

        // set payload for db query
        const queryObject: IQuerySelect = {
            table: 'players',
            function: 'mnp_ranking'
        }
        // run query
        const {data, error} = await this.dq.select(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            result = this.respond(200, `${action} success`, data)
            return result
        }
    }
    
    async avatarUpload(action: string, payload: IPlayer) {
        let result: IResponse

        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        delete payload.token
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // check register rate limit
        const rateLimitID = `${payload.display_name}_${payload.user_agent}`
        const rateLimitResult = await rateLimitAvatar.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }
        // set payload for db query
        const queryObject: IQueryUpdate = {
            table: 'players',
            selectColumn: this.dq.columnSelector('players', 6),
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
            // publish realtime data
            const publishData = {onlinePlayers: JSON.stringify(onlinePlayers.data)}
            const roomlistChannel = 'monopoli-roomlist'
            const isPublished = await this.monopoliPublish(roomlistChannel, publishData)
            console.log(isPublished);
            
            if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
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
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // publish chat
        const publishData = {
            ...payload, 
            onlinePlayers: JSON.stringify(onlinePlayers.data)
        }
        const isPublished = await this.chattingPublish(payload.channel, publishData)
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
}