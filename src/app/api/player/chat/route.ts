import { cookies } from "next/headers";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { IResponse } from "../../../../helper/types";
import PlayerController from "../PlayerController";
import Controller from "../../Controller";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user send chat'
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
    const playerController = new PlayerController()
    const result = await playerController.sendChat(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}