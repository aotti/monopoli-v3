import { NextRequest, NextResponse } from "next/server";
import PlayerController from "../PlayerController";
import { IResponse } from "../../../../helper/types";
import { cookies } from "next/headers";
import Controller from "../../Controller";

export async function PUT(req: NextRequest) {
    // api action
    const action = 'user avatar update'
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
    const playerController = new PlayerController()
    const result = await playerController.avatarUpload(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}