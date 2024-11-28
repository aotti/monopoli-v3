"use server"

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { IResponse } from "../../../helper/types";
import LogoutController from "./LogoutController";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user logout'
    // process
    const logoutController = new LogoutController()
    const result = await logoutController.logout(action, req)
    // return data to client
    return NextResponse.json(result, {status: result.status})
}