import { useEffect, useRef } from "react"
import { useGame } from "../../context/GameContext"
import { useMisc } from "../../context/MiscContext"
import { applyTooltipEvent, translateUI } from "../../helper/helper"
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
import TutorialGameRoom from "./components/TutorialGameRoom"
import { clickOutsideElement } from "../../helper/click-outside"

export default function GameContent() {
    const miscState = useMisc()
    const gameState = useGame()
    // click outside element
    const gameSideButtonRef = useRef()
    clickOutsideElement(gameSideButtonRef, () => gameState.setGameSideButton(null))
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])
    // game history ref
    const gameHistoryRef = useRef()
    clickOutsideElement(gameHistoryRef, () => gameState.setShowGameHistory(false))
    // return spectator to false
    const spectatorLeave = () => gameState.setSpectator(false)

    return (
        <div className="grid grid-cols-12 h-[calc(100vh-3.75rem)]">
            {/* left side | back button, game info, game history */}
            {/* tutorial: relative z-10 */}
            <div className={`${miscState.showTutorial == 'tutorial_gameroom_3' ? 'relative z-10' : ''}
            flex flex-col gap-2 lg:gap-6 self-start mt-6 mx-2 w-20 lg:w-24 h-[calc(100%-5rem)]`}>
                <Link href={'/room'} className="flex items-center justify-center text-center w-20 h-10 lg:w-24 p-1 bg-primary border-8bit-primary text-2xs lg:text-xs active:opacity-75" onClick={spectatorLeave} draggable={false}>
                    <span data-tooltip={'back to room, not leave game'} className="relative"> 
                        {translateUI({lang: miscState.language, text: 'Back to room'})} 
                    </span>
                </Link>
                {/* tutorial button */}
                <div data-tooltip="tutorial" className="relative w-6 lg:w-8">
                    <button type="button" className="active:opacity-75" onClick={() => miscState.setShowTutorial('tutorial_gameroom_1')}>
                        <img src="https://img.icons8.com/?id=3656&format=png&color=FFFFFF" alt="📖" loading="lazy" draggable={false} />
                    </button>
                </div>
                {/* game info */}
                <GameInfo />
                {/* game history */}
                <div ref={gameHistoryRef} className={`relative top-10 lg:top-36 text-2xs lg:text-xs
                ${gameState.displaySettingItem == 'game_history' || miscState.showTutorial == 'tutorial_gameroom_3' ? 'visible' : 'invisible'} `}>
                    <PlayerSettingGameHistory />
                </div>
            </div>
            
            {/* middle side */}
            {/* tutorial: relative z-10 */}
            <section className={`${miscState.showTutorial == 'tutorial_gameroom_2' ? 'relative z-10' : ''}
            col-span-10 grid grid-rows-6 gap-8 justify-center 
            h-[calc(100vh-3.75rem)] scale-90 -mt-2`}>
                {/* board */}
                <BoardNormal />
                {/* <BoardDelta /> */}
                {/* <BoardTwoWay /> */}
                {/* game buttons */
                gameState.spectator
                    ? null
                    : <div className="absolute top-[45%] w-full text-2xs lg:text-xs">
                        <div className="flex flex-col gap-2 lg:gap-3 mx-auto w-fit px-2 text-center">
                            <GameButtons />
                        </div>
                    </div>
                }
                {/* game notif + roll number */}
                <div className={`${gameState.showGameNotif || gameState.rollNumber ? 'block' : 'hidden'} 
                absolute h-full w-full text-center text-2xs lg:text-xs`}>
                    {
                        gameState.rollNumber !== null
                            ? <RollNumber />
                            : <GameNotif />
                    }
                </div>
            </section>

            {/* right side | help, player, chat buttons */}
            {/* tutorial: relative z-10 */}
            <div ref={gameSideButtonRef} className={`${miscState.showTutorial == 'tutorial_gameroom_1' ? 'z-10' : ''}
            absolute top-[20vh] right-[calc(0rem+1rem)]            flex items-center [writing-mode:vertical-lr] 
            text-center text-2xs lg:text-sm             h-60 lg:h-96 w-6 lg:w-8
            bg-darkblue-1 border-8bit-text`}>
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

            {/* tutorial */}
            <div className={`${miscState.showTutorial ? 'block' : 'hidden'} 
            absolute mt-1.5 bg-black/75 h-[calc(100vh-4rem)] w-[calc(100vw-1rem)] leading-6 lg:leading-8`}>
                <TutorialGameRoom />
            </div>
        </div>
    )
}

function SideButtons({ text, setGameSideButton }) {
    const miscState = useMisc()

    return (
        <button type="button" className="h-full p-2 hover:bg-darkblue-4 hover:text-black"
        onClick={() => setGameSideButton(text)}> {translateUI({lang: miscState.language, text: text})} </button>
    )
}