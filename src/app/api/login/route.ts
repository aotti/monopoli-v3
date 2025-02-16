import { NextRequest, NextResponse, userAgent } from "next/server";
import LoginController from "./LoginController";

// used for login & auto login
// if access token exist, do auto login
export async function POST(req: NextRequest) {
    // client payload
    const payload = await req.json() || {}
    // check authorization
    const accessToken = req.headers.get('authorization')?.replace('Bearer ', '')
    // add user agent to payload
    payload.user_agent = userAgent(req).ua
    // process
    const loginController = new LoginController()
    const result = accessToken 
                ? await loginController.autoLogin('user auto login', payload)
                : await loginController.login('user login', payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}