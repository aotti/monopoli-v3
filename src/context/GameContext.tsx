"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IGameContext, ILoggedUsers, IPlayer } from "../helper/types";

const GameContext = createContext<IGameContext>(null)

export const GameProvider = ({ children }: {children: React.ReactNode}) => {
    // board
    const [showTileImage, setShowTileImage] = useState<IGameContext['showTileImage']>(null)
    const [showGameNotif, setShowGameNotif] = useState<IGameContext['showGameNotif']>(null)
    const [rollNumber, setRollNumber] = useState<IGameContext['rollNumber']>(null)
    // side buttons
    const [gameSideButton, setGameSideButton] = useState<IGameContext['gameSideButton']>(null)
    const [openPlayerSetting, setOpenPlayerSetting] = useState(false)
    const [displaySettingItem, setDisplaySettingItem] = useState<IGameContext['displaySettingItem']>(null)
    const [showGameHistory, setShowGameHistory] = useState(false)
    // player
    const [myPlayerInfo, setMyPlayerInfo] = useState<IPlayer>(null)
    const [otherPlayerInfo, setOtherPlayerInfo] = useState<IPlayer>(null)
    const [onlinePlayers, setOnlinePlayers] = useState<ILoggedUsers[]>([])
    const [spectator, setSpectator] = useState(false)
    // room
    const [roomList, setRoomList] = useState([])
    const [roomError, setRoomError] = useState<string>(null)
    const [roomInputPassword, setRoomInputPassword] = useState<string>(null)
    // game
    const [myCurrentGame, setMyCurrentGame] = useState<number>(null)
    const [gameRoomId, setGameRoomId] = useState<number>(null)
    const [gameRoomInfo, setGameRoomInfo] = useState<IGameContext['gameRoomInfo']>([])
    const [gamePlayerInfo, setGamePlayerInfo] = useState<IGameContext['gamePlayerInfo']>([])
    const [gameStages, setGameStages] = useState<IGameContext['gameStages']>('prepare')
    const [gamePlayerTurns, setGamePlayerTurns] = useState<string[]>([])
    const [gameHistory, setGameHistory] = useState<IGameContext['gameHistory']>([])

    useEffect(() => {
        // set online players if exist
        const getOnlinePlayers = localStorage.getItem('onlinePlayers')
        if(getOnlinePlayers) setOnlinePlayers(JSON.parse(getOnlinePlayers))
    }, [])

    const boardStates = {
        showTileImage, setShowTileImage,
        showGameNotif, setShowGameNotif,
        rollNumber, setRollNumber,
    }
    
    const sideButtonStates = {
        gameSideButton: gameSideButton,
        setGameSideButton: setGameSideButton,
        openPlayerSetting: openPlayerSetting,
        setOpenPlayerSetting: setOpenPlayerSetting,
        displaySettingItem: displaySettingItem,
        setDisplaySettingItem: setDisplaySettingItem,
        showGameHistory: showGameHistory,
        setShowGameHistory: setShowGameHistory,
    }

    const playerStates = {
        myPlayerInfo: myPlayerInfo,
        setMyPlayerInfo: setMyPlayerInfo,
        otherPlayerInfo: otherPlayerInfo,
        setOtherPlayerInfo: setOtherPlayerInfo,
        onlinePlayers: onlinePlayers,
        setOnlinePlayers: setOnlinePlayers,
        spectator: spectator,
        setSpectator: setSpectator,
    }

    const roomStates = {
        roomList, setRoomList,
        roomError, setRoomError,
        roomInputPassword, setRoomInputPassword,
    }

    const gameStates = {
        myCurrentGame, setMyCurrentGame,
        gameRoomId, setGameRoomId,
        gameRoomInfo, setGameRoomInfo,
        gamePlayerInfo, setGamePlayerInfo,
        gameStages, setGameStages,
        gamePlayerTurns, setGamePlayerTurns,
        gameHistory, setGameHistory
    }

    const states: IGameContext = {
        // board
        ...boardStates,
        // side buttons
        ...sideButtonStates,
        // player
        ...playerStates,
        // room
        ...roomStates,
        // game
        ...gameStates
    }

    return (
        <GameContext.Provider value={states}>
            {children}
        </GameContext.Provider>
    )
}

export const useGame = () => useContext(GameContext)