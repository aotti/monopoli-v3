import { useMisc } from "../../context/MiscContext";
import { applyTooltipEvent, translateUI } from "../../helper/helper";
import ChatBox from "../../components/ChatBox";
import CreateRoom from "./components/CreateRoom";
import PlayerList from "./components/PlayerList";
import PlayerStats from "./components/PlayerStats";
import RoomCard from "./components/RoomCard";
import { useEffect } from "react";

export default function RoomContent() {
    const miscState = useMisc()
    const roomRules = [
        `board: normal;dice: 2;start: 75k;lose: -25k;mode: 5 laps;curse: 5%`,
        `board: 2 way;dice: 1;start: 75k;lose: -25k;mode: survive;curse: 5%`,
        `board: delta;dice: 2;start: 50k;lose: -25k;mode: 7 laps;curse: 10%`
    ]
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    return (
        <div className="flex gap-2">
            {/* player list, chat box, player stats */}
            <div className="flex flex-col w-[calc(100vw-70vw)]">
                {/* player list + chat */}
                {/* tutorial: relative z-10 */}
                <div className={`${miscState.showTutorial == 'tutorial_roomlist_1' ? 'relative z-10' : ''}
                h-[calc(100vh-52vh)] lg:h-[calc(100vh-50vh)] p-1`}>
                    <span className="border-b-2">
                        { miscState.isChatFocus 
                            ? translateUI({lang: miscState.language, text: 'chat box'}) 
                            : translateUI({lang: miscState.language, text: 'player list'})  }
                    </span>
                    <div className="w-full h-[calc(100%-1rem)]">
                        {
                            miscState.isChatFocus
                                // chat box
                                ? <ChatBox page="room" />
                                // list of online players
                                : <PlayerList />
                        }
                        {/* chat input */}
                        <form className="mt-2" onSubmit={ev => ev.preventDefault()}>
                            <div className="flex items-center gap-2">
                                <input type="text" className="w-4/5 lg:h-10 lg:p-1" 
                                placeholder={translateUI({lang: miscState.language, text: 'chat here'})} required 
                                onFocus={() => miscState.setIsChatFocus(true)} onBlur={() => miscState.setIsChatFocus(false)} />
                                <button type="submit" className="w-6 lg:w-10 active:opacity-50">
                                    <img src="https://img.icons8.com/?size=100&id=2837&format=png&color=FFFFFF" alt="send" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                {/* player stats */}
                {/* tutorial: relative z-10 */}
                <div className={`${miscState.showTutorial == 'tutorial_roomlist_2' ? 'relative z-10' : ''}
                h-[calc(100vh-65vh)] lg:h-[calc(100vh-60vh)] p-1`}>
                    <PlayerStats />
                </div>
            </div>
            {/* room list */}
            {/* tutorial: relative z-10 */}
            <div className={`${miscState.showTutorial == 'tutorial_roomlist_3' ? 'relative z-10' : ''}
            flex flex-col w-[calc(100vw-30vw)]`}>
                {/* 1rem gap, 3.5rem title, 0.5rem margin bot */}
                <div className="flex gap-4 w-full h-fit text-center p-2">
                    {/* tutorial button */}
                    <div data-tooltip="tutorial" className="w-8 my-auto">
                        <button type="button" onClick={() => miscState.setShowTutorial('tutorial_roomlist_1')}>
                            <img src="https://img.icons8.com/?id=3656&format=png&color=FFFFFF" alt="📖" draggable={false} />
                        </button>
                    </div>
                    {/* title */}
                    <div className="flex items-center justify-end mr-10 w-3/5">
                        <p> {translateUI({lang: miscState.language, text: 'Room List'})} </p>
                    </div>
                    {/* create room button */}
                    <div className="text-right w-2/5">
                        <button type="button" className="border-8bit-primary bg-primary active:opacity-75"
                        onClick={() => {
                            // to give zoom-in animate class
                            miscState.setAnimation(true); 
                            // show the modal
                            miscState.setShowModal('create room') 
                        }}> 
                            {translateUI({lang: miscState.language, text: 'Create Room'})}
                        </button>
                    </div>
                    {/* create room modal */}
                    <div className={`absolute z-20 bg-black/50
                    ${miscState.showModal === null ? 'hidden' : 'flex'} items-center justify-center text-left
                    h-[calc(100vh-4.25rem)] w-[calc(65vw+1rem)] lg:w-[calc(65vw+2.5rem)]`}>
                        <CreateRoom />
                    </div>
                </div>
                {/* room list cards 
                    100vh - 3.75rem (header) - 5rem (room list title) */}
                <div className="flex flex-wrap gap-2 justify-between 
                    text-xs w-[calc(100%-1rem)] h-[calc(100vh-7.25rem)] lg:h-[calc(100vh-8.25rem)]
                    overflow-y-scroll p-2 bg-darkblue-1/60 border-8bit-text">
                    {/* card */}
                    <RoomCard roomRules={roomRules[0]} />
                    {/* card */}
                    <RoomCard roomRules={roomRules[1]} />
                    {/* card */}
                    <RoomCard roomRules={roomRules[2]} />
                </div>
            </div>
            {/* tutorial */}
            <div className={`${miscState.showTutorial ? 'block' : 'hidden'} 
            absolute mt-1 bg-black/75 h-[calc(100vh-4rem)] w-[calc(100vw-1rem)] leading-6 lg:leading-8`}>
                {/* player list + chat */}
                <div className={`${miscState.showTutorial == 'tutorial_roomlist_1' ? 'block' : 'hidden'} 
                absolute mt-2 pr-1 right-0 w-2/3 lg:right-[calc(20%-1rem)] lg:w-1/2`}>
                    <p className="text-green-400"> beningging of tutorial </p>
                    <hr />
                    <p className="tutorial_roomlist_1">
                        display list of online player, 
                        if there's no one online, it will be empty 😭. 
                        the "view" button used to check other player 
                        stats
                    </p>
                    <hr className="my-1" />
                    <p className="tutorial_roomlist_1">
                        for the chat, just try type something in the 
                        "chat here" box and the chat box will appear 
                        or you can type "/on" to make the chat box 
                        keep open and "/off" to revert it
                    </p>
                    <hr className="my-1" />
                    <button type="button" className="text-green-400 p-1"
                    onClick={() => miscState.setShowTutorial('tutorial_roomlist_2')}> click here to continue </button>
                </div>
                {/* player stats */}
                <div className={`${miscState.showTutorial == 'tutorial_roomlist_2' ? 'block' : 'hidden'} 
                absolute mt-2 pr-1 right-0 bottom-0 lg:bottom-10 w-2/3 lg:right-[calc(20%-1rem)] lg:w-1/2`}>
                    <p className="tutorial_roomlist_2">
                        display you or other player game stats. 
                        to upload avatar, click the "upload your avatar".
                    </p>
                    <hr className="my-1" />
                    <p className="tutorial_roomlist_2">
                        "worst lost" mean the worst money you have when losing 
                        a game since you <i>breathed in this world</i>, um..i mean created ur account.
                    </p>
                    <hr className="my-1" />
                    <button type="button" className="text-green-400 p-1" 
                    onClick={() => miscState.setShowTutorial('tutorial_roomlist_3')}> 
                        click here to continue 
                    </button>
                </div>
                {/* room list */}
                <div className={`${miscState.showTutorial == 'tutorial_roomlist_3' ? 'block' : 'hidden'}
                absolute mt-2 w-[30%] text-right text-2xs lg:text-sm lg:!leading-6`}>
                    <p className="tutorial_roomlist_3">
                        icon on the right is tutorial button
                    </p>
                    <hr className="my-1" />
                    <p className="tutorial_roomlist_3">
                        to play the game, just click on "create room" 
                        fill the form and it'll show in the room list
                    </p>
                    <hr className="my-1" />
                    <p className="tutorial_roomlist_3">
                        the rules ??? text is a tooltip.
                        on phone, just swipe + hold on the 
                        text as in this .gif: 
                        <img src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/tooltip-jMhpG5ZcuTWhHKb4VxPirbhBl2YZ9Y.gif" alt="tap + swipe.gif" className="mx-auto w-[95%] !h-20 lg:!h-44" />
                    </p>
                    <hr className="my-1" />
                    <p className="tutorial_roomlist_3">
                        delete button only show if the creator is you
                    </p>
                    <hr className="my-1" />
                    <button type="button" className="text-green-400 p-1" onClick={() => miscState.setShowTutorial(null)}> 
                        tutorial complete 
                    </button>
                </div>
            </div>
        </div>
    )
}