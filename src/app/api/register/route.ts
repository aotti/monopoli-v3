import { NextRequest, NextResponse } from "next/server";
import RegisterController from "./RegisterController";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user register'
    // client payload
    const payload = await req.json()
    // process
    const registerController = new RegisterController()
    const result = await registerController.register(action, payload)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}