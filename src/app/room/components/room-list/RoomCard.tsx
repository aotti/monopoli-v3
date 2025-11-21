import { useEffect, useState } from "react"
import { useMisc } from "../../../../context/MiscContext"
import { applyTooltipEvent, translateUI } from "../../../../helper/helper"
import { ICreateRoom } from "../../../../helper/types"
import { useGame } from "../../../../context/GameContext"
import Link from "next/link"
import SelectCharacter from "./SelectCharacter"
import { joinPromptInputs, manageRoomCardForm } from "../../helper/functions"

export default function RoomCard({ roomData }: {roomData: ICreateRoom['list']}) {
    const miscState = useMisc()
    const gameState = useGame()
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    const roomId = roomData.room_id
    const roomConfirmPassword = roomData.room_password || ''
    const roomCreator = roomData.creator || ''
    // check if room have password
    const isRoomLocked = roomConfirmPassword ? `🔒` : ''
    // modify curse text
    const getCurse = roomData.rules.match(/curse: \d{1,2}/)[0].split(': ')[1]
    const setCurseRange = +getCurse > 5 ? `5~${getCurse}%` : `${getCurse}%`
    const roomRules = roomData.rules
    // split per rules
    const rule = {
        board: roomRules.match(/board: \w+/)[0].split(' ')[1],
        dice: roomRules.match(/dice: \d+/)[0].split(' ')[1],
        start: roomRules.match(/start: \d+/)[0].split(' ')[1],
        lose: roomRules.match(/lose: -\d+/)[0].split(' ')[1],
        mode: roomRules.match(/mode: \w+/)[0].split(' ')[1],
        curse: roomRules.match(/curse: \d{1,2}/)[0].split(' ')[1],
    }
    const modifiedRules = roomRules.replace(/board: (normal|twoway)/, 'board: bbb').replace(/dice: \d+/, 'dice: ddd')
                                   .replace(/start: \d+/, 'start: sss').replace(/lose: -\d+/, 'lose: lll')
                                   .replace(/mode: \w+|\d_\w+/, 'mode: mmm').replace(/curse: \d{1,2}/, 'curse: ccc')
    const translateRules = translateUI({lang: miscState.language, text: modifiedRules as any})
                        .replace('bbb', rule.board).replace('ddd', rule.dice)
                        .replace('sss', rule.start).replace('lll', rule.lose)
                        .replace('mmm', translateUI({lang: miscState.language, text: rule.mode as any}))
                        .replace('ccc', setCurseRange)
    // room status
    const roomStatusColor = roomData.status == 'prepare' ? 'bg-green-500/30' : 'bg-orange-500/30'

    // player input password
    const [showInputPassword, setShowInputPassword] = useState(false)

    return (
        <div className={`relative w-[calc(100%-52.5%)] h-56 lg:h-60 border-2 ${roomStatusColor} animate-fade-down animate-once`}>
            <form onSubmit={ev => manageRoomCardForm(ev, roomId, miscState, gameState)}>
                {/* room id */}
                <input type="hidden" id="room_id" value={roomId} />
                <input type="hidden" id={`room_password_${roomId}`} />
                <input type="hidden" id={`select_character_${roomId}`} />
                {/* room name */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Name'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="room_name" className="bg-transparent text-white w-3/5 border-b border-b-white" 
                    value={roomData.room_name || ''} readOnly />
                </div>
                {/* rules */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Rules'})} </span>
                        <span> : </span>
                    </label>
                    <div className="w-3/5 border-b border-b-white">
                        {/* hover rules */}
                        <p data-tooltip={translateRules.replaceAll(';', '\n')} className="relative w-full text-center bg-transparent" > 
                            ??? 
                        </p>
                        {/* input */}
                        <input type="hidden" id="rules" value={roomData.rules || ''} readOnly />
                    </div>
                </div>
                {/* player count */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Count'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="player_count" className="bg-transparent text-white w-3/5 border-b border-b-white" value={`${roomData?.player_count} ${translateUI({lang: miscState.language, text: 'player(s)'})}`} readOnly />
                </div>
                {/* max player */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Max'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="player_max" className="bg-transparent text-white w-3/5 border-b border-b-white" value={`${roomData.player_max} ${translateUI({lang: miscState.language, text: 'player(s)'})}`} readOnly />
                </div>
                {/* creator */}
                <div className="flex justify-between p-2">
                    <label className="flex justify-between grow">
                        <span> {translateUI({lang: miscState.language, text: 'Creator'})} </span>
                        <span> : </span>
                    </label>
                    <input type="text" id="creator" className="bg-transparent text-white w-3/5 border-b border-b-white" 
                    value={roomCreator} readOnly />
                </div>
                <div className={` ${gameState.guestMode ? 'hidden' : 'flex'} text-right p-2 lg:mt-2`}>
                    {/* join button */}
                    <JoinRoomButton isRoomLocked={isRoomLocked} roomId={roomId} setShowInputPassword={setShowInputPassword} />
                    {/* spectate button */}
                    <SpectateRoomButton roomId={roomId} roomCreator={roomCreator} />
                    {/* delete button */}
                    <DeleteRoomButton roomId={roomId} roomCreator={roomCreator} />
                    <Link id={`gotoGame${roomId}`} href={{ pathname: '/game', query:{id: roomId} }} hidden={true}></Link>
                </div>
            </form>
            {/* result message */}
            <div className={`${gameState.roomError == `${roomId}` ? 'block' : 'hidden'} absolute top-[15vh] lg:top-[10vh] left-[5vw] 
            w-[20vw] lg:p-1 text-center bg-darkblue-1 border-8bit-text`}>
                <p id={`result_room_${roomId}`}></p>
            </div>
            <JoinRoomPrompt roomId={roomId} showInputPassword={showInputPassword} setShowInputPassword={setShowInputPassword} />
        </div>
    )
}

function JoinRoomButton(
    {isRoomLocked, roomId, setShowInputPassword}: 
    {isRoomLocked: string, roomId: number, setShowInputPassword}
) {
    const miscState = useMisc()
    const gameState = useGame()
    // set lock icon
    const lockIcon = isRoomLocked ? `after:content-['🔒'] after:relative after:-top-px after:ml-1 after:hue-rotate-180 after:brightness-90` : ''
    // join handler
    const joinHandler = () => {
        // show the modal
        miscState.setShowJoinModal(`join_room_${roomId}`) 
        // show input password
        if(isRoomLocked == '🔒') setShowInputPassword(true)
    }

    return (
        gameState.myCurrentGame == roomId
        ? <Link id={`join_button_${roomId}`} href={miscState.disableButtons == 'roomlist' ? '#' : { pathname: '/game', query:{id: roomId} }} className={`${miscState.disableButtons == 'roomlist' ? 'saturate-0' : ''} w-16 lg:w-24 text-2xs lg:text-xs text-center bg-success border-8bit-success active:opacity-75`}>
            {translateUI({lang: miscState.language, text: 'Join'})}
        </Link>
        : <button type="button" id={`join_button_${roomId}`} className={`${miscState.disableButtons == 'roomlist' ? 'saturate-0':''} w-16 lg:w-24 text-2xs lg:text-xs bg-success border-8bit-success active:opacity-75 ${lockIcon}`} onClick={joinHandler} disabled={miscState.disableButtons == 'roomlist' ? true : false}>
            {translateUI({lang: miscState.language, text: 'Join'})}
        </button>
    )
}

function SpectateRoomButton({roomId, roomCreator}: {roomId: number, roomCreator: string}) {
    const miscState = useMisc()
    const gameState = useGame()
    
    const spectateClass = `${miscState.disableButtons == 'roomlist' ? 'saturate-0' : ''} w-16 lg:w-24 text-2xs lg:text-xs bg-primary border-8bit-primary active:opacity-75 ${gameState.myCurrentGame === roomId ? 'saturate-0' : ''}`

    return (
        // only show for rooms that not mine
        gameState.myPlayerInfo.display_name == roomCreator
            ? null
            : <button type="submit" id={`spectate_button_${roomId}`} 
            disabled={gameState.myCurrentGame === roomId ? true : miscState.disableButtons == 'roomlist' ? true : false} 
            className={spectateClass}>
                {translateUI({lang: miscState.language, text: 'Spectate'})}
            </button>
    )
}

function DeleteRoomButton({roomId, roomCreator}: {roomId: number, roomCreator: string}) {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        // only show for my room
        gameState.myPlayerInfo.display_name == roomCreator
            ? <button type="submit" id={`delete_button_${roomId}`} disabled={miscState.disableButtons == 'roomlist' ? true : false} className={`${miscState.disableButtons == 'roomlist' ? 'saturate-0' : ''} w-16 lg:w-24 text-2xs lg:text-xs bg-darkblue-1 border-8bit-text active:opacity-75`}>
                {translateUI({lang: miscState.language, text: 'Delete'})}
            </button>
            : null
    )
}

function JoinRoomPrompt({ roomId, showInputPassword, setShowInputPassword }) {
    const miscState = useMisc()
    const gameState = useGame()
    // find room data
    const findRoomData = gameState.roomList.map(v => v.room_id).indexOf(roomId)

    return (
        <div className={`${miscState.showJoinModal ? 'flex' : 'hidden'} absolute top-0 z-20 bg-black/50 items-center justify-center text-left h-full w-full`}>
            <form onSubmit={ev => joinPromptInputs(ev, roomId, miscState, setShowInputPassword)} 
            className={`${miscState.showJoinModal == `join_room_${roomId}` ? 'flex' : 'hidden'} flex-col justify-center gap-2 bg-darkblue-1 w-full h-full`}>
                {/* select character */}
                <SelectCharacter disabledCharacters={gameState.roomList[findRoomData].characters} />
                {/* input password */}
                <div className={`${showInputPassword ? 'flex' : 'hidden'} flex-col gap-1 mx-auto w-3/4 lg:p-1 text-center`}>
                    <label htmlFor={`input_password_${roomId}`}> room password: </label>
                    <div className="flex gap-1">
                        <input type="text" id={`input_password_${roomId}`} className="w-full px-1" minLength={3} maxLength={8} placeholder="password" />
                    </div>
                </div>
                {/* join room submit */}
                <div className="flex justify-between mx-6">
                    <button type="button" className="text-red-300 p-1 active:opacity-75"
                    onClick={() => {miscState.setShowJoinModal(null); setShowInputPassword(false)}}> 
                        {translateUI({lang: miscState.language, text: 'Close'})} 
                    </button>
                    <button type="submit" className="text-green-300 p-1 active:opacity-75"> 
                        {translateUI({lang: miscState.language, text: 'Next'})} 
                    </button>
                </div>
            </form>
        </div>
    )
}