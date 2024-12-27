import { NextRequest, NextResponse } from "next/server";
import Controller from "../Controller";
import GameController from "./GameController";
import { IResponse } from "../../../helper/types";

export async function GET(req: NextRequest) {
    // api action
    const action = 'game get player'
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
    const result = await gameController.getPlayers(action, payload as any)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}

export async function POST(req: NextRequest) {
    const payload = await req.json()
    // check authorization
    const gameController = new GameController()
    const isAuth = gameController.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // get action
    const action = payload.action
    delete payload.action
    // process
    let result: IResponse = null
    switch(action) {
        case 'game ready player': 
            result = await gameController.readyPlayer(action, payload)
            break
        case 'game start': 
            result = await gameController.startGame(action, payload)
            break
        case 'game roll turn': 
            result = await gameController.decideTurn(action, payload)
            break
        case 'game roll dice': 
            result = await gameController.rollDice(action, payload)
            break
        default: 
            result = {status: 404, message: 'request failed', data: []} as IResponse
    }
    // return data to client
    return NextResponse.json(result, {status: result.status})
}

export async function  PUT(req: NextRequest) {
    const payload = await req.json()
    // check authorization
    const gameController = new GameController()
    const isAuth = gameController.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // get action
    const action = payload.action
    delete payload.action
    // process
    const result = await gameController.turnEnd(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}