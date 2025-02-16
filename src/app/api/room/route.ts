import { NextRequest, NextResponse, userAgent } from "next/server";
import RoomController from "./RoomController";
import Controller from "../Controller";
import { IResponse } from "../../../helper/types";

export async function GET(req: NextRequest) {
    // api action
    const action = 'room get list'
    // check authorization
    const controller = new Controller()
    const isAuth = controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    const payload = {token: isAuth.data[0].accessToken}
    // process
    const roomController = new RoomController()
    const result = await roomController.getRooms(action, payload as any)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}

export async function POST(req: NextRequest) {
    // api action
    const action = 'room create'
    // client payload
    const payload = await req.json()
    // check authorization
    const controller = new Controller()
    const isAuth = controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // add user agent
    payload.user_agent = userAgent(req).ua
    // process
    const roomController = new RoomController()
    const result = await roomController.create(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}

export async function PUT(req: NextRequest) {
    // client payload
    const payload = await req.json()
    // check authorization
    const controller = new Controller()
    const isAuth = controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // add user agent
    payload.user_agent = userAgent(req).ua
    // get action
    const action = payload.action
    delete payload.action
    // process
    const roomController = new RoomController()
    const result = action == 'room join' 
                ? await roomController.joinRoom(action, payload)
                : {status: 404, message: 'request failed', data: []} as IResponse
    // return data to client
    return NextResponse.json(result, {status: result.status})
}

export async function DELETE(req: NextRequest) {
    // client payload
    const payload = await req.json()
    // check authorization
    const controller = new Controller()
    const isAuth = controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // add user agent
    payload.user_agent = userAgent(req).ua
    // get action
    const action = payload.action
    delete payload.action
    // process
    const roomController = new RoomController()
    const result = action == 'room leave'
                ? await roomController.leaveRoom(action, payload)
                : action == 'room hard delete' 
                    ? await roomController.hardDelete(action, payload)
                    : {status: 404, message: 'request failed', data: []} as IResponse
    // return data to client
    return NextResponse.json(result, {status: result.status})
}