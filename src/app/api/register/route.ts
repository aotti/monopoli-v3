import { NextRequest, NextResponse } from "next/server";
import RegisterController from "./RegisterController";
import Controller from "../Controller";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user register'
    // client payload
    const payload = await req.json()
    const controller = new Controller()
    // check header x-identifier
    const checkXID = controller.checkXIdentifier(req)
    if(checkXID.status !== 200) 
        return NextResponse.json(checkXID, {status: checkXID.status})
    // add identifier
    payload.identifier = checkXID.data
    // process
    const registerController = new RegisterController()
    const result = await registerController.register(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}