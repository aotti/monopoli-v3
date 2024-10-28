import { ChangeEvent } from "react";
import { useMisc } from "../../../context/MiscContext";
import { qS, translateUI } from "../../../helper/helper";
import Link from "next/link";

export default function CreateRoom() {
    const miscState = useMisc()

    return (
        <div id="create_room_modal" className={`${miscState.showModal == 'create room' ? 'block' : 'hidden'} 
            relative z-20 bg-darkblue-3 border-8bit-modal p-2 
            ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'} w-[calc(100vw-60vw)]`}>
            {/* modal head */}
            <div className="border-b-2 mb-4">
                <span> {translateUI({lang: miscState.language, text: 'Create Room'})} </span>
            </div>
            {/* modal body */}
            <div>
                <form className="flex flex-col gap-2 lg:gap-4" onSubmit={ev => {
                    ev.preventDefault()
                    // hide the modal
                    miscState.setShowModal(null)
                    const link = qS('#gotoGame') as HTMLAnchorElement
                    link.click()
                }}>
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
                        <label htmlFor="select_money_start" className="text-left">
                            <span> {translateUI({lang: miscState.language, text: 'Money Start'})} </span>
                            <span id="selected_money_start"></span>
                        </label>
                        <input type="range" className="w-32 lg:w-44 px-1" id="select_money_start" 
                        step={25000} min={50000} max={100000} defaultValue={75000} required 
                        onChange={ev => displaySelectedMoney(ev)} />
                    </div>
                    {/* money lose */}
                    <div className="flex justify-between">
                        <label htmlFor="select_money_lose" className="text-left">
                            <span> {translateUI({lang: miscState.language, text: 'Money Lose'})} </span>
                            <span id="selected_money_lose"></span>
                        </label>
                        <input type="range" className="w-32 lg:w-44 px-1" id="select_money_lose" 
                        step={25000} min={25000} max={75000} defaultValue={75000} required 
                        onChange={ev => displaySelectedMoney(ev)} />
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
                    {/* set password */}
                    <div className="flex justify-between">
                        <label htmlFor="password" className=""> Password </label>
                        <input type="text" className="w-32 lg:w-44 px-1" id="password" maxLength={8} placeholder="optional" />
                    </div>
                    {/* message */}
                    <div className="flex justify-between">
                        {/* error = text-red-300 | success = text-green-300 */}
                        <p id="result_message" className="mx-auto text-center"></p>
                    </div>
                    {/* submit */}
                    <div className="flex justify-between mx-6">
                        <button type="button" className="text-red-300 p-1" onClick={() => {
                            // set false to give zoom-out animate class
                            miscState.setAnimation(false); 
                            // timeout to wait the animation zoom-out
                            setTimeout(() => miscState.setShowModal(null), 200) 
                        }}> 
                            {translateUI({lang: miscState.language, text: 'Close'})} 
                        </button>
                        <button type="submit" className="text-green-300 p-1"> 
                            {translateUI({lang: miscState.language, text: 'Create'})} 
                        </button>
                        <Link id="gotoGame" href={'/game'} hidden={true}></Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

function displaySelectedMoney(ev: ChangeEvent<HTMLInputElement>) {
    const element = ev.currentTarget
    const elementId = element.id
    // check id
    if(elementId == 'select_money_start') {
        qS('#selected_money_start').textContent = `(${element.value})`
    }
    else if(elementId == 'select_money_lose') {
        qS('#selected_money_lose').textContent = `(-${element.value})`
    }
}