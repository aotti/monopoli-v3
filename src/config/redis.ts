import { Redis } from "@upstash/redis";

export function redis() {
    const client = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
    return client
}