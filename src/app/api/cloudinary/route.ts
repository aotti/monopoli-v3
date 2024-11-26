import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
    // create api action
    const action = 'cloudinary signature endpoint'
    console.log(action);
    
    const { paramsToSign } = await req.json()
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET)
    return NextResponse.json({ signature })
}