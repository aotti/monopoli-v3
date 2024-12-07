import { cookies } from "next/headers";
import { ILoggedUsers, IPlayer, IResponse } from "../../../helper/types";
import Controller from "../Controller";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export default class LogoutController extends Controller {

    async logout(action: string, req: NextRequest) {
        console.log(action);
        
        let result: IResponse

        // check refresh token
        const refreshToken = cookies().get('refreshToken')?.value
        // access & refresh token empty
        if(!refreshToken) 
            return result = this.respond(403, 'forbidden', [])
        // verify refresh token
        const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
        const verify = await jwtVerify<IPlayer>(refreshToken, secret)
        // token expired
        if(!verify?.payload) return result = this.respond(403, 'forbidden', [])
        // set refresh token to empty
        cookies().set('refreshToken', '', { 
            path: '/',
            domain: req.nextUrl.hostname,
            maxAge: 0, // 1 week * 2
            httpOnly: true,
            sameSite: 'strict'
        })
        // remove player from log
        // renew log online player
        const logData: Omit<ILoggedUsers, 'timeout_token'> = {
            display_name: verify.payload.display_name,
            status: 'online'
        }
        const onlinePlayers = await this.logOnlineUsers('out', logData)
        // publish online players
        const onlineplayer_channel = 'monopoli-onlineplayer'
        const isPublished = await this.pubnubPublish(onlineplayer_channel, {onlinePlayers: JSON.stringify(onlinePlayers)})
        console.log(isPublished);
        
        if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // return result
        return result = this.respond(200, `${action} success`, [])
    }
}