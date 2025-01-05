import { NextRequest, NextResponse } from "next/server";
import LogoutController from "./LogoutController";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user logout'
    // process
    const logoutController = new LogoutController()
    const result = await logoutController.logout(action)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}