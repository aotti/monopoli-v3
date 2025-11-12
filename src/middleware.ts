import { cookies } from "next/headers";
import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
    const maintenanceStatus = process.env.MAINTENANCE_STATUS
    const url = req.nextUrl
    const {origin, pathname, searchParams} = url

    if(pathname.startsWith('/api/')) {
        if(!req.headers.get('referer')?.match(origin)) {
            // game log access with secret
            if(pathname.match(`/game/log`) && searchParams.get('secret') === process.env.GAME_LOG_SECRET)
                return NextResponse.next()
            // other api routes error
            return NextResponse.json({message: "not found"}, {status: 404})
        }
    }

    // prevent all routing if the game is under maintenance
    if(maintenanceStatus === 'true' && pathname.match(/room|game/)) {
        return NextResponse.redirect(new URL("/", req.url))
    }

    // redirect to room list if theres no search params (id) on game room
    if(req.method === 'GET' && pathname.match('game') && !searchParams.get('id')) {
        return NextResponse.redirect(new URL('/room', req.url))
    }
}

export const config: MiddlewareConfig = {
    // matcher: ['/room', '/game']
    matcher: ['/((?!_next|fonts|examples|svg|[\\w-]+\\.\\w+).*)']
}