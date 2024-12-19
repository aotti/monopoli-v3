import { useEffect, useRef, useState } from "react"
import { useGame } from "../../context/GameContext"
import { useMisc } from "../../context/MiscContext"
import { applyTooltipEvent, fetcher, fetcherOptions, qS, translateUI } from "../../helper/helper"
import BoardNormal from "./components/board/BoardNormal"
import BoardDelta from "./components/board/BoardDelta"
import BoardTwoWay from "./components/board/BoardTwoWay"
import GameInfo from "./components/board/GameInfo"
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
import PubNub, { Listener } from "pubnub"
import { GameRoomListener, IChat, IGameContext, IMiscContext, IResponse } from "../../helper/types"

export default function GameContent({ pubnubSetting }) {
    const miscState = useMisc()
    const gameState = useGame()
    
    // click outside element
    const gameSideButtonRef = useRef()
    clickOutsideElement(gameSideButtonRef, () => gameState.setGameSideButton(null))
    // game history ref
    const gameHistoryRef = useRef()
    clickOutsideElement(gameHistoryRef, () => gameState.setShowGameHistory(false))
    // return spectator to false
    const spectatorLeave = () => {
        gameState.setSpectator(false)
        // hide tutorial
        miscState.setShowTutorial(null)
    }

    // pubnub
    const pubnubClient = new PubNub(pubnubSetting)
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()

        // get player list
        const gameroomParam = +location.search.match(/id=\d+$/)[0].split('=')[1]
        getPlayerInfo(gameroomParam, miscState, gameState)

        gameState.setGameRoomId(gameroomParam)
        // pubnub channels
        const gameroomChannel = `monopoli-gameroom-${gameroomParam}`
        // subscribe
        pubnubClient.subscribe({ 
            channels: [gameroomChannel] 
        })
        // get published message
        const publishedMessage: Listener = {
            message: (data) => {
                const getMessage = data.message as PubNub.Payload & IChat & GameRoomListener
                // add chat
                const soundMessageNotif = qS('#sound_message_notif') as HTMLAudioElement
                if(getMessage.message_text) {
                    const chatData: Omit<IChat, 'channel'|'token'> = {
                        display_name: getMessage.display_name,
                        message_text: getMessage.message_text,
                        message_time: getMessage.message_time
                    }
                    miscState.setMessageItems(data => [...data, chatData])
                    // play notif sound
                    if(getMessage.display_name != gameState.myPlayerInfo.display_name) 
                        soundMessageNotif.play()
                }
                // join
                if(getMessage.joinPlayer) {
                    gameState.setGamePlayerInfo(players => [...players, getMessage.joinPlayer])
                }
                // leave
                if(getMessage.leavePlayer) {
                    gameState.setGamePlayerInfo(players => {
                        const playersLeft = [...players]
                        // remove player
                        const findLeavePlayer = playersLeft.map(v => v.display_name).indexOf(getMessage.leavePlayer)
                        playersLeft.splice(findLeavePlayer, 1)
                        return playersLeft
                    })
                }
                const playerTurnNotif = qS('#player_turn_notif')
                // ready
                if(getMessage.readyPlayers) {
                    // set players ready text
                    playerTurnNotif.textContent = `${getMessage.readyPlayers.length} player(s) ready`
                    // if > 2 players ready, set notif
                    if(getMessage.readyPlayers.length >= 2) {
                        const notifTitle = qS('#result_notif_title')
                        const notifMessage = qS('#result_notif_message')
                        // show notif
                        miscState.setAnimation(true)
                        gameState.setShowGameNotif('normal')
                        notifTitle.textContent = translateUI({lang: miscState.language, text: 'Preparation'})
                        notifMessage.textContent = translateUI({lang: miscState.language, text: 'if all players are ready, room creator have to click the "start" button'})
                    }
                }
                // start
                if(getMessage.startGame) {
                    // change game stage
                    gameState.setGameStages('decide')
                    // set fixed player number
                    gameState.setGameFixedPlayers(getMessage.fixedPlayers)
                    // remove players ready text
                    playerTurnNotif.textContent = translateUI({lang: miscState.language, text: 'click roll turn'})
                }
                // decide
                if(getMessage.decidePlayers) {
                    // display rolled number
                    const decidePlayersRank = []
                    for(let dp of getMessage.decidePlayers) 
                        decidePlayersRank.push(`${dp.rolled_number} - ${dp.display_name}`)
                    playerTurnNotif.textContent = decidePlayersRank.join('\n')
                }
            }
        }
        pubnubClient.addListener(publishedMessage)
        // unsub and remove listener
        return () => {
            pubnubClient.unsubscribe({ 
                channels: [gameroomChannel] 
            })
            pubnubClient.removeListener(publishedMessage)
        }
    }, [])

    return (
        <div className="grid grid-cols-12 h-[calc(100vh-3.75rem)]">
            {/* left side | back button, game info, game history */}
            {/* tutorial: relative z-10 */}
            <div className={`${miscState.showTutorial == 'tutorial_gameroom_3' ? 'relative z-10' : ''}
            flex flex-col gap-2 lg:gap-6 mt-6 mx-2 w-24 lg:w-36 h-[calc(100%-5rem)]`}>
                <Link href={'/room'} className={`flex items-center justify-center text-center w-20 h-10 lg:w-24 bg-primary
                border-8bit-primary text-2xs lg:text-xs active:opacity-75 ${miscState.language == 'indonesia' ? 'py-1' : ''}`} 
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
                {
                    gameState.gameRoomId
                        ? <>
                            <BoardNormal />
                            {/* <BoardDelta /> */}
                            {/* <BoardTwoWay /> */}
                        </>
                        : null
                }
                {/* game buttons */
                gameState.spectator
                    ? null
                    : <div className="absolute top-[45%] w-full text-2xs lg:text-xs">
                        <GameButtons />
                    </div>
                }
                {/* game notif + roll number */}
                <div className={`${gameState.showGameNotif || gameState.rollNumber ? 'block' : 'hidden'} 
                absolute h-full w-full text-center text-2xs lg:text-xs`}>
                    {
                        gameState.rollNumber
                            ? <RollNumber roomId={gameState.gameRoomId} />
                            : null
                    }
                    <GameNotif />
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
                    <ChatBox page="game" id={gameState.gameRoomId} />
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

async function getPlayerInfo(roomId: number, miscState: IMiscContext, gameState: IGameContext) {
    // result message
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    const playerTurnNotif = qS('#player_turn_notif')
    // fetch
    const getPlayerFetchOptions = fetcherOptions({method: 'GET', credentials: true, noCache: true})
    const getPlayerResponse: IResponse = await (await fetcher(`/game?id=${roomId}`, getPlayerFetchOptions)).json()
    // response
    switch(getPlayerResponse.status) {
        case 200: 
            // set player list
            gameState.setGamePlayerInfo(getPlayerResponse.data[0].getPlayers)
            // set decide players
            if(getPlayerResponse.data[0]?.decidePlayers) {
                // disable roll turn button
                const rollTurnButton = qS('#roll_turn_button') as HTMLInputElement
                // change game stage
                gameState.setGameStages('decide')
                // set fixed players
                gameState.setGameFixedPlayers(getPlayerResponse.data[0].preparePlayers.length)
                // display rolled number
                const decidePlayersRank = []
                for(let dp of getPlayerResponse.data[0]?.decidePlayers) {
                    decidePlayersRank.push(`${dp.rolled_number} - ${dp.display_name}`)
                    // check if player have rolled
                    if(dp.display_name == gameState.myPlayerInfo.display_name) {
                        rollTurnButton.disabled = true
                        rollTurnButton.className = 'min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0'
                    }
                }
                playerTurnNotif.textContent = decidePlayersRank.join('\n')
                return
            }
            // set prepare players
            else if(getPlayerResponse.data[0]?.preparePlayers) {
                const playerTurnNotif = qS('#player_turn_notif')
                playerTurnNotif.textContent = `${getPlayerResponse.data[0].preparePlayers.length} player(s) ready`
                // if > 2 players ready, set notif
                if(getPlayerResponse.data[0].preparePlayers.length >= 2) {
                    // show notif
                    miscState.setAnimation(true)
                    gameState.setShowGameNotif('normal')
                    notifTitle.textContent = translateUI({lang: miscState.language, text: 'Preparation'})
                    notifMessage.textContent = translateUI({lang: miscState.language, text: 'if all players are ready, room creator have to click the "start" button'})
                }
                // change to start button (for creator)
                const readyButton = qS('#ready_button') as HTMLInputElement
                const findCreator = gameState.gameRoomInfo.map(v => v.creator).indexOf(gameState.myPlayerInfo?.display_name)
                if(readyButton && findCreator !== -1) {
                    readyButton.id = 'start_button'
                    readyButton.textContent = translateUI({lang: miscState.language, text: 'start'})
                    return
                }
                // disable button if ready is clicked (for other)
                const isReadyClicked = getPlayerResponse.data[0]?.preparePlayers.indexOf(gameState.myPlayerInfo?.display_name)
                if(readyButton && isReadyClicked !== -1) {
                    readyButton.disabled = true
                    readyButton.className = 'min-w-20 bg-primary border-8bit-primary active:opacity-75 saturate-0'
                    return
                }
            }
            return
        default: 
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            // error message
            notifTitle.textContent = `error ${getPlayerResponse.status}`
            notifMessage.textContent = `${getPlayerResponse.message}`
            return
    }
}