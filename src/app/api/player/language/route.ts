import { NextRequest, NextResponse, userAgent } from "next/server";
import Controller from "../../Controller";
import PlayerController from "../PlayerController";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user language'
    // client payload
    const payload = await req.json()
    const controller = new Controller()
    // check header x-identifier
    const checkXID = controller.checkXIdentifier(req)
    if(checkXID.status !== 200) 
        return NextResponse.json(checkXID, {status: checkXID.status})
    // add user agent
    payload.user_agent = `${userAgent(req).ua}_${checkXID.data}`
    // process
    const playerController = new PlayerController()
    const result = await playerController.setLanguage(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}