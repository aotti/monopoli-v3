import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useMisc } from "../../../context/MiscContext";
import { applyTooltipEvent, errorCreateRoom, fetcher, fetcherOptions, moneyFormat, qS, questionMark, setInputValue, translateUI } from "../../../helper/helper";
import Link from "next/link";
import { ICreateRoom, IGameContext, IMiscContext, IResponse } from "../../../helper/types";
import { useGame } from "../../../context/GameContext";
import SelectCharacter from "./SelectCharacter";

export default function CreateRoom() {
    const miscState = useMisc()
    const gameState = useGame()
    // form pages
    const [createRoomPage, setCreateRoomPage] = useState<1|2|3>(1)
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
        <div id="create_room_modal" className={`relative z-20 bg-darkblue-3 border-8bit-modal px-2 w-80 lg:w-[30rem]
        ${miscState.showModal == 'create room' ? 'block' : 'hidden'} 
        ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'}`}>
            {/* modal head */}
            <div className="border-b-2 mb-2">
                <span> {translateUI({lang: miscState.language, text: 'Create Room'})} </span>
            </div>
            {/* modal body */}
            <form onSubmit={ev => createRoom(ev, miscState, gameState, setCreateRoomPage)} noValidate>
                {/* part 1 */}
                <div className={`${createRoomPage === 1 ? 'flex' : 'hidden'} flex-col gap-2 lg:gap-4 my-auto`}>
                    {/* set room name */}
                    <div className="flex justify-between">
                        <label htmlFor="name"> {translateUI({lang: miscState.language, text: 'Name'})} </label>
                        <input type="text" className="w-36 lg:w-48 px-1" id="room_name" minLength={4} maxLength={12} placeholder="max 12 letters" />
                    </div>
                    {/* set password */}
                    <div className="flex justify-between">
                        <label htmlFor="room_password"> Password </label>
                        <input type="text" className="w-36 lg:w-48 px-1" id="room_password" minLength={3} maxLength={8} placeholder="optional" />
                    </div>
                    {/* select mode */}
                    <div className="flex justify-between">
                        <label htmlFor="select_mode"> Mode </label>
                        <select id="select_mode" className="w-32 lg:w-44">
                            <option value="survive"> survive </option>
                            <option value="5_laps"> 5 laps </option>
                            <option value="7_laps"> 7 laps </option>
                        </select>
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
                        <label htmlFor="select_board"> {translateUI({lang: miscState.language, text: 'Board'})} </label>
                        <select id="select_board" className="w-32 lg:w-44">
                            <option value="normal"> normal </option>
                            <option value="2_way" disabled> {translateUI({lang: miscState.language, text: '2 way'})} </option>
                            <option value="delta" disabled> delta </option>
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
                        <button type="button" className="text-red-300 p-1 active:opacity-75"
                        onClick={() => setCreateRoomPage(1)}> 
                            {translateUI({lang: miscState.language, text: 'Back'})} 
                        </button>
                        <button type="button" className="text-green-300 p-1 active:opacity-75" 
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
                        <button type="button" className="text-red-300 p-1 active:opacity-75"
                        onClick={() => setCreateRoomPage(2)}> 
                            {translateUI({lang: miscState.language, text: 'Back'})} 
                        </button>
                        <button type="submit" id="create_room" className="text-green-300 p-1 active:opacity-75"> 
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

async function createRoom(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext, setCreateRoomPage) {
    ev.preventDefault()
    // result message
    const resultMessage = qS('#result_message')
    resultMessage.className = 'mx-auto text-center text-2xs lg:text-[12px]'
    resultMessage.textContent = ''
    // submit button
    const createButton = qS('#create_room') as HTMLInputElement
    // input value container
    const inputValues: ICreateRoom['input'] = {
        creator: gameState.myPlayerInfo.display_name,
        room_name: null,
        room_password: null,
        select_mode: null,
        select_board: null,
        select_dice: null,
        select_money_start: null,
        select_money_lose: null,
        select_curse: null,
        select_max_player: null,
        select_character: null
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName.match(/INPUT|SELECT/) && input.type != 'radio') {
            // filter inputs
            if(setInputValue('room_name', input)) {
                // check room list 
                if(gameState.roomList.length > 0) {
                    const roomName = input.value.trim().toLowerCase()
                    const isRoomNameExist = gameState.roomList.map(v => v.room_name).indexOf(roomName)
                    // room name exist
                    if(isRoomNameExist !== -1) {
                        resultMessage.classList.add('text-red-300')
                        resultMessage.textContent = translateUI({lang: miscState.language, text: 'name: room name already exist'})
                        return
                    }
                }
                inputValues.room_name = input.value.trim().toLowerCase()
            }
            else if(setInputValue('room_password', input)) inputValues.room_password = input.value == '' ? null : input.value.trim()
            else if(setInputValue('select_mode', input)) inputValues.select_mode = input.value.trim().toLowerCase()
            else if(setInputValue('select_board', input)) inputValues.select_board = input.value.trim().toLowerCase()
            else if(setInputValue('select_dice', input)) inputValues.select_dice = `${input.value}`
            else if(setInputValue('select_money_start', input)) inputValues.select_money_start = `${input.value}`
            else if(setInputValue('select_money_lose', input)) inputValues.select_money_lose = `${input.value}`
            else if(setInputValue('select_curse', input)) inputValues.select_curse = `${input.value}`
            else if(setInputValue('select_max_player', input)) inputValues.select_max_player = `${input.value}`
            // dont lowercase link
            else if(setInputValue('select_character', input)) inputValues.select_character = input.value.trim()
            // error
            else {
                resultMessage.classList.add('text-red-300')
                resultMessage.textContent = errorCreateRoom(input.id, miscState.language)
                return
            }
        }
    }
    // submit button loading
    const tempButtonText = createButton.textContent
    createButton.textContent = 'Loading'
    createButton.disabled = true
    // fetch
    const createRoomFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
    const createRoomResponse: IResponse = await (await fetcher('/room', createRoomFetchOptions)).json()
    // response
    switch(createRoomResponse.status) {
        case 200: 
            // save access token
            if(createRoomResponse.data[0].token) {
                localStorage.setItem('accessToken', createRoomResponse.data[0].token)
                delete createRoomResponse.data[0].token
            }
            // set create room page
            setCreateRoomPage(1)
            // set my current game
            gameState.setMyCurrentGame(createRoomResponse.data[0].currentGame)
            // hide the modal & tutorial
            miscState.setShowModal(null)
            miscState.setShowTutorial(null)
            // submit button normal
            createButton.textContent = tempButtonText
            createButton.removeAttribute('disabled')
            return
        default: 
            // submit button normal
            createButton.textContent = tempButtonText
            createButton.removeAttribute('disabled')
            // special for room name error
            if(typeof createRoomResponse.message == 'string' && createRoomResponse.message.match('name:')) {
                resultMessage.classList.add('text-red-300')
                resultMessage.textContent = translateUI({lang: miscState.language, text: createRoomResponse.message as any})
                return
            }
            // result message
            const translateError = translateUI({lang: miscState.language, text: createRoomResponse.message as any})
            resultMessage.classList.add('text-red-300')
            resultMessage.textContent = `❌ ${createRoomResponse.status}: ${translateError || createRoomResponse.message}`
            return
    }
}