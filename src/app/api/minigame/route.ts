import { NextRequest, NextResponse, userAgent } from "next/server";
import Controller from "../Controller";
import MinigameController from "./MinigameController";

export async function POST(req: NextRequest) {
    // api action
    const action = 'minigame answer'
    // client payload
    const payload = await req.json()
    const controller = new Controller()
    // check header x-identifier
    const checkXID = controller.checkXIdentifier(req)
    if(checkXID.status !== 200) 
        return NextResponse.json(checkXID, {status: checkXID.status})
    // check authorization
    const isAuth = controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // add user agent
    payload.user_agent = `${userAgent(req).ua}_${checkXID.data}`
    // process
    const minigameController = new MinigameController()
    const result = await minigameController.answer(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}