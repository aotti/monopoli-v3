import { cookies } from "next/headers";
import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
    // redirect to home if user dont have refresh token
    const refreshToken = typeof cookies().get('refreshToken')?.value == 'string'
    if(!refreshToken) {
        // set query to delete all data
        return NextResponse.redirect(new URL("/?reset=true", req.url))
    }
    // redirect to room list if theres no search params (id) on game room
    if(req.nextUrl.pathname.match('game') && !req.nextUrl.searchParams.get('id')) {
        return NextResponse.redirect(new URL('/room', req.url))
    }
}

export const config: MiddlewareConfig = {
    matcher: ['/game']
}