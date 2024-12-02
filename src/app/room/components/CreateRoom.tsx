import { ChangeEvent, useEffect, useState } from "react";
import { useMisc } from "../../../context/MiscContext";
import { applyTooltipEvent, moneyFormat, qS, questionMark, translateUI } from "../../../helper/helper";
import Link from "next/link";

export default function CreateRoom() {
    const miscState = useMisc()
    // form pages
    const [createRoomPage, setCreateRoomPage] = useState<1|2>(2)
    // tooltip
    const tooltip = {
        moneyStart: translateUI({lang: miscState.language, text: 'money that player have on start'}),
        moneyLose: translateUI({lang: miscState.language, text: 'player lose if the money less than this limit'}),
        curse: translateUI({lang: miscState.language, text: 'cursed tile price will go up/down around this %'}),
    }
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    return (
        <div id="create_room_modal" className={`${miscState.showModal == 'create room' ? 'block' : 'hidden'} 
            relative z-20 bg-darkblue-3 border-8bit-modal px-2
            ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'} w-80 lg:w-[30rem]`}>
            {/* modal head */}
            <div className="border-b-2 mb-2">
                <span> {translateUI({lang: miscState.language, text: 'Create Room'})} </span>
            </div>
            {/* modal body */}
            <form className="" onSubmit={ev => {
                ev.preventDefault()
                // hide the modal
                miscState.setShowModal(null)
                const link = qS('#gotoGame') as HTMLAnchorElement
                link.click()
            }}>
                {/* part 1 */}
                <div className={`${createRoomPage === 1 ? 'flex' : 'hidden'} flex-col gap-2 lg:gap-4 my-auto`}>
                    {/* set room name */}
                    <div className="flex justify-between">
                        <label htmlFor="name" className=""> {translateUI({lang: miscState.language, text: 'Name'})} </label>
                        <input type="text" className="w-36 lg:w-48 px-1" id="name" minLength={4} maxLength={12} placeholder="max 12 letters" />
                    </div>
                    {/* set password */}
                    <div className="flex justify-between">
                        <label htmlFor="password" className=""> Password </label>
                        <input type="text" className="w-36 lg:w-48 px-1" id="password" minLength={3} maxLength={8} placeholder="optional" />
                    </div>
                    {/* submit */}
                    <div className="flex justify-between mx-6">
                        <button type="button" className="text-red-300 p-1 active:opacity-75" onClick={() => { 
                            // set false to give zoom-out animate class
                            miscState.setAnimation(false); 
                            // timeout to wait the animation zoom-out
                            setTimeout(() => miscState.setShowModal(null), 200) 
                        }}> 
                            {translateUI({lang: miscState.language, text: 'Close'})} 
                        </button>
                        <button type="button" className="text-green-300 p-1 active:opacity-75" 
                        onClick={() => setCreateRoomPage(2)}> 
                            {translateUI({lang: miscState.language, text: 'Next'})} 
                        </button>
                    </div>
                </div>

                {/* part 2 */}
                <div className={`${createRoomPage === 2 ? 'flex' : 'hidden'} flex-col gap-2 lg:gap-4`}>
                    {/* select board */}
                    <div className="flex justify-between">
                        <label htmlFor="select_board" className=""> {translateUI({lang: miscState.language, text: 'Board'})} </label>
                        <select id="select_board" className="w-32 lg:w-44">
                            <option value="normal"> Normal </option>
                            <option value="2_way"> {translateUI({lang: miscState.language, text: '2 Way'})} </option>
                            <option value="delta"> Delta </option>
                        </select>
                    </div>
                    {/* dice */}
                    <div className="flex justify-between">
                        <label htmlFor="select_dice" className=""> {translateUI({lang: miscState.language, text: 'Dice'})} </label>
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
                        step={25000} min={50000} max={100000} defaultValue={75000} required 
                        onChange={ev => displaySelectedRange(ev)} />
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
                        step={25000} min={25000} max={75000} defaultValue={75000} required 
                        onChange={ev => displaySelectedRange(ev)} />
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
                        step={5} min={5} max={15} defaultValue={5} required 
                        onChange={ev => displaySelectedRange(ev)} />
                    </div>
                    {/* max player */}
                    <div className="flex justify-between">
                        <label htmlFor="select_max_player" className=""> {translateUI({lang: miscState.language, text: 'Max Player'})} </label>
                        <select id="select_max_player" className="w-32 lg:w-44">
                            <option value="1"> 1 </option>
                            <option value="2"> 2 </option>
                            <option value="3"> 3 </option>
                            <option value="4"> 4 </option>
                        </select>
                    </div>
                    {/* select mode */}
                    <div className="flex justify-between">
                        <label htmlFor="select_mode" className=""> Mode </label>
                        <select id="select_mode" className="w-32 lg:w-44">
                            <option value="survive"> survive </option>
                            <option value="5 laps"> 5 laps </option>
                            <option value="7 laps"> 7 laps </option>
                        </select>
                    </div>
                    {/* message */}
                    <div className="flex justify-between">
                        {/* error = text-red-300 | success = text-green-300 */}
                        <p id="result_message"></p>
                    </div>
                    {/* submit */}
                    <div className="flex justify-between mx-6">
                        <button type="button" className="text-red-300 p-1 active:opacity-75"
                        onClick={() => setCreateRoomPage(1)}> 
                            {translateUI({lang: miscState.language, text: 'Back'})} 
                        </button>
                        <button type="submit" id="create_room" className="text-green-300 p-1 active:opacity-75"> 
                            {translateUI({lang: miscState.language, text: 'Create'})} 
                        </button>
                        <Link id="gotoGame" href={'/game'} hidden={true}></Link>
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