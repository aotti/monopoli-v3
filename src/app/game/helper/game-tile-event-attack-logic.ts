import { FormEvent } from "react";
import { qS } from "../../../helper/helper";

export function pickCityToRaid(ev: FormEvent<HTMLFormElement>, setShowAttackConfirmation: any, attackCityData: string[]) {
    ev.preventDefault()
    // attack city data
    const [cityOwner, cityAmount, cityName, cityPrice] = attackCityData
    // show attack popup
    setShowAttackConfirmation(true)
    const attackConfirmationCity = qS('#attack_confirmation_city')
    attackConfirmationCity.textContent = cityName
}