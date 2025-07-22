import { IQueryInsert, IUser, IResponse } from "../../../helper/types";
import Controller from "../Controller";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimitRegister = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(2, '8h'),
    prefix: '@upstash/ratelimit',
})

export default class RegisterController extends Controller {
    
    async register(action: string, payload: Omit<IUser, 'photo'> & {identifier: string}) {
        let result: IResponse

        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // check register rate limit
        const rateLimitID = payload.identifier
        const rateLimitResult = await rateLimitRegister.limit(rateLimitID);
        if(!rateLimitResult.success) {
            return this.respond(429, 'too many request', [])
        }
        // set payload for db query
        const queryObject: Omit<IQueryInsert, 'insertColumn'> = {
            table: 'users',
            function: 'mnp_register',
            function_args: {
                tmp_username: payload.username,
                tmp_password: payload.password,
                tmp_display_name: payload.display_name
            }
        }
        // run query
        const {data, error} = await this.dq.insert(queryObject as IQueryInsert)
        if(error) {
            result = this.respond(500, error.message, [])
        }
        else if(data) {
            result = this.respond(201, `${action} success`, data)
        }
        // return result
        return result
    }
}