import { NextRequest, NextResponse, userAgent } from "next/server";
import { IPlayer } from "../../../../helper/types";
import Controller from "../../Controller";
import PlayerController from "../PlayerController";

export async function GET(req: NextRequest) {
    // api action
    const action = 'user get ranking'
    // query
    const payload: Partial<IPlayer> = {}
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
    const result = await playerController.viewRanking(action, payload as IPlayer)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}