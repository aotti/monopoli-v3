import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { IResponse } from "../../../helper/types";
import RoomController from "./RoomController";

export async function GET(req: NextRequest) {
    // api action
    const action = 'room get list'
    // check authorization
    const accessToken = req.headers.get('authorization')?.replace('Bearer ', '')
    if(!accessToken) {
        // check refresh token
        const refreshToken = cookies().get('refreshToken')?.value
        // access & refresh token empty
        if(!refreshToken) 
            return NextResponse.json<IResponse>({
                status: 403,
                message: 'forbidden',
                data: []
            }, {status: 403})
    }
    // token exist, add to payload
    const payload = { token: accessToken }
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
    const accessToken = req.headers.get('authorization')?.replace('Bearer ', '')
    if(!accessToken) {
        // check refresh token
        const refreshToken = cookies().get('refreshToken')?.value
        // access & refresh token empty
        if(!refreshToken) 
            return NextResponse.json<IResponse>({
                status: 403,
                message: 'forbidden',
                data: []
            }, {status: 403})
    }
    // token exist, add to payload
    payload.token = accessToken
    // process
    const roomController = new RoomController()
    const result = await roomController.create(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}