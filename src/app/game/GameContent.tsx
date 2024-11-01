import { useRef } from "react"
import Tooltip from "../../components/Tooltip"
import { useGame } from "../../context/GameContext"
import { useMisc } from "../../context/MiscContext"
import { clickOutsideElement } from "../../helper/helper"
import { ITooltip } from "../../helper/types"
import BoardDelta from "./components/boards/BoardDelta"
import BoardNormal from "./components/boards/BoardNormal"
import BoardTwoWay from "./components/boards/BoardTwoWay"
import GameInfo from "./components/GameInfo"
import HelpSection from "./components/side_buttons/HelpSection"
import PlayerSection from "./components/side_buttons/PlayerSection"
import ChatBox from "../../components/ChatBox"

export default function GameContent() {
    const miscState = useMisc()
    const gameState = useGame()
    const backTooltip: ITooltip = {
        text: 'back to room list (not leaving)',
        key: '#backTooltip',
        pos: 'right',
        arrow: ['left', 'start']
    }
    // click outside element
    const gameSideButtonRef = useRef()
    clickOutsideElement(gameSideButtonRef, () => gameState.setGameSideButton(null))

    return (
        <div className="grid grid-cols-12 h-[calc(100vh-3.75rem)]">
            <div id="backTooltip" className="flex flex-col gap-10 self-start mt-6 mx-2 w-20 lg:w-24">
                <button type="button" className="w-20 h-10 lg:w-24 p-1 bg-primary border-8bit-primary text-2xs lg:text-xs"
                onTouchStart={() => miscState.setHoverTooltip(`${backTooltip.key.substring(1)}`)}
                onTouchEnd={() => miscState.setHoverTooltip(null)}
                onMouseOver={() => miscState.setHoverTooltip(`${backTooltip.key.substring(1)}`)} 
                onMouseOut={() => miscState.setHoverTooltip(null)}>
                    <span> Back to room </span>
                    {
                        miscState.hoverTooltip == backTooltip.key.substring(1)
                            ? <Tooltip options={backTooltip}/>
                            : null
                    }
                </button>
                {/* game info */}
                <GameInfo />
            </div>
            {/* normal board | 28 square */}
            {/* <BoardNormal /> */}
            <BoardDelta />
            {/* <BoardTwoWay /> */}

            {/* help, player, chat buttons */}
            <div className="absolute top-[20vh] right-[calc(0rem+1rem)]
            flex items-center [writing-mode:vertical-lr] 
            text-center text-2xs lg:text-sm 
            h-60 lg:h-96 w-6 lg:w-8
            bg-darkblue-1 border-8bit-text">
                {/* help */}
                <div className="h-20 lg:h-32 p-1" ref={gameSideButtonRef}>
                    <button type="button" className="h-full p-2 hover:bg-darkblue-4 hover:text-black"
                    onClick={() => gameState.setGameSideButton('help')}> help </button>
                    <HelpSection />
                </div>
                {/* player */}
                <div className="h-20 lg:h-32 p-1" ref={gameSideButtonRef}>
                    <button type="button" className="h-full p-2 hover:bg-darkblue-4 hover:text-black"
                    onClick={() => gameState.setGameSideButton('players')}> players </button>
                    <PlayerSection />
                </div>
                {/* chat */}
                <div className="h-20 lg:h-32 p-1" ref={gameSideButtonRef}>
                    <button type="button" className="h-full p-2 hover:bg-darkblue-4 hover:text-black"
                    onClick={() => gameState.setGameSideButton('chat')}> chat </button>
                    <ChatBox page="game" />
                </div>
            </div>
        </div>
    )
}