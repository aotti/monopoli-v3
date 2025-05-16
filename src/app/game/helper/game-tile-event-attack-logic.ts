import { FormEvent } from "react";
import { fetcher, fetcherOptions, moneyFormat, qS, translateUI } from "../../../helper/helper";
import { IAttackAnimationData, IAttackCityList, IGameContext, IMiscContext, IResponse } from "../../../helper/types";
import { updateCityList } from "./game-tile-event-city-logic";
import { updateSpecialCardList } from "./game-tile-event-special-card-logic";

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
    // find attacker
    const findAttacker = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(gameState.myPlayerInfo.display_name)
    const attackerData = gameState.gamePlayerInfo[findAttacker]
    // get declared city
    const targetCity = qS('#attack_confirmation_city').textContent
    // get city price for steal attack
    const [targetCityOwner, targetCurrentCity, targetCityName, targetCityProperty, targetCityPrice] = attackCityList.map(v => v.cityList.map(city => {
        const findCity = city.indexOf(targetCity)
        if(findCity !== -1) {
            const [cityName, cityPrice] = city.split(',')
            // get city property list
            const getCityProperty = v.currentCity.split(';').map(v => 
                // split city from properties
                v.match(cityName) ? v.split('*')[1] : null
            // split all properties
            ).filter(i=>i)[0].split(',')
            // get city last property
            const cityLastProperty = getCityProperty[getCityProperty.length-1]
            // return data
            return [v.cityOwner, v.currentCity, cityName, cityLastProperty, cityPrice]
        }
        else return null
    })).flat(10).filter(i => i)
    // submit button
    const submitButton = (ev.nativeEvent as any).submitter as HTMLInputElement
    // input value container
    const inputValues = {
        action: 'game attack city',
        channel: `monopoli-gameroom-${gameState.gameRoomId}`,
        attacker_name: gameState.myPlayerInfo.display_name,
        attacker_city: null,
        target_city_owner: targetCityOwner, // used for db
        target_city_left: null,
        target_city_property: targetCityProperty,
        target_city: targetCityName,
        attack_type: submitButton.id,
        event_money: '0',
        special_card: 'used-attack city',
        card: updateSpecialCardList(['used-attack city'], attackerData.card)
    }
    // warning message
    const quakeWarning = translateUI({lang: miscState.language, text: 'Send earthquake to destined city and cause permanent damage that reduce city tax by 50%. Are you sure wanna attack?'})
    const meteorWarning = translateUI({lang: miscState.language, text: 'Send meteor to destined city and destroy the whole city (enemy must have > 2 city). Are you sure wanna attack?'})
    const stealWarning = translateUI({lang: miscState.language, text: 'Threaten destined city with military force to sell the city for 30% price (ppp, you must have < 2 cities). Are you sure wanna attack?'})
    
    // confirmation & attack logic
    if(submitButton.id.match('quake')) {
        if(!confirm(quakeWarning)) return
    }
    else if(submitButton.id.match('meteor')) {
        if(!confirm(meteorWarning)) return
        // remove target city from owner with meteor
        const targetCityLeft = updateCityList({action: 'sell', currentCity: targetCurrentCity, cityName: targetCityName})
        inputValues.target_city_left = targetCityLeft
    }
    else if(submitButton.id.match('steal')) {
        // steal price = 20% normal price
        const stealPrice = Math.floor(+targetCityPrice * .3)
        inputValues.event_money = stealPrice.toString()
        if(!confirm(stealWarning.replace('ppp', moneyFormat(stealPrice)))) return
        // move ownership from target to the attacker
        // remove city from target
        const targetCityLeft = updateCityList({action: 'sell', currentCity: targetCurrentCity, cityName: targetCityName})
        inputValues.target_city_left = targetCityLeft
        // get attacker city data
        const attackerCurrentCity = attackerData.city
        // add the city to attacker
        const attackerCity = updateCityList({action: 'buy', currentCity: attackerCurrentCity, cityName: targetCityName, cityProperty: '1house'})
        inputValues.attacker_city = attackerCity
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
    notifMessage.textContent = `attacking ${targetCityName} city..`
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

export function attackCityAnimation(attackAnimationData: IAttackAnimationData) {
    const {attackTimer, attackType, targetCity, targetCityProperty} = attackAnimationData
    // get attacked city property
    const cityProperty = targetCityProperty == '2house1hotel' ? 'hotel' : 'house'
    // attack animation
    if(attackType == 'quake') {
        // get video & audio elements
        const videoCityQuake = qS(`#video_city_quake_${cityProperty}_${targetCity}`) as HTMLVideoElement
        const soundCityQuake = qS('#sound_city_quake') as HTMLAudioElement
        // show video
        videoCityQuake.classList.remove('hidden')
        // play video & audio
        videoCityQuake.play()
        soundCityQuake.play()
        // hide quake video
        setTimeout(() => videoCityQuake.classList.add('hidden'), attackTimer)
    }
    else if(attackType == 'meteor') {
        // get video & audio elements
        const videoCityMeteor = qS(`#video_city_meteor_${cityProperty}_${targetCity}`) as HTMLVideoElement
        const soundCityMeteor = qS('#sound_city_meteor') as HTMLAudioElement
        // display video
        videoCityMeteor.classList.remove('hidden')
        // play video & audio
        videoCityMeteor.play()
        soundCityMeteor.play()
        // hide broken video
        setTimeout(() => videoCityMeteor.classList.add('hidden'), attackTimer)
    }
}