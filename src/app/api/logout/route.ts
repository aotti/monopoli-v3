import { NextRequest, NextResponse, userAgent } from "next/server";
import LogoutController from "./LogoutController";
import Controller from "../Controller";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user logout'
    const controller = new Controller()
    // check header x-identifier
    const checkXID = controller.checkXIdentifier(req)
    if(checkXID.status !== 200) 
        return NextResponse.json(checkXID, {status: checkXID.status})
    // payload
    const payload = {
        user_agent: `${userAgent(req).ua}_${checkXID.data}`
    }
    // process
    const logoutController = new LogoutController()
    const result = await logoutController.logout(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}