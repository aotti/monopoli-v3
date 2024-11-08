import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"

export default function HelpSection() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className={`${gameState.gameSideButton == 'help' ? 'block' : 'hidden'}
        absolute top-[0vh] right-[calc(0rem+2.25rem)] lg:right-[calc(0rem+2.75rem)] 
        [writing-mode:horizontal-tb] p-1 overflow-y-scroll
        bg-darkblue-1 border-8bit-text w-[30vw] h-[calc(100%-1rem)]`}>
            <p className="text-xs lg:text-sm border-b-2 pb-1 mb-1">
                {translateUI({lang: miscState.language, text: 'help'})}
            </p>
            <ol className="text-left text-2xs lg:text-[10px]">
                {/* kartu dana umum */}
                <details className="my-2 cursor-pointer">
                    <summary className="text-[10px] lg:text-xs text-green-400"> {translateUI({lang: miscState.language, text: 'Community Card'})} </summary>
                        <li> [^25%] {translateUI({lang: miscState.language, text: 'Gift from the bank, you get 40.000'})} </li>
                        <li> [^25%] {translateUI({lang: miscState.language, text: 'Your birthday, get 15.000 from each player'})} </li>
                        <li> [^25%] {translateUI({lang: miscState.language, text: 'You get an inheritance of 65.000'})} </li>

                        <li> [25%] {translateUI({lang: miscState.language, text: 'Gilang the hacker hacks your bank account and loses 20.000'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'Fortune blocking card, when you pass the start, you only get 5.000'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'Your car is broken, pay 35.000 repair costs'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'Tax nerf card 35%'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'You get 20.000 times the number on the selected coin'})} </li>

                        <li> [15%] {translateUI({lang: miscState.language, text: 'Debt collectors come to your house, you pay 60.000 debt'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Pay the hospital 50.000'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'The kind Gilang gives you 5.000'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Select the city you want to go to'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Anti tax card'})} </li>

                        <li> [8%] {translateUI({lang: miscState.language, text: 'Monthly salary has been paid, you get 160.000'})} </li>
                        <li> [8%] {translateUI({lang: miscState.language, text: 'Pay electricity & water bills 100.000'})} </li>
                        <li> [8%] {translateUI({lang: miscState.language, text: 'Sell 1 owned city (random)'})} </li>
                        <li> [5%] {translateUI({lang: miscState.language, text: 'City upgrade card'})} </li>
                </details>
                {/* kartu kesempatan */}
                <details className="my-2 cursor-pointer">
                    <summary className="text-[10px] lg:text-xs text-green-400"> {translateUI({lang: miscState.language, text: 'Chance Card'})} </summary>
                        <li> [^25%] {translateUI({lang: miscState.language, text: 'You stumbled, take 1 step forward'})} </li>
                        <li> [^25%] {translateUI({lang: miscState.language, text: 'You find 50.000 on the road, take the money or take 2 steps forward'})} </li>
                        <li> [^25%] {translateUI({lang: miscState.language, text: 'You find 30.000 in your pocket'})} </li>

                        <li> [25%] {translateUI({lang: miscState.language, text: 'Home renovation, pay 30% of the total money'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'You chased by a monitor lizard, take 2 steps back'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'Go forward to the start or take a general fund card'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'Gaming dice card, get 10.000 multiplied by the rolled dice number'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'Upgrade 1 owned city (random)'})} </li>

                        <li> [15%] {translateUI({lang: miscState.language, text: "Head to someone else's city"})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Gilang drops his ichi ocha, you have to take 3 steps back to return it'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Try your luck, go to free parking or go to jail'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Free parking nerf card'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Earthquake, 1 building collapses #sadge'})} </li>

                        <li> [8%] {translateUI({lang: miscState.language, text: 'You are caught red-handed in corruption, go to jail & fined 90% of the total money'})} </li>
                        <li> [8%] {translateUI({lang: miscState.language, text: 'Anti jail card'})} </li>
                        <li> [8%] {translateUI({lang: miscState.language, text: 'You get a surprise money of 200.000'})} </li>
                        <li> [5%] {translateUI({lang: miscState.language, text: 'City upgrade card'})} </li>
                </details>
                {/* efek kartu */}
                <details className="my-2 cursor-pointer">
                    <summary className="text-[10px] lg:text-xs text-green-400"> {translateUI({lang: miscState.language, text: 'Card Effect'})} </summary>
                        <li className="text-red-400"> {translateUI({lang: miscState.language, text: 'Each card can only be used once'})} </li>
                        <li className="text-red-400"> {translateUI({lang: miscState.language, text: "Cannot have 2 same card, if you get 2x anti tax card it'll only count as 1"})} </li>
                        <li> {translateUI({lang: miscState.language, text: 'Anti Jail = when you step on jail tile, you can avoid imprisoned effect'})} </li>
                        <li> {translateUI({lang: miscState.language, text: "Anti Tax = avoid paying tax on stepping someone's city"})} </li>
                        <li> {translateUI({lang: miscState.language, text: 'Nerf Tax = pay tax 35% less'})} 😎 </li>
                        <li> {translateUI({lang: miscState.language, text: 'Gaming Dice = get money 10k * dice number'})} </li>
                        <li> {translateUI({lang: miscState.language, text: 'Nerf Gaming Dice = get money 5k * dice number'})} </li>
                        <li> {translateUI({lang: miscState.language, text: 'Sad Gaming Dice = loss money 5k * dice number'})} </li>
                        <li> {translateUI({lang: miscState.language, text: 'Nerf Parking = your tile selection on stepping free parking is 40% less'})} </li>
                        <li> {translateUI({lang: miscState.language, text: 'Fortune Blocking = when passing start line, only get 5k'})} </li>
                        <li> {translateUI({lang: miscState.language, text: 'City Upgrade = can upgrade your city without getting there, but random'})} </li>
                </details>
                {/* buff debuff */}
                <details className="my-2 cursor-pointer">
                    <summary className="text-[10px] lg:text-xs text-green-400"> {translateUI({lang: miscState.language, text: 'Buff/Debuff Area'})} </summary>
                        <li> {translateUI({lang: miscState.language, text: 'Normal Area (65% chance)'})}
                            <ul className="list-disc">
                                <li> [25%] {translateUI({lang: miscState.language, text: 'Take 1 step forward'})} </li>
                                <li> [15%] {translateUI({lang: miscState.language, text: 'Take 2 step forward'})} </li>
                                <li> [10%] {translateUI({lang: miscState.language, text: 'Get nerf gaming dice card'})} </li>
                                <li> [8%] {translateUI({lang: miscState.language, text: 'Get nerf parking card'})} </li>
                                <li> [7%] {translateUI({lang: miscState.language, text: 'Go to next Normal Area'})} </li>
                            </ul>
                        </li>
                        <li> {translateUI({lang: miscState.language, text: 'Buff Area (100% chance)'})}
                            <ul className="list-disc">
                                <li> [40%] {translateUI({lang: miscState.language, text: 'Get money 5k x laps'})} </li>
                                <li> [20%] {translateUI({lang: miscState.language, text: 'Get anti jail card'})} </li>
                                <li> [15%] {translateUI({lang: miscState.language, text: 'Get nerf gaming dice card'})} </li>
                                <li> [15%] {translateUI({lang: miscState.language, text: 'Get nerf tax card'})} </li>
                                <li> [10%] {translateUI({lang: miscState.language, text: 'Get city upgrade card'})} </li>
                            </ul>
                        </li>
                </details>
            </ol>
        </div>
    )
}