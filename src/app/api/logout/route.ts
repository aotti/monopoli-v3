import { NextRequest, NextResponse, userAgent } from "next/server";
import LogoutController from "./LogoutController";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user logout'
    // payload
    const payload = {user_agent: userAgent(req).ua}
    // process
    const logoutController = new LogoutController()
    const result = await logoutController.logout(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}