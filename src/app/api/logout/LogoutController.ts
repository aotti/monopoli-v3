import { cookies } from "next/headers";
import { IResponse } from "../../../helper/types";
import Controller from "../Controller";
import { NextRequest } from "next/server";

export default class LogoutController extends Controller {

    async logout(action: string, req: NextRequest) {
        console.log(action);
        
        let result: IResponse

        // check refresh token
        const refreshToken = cookies().get('refreshToken')?.value
        // access & refresh token empty
        if(!refreshToken) 
            return result = this.respond(403, 'forbidden', [])
        // set refresh token to empty
        cookies().set('refreshToken', '', { 
            path: '/',
            domain: req.nextUrl.hostname,
            maxAge: 0, // 1 week * 2
            httpOnly: true,
            sameSite: 'strict'
        })
        // return result
        return result = this.respond(200, `${action} success`, [])
    }
}