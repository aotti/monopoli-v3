import { useMisc } from "../../context/MiscContext";
import { translateUI } from "../../helper/helper";
import { ITooltip } from "../../helper/types";
import ChatBox from "../../components/ChatBox";
import CreateRoom from "./components/CreateRoom";
import PlayerList from "./components/PlayerList";
import PlayerStats from "./components/PlayerStats";
import RoomCard from "./components/RoomCard";

export default function RoomContent() {
    const miscState = useMisc()
    const roomRules: {[key: number]: ITooltip} = {
        '1': {
            text: `board: normal;dice: 2;start: 75k;lose: -25k;mode: 5 laps;curse: 5%`,
            key: `#rules_${1}`,
            pos: 'top',
            arrow: ['bottom', 'middle']
        },
        '2': {
            text: `board: 2 way;dice: 1;start: 75k;lose: -25k;mode: survive;curse: 5%`,
            key: `#rules_${2}`,
            pos: 'top',
            arrow: ['bottom', 'middle']
        },
        '3': {
            text: `board: delta;dice: 2;start: 50k;lose: -25k;mode: 7 laps;curse: 10%`,
            key: `#rules_${3}`,
            pos: 'top',
            arrow: ['bottom', 'middle']
        },
    }

    return (
        <div className="flex gap-2">
            {/* player list && stats */}
            <div className="flex flex-col w-[calc(100vw-70vw)]">
                <div className="h-[calc(100vh-52vh)] lg:h-[calc(100vh-50vh)] p-1 border-b-2">
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
                <div className="h-[calc(100vh-65vh)] lg:h-[calc(100vh-60vh)] p-1">
                    <PlayerStats />
                </div>
            </div>
            {/* room list */}
            <div className="flex flex-col w-[calc(100vw-30vw)]">
                {/* 1rem gap, 3.5rem title, 0.5rem margin bot */}
                <div className="flex gap-4 w-full h-fit text-center p-2">
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
                    ${miscState.showModal === null ? 'hidden' : 'flex'} items-center justify-center
                    h-[calc(100vh-4.25rem)] w-[calc(100vw-30vw+1rem)] lg:w-[calc(100vw-30vw+2.5rem)]`}>
                        <CreateRoom />
                    </div>
                </div>
                {/* 
                    room cards 
                    100vh - 3.75rem (header) - 5rem (room list title)
                */}
                <div className="flex flex-wrap gap-2 justify-between 
                    text-xs w-[calc(100%-1rem)] h-[calc(100vh-7.25rem)] lg:h-[calc(100vh-8.25rem)]
                    overflow-y-scroll p-2 bg-darkblue-1/60 border-8bit-text">
                    {/* card */}
                    <RoomCard roomRules={roomRules[1]} />
                    {/* card */}
                    <RoomCard roomRules={roomRules[2]} />
                    {/* card */}
                    <RoomCard roomRules={roomRules[3]} />
                </div>
            </div>
        </div>
    )
}