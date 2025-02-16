import { sha256 } from "../../../helper/helper";
import { IQueryInsert, IUser, IResponse } from "../../../helper/types";
import Controller from "../Controller";

export default class RegisterController extends Controller {
    
    async register(action: string, payload: Omit<IUser, 'photo'>) {
        let result: IResponse

        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // set payload for db query
        const queryObject: Omit<IQueryInsert, 'insertColumn'> = {
            table: 'users',
            function: 'mnp_register',
            function_args: {
                tmp_username: payload.username,
                tmp_password: sha256(payload.password),
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