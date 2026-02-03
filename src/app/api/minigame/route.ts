import { NextRequest, NextResponse, userAgent } from "next/server";
import Controller from "../Controller";
import MinigameController from "./MinigameController";
import { IResponse } from "../../../helper/types";

export async function GET(req: NextRequest) {
    // api action
    const action = 'minigame get words'
    // query
    const payload: any = {
        room_id: req.nextUrl.searchParams.get('id'),
    }
    const controller = new Controller()
    // check header x-identifier
    const checkXID = controller.checkXIdentifier(req)
    if(checkXID.status !== 200) 
        return NextResponse.json(checkXID, {status: checkXID.status})
    // check authorization
    const isAuth = await controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // add user agent to payload
    payload.user_agent = `${userAgent(req).ua}_${checkXID.data}`
    // process
    const minigameController = new MinigameController()
    const result = await minigameController.preparation(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}

export async function POST(req: NextRequest) {
    // client payload
    const payload = await req.json()
    const controller = new Controller()
    // check header x-identifier
    const checkXID = controller.checkXIdentifier(req)
    if(checkXID.status !== 200) 
        return NextResponse.json(checkXID, {status: checkXID.status})
    // check authorization
    const isAuth = await controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // add user agent
    payload.user_agent = `${userAgent(req).ua}_${checkXID.data}`
    // get action
    const action = payload.action
    delete payload.action
    // process
    const minigameController = new MinigameController()
    let result: IResponse = null
    switch(action) {
        case 'minigame answer': result = await minigameController.answer(action, payload); break
        case 'minigame unknown answer': result = await minigameController.unknownAnswer(action, payload); break
        default: result = {status: 404, message: 'request failed', data: []}
    }
    // return data to client
    return NextResponse.json(result, {status: result.status})
}