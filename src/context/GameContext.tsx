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
    const [expandGameHistory, setExpandGameHistory] = useState(false)
    // player
    const [myPlayerInfo, setMyPlayerInfo] = useState<IPlayer>({
        display_name: 'guest',
        game_played: 0,
        worst_money_lost: 0,
        avatar: null
    })
    const [otherPlayerInfo, setOtherPlayerInfo] = useState<IPlayer>(null)
    const [guestMode, setGuestMode] = useState(true)
    const [onlinePlayers, setOnlinePlayers] = useState<ILoggedUsers[]>([])
    const [spectator, setSpectator] = useState(false)
    const [rankingInfo, setRankingInfo] = useState<IGameContext['rankingInfo']>([])
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
    const [gameQuakeCity, setGameQuakeCity] = useState<string[]>([])
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
        gameSideButton, setGameSideButton,
        openPlayerSetting, setOpenPlayerSetting,
        displaySettingItem, setDisplaySettingItem,
        showGameHistory, setShowGameHistory,
        expandGameHistory, setExpandGameHistory
    }

    const playerStates = {
        myPlayerInfo, setMyPlayerInfo,
        otherPlayerInfo, setOtherPlayerInfo,
        guestMode, setGuestMode,
        onlinePlayers, setOnlinePlayers,
        spectator, setSpectator,
        rankingInfo, setRankingInfo
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
        gameQuakeCity, setGameQuakeCity,
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