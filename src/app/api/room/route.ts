import { NextRequest, NextResponse } from "next/server";
import RoomController from "./RoomController";
import Controller from "../Controller";

export async function GET(req: NextRequest) {
    // api action
    const action = 'room get list'
    // check authorization
    const controller = new Controller()
    const isAuth = controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    const payload = { token: isAuth.data[0].accessToken }
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
    // get action
    const action = payload.action
    delete payload.action
    // process
    const roomController = new RoomController()
    const result = action == 'room join' 
                ? await roomController.joinRoom(action, payload)
                : await roomController.softDelete(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}

export async function DELETE(req: NextRequest) {
    // api action
    const action = 'room hard delete'
    // client payload
    const payload = await req.json()
    // check authorization
    const controller = new Controller()
    const isAuth = controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // process
    const roomController = new RoomController()
    const result = await roomController.hardDelete(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}