import { jwtVerify, SignJWT } from "jose";
import { DatabaseQueries } from "../../helper/DatabaseQueries";
import { filterInput, verifyAccessToken } from "../../helper/helper";
import { ILoggedUsers, IPlayer, IResponse, IToken, TokenPayloadType } from "../../helper/types";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import PubNub from "pubnub";

export default class Controller {
    protected dq = new DatabaseQueries()
    // pubnub for publish
    private pubnubServer = new PubNub({
        subscribeKey: process.env.PUBNUB_SUB_KEY,
        publishKey: process.env.PUBNUB_PUB_KEY,
        userId: process.env.PUBNUB_UUID
    })

    protected async pubnubPublish(channel: string, data: any) {
        return this.pubnubServer.publish({
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
            // player
            case 'user register': [filterStatus, filterMessage] = loopKeyValue(); break
            case 'user login': [filterStatus, filterMessage] = loopKeyValue(); break
            case 'user avatar update': [filterStatus, filterMessage] = loopKeyValue(); break
            case 'user get stats': [filterStatus, filterMessage] = loopKeyValue(); break
            case 'user send chat': [filterStatus, filterMessage] = loopKeyValue(); break
            // room
            case 'room create': [filterStatus, filterMessage] = loopKeyValue(); break
            case 'room hard delete': [filterStatus, filterMessage] = loopKeyValue(); break
            case 'room join': [filterStatus, filterMessage] = loopKeyValue(); break
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
        console.log({renewMyPlayer});
        
        if(renewMyPlayer.status === 200) return renewMyPlayer
        // if data empty, log my player
        const logMyPlayer = await this.logOnlineUsers('log', logData)
        console.log({logMyPlayer});
        
        if(logMyPlayer.status === 200) return logMyPlayer
    }

    protected async logOnlineUsers(action: 'log'|'out'|'renew', payload: Omit<ILoggedUsers, 'timeout_token'>) {
        const getLoggedUsers = cookies().get('loggedUsers')?.value
        let loggedUsers: ILoggedUsers[] = getLoggedUsers ? JSON.parse(getLoggedUsers) : []

        // logging users
        if(action == 'log') {
            // check if user exist
            const isUserExist = loggedUsers.map(v => v.display_name).indexOf(payload.display_name)
            if(isUserExist !== -1) {
                // check if token expired
                const [error, verify] = await verifyAccessToken({
                    action: 'verify-only', 
                    token: loggedUsers[isUserExist].timeout_token, 
                    secret: process.env.ACCESS_TOKEN_SECRET
                })
                // token not expired yet
                if(verify) return this.respond(403, 'this account is online', [])
            }
            // token expired
            // create token for timeout
            const loggedToken = await this.generateAccessToken(payload as any, '5min')
            // log the user
            loggedUsers.push({
                display_name: payload.display_name,
                status: payload.status,
                timeout_token: loggedToken
            })
            // update cookie
            updateLoggedUsersCookie()
            return this.respond(200, 'user logged', loggedUsers)
        }
        // remove user
        else if(action == 'out') {
            loggedUsers = loggedUsers.filter(p => p.display_name != payload.display_name)
            // update cookie
            updateLoggedUsersCookie()
            return this.respond(200, 'user logged', loggedUsers)
        }
        // renew user timeout token
        else if(action == 'renew') {
            // create token for timeout
            const loggedToken = await this.generateAccessToken(payload as any, '5min')
            // renew if user still logged
            const renewUser = loggedUsers.map(user => user.display_name).indexOf(payload.display_name)
            if(renewUser === -1) return this.respond(403, 'user not renew', [])
            // update my token
            loggedUsers[renewUser].timeout_token = loggedToken
            // update cookie
            updateLoggedUsersCookie()
            return this.respond(200, 'user logged', loggedUsers)
        }

        // update cookies
        function updateLoggedUsersCookie() {
            cookies().set('loggedUsers', JSON.stringify(loggedUsers), {
                path: '/',
                maxAge: 604800 * 2, // 1 week * 2
                httpOnly: true,
                sameSite: 'strict',
            })
        }
    }

    /**
     * @description check authorization header token 
     */
    checkAuthorization(req: NextRequest) {
        const accessToken = req.headers.get('authorization')?.replace('Bearer ', '')
        if(!accessToken) {
            // check refresh token
            const refreshToken = cookies().get('refreshToken')?.value
            // access & refresh token empty
            if(!refreshToken) 
                return this.respond(403, 'forbidden', [])
        }
        return this.respond(200, 'token ok', [{accessToken: accessToken}])
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
     * @returns verified token & get payload | error if no refresh token
     */
    protected async getTokenPayload(payload: {token: string}): Promise<IResponse<{tpayload: IPlayer, token: string}>> {
        // verify access token
        const [error, data] = await verifyAccessToken({
            action: 'verify-payload',
            secret: process.env.ACCESS_TOKEN_SECRET,
            token: payload.token
        })
        // access token expired / not exist
        if(!payload.token || error) {
            // get refresh token
            const refreshToken = cookies().get('refreshToken').value
            // verify token & renew access token
            const isVerified = await this.renewAccessToken(refreshToken)
            // token expired / not exist
            if(!isVerified) return this.respond(403, `forbidden`, [])
            // get payload from refresh token (100% no error cuz renew)
            const [accessToken, renewData] = isVerified
            return this.respond(200, 'get token payload', [{ tpayload: renewData, token: accessToken }])
        }
        // if current access token isnt expired, set to null
        return this.respond(200, 'get token payload', [{ tpayload: data, token: null }])
    }
}