import { qS, translateUI, moneyFormat, simpleDecrypt } from "../../../helper/helper";
import { IMiscContext, IGameContext, EventDataType } from "../../../helper/types";
import { playGameSounds } from "./game-tile-event-sounds";
import { useSpecialCard } from "./game-tile-event-special-card-logic";

// ========== # CURSED CITY EVENT ==========
// ========== # CURSED CITY EVENT ==========
export function stopByCursedCity(findPlayer: number, tileElement: HTMLElement, miscState: IMiscContext, gameState: IGameContext) {
    return new Promise(async (resolve: (value: EventDataType)=>void) => {
        const getCityInfo = tileElement.dataset.cityInfo
        const decCityInfo = simpleDecrypt(getCityInfo, miscState.simpleKey).split(',')
        const [cityName, cityProperty, cityPrice, cityOwner] = decCityInfo;
        // result message
        const notifTitle = qS('#result_notif_title')
        const notifMessage = qS('#result_notif_message')
        // check special card
        const [specialCard, specialEffect] = await useSpecialCard(
            {type: 'cursed', price: +cityPrice}, findPlayer, miscState, gameState
        ) as [string, number]
        // only play sound if get cursed
        if(!specialCard) playGameSounds('cursed', miscState)
        // notif message
        notifTitle.textContent = translateUI({lang: miscState.language, text: 'Cursed City'})
        notifMessage.textContent = translateUI({lang: miscState.language, text: 'The city curse you for xxx'})
                                .replace('xxx', moneyFormat(+cityPrice))
                                + (specialCard ? `\n"${specialCard}"` : '')
        // show notif 
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        // get all players 
        const otherPlayerNames = gameState.gamePlayerInfo.map(v => v.display_name).join(',')
        // return event data
        resolve({
            event: 'cursed',
            money: specialEffect || -cityPrice,
            takeMoney: specialEffect ? `${specialEffect};${otherPlayerNames}` : null,
            card: specialCard
        })
    })
}