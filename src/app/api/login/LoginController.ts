import { cookies } from "next/headers";
import { IPlayer, IQuerySelect, IResponse, IUser } from "../../../helper/types";
import Controller from "../Controller";
import { sha256 } from "../../../helper/helper";

export default class LoginController extends Controller {

    async login(action: string, payload: Pick<IUser, 'username'|'password'> & {user_agent: string}) {
        let result: IResponse

        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // set payload for db query
        const queryObject: IQuerySelect = {
            table: 'users',
            function: 'mnp_login',
            function_args: { 
                tmp_username: payload.username,
                tmp_password: sha256(payload.password)
            }
        }
        // run query
        const {data, error} = await this.dq.select<IPlayer>(queryObject)
        if(error) {
            // username/password error
            if(error.code == 'P0001') result = this.respond(400, error.message, [])
            // other error
            else result = this.respond(500, error.message, [])
        }
        else if(data) {
            // get player daily status
            const getPlayerDaily = await this.redisGet(`${data[0].display_name}_dailyStatus`)
            const today = new Date().toLocaleString([], {weekday: 'long'})
            const isDailyReset = getPlayerDaily.length > 0
                                // is daily status == today 
                                ? getPlayerDaily[0] === today
                                    // daily claimed
                                    ? 'claimed'
                                    // daily unclaim
                                    : 'unclaim'
                                : 'unclaim'
            // get player coins
            const getPlayerCoins = await this.redisGet(`${data[0].display_name}_coins`)
            // get player shop items
            const getPlayerShopItems = await this.redisGet(`${data[0].display_name}_shopItems`)
            // if empty, create it
            if(getPlayerCoins.length === 0) 
                await this.redisSet(`${data[0].display_name}_coins`, [0])
            // log user
            const onlinePlayers = await this.getOnlinePlayers(data[0], payload.user_agent)
            if(onlinePlayers.status !== 200) return onlinePlayers
            // publish online players
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayers.data)})
            console.log(isRoomPublished);
            
            if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // generate refresh token
            const refreshToken = await this.generateToken({type: 'refresh', payload: data[0]})
            // save refresh token
            cookies().set('refreshToken', refreshToken, { 
                path: '/',
                maxAge: 604800 * 2, // 1 week * 2
                httpOnly: true,
                sameSite: 'strict',
            })
            // generate access token
            const accessToken = await this.generateToken({type: 'access', payload: data[0], expire: '10min'})
            const resultData = {
                player: data[0],
                dailyStatus: isDailyReset,
                playerCoins: getPlayerCoins.length > 0 ?  getPlayerCoins[0] : 0,
                playerShopItems: getPlayerShopItems,
                token: accessToken,
                // in case client-side not subscribe yet cuz still loading
                onlinePlayers: onlinePlayers.data
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async autoLogin(action: string, payload: {user_agent: string}) {
        let result: IResponse

        // get refresh token
        const refreshToken = cookies().get('refreshToken')?.value
        if(!refreshToken) return result = this.respond(403, `${action} failed`, [])
        // verify token
        const isVerified = await this.renewAccessToken(refreshToken)
        // token expired / not exist
        if(!isVerified) return result = this.respond(403, `forbidden`, [])
        // token verified
        const [accessToken, renewData] = isVerified
        // set payload for db query
        const queryObject: IQuerySelect = {
            table: 'players',
            selectColumn: this.dq.columnSelector('players', 45),
            whereColumn: 'display_name',
            whereValue: renewData.display_name
        }
        // run query
        const {data, error} = await this.dq.select<IPlayer>(queryObject)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else {
            // get player daily status
            const getPlayerDaily = await this.redisGet(`${data[0].display_name}_dailyStatus`)
            const today = new Date().toLocaleString([], {weekday: 'long'})
            const isDailyReset = getPlayerDaily.length > 0
                                // is daily status == today 
                                ? getPlayerDaily[0] === today
                                    // daily claimed
                                    ? 'claimed'
                                    // daily unclaim
                                    : 'unclaim'
                                : 'unclaim'
            // get player coins
            const getPlayerCoins = await this.redisGet(`${data[0].display_name}_coins`)
            // get player shop items
            const getPlayerShopItems = await this.redisGet(`${data[0].display_name}_shopItems`)
            // if empty, create it
            if(getPlayerCoins.length === 0) 
                await this.redisSet(`${data[0].display_name}_coins`, [0])
            // new renew data
            const newRenewData: IPlayer = {
                ...renewData,
                game_played: data[0].game_played,
                worst_money_lost: data[0].worst_money_lost
            }
            // renew/log online player
            const onlinePlayers = await this.getOnlinePlayers(renewData, payload.user_agent)
            if(onlinePlayers.status !== 200) return onlinePlayers
            // publish online players
            const roomlistChannel = 'monopoli-roomlist'
            const isRoomPublished = await this.monopoliPublish(roomlistChannel, {onlinePlayers: JSON.stringify(onlinePlayers.data)})
            console.log(isRoomPublished);
            
            if(!isRoomPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
            // set result
            const resultData = {
                player: newRenewData,
                dailyStatus: isDailyReset,
                playerCoins: getPlayerCoins.length > 0 ?  getPlayerCoins[0] : 0,
                playerShopItems: getPlayerShopItems,
                token: accessToken,
                // in case client-side not subscribe yet cuz still loading
                onlinePlayers: onlinePlayers.data
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }
}