import { cookies } from "next/headers";
import { ILoggedUsers, IPlayer, IQuerySelect, IResponse, IUser } from "../../../helper/types";
import Controller from "../Controller";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export default class LoginController extends Controller {

    async login(action: string, payload: Pick<IUser, 'username'|'password'>, req: NextRequest) {
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
                tmp_password: payload.password
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
            // log user
            const logData: Omit<ILoggedUsers, 'timeout_token'> = {
                display_name: data[0].display_name,
                status: 'online'
            }
            const onlinePlayers = await this.logOnlineUsers('log', logData)
            // publish online players
            const onlineplayer_channel = 'monopoli-onlineplayer'
            this.pubnubPublish(onlineplayer_channel, {onlinePlayers: JSON.stringify(onlinePlayers)})
            // generate refresh token
            const refreshToken = await this.generateToken({type: 'refresh', payload: data[0]})
            // save refresh token
            cookies().set('refreshToken', refreshToken, { 
                path: '/',
                domain: req.nextUrl.hostname,
                maxAge: 604800 * 2, // 1 week * 2
                httpOnly: true,
                sameSite: 'strict'
            })
            // generate access token
            const accessToken = await this.generateToken({type: 'access', payload: data[0], expire: '10min'})
            const resultData = {
                player: data[0],
                token: accessToken,
                onlinePlayers: onlinePlayers
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return result
        return result
    }

    async autoLogin(action: string) {
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
        // renew/log online player
        const onlinePlayers = await this.getOnlinePlayers(renewData)
        // publish online players
        const onlineplayer_channel = 'monopoli-onlineplayer'
        this.pubnubPublish(onlineplayer_channel, {onlinePlayers: JSON.stringify(onlinePlayers)})
        // set result
        const resultData = {
            player: renewData,
            token: accessToken,
            onlinePlayers: onlinePlayers
        }
        result = this.respond(200, `${action} success`, [resultData])
        // return result
        return result
    }
}