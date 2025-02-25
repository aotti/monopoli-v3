import { jwtVerify, SignJWT } from "jose";
import { DatabaseQueries } from "../../helper/DatabaseQueries";
import { filterInput, verifyAccessToken } from "../../helper/helper";
import { ILoggedUsers, IPlayer, IResponse, IToken, TokenPayloadType } from "../../helper/types";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import PubNub from "pubnub";
import { redis } from "../../config/redis";

// redis
const redisClient = redis()

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

    constructor() {
        // this.redisReset('loggedPlayers')
        // this.redisReset('readyPlayers_33')
        // this.redisReset('decidePlayers_33')
        // this.redisReset('gameHistory_33')
        // this.redisReset('playerTurns_148')
        // this.redisSet('playerTurns_148', ['suwanto', 'gandesblood'])
        // this.redisSet('playerTurns_148', ['gandesblood', 'suwanto'])
        // this.redisSet('disabledCharacters_32', [
        //     'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/characters/circle-MPxBNB61chi1TCQfEnqvWesqXT2IqM.png'
        // ])
        // this.redisSet('disabledCharacters_33', [
        //     'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/characters/circle-MPxBNB61chi1TCQfEnqvWesqXT2IqM.png',
        //     'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/characters/square-GcUfnpybETUDXjwbOxSTxdC6fkp4xb.png'
        // ])
    }

    /**
     * @description used for log online users & room names
     */
    protected async redisSet(key: string, value: any[]) {
        // set new data
        const setResult = await redisClient.set(key, JSON.stringify(value));
        return setResult
    }

    /**
     * @description used for retrieve logged online users & room names
     * @returns JSON.parse value
     */
    protected async redisGet(key: string) {
        // get existing data
        const getResult: any = await redisClient.get(key);
        return getResult as any[] || []
    }

    protected async redisReset(key: string) {
        // reset existing data
        const resetResult = await redisClient.del(key)
        console.log(resetResult);
        
    }

    protected filterPayload<T>(action: string, payload: T) {
        // log the action
        console.log(action);

        // filter result
        let [filterStatus, filterMessage] = [false, 'payload is not filtered yet']
        // matching filter
        switch(action) {
            // player
            case 'user register': 
            case 'user login': 
            case 'user avatar update': 
            case 'user get stats': 
            case 'user send chat': [filterStatus, filterMessage] = loopKeyValue(); break
            // room
            case 'room create': 
            case 'room hard delete': 
            case 'room join': 
            case 'room leave': [filterStatus, filterMessage] = loopKeyValue(); break
            // game
            case 'game get player': 
            case 'game ready player': 
            case 'game start': 
            case 'game roll turn': 
            case 'game roll dice': 
            case 'game surrender': 
            case 'game sell city': 
            case 'game turn end': 
            case 'game over': [filterStatus, filterMessage] = loopKeyValue(); break
        }
        // return filter
        return this.respond(filterStatus ? 200 : 400, filterMessage, [])

        // looping function
        function loopKeyValue(): [boolean, string] {
            for(let [key, value] of Object.entries(payload)) {
                // skip filter password 
                if(key == 'token') continue
                else if(!filterInput(key as any, value)) 
                    return [false, `${key} doesnt match!`]
            }
            return [true, 'filter ok']
        }
    }

    protected respond<T=any>(s: number, m: string, d: T[]) {
        return {
            status: s,
            message: m,
            data: d
        }
    }

    protected async getOnlinePlayers(data: IPlayer, userAgent: string) {
        const logData: Partial<ILoggedUsers> = {
            display_name: data.display_name,
            status: 'online',
            user_agent: userAgent
        }
        // renew my player
        const renewMyPlayer = await this.logOnlineUsers('renew', logData)
        if(renewMyPlayer.status === 200 || renewMyPlayer.status === 400 || renewMyPlayer.status === 403) 
            return renewMyPlayer
        // if data empty, log my player
        const logMyPlayer = await this.logOnlineUsers('log', logData)
        if(logMyPlayer.status === 200 || logMyPlayer.status === 400 || logMyPlayer.status === 403) 
            return logMyPlayer
    }

    protected async logOnlineUsers(action: 'log'|'out'|'renew', payload: Partial<ILoggedUsers>) {
        const getLoggedPlayers = await this.redisGet('loggedPlayers')
        let loggedPlayers: ILoggedUsers[] = getLoggedPlayers.length > 0 ? getLoggedPlayers : []
        // check players token each request
        if(loggedPlayers.length > 0) {
            const getPlayersToken = loggedPlayers.map(v => v.timeout_token)
            // verify players token
            for(let token of getPlayersToken) {
                const [error, verify] = await verifyAccessToken({
                    action: 'verify-only', 
                    token: token, 
                    secret: process.env.ACCESS_TOKEN_SECRET
                })
                // filter expired players
                if(error) loggedPlayers = loggedPlayers.filter(v => v.timeout_token != token)
            }
            // check for account in use
            // match the user agent
            console.log(action, 'checking account in use');
            const findUser = loggedPlayers.map(v => v.display_name).indexOf(payload.display_name)
            const isUserAgentMatch = matchUserAgent(payload.user_agent, findUser)
            if(findUser !== -1 && !isUserAgentMatch) {
                // if user wanna logout
                if(action == 'out') return this.respond(400, 'status must be online', [])
                // other action
                return this.respond(403, 'account in use', [])
            }
        }
        // logging users
        if(action == 'log') {
            // create token for timeout
            const timeoutToken = await this.generateAccessToken(payload as any, '5min')
            // log the player
            // used for client side afk player
            loggedPlayers.push({
                display_name: payload.display_name,
                status: payload.status,
                timeout_token: timeoutToken,
                user_agent: payload.user_agent
            })
            // save user agent to redis
            // used for check account in use
            await this.redisSet(`userAgent_${payload.display_name}`, [payload.user_agent])
            const filteredLoggedPlayers = loggedPlayers.filter((v1, i, arr) => arr.findLastIndex(v2 => v2.display_name == v1.display_name) === i)
            // save to redis
            await this.redisSet('loggedPlayers', filteredLoggedPlayers)
            // response
            return this.respond(200, 'user logged', filteredLoggedPlayers)
        }
        // renew user timeout token
        else if(action == 'renew') {
            // renew if user still logged
            // status 400 used for proceed to 'log' action 
            const renewUser = loggedPlayers.map(v => v.display_name).indexOf(payload.display_name)
            if(renewUser === -1) return this.respond(401, 'no access', [])
            // create token for timeout
            const timeoutToken = await this.generateAccessToken(payload as any, '5min')
            // update my token
            loggedPlayers[renewUser].timeout_token = timeoutToken
            // save to redis
            await this.redisSet('loggedPlayers', loggedPlayers)
            // response
            return this.respond(200, 'user logged', loggedPlayers)
        }
        // remove user
        else if(action == 'out') {
            loggedPlayers = loggedPlayers.filter(v => v.display_name != payload.display_name)
            // save to redis
            await this.redisSet('loggedPlayers', loggedPlayers)
            // response
            return this.respond(200, 'user logged', loggedPlayers)
        }

        /**
         * @description match timeout token as identifier for user
         */
        function matchUserAgent(userAgent: string, index: number) {
            if(userAgent && userAgent == loggedPlayers[index]?.user_agent)
                return true
            return false
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