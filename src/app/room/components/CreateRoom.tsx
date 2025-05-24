import { ChangeEvent, useEffect, useState } from "react";
import { useMisc } from "../../../context/MiscContext";
import { applyTooltipEvent, moneyFormat, qS, questionMark, translateUI } from "../../../helper/helper";
import { useGame } from "../../../context/GameContext";
import SelectCharacter from "./SelectCharacter";
import { createRoom } from "../helper/functions";

export default function CreateRoom() {
    const miscState = useMisc()
    const gameState = useGame()
    // form pages
    const [createRoomPage, setCreateRoomPage] = useState<1|2|3>(1)
    // tooltip
    const tooltip = {
        mode: translateUI({lang: miscState.language, text: 'survive: until 1 player left;laps: 1st player get 5/7 laps, will end the game'}),
        moneyStart: translateUI({lang: miscState.language, text: 'money that player have on start'}),
        moneyLose: translateUI({lang: miscState.language, text: 'player lose if the money less than this limit'}),
        curse: translateUI({lang: miscState.language, text: 'cursed tile price will go up/down around this %'}),
    }
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    return (
        <div id="create_room_modal" className={`relative z-20 bg-darkblue-3 border-8bit-modal px-2 w-80 lg:w-[30rem]
        ${miscState.showModal == 'create room' ? 'block' : 'hidden'} 
        ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'}`}>
            {/* modal head */}
            <div className="border-b-2 mb-2">
                <span> {translateUI({lang: miscState.language, text: 'Create Room'})} </span>
            </div>
            {/* modal body, 
                novalidate to prevent native validation
                cuz create room have > 1 page it will be error */}
            <form onSubmit={ev => createRoom(ev, miscState, gameState, setCreateRoomPage)} noValidate>
                {/* part 1 */}
                <div className={`${createRoomPage === 1 ? 'flex' : 'hidden'} flex-col gap-2 lg:gap-4 my-auto`}>
                    {/* set room name */}
                    <div className="flex justify-between">
                        <label htmlFor="name"> {translateUI({lang: miscState.language, text: 'Name'})} </label>
                        <input type="text" className="w-36 lg:w-48 px-1" id="room_name" minLength={4} maxLength={12} placeholder={translateUI({lang: miscState.language, text: 'max 12 letters'})} />
                    </div>
                    {/* set password */}
                    <div className="flex justify-between">
                        <label htmlFor="room_password"> Password </label>
                        <input type="text" className="w-36 lg:w-48 px-1" id="room_password" minLength={3} maxLength={8} placeholder={translateUI({lang: miscState.language, text: 'optional'})} />
                    </div>
                    {/* select mode */}
                    <div className="flex justify-between">
                        <label htmlFor="select_mode" data-tooltip={tooltip.mode.replace(';', '\n')} className="relative flex flex-col text-left">
                            <span className={`${questionMark()}`}> Mode </span>
                        </label>
                        <select id="select_mode" className="w-32 lg:w-44">
                            <option value="survive"> {translateUI({lang: miscState.language, text: 'survive'})} </option>
                            <option value="5_laps"> {translateUI({lang: miscState.language, text: '5 laps'})} </option>
                            <option value="7_laps"> {translateUI({lang: miscState.language, text: '7 laps'})} </option>
                        </select>
                    </div>
                    {/* submit */}
                    <div className="flex justify-between mx-6">
                        <button type="button" className="text-red-300 p-1 active:opacity-75 hover:animate-jump" onClick={() => { 
                            // set false to give zoom-out animate class
                            miscState.setAnimation(false); 
                            // timeout to wait the animation zoom-out
                            setTimeout(() => miscState.setShowModal(null), 200) 
                        }}> 
                            {translateUI({lang: miscState.language, text: 'Close'})} 
                        </button>
                        <button type="button" className="text-green-300 p-1 active:opacity-75 hover:animate-jump" 
                        onClick={() => setCreateRoomPage(2)}> 
                            {translateUI({lang: miscState.language, text: 'Next'})} 
                        </button>
                    </div>
                </div>

                {/* part 2 */}
                <div className={`${createRoomPage === 2 ? 'flex' : 'hidden'} flex-col gap-2 lg:gap-4`}>
                    {/* select board */}
                    <div className="flex justify-between">
                        <label htmlFor="select_board"> {translateUI({lang: miscState.language, text: 'Board'})} </label>
                        <select id="select_board" className="w-32 lg:w-44">
                            <option value="normal"> {translateUI({lang: miscState.language, text: 'normal'})} </option>
                            <option value="twoway"> {translateUI({lang: miscState.language, text: '2 way'})} </option>
                        </select>
                    </div>
                    {/* dice */}
                    <div className="flex justify-between">
                        <label htmlFor="select_dice"> {translateUI({lang: miscState.language, text: 'Dice'})} </label>
                        <select id="select_dice" className="w-32 lg:w-44">
                            <option value="1"> 1 </option>
                            <option value="2"> 2 </option>
                        </select>
                    </div>
                    {/* money start */}
                    <div className="flex justify-between">
                        <label htmlFor="select_money_start" data-tooltip={tooltip.moneyStart} className="relative flex flex-col text-left">
                            <span className={`${questionMark()}`}> 
                                {translateUI({lang: miscState.language, text: 'Money Start'})} 
                            </span>
                            <p id="selected_money_start"></p>
                        </label>
                        <input type="range" className="w-32 lg:w-44 px-1" id="select_money_start" 
                        step={25000} min={50000} max={100000} defaultValue={75000} onChange={ev => displaySelectedRange(ev)} />
                    </div>
                    {/* money lose */}
                    <div className="flex justify-between">
                        <label htmlFor="select_money_lose" data-tooltip={tooltip.moneyLose} className="relative flex flex-col text-left">
                            <span className={`${questionMark()}`}> 
                                {translateUI({lang: miscState.language, text: 'Money Lose'})} 
                            </span>
                            <p id="selected_money_lose"></p>
                        </label>
                        <input type="range" className="w-32 lg:w-44 px-1" id="select_money_lose" 
                        step={25000} min={25000} max={75000} defaultValue={75000} onChange={ev => displaySelectedRange(ev)} />
                    </div>
                    {/* curse random */}
                    <div className="flex justify-between">
                        <label htmlFor="select_curse" data-tooltip={tooltip.curse} className="relative flex flex-col text-left">
                            <span className={`${questionMark()}`}> 
                                {translateUI({lang: miscState.language, text: 'Curse'})} 
                            </span>
                            <p id="selected_curse"></p>
                        </label>
                        <input type="range" className="w-32 lg:w-44 px-1" id="select_curse" 
                        step={5} min={5} max={15} defaultValue={5} onChange={ev => displaySelectedRange(ev)} />
                    </div>
                    {/* max player */}
                    <div className="flex justify-between">
                        <label htmlFor="select_max_player"> {translateUI({lang: miscState.language, text: 'Max Player'})} </label>
                        <select id="select_max_player" className="w-32 lg:w-44">
                            <option value="2"> 2 </option>
                            <option value="3"> 3 </option>
                            <option value="4"> 4 </option>
                        </select>
                    </div>
                    {/* submit */}
                    <div className="flex justify-between mx-6">
                        <button type="button" className="text-red-300 p-1 active:opacity-75 hover:animate-jump"
                        onClick={() => setCreateRoomPage(1)}> 
                            {translateUI({lang: miscState.language, text: 'Back'})} 
                        </button>
                        <button type="button" className="text-green-300 p-1 active:opacity-75 hover:animate-jump" 
                        onClick={() => setCreateRoomPage(3)}> 
                            {translateUI({lang: miscState.language, text: 'Next'})} 
                        </button>
                    </div>
                </div>
                
                {/* part 3 */}
                <div className={`${createRoomPage === 3 ? 'flex' : 'hidden'} flex-col gap-2 lg:gap-4`}>
                    {/* select character */}
                    <SelectCharacter disabledCharacters={[]} />
                    {/* message */}
                    <div className="flex justify-between">
                        {/* error = text-red-300 | success = text-green-300 */}
                        <p id="result_message"></p>
                    </div>
                    {/* submit */}
                    <div className="flex justify-between mx-6">
                        <button type="button" className="text-red-300 p-1 active:opacity-75 hover:animate-jump"
                        onClick={() => setCreateRoomPage(2)}> 
                            {translateUI({lang: miscState.language, text: 'Back'})} 
                        </button>
                        <button type="submit" id="create_room" className="text-green-300 p-1 active:opacity-75 hover:animate-jump"> 
                            {translateUI({lang: miscState.language, text: 'Create'})} 
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

function displaySelectedRange(ev: ChangeEvent<HTMLInputElement>) {
    const element = ev.currentTarget
    const elementId = element.id
    // check id
    if(elementId == 'select_money_start') {
        qS('#selected_money_start').textContent = `(${moneyFormat(+element.value)})`
    }
    else if(elementId == 'select_money_lose') {
        qS('#selected_money_lose').textContent = `(-${moneyFormat(+element.value)})`
    }
    else if(elementId == 'select_curse') {
        qS('#selected_curse').textContent = +element.value > 5 ? `(5~${element.value}%)` : `(${element.value}%)`
    }
}