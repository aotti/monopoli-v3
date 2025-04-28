import { qS, translateUI, moneyFormat } from "../../../helper/helper";
import { IMiscContext, IGameContext, EventDataType } from "../../../helper/types";
import { useSpecialCard } from "./game-tile-event-special-card-logic";

// ========== # CURSED CITY EVENT ==========
// ========== # CURSED CITY EVENT ==========
export function stopByCursedCity(findPlayer: number, tileElement: HTMLElement, miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        const getCityInfo = tileElement.dataset.cityInfo.split(',')
        const [cityName, cityProperty, cityPrice, cityOwner] = getCityInfo as string[];
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        const notifTimer = qS('#result_notif_timer')
        // check special card
        const [specialCard, specialEffect] = await useSpecialCard(
            {type: 'cursed', price: +cityPrice}, findPlayer, miscState, gameState
        ) as [string, number]
        // notif message
        notifTitle.textContent = translateUI({lang: miscState.language, text: 'Cursed City'})
        notifMessage.textContent = translateUI({lang: miscState.language, text: 'The city curse you for xxx'})
                                .replace('xxx', moneyFormat(+cityPrice))
        notifTimer.textContent = specialCard ? `"${specialCard}"` : ''
        // show notif 
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        // get all players 
        const otherPlayerNames = gameState.gamePlayerInfo.map(v => v.display_name).join(',')
        // return event data
        resolve({
            event: 'cursed',
            money: specialEffect || -cityPrice,
            takeMoney: specialEffect ? `${specialEffect};${otherPlayerNames}` : null
        })
    })
}