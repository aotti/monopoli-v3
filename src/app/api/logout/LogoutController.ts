import { cookies } from "next/headers";
import { ILoggedUsers, IPlayer, IResponse } from "../../../helper/types";
import Controller from "../Controller";
import { jwtVerify } from "jose";

export default class LogoutController extends Controller {

    async logout(action: string) {
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
        // remove player from log
        const logData: Partial<ILoggedUsers> = {
            display_name: verify.payload.display_name,
            status: 'online'
        }
        const onlinePlayers = await this.logOnlineUsers('out', logData as ILoggedUsers)
        if(onlinePlayers.status !== 200) return onlinePlayers
        console.log('logout', onlinePlayers);
        
        // publish online players
        const onlineplayer_channel = 'monopoli-onlineplayer'
        const isPublished = await this.pubnubPublish(onlineplayer_channel, {onlinePlayers: JSON.stringify(onlinePlayers.data)})
        console.log(isPublished);
        
        if(!isPublished.timetoken) return this.respond(500, 'realtime error, try again', [])
        // set player secret to empty
        cookies().set('timeoutToken', '', {
            path: '/',
            maxAge: 0, // expire & remove in 0 seconds
            httpOnly: true,
            sameSite: 'strict',
        })
        cookies().set('joinedRoom', '', {
            path: '/',
            maxAge: 0, // expire & remove in 0 seconds
            httpOnly: true,
            sameSite: 'strict',
        })
        // set refresh token to empty
        cookies().set('refreshToken', '', { 
            path: '/',
            maxAge: 0, // expire & remove in 0 seconds
            httpOnly: true,
            sameSite: 'strict'
        })
        // return result
        return result = this.respond(200, `${action} success`, [])
    }
}