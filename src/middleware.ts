import { cookies } from "next/headers";
import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
    // prevent all routing if the game is under maintenance
    const maintenanceStatus = process.env.MAINTENANCE_STATUS
    if(maintenanceStatus === 'true' && req.nextUrl.pathname.match(/room|game/)) {
        // go to home
        return NextResponse.redirect(new URL("/", req.url))
    }

    // redirect to room list if theres no search params (id) on game room
    if(req.nextUrl.pathname.match('game') && !req.nextUrl.searchParams.get('id')) {
        return NextResponse.redirect(new URL('/room', req.url))
    }
}

export const config: MiddlewareConfig = {
    matcher: ['/room', '/game']
}