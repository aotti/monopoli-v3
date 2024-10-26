import { ITooltip } from "../../helper/types";
import RoomCard from "./components/RoomCard";

export default function RoomContent() {
    const roomRules: {[key: number]: ITooltip} = {
        '1': {
            text: `board: normal\ndice: 2\nstart: 75k\nlose: -25k\nmode: 5 round\ncurse: 5%`,
            key: `#rules_${1}`,
            pos: 'top',
            arrow: ['bottom', 'middle']
        },
        '2': {
            text: `board: 2 way\ndice: 1\nstart: 75k\nlose: -25k\nmode: survive\ncurse: 5%`,
            key: `#rules_${2}`,
            pos: 'top',
            arrow: ['bottom', 'middle']
        },
        '3': {
            text: `board: delta\ndice: 2\nstart: 50k\nlose: -25k\nmode: 7 round\ncurse: 10%`,
            key: `#rules_${3}`,
            pos: 'top',
            arrow: ['bottom', 'middle']
        },
    }

    return (
        <div className="flex gap-2">
            {/* player list && stats */}
            <div className="flex flex-col w-[calc(100vw-75vw)]">
                <div className="h-[calc(100vh-50vh)] p-2 border-2 border-t-0">
                    <span> player list </span>
                </div>
                <div className="h-[calc(100vh-65vh)] lg:h-[calc(100vh-60vh)] p-2 bg-darkblue-1/60">
                    <p> my stats </p>
                </div>
            </div>
            {/* room list */}
            <div className="flex flex-col w-[calc(100vw-25vw)]">
                {/* 1rem gap, 3.5rem title, 0.5rem margin bot */}
                <div className="flex gap-4 w-full h-fit text-center p-2">
                    {/* title */}
                    <div className="flex items-center justify-end mr-10 w-3/5">
                        <p> Room List </p>
                    </div>
                    {/* create room button */}
                    <div className="text-right w-2/5">
                        <button type="button" className="border-8bit-primary bg-primary"> Create Room </button>
                    </div>
                </div>
                {/* 
                    room cards 
                    100vh - 3.75rem (header) - 5rem (room list title)
                */}
                <div className="flex flex-wrap gap-2 justify-between 
                    text-xs w-full h-[calc(100vh-7rem)] lg:h-[calc(100vh-7.25rem)]
                    overflow-y-scroll p-2 border-t-2 border-b-2">
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