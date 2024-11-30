import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { IResponse } from "../../../../helper/types";
import PlayerController from "../PlayerController";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user send chat'
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
    const playerController = new PlayerController()
    const result = await playerController.sendChat(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}