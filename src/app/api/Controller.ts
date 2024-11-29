import { jwtVerify, SignJWT } from "jose";
import { DatabaseQueries } from "../../helper/DatabaseQueries";
import { filterInput, verifyAccessToken } from "../../helper/helper";
import { ILoggedUsers, IPlayer, IResponse, IToken, IUser, TokenPayloadType } from "../../helper/types";
import { cookies } from "next/headers";
import PubNub from "pubnub";

export default class Controller {
    protected dq = new DatabaseQueries()
    // log users online
    private static loggedUsers: ILoggedUsers[] = []
    // pubnub for publish
    private pubnub: PubNub

    constructor() {
        // initialize pubnub
        this.pubnub = new PubNub({
            subscribeKey: process.env.PUBNUB_SUB_KEY,
            publishKey: process.env.PUBNUB_PUB_KEY,
            userId: process.env.PUBNUB_UUID
        })
    }

    protected async pubnubPublish<T extends PubNub.Payload>(channel: string, data: T) {
        await this.pubnub.publish({
            channel: channel,
            message: data
        })
    }

    protected filterPayload<T>(action: string, payload: T) {
        // log the action
        console.log(action);

        // filter result
        let [filterStatus, filterMessage] = [false, 'payload is not filtered yet']
        // matching filter
        switch(action) {
            case 'user register': [filterStatus, filterMessage] = loopKeyValue(); break
            case 'user login': [filterStatus, filterMessage] = loopKeyValue(); break
            case 'user avatar update': [filterStatus, filterMessage] = loopKeyValue(); break
            case 'user get stats': [filterStatus, filterMessage] = loopKeyValue(); break
        }
        // return filter
        return this.respond(filterStatus ? 200 : 400, filterMessage, [])

        // looping function
        function loopKeyValue(): [boolean, string] {
            for(let [key, value] of Object.entries(payload)) {
                // skip filter password 
                if(key == 'password' || key == 'token') continue
                else if(!filterInput(key as any, value)) 
                    return [false, `${key} doesnt match!`]
            }
            return [true, 'filter ok']
        }
    }

    protected respond<T=any>(s: number, m: string | object, d: T[]) {
        return {
            status: s,
            message: m,
            data: d
        }
    }

    protected async getOnlinePlayers(data: IPlayer) {
        const logData: Omit<ILoggedUsers, 'timeout_token'> = {
            display_name: data.display_name,
            status: 'online'
        }
        // renew my player
        const renewMyPlayer = await this.logOnlineUsers('renew', logData)
        // if null, log my player
        const logMyPlayer = !renewMyPlayer ? await this.logOnlineUsers('log', logData) : null
        return renewMyPlayer || logMyPlayer
    }

    protected async logOnlineUsers(action: 'log'|'out'|'renew', payload: Omit<ILoggedUsers, 'timeout_token'>) {
        if(action == 'log') {
            // create token for timeout
            const loggedToken = await this.generateAccessToken(payload as any, '5min')
            // check if user exist
            const isUserExist = Controller.loggedUsers.map(v => v.display_name).indexOf(payload.display_name)
            if(isUserExist !== -1) return Controller.loggedUsers
            // user not exist log user + token
            Controller.loggedUsers.push({
                display_name: payload.display_name,
                status: payload.status,
                timeout_token: loggedToken
            })
            return Controller.loggedUsers
        }
        else if(action == 'out') {
            Controller.loggedUsers = Controller.loggedUsers.filter(p => p.display_name != payload.display_name)
            return Controller.loggedUsers
        }
        else if(action == 'renew') {
            // create token for timeout
            const loggedToken = await this.generateAccessToken(payload as any, '5min')
            // renew if user still logged
            const renewUser = Controller.loggedUsers.map(user => user.display_name).indexOf(payload.display_name)
            if(renewUser === -1) return null
            // update my token
            Controller.loggedUsers[renewUser].timeout_token = loggedToken
            return Controller.loggedUsers
        }
    }
    
    protected generateToken<T extends IToken>(args: T): Promise<string>
    protected async generateToken<T extends IToken>(args: T) {
        return args.type == 'access'
            ? await this.generateAccessToken(args.payload, args.expire)
            : await this.generateRefreshToken(args.payload)
    }

    private async generateAccessToken(payload: TokenPayloadType, expire: string) {
        const accessSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
        return await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setAudience('https://monopoli-v3.vercel.app')
            .setIssuer('monopoli lemao')
            .setSubject(payload.display_name)
            .setExpirationTime(expire)
            .sign(accessSecret)
    }

    private async generateRefreshToken(payload: TokenPayloadType) {
        const refreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
        return await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setAudience('https://monopoli-v3.vercel.app')
            .setIssuer('monopoli lemao')
            .setSubject(payload.display_name)
            .sign(refreshSecret)
    }

    protected async renewAccessToken(refreshToken: string): Promise<[string, IPlayer] | null> {
        // verify token
        const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
        const verified = await jwtVerify<IPlayer>(refreshToken, secret)
        if(verified?.payload) {
            const renewData: IPlayer = {
                display_name: verified.payload.display_name,
                game_played: verified.payload.game_played,
                worst_money_lost: verified.payload.worst_money_lost,
                avatar: verified.payload.avatar
            }
            // renew access token
            const accessToken = await this.generateToken({type: 'access', payload: renewData, expire: '10min'})
            return [accessToken, renewData]
        }
        else {
            // token expired / not exist
            // remove token
            cookies().delete('refreshToken')
            return null
        }
    }

    /**
     * @param payload embedded access token to payload in route
     * @description verify access / refresh token
     * @returns verified token & get payload
     */
    protected async getTokenPayload(payload: {token: string}): Promise<IResponse<{tpayload: IPlayer, token: string}>> {
        // if current access token isnt expired, set to null
        let newAccessToken: string = null
        // access token expired / not exist
        if(!payload.token) {
            // get refresh token
            const refreshToken = cookies().get('refreshToken').value
            // verify token & renew access token
            const isVerified = await this.renewAccessToken(refreshToken)
            // token expired / not exist
            if(!isVerified) return this.respond(403, `forbidden`, [])
            // refresh token verified
            const [accessToken, renewData] = isVerified
            payload.token = accessToken
            // set new access token
            newAccessToken = accessToken
        }
        // get payload from access token (100% no error cuz renew)
        const [error, data] = await verifyAccessToken({
            action: 'verify-payload',
            secret: process.env.ACCESS_TOKEN_SECRET,
            token: payload.token
        })
        return this.respond(200, 'get token payload', [{ tpayload: data, token: newAccessToken }])
    }
}