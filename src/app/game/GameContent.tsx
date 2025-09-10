import { useEffect, useRef } from "react"
import { useGame } from "../../context/GameContext"
import { useMisc } from "../../context/MiscContext"
import { applyTooltipEvent, qS, translateUI } from "../../helper/helper"
import BoardNormal from "./components/board/BoardNormal"
import BoardTwoway from "./components/board/BoardTwoway"
import GameInfo from "./components/board/GameInfo"
import HelpSection from "./components/side-button-content/HelpSection"
import PlayerSection from "./components/side-button-content/PlayerSection"
import ChatBox, { ChatEmotes, sendChat } from "../../components/ChatBox"
import PlayerSettingGameHistory from "./components/side-button-content/PlayerSettingGameHistory"
import GameButtons from "./components/board/GameButtons"
import GameNotif from "./components/board/GameNotif"
import Link from "next/link"
import RollNumber from "./components/board/RollNumber"
import TutorialGameRoom from "./components/other/TutorialGameRoom"
import PubNub, { Listener } from "pubnub"
import { gameMessageListener } from "./helper/published-message"
import GameSounds from "../../components/GameSounds"
import { getPlayerInfo } from "./helper/game-prepare-playing-logic"
import PreloadCardImages from "./components/other/PreloadCardImages"
import { clickOutsideElement } from "../../helper/click-outside"
import MiniGame from "./components/board/MiniGame"
import { clickInsideElement } from "../../helper/click-inside"

