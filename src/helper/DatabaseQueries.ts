import { IQueryInsert, IQuerySelect, IQueryUpdate, PG_PromiseType } from "./types";
import { supabase } from "../config/database";

export class DatabaseQueries {
    private sb = supabase()
    private prefix = 'monopoli_'

    private async db_func<T=any>(queryObject: IQuerySelect | IQueryInsert | IQueryUpdate) {
        // order columns
        if(queryObject.order) {
            const [col, by] = queryObject.order
            const orderBy = by === 'asc' ? true : false
            // run function
            const {data, error} = queryObject.function_args
                                    // function with parameter
                                    ? await this.sb.rpc(queryObject.function, queryObject.function_args).order(col, {ascending: orderBy})
                                    // function without parameter
                                    : await this.sb.rpc(queryObject.function).order(col, {ascending: orderBy})
            return {data: data as T[], error: error}
        }
        // not order columns
        // run function
        const {data, error} = queryObject.function_args
                                // function with parameter
                                ? await this.sb.rpc(queryObject.function, queryObject.function_args)
                                // function without parameter
                                : await this.sb.rpc(queryObject.function)  
        return {data: data as T[], error: error}
    }

    select<T=any>(queryObject: IQuerySelect): PG_PromiseType<T> {
        // select data
        const selectAllDataFromDB = async () => {
            // default limit
            let [rangeMin, rangeMax]: [number, number] = [0, 50]
            // if there's limit property in query object
            if(queryObject.limit) {
                const [min, max] = queryObject.limit;
                // update rangeMin and rangeMax
                [rangeMin, rangeMax] = [min, max];
            }
            if(queryObject.function) {
                // run function
                const invokeFunction = await this.db_func<T>(queryObject)
                return invokeFunction
            }
            else if(queryObject.whereColumn) {
                // where condition
                const {data, error} = await this.sb.from(this.prefix + queryObject.table)
                                    .select(queryObject.selectColumn as string) // select columns
                                    .eq(queryObject.whereColumn as string, queryObject.whereValue) // where condition
                                    .range(rangeMin, rangeMax) // limit, how many data will be retrieved
                                    .order('id', {ascending: true}) // order data by..
                return {data: data as T[], error: error}
            }
            else {
                // run query 
                const {data, error} = await this.sb.from(this.prefix + queryObject.table)
                                    .select(queryObject.selectColumn as string) // select columns
                                    .range(rangeMin, rangeMax) // limit, how many data will be retrieved
                                    .order('id', {ascending: true}) // order data by..
                return {data: data as T[], error: error}
            }
        }
        return selectAllDataFromDB()
    }

    insert<T=any>(queryObject: IQueryInsert): PG_PromiseType<T> {
        // insert data 
        const insertDataToDB = async () => {
            if(queryObject.function) {
                // run function
                const invokeFunction = await this.db_func<T>(queryObject)
                return invokeFunction
            }
            else {
                // run query
                const {data, error} = await this.sb.from(this.prefix + queryObject.table)
                                    .insert(queryObject.insertColumn)
                                    .select(queryObject.selectColumn as string)
                return {data: data as T[], error: error}
            }
        }
        return insertDataToDB()
    }

    update<T=any>(queryObject: IQueryUpdate): PG_PromiseType<T> {
        // update data
        const updateDataToDB = async () => {
            if(queryObject.function) {
                // run function
                const invokeFunction = await this.db_func<T>(queryObject)
                return invokeFunction
            }
            else {
                // run query
                const {data, error} = await this.sb.from(this.prefix + queryObject.table)
                                    .update(queryObject.updateColumn)
                                    .eq(queryObject.whereColumn, queryObject.whereValue)
                                    .select(queryObject.selectColumn as string)
                return {data: data as T[], error: error}
            }
        }
        return updateDataToDB()
    }

    /**
     * 
     * @param type table name without prefix, ex: abc_words > words
     * @param columns choose columns by numbers, each type has different columns
     * @returns selected columns 
     * @description example: 
     * 
     * - table words = select 'id, category, word' = 123; select 'id, word' = 13;
     * 
     * list of column:
     * - users - id | username | password | created_at | updated_at | deleted_at
     * - players - id | user_id | display_name | game_played | worst_money_lost | avatar | updated_at | deleted_at
     * - rooms - id | creator_id | name | password | player_count | rules | status | created_at | updated_at | deleted_at
     * - games - id | room_id | player_id | character | pos | lap | money | card | city | prison | created_at | updated_at | deleted_at
     */
    columnSelector(type: 'users'|'players'|'rooms'|'games', columns: number) {
        // to save selected column 
        const selectedColumns = []
        // for users table
        if(type === 'users') {
            const pickerList: string[] = ['id', 'username', 'password', 'created_at', 'updated_at', 'deleted_at']
            selectedColumns.push(columnPicker(pickerList))
        }
        // for profiles table
        else if(type === 'players') {
            const pickerList: string[] = ['id', 'user_id', 'display_name', 'game_played', 'worst_money_lost', 'avatar', 'created_at', 'updated_at', 'deleted_at']
            selectedColumns.push(columnPicker(pickerList))
        }
        // for messages table
        else if(type === 'rooms') {
            const pickerList: string[] = ['id', 'creator_id(display_name)', 'name', 'password', 'player_count', 'rules', 'status', 'created_at', 'updated_at', 'deleted_at']
            selectedColumns.push(columnPicker(pickerList))
        }
        // for direct_chats table
        else if(type === 'games') {
            const pickerList: string[] = ['id', 'room_id', 'player_id(display_name)', 'character', 'pos', 'lap', 'money', 'card', 'city', 'prison', 'created_at', 'updated_at', 'deleted_at']
            selectedColumns.push(columnPicker(pickerList))
        }
        // return selected columns
        return selectedColumns.join(', ')

        // looping columns
        function columnPicker(pickerList: string[]) {
            // temp col container
            const colsPicked = []
            // convert number to string for looping to work
            const cols = columns.toString()
            for(let col of cols) {
                // push selected column to container
                colsPicked.push(pickerList[+col - 1])
            }
            return colsPicked
        }
    }
}