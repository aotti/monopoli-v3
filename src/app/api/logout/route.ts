import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { IResponse } from "../../../helper/types";
import { verifyAccessToken } from "../../../helper/helper";

export async function POST(req: NextRequest) {
    // api action
    const action = 'user logout'
    // check authorization
    const accessToken = req.headers.get('authorization')?.replace('Bearer ', '')
    if(!accessToken) 
        return NextResponse.json<IResponse>({
            status: 403,
            message: 'forbidden',
            data: []
        }, {status: 403})
    // verify access token
    const [error, verify] = await verifyAccessToken({action: 'verify-only', token: accessToken, secret: process.env.ACCESS_TOKEN_SECRET})
    if(error?.name == 'JWTExpired') {
        // check refresh token
        const refreshToken = cookies().get('refreshToken')?.value
        // access & refresh token empty
        if(!refreshToken) 
            return NextResponse.json<IResponse>({
                status: 403,
                message: 'forbidden',
                data: []
            }, {status: 403})
    }
    // access / refresh token exist
    // delete refresh token
    cookies().delete('refreshToken')
    // return data to client
    return NextResponse.json<IResponse>({
        status: 200,
        message: `${action} success`,
        data: []
    }, {status: 200})
}