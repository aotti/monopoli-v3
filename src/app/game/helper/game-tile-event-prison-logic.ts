import { EventDataType, IGameContext, IMiscContext } from "../../../helper/types"
import { useSpecialCard } from "./game-tile-event-special-card-logic"

// ========== # PRISON EVENT ==========
// ========== # PRISON EVENT ==========
export function stopByPrison(findPlayer: number, miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        // check for anti prison special card
        const [specialCard, specialEffect] = await useSpecialCard({type: 'prison'}, findPlayer, miscState, gameState)
        // return event data
        return resolve({
            event: 'get_arrested',
            accumulate: specialEffect ? -1 : 0,
            money: 0,
            card: specialCard,
        })
    })
}