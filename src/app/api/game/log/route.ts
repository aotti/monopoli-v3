import { NextRequest, NextResponse } from "next/server"
import Controller from "../../Controller"
import GameController from "../GameController"

export async function GET(req: NextRequest) {
    // api action
    const action = 'game get log'
    // query
    const payload: any = {
      room_id: req.nextUrl.searchParams.get('id')
    }
    // check authorization
    const controller = new Controller()
    const isAuth = controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // process
    const gameController = new GameController()
    const result = await gameController.getLogs(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}