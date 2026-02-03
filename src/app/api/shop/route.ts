import { NextRequest, NextResponse, userAgent } from "next/server";
import Controller from "../Controller";
import ShopController from "./ShopController";

export async function POST(req: NextRequest) {
    // api action
    const action = 'shop buy'
    // client payload
    const payload = await req.json()
    const controller = new Controller()
    // check header x-identifier
    const checkXID = controller.checkXIdentifier(req)
    if(checkXID.status !== 200) 
        return NextResponse.json(checkXID, {status: checkXID.status})
    // check authorization
    const isAuth = await controller.checkAuthorization(req)
    // token empty
    if(isAuth.status !== 200) return NextResponse.json(isAuth, {status: isAuth.status})
    // token exist, add to payload
    payload.token = isAuth.data[0].accessToken
    // add user agent
    payload.user_agent = `${userAgent(req).ua}_${checkXID.data}`
    // process
    const shopController = new ShopController()
    const result = await shopController.buyItem(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}