import { cookies } from "next/headers";
import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
    // redirect to home if user dont have refresh token
    const refreshToken = cookies().get('refreshToken')?.value
    if(!refreshToken) {
        // set query to delete all data
        return NextResponse.redirect(new URL("/?reset=true", req.url))
    }
}

export const config: MiddlewareConfig = {
    matcher: ['/room', '/game']
}