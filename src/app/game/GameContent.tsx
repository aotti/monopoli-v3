import { useEffect, useRef } from "react"
import Tooltip from "../../components/Tooltip"
import { useGame } from "../../context/GameContext"
import { useMisc } from "../../context/MiscContext"
import { clickOutsideElement, qS } from "../../helper/helper"
import { ITooltip } from "../../helper/types"
import BoardNormal from "./components/board/BoardNormal"
import BoardDelta from "./components/board/BoardDelta"
import BoardTwoWay from "./components/board/BoardTwoWay"
import GameInfo from "./components/GameInfo"
import HelpSection from "./components/side-button-content/HelpSection"
import PlayerSection from "./components/side-button-content/PlayerSection"
import ChatBox from "../../components/ChatBox"
import PlayerSettingGameHistory from "./components/side-button-content/PlayerSettingGameHistory"
import GameButtons from "./components/board/GameButtons"
import GameNotif from "./components/board/GameNotif"
import Link from "next/link"
import RollNumber from "./components/board/RollNumber"

export default function GameContent() {
    const miscState = useMisc()
    const gameState = useGame()
    // click outside element
    const gameSideButtonRef = useRef()
    clickOutsideElement(gameSideButtonRef, () => gameState.setGameSideButton(null))

    return (
        <div className="grid grid-cols-12 h-[calc(100vh-3.75rem)]">
            {/* left side | back button, game info, game history */}
            <div className="flex flex-col justify-between gap-6 self-start mt-6 mx-2 w-20 lg:w-24 h-[calc(100%-5rem)]">
                <button type="button" className="w-20 h-10 lg:w-24 p-1 bg-primary border-8bit-primary text-2xs lg:text-xs"
                onClick={() => {
                    const link = qS('#back_to_room') as HTMLAnchorElement
                    link.click()
                }}>
                    <span> Back to room </span>
                    <Link id="back_to_room" href={'/room'} hidden={true}></Link>
                </button>
                {/* game info */}
                <GameInfo />
                {/* game history */}
                <PlayerSettingGameHistory />
            </div>
            
            {/* middle side */}
            <section className="col-span-10 grid grid-rows-6 gap-8 justify-center 
            h-[calc(100vh-3.75rem)] scale-90 -mt-2">
                {/* board */}
                <BoardNormal />
                {/* <BoardDelta /> */}
                {/* <BoardTwoWay /> */}
                {/* game buttons */}
                <div className="absolute top-1/2 w-full flex flex-col gap-4 text-2xs lg:text-xs">
                    <GameButtons />
                </div>
                {/* game notif + roll number */}
                <div className={`${gameState.showNotif || gameState.rollNumber ? 'block' : 'hidden'} absolute h-full w-full text-center text-2xs lg:text-xs`}>
                    <GameNotif />
                    {
                        gameState.rollNumber !== null
                            ? <RollNumber />
                            : null
                    }
                </div>
            </section>

            {/* right side | help, player, chat buttons */}
            <div ref={gameSideButtonRef} className="absolute top-[20vh] right-[calc(0rem+1rem)]
            flex items-center [writing-mode:vertical-lr] 
            text-center text-2xs lg:text-sm 
            h-60 lg:h-96 w-6 lg:w-8
            bg-darkblue-1 border-8bit-text">
                {/* help */}
                <div className="h-20 lg:h-32 p-1">
                    <SideButtons text={'help'} setGameSideButton={gameState.setGameSideButton} />
                    <HelpSection />
                </div>
                {/* player */}
                <div className="h-20 lg:h-32 p-1">
                    <SideButtons text={'players'} setGameSideButton={gameState.setGameSideButton} />
                    <PlayerSection />
                </div>
                {/* chat */}
                <div className="h-20 lg:h-32 p-1">
                    <SideButtons text={'chat'} setGameSideButton={gameState.setGameSideButton} />
                    <ChatBox page="game" />
                </div>
            </div>
        </div>
    )
}

function SideButtons({ text, setGameSideButton }) {
    return (
        <button type="button" className="h-full p-2 hover:bg-darkblue-4 hover:text-black"
        onClick={() => setGameSideButton(text)}> {text} </button>
    )
}