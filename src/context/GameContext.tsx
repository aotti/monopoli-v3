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
    const [dailyStatus, setDailyStatus] = useState<'claimed'|'unclaim'>(null)
    const [lastDailyStatus, setLastDailyStatus] = useState<string>(null)
    const [dailyHistory, setDailyHistory] = useState<IGameContext['dailyHistory']>(null)
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
    const [diceMode, setDiceMode] = useState<IGameContext['diceMode']>('off')
    const [gameHistory, setGameHistory] = useState<IGameContext['gameHistory']>([])
    // shop
    const [myCoins, setMyCoins] = useState(0)
    const [myShopItems, setMyShopItems] = useState<IGameContext['myShopItems']>(null)

    useEffect(() => {
        // set online players if exist
        const getOnlinePlayers = localStorage.getItem('onlinePlayers')
        if(getOnlinePlayers) setOnlinePlayers(JSON.parse(getOnlinePlayers))
        // set my coins if exist
        const getPlayerCoins = localStorage.getItem('playerCoins')
        if(getPlayerCoins) setMyCoins(+getPlayerCoins)
        // set my shop items if exist
        const getPlayerShopItems = localStorage.getItem('playerShopItems')
        if(getPlayerShopItems) setMyShopItems(JSON.parse(getPlayerShopItems))
        // set daily states
        const getPlayerDailyStatus = localStorage.getItem('dailyStatus')
        if(getPlayerDailyStatus) setDailyStatus(getPlayerDailyStatus as any)
        const getPlayerDailyHistory = localStorage.getItem('dailyHistory')
        if(getPlayerDailyHistory) setDailyHistory(JSON.parse(getPlayerDailyHistory))
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
        rankingInfo, setRankingInfo,
        myCoins, setMyCoins,
        myShopItems, setMyShopItems,
        dailyStatus, setDailyStatus,
        lastDailyStatus, setLastDailyStatus,
        dailyHistory, setDailyHistory,
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
        diceMode, setDiceMode,
        gameHistory, setGameHistory,
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