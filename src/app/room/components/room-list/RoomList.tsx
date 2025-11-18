import { useRef } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"
import Daily from "../other/Daily"
import { DailyButton, MenuButton, RankingButton, ShopButton } from "../other/MenuButtons"
import Ranking from "../other/Ranking"
import Shop from "../other/Shop"
import CreateRoom from "./CreateRoom"
import CreateRoomButton from "./CreateRoomButton"
import { clickOutsideElement } from "../../../../helper/click-outside"
import RoomCard from "./RoomCard"
import { ChatCommands } from "../../../../components/ChatBox"

export default function RoomList() {
    const miscState = useMisc()
    const gameState = useGame()
        
    // menu item ref
    const menuItemRef = useRef()
    clickOutsideElement(menuItemRef, () => miscState.showRoomListMenu ? miscState.setShowRoomListMenu(false) : null)

    return (
        <div className={`flex flex-col w-[calc(100vw-30vw)]`}>
            {/* tutorial: relative z-10 */}
            {/* room list header
                1rem gap, 3.5rem title, 0.5rem margin bot */}
            <div className={`${miscState.showTutorial == 'tutorial_roomlist_4' ? 'relative z-10 bg-darkblue-2' : ''} 
            flex justify-between gap-4 w-full h-fit text-center p-1`}>
                {/* left buttons */}
                <div className="flex gap-2 lg:gap-4">
                    <div data-tooltip="tutorial" className="w-8 my-auto">
                        {/* tutorial button */}
                        <button type="button" className="active:opacity-75" onClick={() => miscState.setShowTutorial('tutorial_roomlist_1')}>
                            <img src="https://img.icons8.com/?id=3656&format=png&color=FFFFFF" alt="📖" width={100} height={100} draggable={false} />
                        </button>
                    </div>
                    <div data-tooltip="chat commands" className="relative w-8 my-auto">
                        {/* chat command button */}
                        <button type="button" className="scale-150 active:opacity-75" onClick={() => miscState.setShowChatCommands(true)}>
                            <img src="https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=FFFFFF" alt="📝" width={100} height={100} draggable={false} />
                        </button>
                        {/* chat commands */}
                        {miscState.showChatCommands ? <ChatCommands /> : null}
                    </div>
                </div>
                {/* title */}
                <div className="flex items-center justify-center w-3/5">
                    <p> {translateUI({lang: miscState.language, text: 'Room List'})} </p>
                </div>
                {/* right buttons */}
                <div className="flex gap-2">
                    {/* create room button */}
                    <CreateRoomButton />
                    {/* menu button */}
                    <MenuButton />
                    {/* menu item */}
                    <div ref={menuItemRef} className={`${miscState.showRoomListMenu ? 'flex' : 'hidden'} flex-col gap-2 absolute z-10 right-16 border-8bit-text bg-darkblue-1 w-max`}>
                        {/* ranking button */}
                        <RankingButton />
                        {/* shop button */}
                        <ShopButton />
                        {/* daily button */}
                        {gameState.myPlayerInfo.display_name != 'guest' ? <DailyButton /> : null}
                    </div>
                </div>
                {/* create room, ranking, shop, calendar modal */}
                <div className={`absolute z-20 -ml-2 bg-black/50
                ${miscState.showModal === null ? 'hidden' : 'flex'} items-center justify-center text-left
                h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.25rem)] w-[calc(65vw+1.5rem)] lg:w-[calc(65vw+3rem)]`}>
                    {/* create room */}
                    <CreateRoom />
                    {/* ranking */}
                    <Ranking />
                    {/* shop */}
                    <Shop />
                    {/* daily */}
                    {gameState.lastDailyStatus ? <Daily /> : null}
                </div>
            </div>
            {/* room list cards 
                100vh - 3.75rem (header) - 5rem (room list title) */}
            <div className={`${miscState.showTutorial == 'tutorial_roomlist_3' ? 'relative z-10' : ''} 
            flex flex-wrap gap-2 justify-between 
            text-xs w-[calc(100%-1rem)] h-[calc(100vh-7.25rem)] lg:h-[calc(100vh-8.25rem)]
            overflow-y-scroll p-2 bg-darkblue-1/60 border-8bit-text`}>
                {/* card */}
                {gameState.roomList.length > 0
                    ? gameState.roomList.map((room, i) => room.visibility == '0' ? null : <RoomCard key={i} roomData={room} />)
                    : <div className="m-auto">
                        <span id="result_message"> there is no game </span>
                        <img src="https://img.icons8.com/?id=-70EdELqFxwn&format=png" className="inline !w-10 !h-10" loading="lazy" />
                    </div>
                }
            </div>
        </div>
    )
}