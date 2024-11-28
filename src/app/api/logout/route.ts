"use server"

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { IResponse } from "../../../helper/types";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user logout'
    console.log(action);
    
    // check refresh token
    const refreshToken = cookies().get('refreshToken')?.value
    // access & refresh token empty
    if(!refreshToken) 
        return NextResponse.json<IResponse>({
            status: 403,
            message: 'forbidden',
            data: []
        }, {status: 403})
    // refresh token exist
    // delete refresh token
    cookies().delete('refreshToken')
    // return data to client
    return NextResponse.json<IResponse>({
        status: 200,
        message: `${action} success`,
        data: []
    }, {status: 200})
}