export default function GameContent({ pubnubSetting }: {pubnubSetting: {monopoly: any, chatting: any}}) {
    const miscState = useMisc()
    const gameState = useGame()

    // click outside element
    const gameSideButtonRef = useRef()
    clickOutsideElement(gameSideButtonRef, () => gameState.setGameSideButton(null))
    // game history ref
    const gameHistoryRef = useRef()
    clickOutsideElement(gameHistoryRef, () => gameState.setExpandGameHistory(false))
    // return spectator to false
    const spectatorLeave = () => {
        gameState.setSpectator(false)
        // hide tutorial
        miscState.setShowTutorial(null)
        // set notif to null
        gameState.setShowGameNotif(null)
    }

    // tooltip (the element must have position: relative)
    useEffect(() => {
        // start room list tutorial for 1st login (1st browser)
        const isGameRoomTutorialDone = localStorage.getItem('gameRoomTutorial')
        if(!isGameRoomTutorialDone) {
            miscState.setShowTutorial('tutorial_gameroom_1')
            localStorage.setItem('gameRoomTutorial', 'true')
        }
        applyTooltipEvent()
        // reset disable buttons
        miscState.setDisableButtons(null)
        // get player list and set room id
        const gameroomParam = +location.search.match(/id=\d+$/)[0].split('=')[1]
        getPlayerInfo(gameroomParam, miscState, gameState)
        gameState.setGameRoomId(gameroomParam)

        // remove sub event data
        localStorage.removeItem('subPlayerDice')
        localStorage.removeItem('subEventData')
        localStorage.removeItem('parkingEventData')
        localStorage.removeItem('specialCardUsed')
        localStorage.removeItem('buffDebuffUsed')
        localStorage.removeItem('moreMoney')
        localStorage.removeItem('playerTurns')
        // reset dice controller value
        gameState.setDiceMode('off')

        // set player turn
        const setPlayerTurnText = () => {
            const getPlayerTurns = localStorage.getItem('playerTurns') || '[]'
            const parsedPlayerTurns = JSON.parse(getPlayerTurns) as string[]
            const playerTurnNotif = qS('#player_turn_notif')
            
            if(playerTurnNotif && parsedPlayerTurns?.length > 1) {
                playerTurnNotif.textContent = translateUI({lang: miscState.language, text: 'ppp turn'})
                                            .replace('ppp', parsedPlayerTurns[0])
            }
        }
        document.body.tabIndex = 0
        document.body.addEventListener('click', setPlayerTurnText)

        return () => {
            document.body.removeEventListener('click', setPlayerTurnText)
        }
    }, [])

    // pubnub
    const pubnubClient = new PubNub(pubnubSetting.monopoly)
    useEffect(() => {
        const gameroomParam = +location.search.match(/id=\d+$/)[0].split('=')[1]
        // pubnub channels
        const gameroomChannel = `monopoli-gameroom-${gameroomParam}`
        // subscribe
        pubnubClient.subscribe({ 
            channels: [gameroomChannel] 
        })
        // get published message
        const publishedMessage: Listener = {
            message: (data) => gameMessageListener(data, miscState, gameState)
        }
        pubnubClient.addListener(publishedMessage)
        // unsub and remove listener
        return () => {
            pubnubClient.unsubscribe({ 
                channels: [gameroomChannel] 
            })
            pubnubClient.removeListener(publishedMessage)
        }
    }, [gameState.gamePlayerInfo, gameState.showGameNotif, 
        gameState.minigameWords, gameState.minigameMatchedWords, 
        gameState.minigameAnswerList])

    return (
        <div className="grid grid-cols-12 h-[calc(100vh-3.75rem)]">
            {/* left side | back button, game info, game history */}
            {/* tutorial: relative z-10 */}
            <div className={`${miscState.showTutorial == 'tutorial_gameroom_3' ? 'relative z-10' : ''}
            flex flex-col gap-2 lg:gap-6 mt-6 mx-2 w-24 lg:w-36 h-[calc(100%-5rem)]`}>
                <Link className={`flex items-center justify-center text-center w-20 h-10 lg:w-24 bg-primary 
                border-8bit-primary text-2xs lg:text-xs active:opacity-75
                ${miscState.disableButtons == 'gameroom' ? 'saturate-0' : ''} ${miscState.language == 'indonesia' ? 'py-1' : ''}`} 
                id="back_to_room" href={miscState.disableButtons == 'gameroom' ? '#' : '/room'} 
                onClick={spectatorLeave} draggable={false}>
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
                {gameState.gameRoomId ? <GameInfo roomId={gameState.gameRoomId} /> : null}
                {/* game history */}
                <div ref={gameHistoryRef} className={`relative top-10 lg:top-36 text-2xs lg:text-xs
                ${gameState.showGameHistory || miscState.showTutorial == 'tutorial_gameroom_3' ? 'visible' : 'invisible'} `}>
                    <PlayerSettingGameHistory />
                </div>
            </div>
            
            {/* middle side */}
            {/* tutorial: relative z-10 */}
            <section className={`${miscState.showTutorial == 'tutorial_gameroom_2' ? 'relative z-10' : ''}
            col-span-10 grid grid-rows-6 gap-8 justify-center
            h-[calc(100vh-3.75rem)] scale-90 -mt-2`}>
                {/* board */}
                {gameState.gameRoomId
                    ? <>
                        {gameState.gameRoomInfo.map((v, i) => {
                            return v.room_id === gameState.gameRoomId 
                                ? v.board == 'normal'
                                    ? <BoardNormal key={i} /> 
                                    : miscState.showTutorial == 'tutorial_gameroom_2' 
                                        ? <BoardNormal key={i} /> 
                                        : <BoardTwoway key={i} />
                                : null
                        })}
                    </>
                    : null
                }
                {/* game buttons */
                gameState.spectator || miscState.showTutorial == 'tutorial_gameroom_2'
                    ? null
                    : <div className="absolute top-[45%] w-full text-2xs lg:text-xs">
                        <GameButtons />
                    </div>
                }
                {/* game notif + roll number + minigame */}
                <div className={`${gameState.showGameNotif || gameState.showMiniGame || gameState.rollNumber ? 'block' : 'hidden'} 
                absolute h-full w-full text-center text-2xs lg:text-xs`}>
                    {gameState.rollNumber ? <RollNumber roomId={gameState.gameRoomId} /> : null}
                    <GameNotif />
                    <MiniGame />
                </div>
            </section>

            {/* right side | help, player, chat buttons */}
            {/* tutorial: relative z-10 */}
            <div ref={gameSideButtonRef} className={`${miscState.showTutorial == 'tutorial_gameroom_1' ? 'z-10' : ''}
            absolute top-[20vh] right-[calc(0rem+1rem)]     flex items-center [writing-mode:vertical-lr] 
            text-center text-2xs lg:text-sm     h-60 lg:h-96 w-6 lg:w-8
            bg-darkblue-1 border-8bit-text`}>
                {/* help */}
                <div className="h-20 lg:h-32 p-1">
                    <SideButtons text={'help'} setGameSideButton={gameState.setGameSideButton} />
                    <HelpSection />
                </div>
                {/* player */}
                <div id="player_side_button" className="h-20 lg:h-32 p-1">
                    <SideButtons text={'players'} setGameSideButton={gameState.setGameSideButton} />
                    <PlayerSection />
                </div>
                {/* chat */}
                <div className="h-20 lg:h-32 p-1">
                    <SideButtons text={'chat'} setGameSideButton={gameState.setGameSideButton} />
                    {!gameState.gameRoomId ? null : 
                    <div className={`${gameState.gameSideButton == 'chat' ? 'block' : 'hidden'}
                    absolute top-[0vh] right-[calc(0rem+2.25rem)] lg:right-[calc(0rem+2.75rem)] 
                    text-left [writing-mode:horizontal-tb] p-1 
                    bg-darkblue-1 border-8bit-text w-[30vw] h-[calc(100%-1rem)]`}>
                        <ChatBox page="game" pubnubSetting={pubnubSetting} />
                        <GameroomChatForm id={gameState.gameRoomId} />
                    </div>}
                </div>
            </div>

            {/* tutorial */}
            <div className={`${miscState.showTutorial ? 'block' : 'hidden'} 
            absolute mt-1.5 bg-black/75 h-[calc(100vh-4rem)] w-[calc(100vw-1rem)] leading-6 lg:leading-8`}>
                <TutorialGameRoom />
            </div>

            {/* game sounds */}
            <GameSounds />
            {/* card images */}
            <PreloadCardImages />
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

function GameroomChatForm({ id }: {id: number}) {
    const miscState = useMisc()
    const gameState = useGame()

    // chat emotes ref
    const chatEmotesRef = useRef()
    clickInsideElement(chatEmotesRef, () => miscState.showEmotes ? miscState.setShowEmotes(false) : null)

    const scrollToBottom = () => {
        const chatContainer = qS('#chat_container')
        if(chatContainer) chatContainer.scrollTo({top: chatContainer.scrollHeight})
    }
    
    return (
        <form className="absolute bottom-0 flex items-center justify-center gap-2 w-full" 
        onSubmit={ev => sendChat(ev, miscState, gameState, id)}>
            {/* input chat */}
            <input type="text" id="message_text" className="w-4/5 lg:h-10 lg:p-1" minLength={1} maxLength={80}
            placeholder={translateUI({lang: miscState.language, text: 'chat here'})} autoComplete="off" required 
            onFocus={() => scrollToBottom()}/>
            {/* emote list */}
            {miscState.showEmotes ? <ChatEmotes isGameRoom={true} /> : null}
            {/* emote button */}
            <button ref={chatEmotesRef} type="button" className="w-6 h-6 lg:w-10 lg:h-10 active:opacity-50" onClick={() => miscState.setShowEmotes(true)}>
                <img src="https://img.icons8.com/?size=100&id=120044&format=png&color=FFFFFF" alt="emot" draggable={false} />
            </button>
            {/* submit chat */}
            <button type="submit" className="w-6 h-6 lg:w-10 lg:h-10 active:opacity-50">
                <img src="https://img.icons8.com/?size=100&id=2837&format=png&color=FFFFFF" alt="send" draggable={false} />
            </button>
        </form>
    )
} 