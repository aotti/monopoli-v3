import { NextRequest, NextResponse, userAgent } from "next/server";
import { IPlayer } from "../../../helper/types";
import PlayerController from "./PlayerController";
import Controller from "../Controller";

export async function GET(req: NextRequest) {
    // api action
    const action = 'user get stats'
    // query
    const payload: Partial<IPlayer> = {
        display_name: req.nextUrl.searchParams.get('display_name')
    }
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
    const result = await playerController.viewPlayer(action, payload as IPlayer)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}