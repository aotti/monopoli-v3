import { NextRequest, NextResponse, userAgent } from "next/server";
import Controller from "../Controller";
import GameController from "./GameController";
import { IResponse } from "../../../helper/types";
import RoomController from "../room/RoomController";

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
    // add user agent to payload
    payload.user_agent = userAgent(req).ua
    // process
    const gameController = new GameController()
    const result = await gameController.getPlayers(action, payload)
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
    // add user agent to payload
    payload.user_agent = userAgent(req).ua
    // get action
    const action = payload.action
    delete payload.action
    // process
    let result: IResponse = null
    switch(action) {
        case 'game ready player': result = await gameController.readyPlayer(action, payload); break
        case 'game start': result = await gameController.startGame(action, payload); break
        case 'game roll turn': result = await gameController.decideTurn(action, payload); break
        case 'game roll dice': result = await gameController.rollDice(action, payload); break
        case 'game attack city': result = await gameController.attackCity(action, payload); break
        case 'game fix player turns': result = await gameController.fixPlayerTurns(action, payload); break
        // error
        default: result = {status: 404, message: 'request failed', data: []}
    }
    // return data to client
    return NextResponse.json(result, {status: result.status})
}

export async function PUT(req: NextRequest) {
    const payload = await req.json()
    // check authorization
    const roomController = new RoomController()
    const gameController = new GameController()
    const isAuth = gameController.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // add user agent to payload
    payload.user_agent = userAgent(req).ua
    // get action
    const action = payload.action
    delete payload.action
    // process
    let result: IResponse = null
    switch(action) {
        case 'game turn end': result = await gameController.turnEnd(action, payload); break
        case 'game surrender': result = await gameController.surrender(action, payload); break
        case 'game over': result = await roomController.softDelete(action, payload); break
        case 'game sell city': result = await gameController.sellCity(action, payload); break
        // error
        default: result = {status: 404, message: 'request failed', data: []}
    }
    // return data to client
    return NextResponse.json(result, {status: result.status})
}