import { FormEvent } from "react";
import { fetcher, fetcherOptions, moneyFormat, qS, translateUI } from "../../../helper/helper";
import { IAttackCityList, IGameContext, IMiscContext, IResponse } from "../../../helper/types";

export function pickCityToRaid(ev: FormEvent<HTMLFormElement>, setShowAttackConfirmation: any, attackCityData: string[]) {
    ev.preventDefault()
    // attack city data
    const [cityName, cityPrice] = attackCityData
    // show attack popup
    setShowAttackConfirmation(true)
    const attackConfirmationCity = qS('#attack_confirmation_city')
    attackConfirmationCity.textContent = cityName
}

export async function declareAttackCity(ev: FormEvent<HTMLFormElement>, attackCityList: IAttackCityList[], setShowAttackConfirmation, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // get declared city
    const declaredCity = qS('#attack_confirmation_city').textContent
    // get city price for steal attack
    const [cityName, cityPrice] = attackCityList.map(v => v.cityList.map(city => {
        const findCity = city.indexOf(declaredCity)
        if(findCity !== -1) return city
        else return null
    })).flat(10).filter(i => i)[0].split(',')
    // submit button
    const submitButton = (ev.nativeEvent as any).submitter as HTMLInputElement
    // warning message
    const quakeWarning = translateUI({lang: miscState.language, text: 'Send earthquake to destined city and cause permanent damage that reduce city tax by 50%. Are you sure wanna attack?'})
    const meteorWarning = translateUI({lang: miscState.language, text: 'Send meteor to destined city and destroy the whole city (must have > 1 city). Are you sure wanna attack?'})
    const stealWarning = translateUI({lang: miscState.language, text: 'Threaten destined city with military force to sell the city for 30% price (ppp). Are you sure wanna attack?'})
    switch(submitButton.id) {
        // warning
        case 'attack_city_quake':
            if(!confirm(quakeWarning)) return
            break
        case 'attack_city_meteor': 
            if(!confirm(meteorWarning)) return
            break
        case 'attack_city_steal':
            // steal price = 20% normal price
            const stealPrice = Math.floor(+cityPrice * .3)
            if(!confirm(stealWarning.replace('ppp', moneyFormat(stealPrice)))) return
            break
    }
    // ### special card param = `${cityName}-attack ${type}`
    // input value container
    const inputValues = {
        action: 'game attack city',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        display_name: gameState.myPlayerInfo.display_name,
        targetCity: declaredCity,
        attackType: submitButton.id,
    }
    // close attack modal & player setting
    setShowAttackConfirmation(false)
    gameState.setGameSideButton(null)
    // set state to disable "back to room & surrender" buttons
    miscState.setDisableButtons('gameroom')
    // set notif
    miscState.setAnimation(true)
    gameState.setShowGameNotif('normal')
    // notif message
    notifTitle.textContent = 'Attack City'
    notifMessage.textContent = `attacking ${declaredCity} city..`
    // fetch
    const attackCityFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const attackCityResponse: IResponse = await (await fetcher('/game', attackCityFetchOptions)).json()
    // response
    switch(attackCityResponse.status) {
        case 200:
            // save access token
            if(attackCityResponse.data[0].token) {
                localStorage.setItem('accessToken', attackCityResponse.data[0].token)
                delete attackCityResponse.data[0].token
            }
            // enable gameroom buttons
            miscState.setDisableButtons(null)
            return
        default: 
            // enable gameroom buttons
            miscState.setDisableButtons(null)
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${attackCityResponse.status}`
            notifMessage.textContent = `${attackCityResponse.message}`
            return
    }
}

export function attackCity(attackData: string, miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // get city target & attack type
    const [targetCity, attackType] = attackData.split('-')
    // get city element
    const attackCityElement = qS(`[data-city-info^='${targetCity}']`) as HTMLElement
    // attack the city
    if(attackType.match('quake')) {

    }
    else if(attackType.match('meteor')) {

    }
    else if(attackType.match('steal')) {

    }
}