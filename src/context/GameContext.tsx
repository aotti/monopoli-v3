"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IGameContext, ILoggedUsers, IPlayer } from "../helper/types";

const GameContext = createContext<IGameContext>(null)

export const GameProvider = ({ children }: {children: React.ReactNode}) => {
    // board
    const [showTileImage, setShowTileImage] = useState<IGameContext['showTileImage']>(null)
    const [showNotif, setShowNotif] = useState<IGameContext['showNotif']>(null)
    const [rollNumber, setRollNumber] = useState<IGameContext['rollNumber']>(null)
    // side buttons
    const [gameSideButton, setGameSideButton] = useState<IGameContext['gameSideButton']>(null)
    const [openPlayerSetting, setOpenPlayerSetting] = useState(false)
    const [displaySettingItem, setDisplaySettingItem] = useState<IGameContext['displaySettingItem']>(null)
    const [showGameHistory, setShowGameHistory] = useState(false)
    // player
    const [myPlayerInfo, setMyPlayerInfo] = useState<IPlayer>(null)
    const [otherPlayerInfo, setOtherPlayerInfo] = useState<IPlayer>(null)
    const [onlinePlayers, setOnlinePlayers] = useState<ILoggedUsers[]>(null)

    useEffect(() => {
        // set online players if exist
        const getOnlinePlayers = localStorage.getItem('onlinePlayers')
        if(getOnlinePlayers) setOnlinePlayers(JSON.parse(getOnlinePlayers))
    }, [])

    const states: IGameContext = {
        // board
        showTileImage: showTileImage,
        setShowTileImage: setShowTileImage,
        showNotif: showNotif,
        setShowNotif: setShowNotif,
        rollNumber: rollNumber,
        setRollNumber: setRollNumber,
        // side buttons
        gameSideButton: gameSideButton,
        setGameSideButton: setGameSideButton,
        openPlayerSetting: openPlayerSetting,
        setOpenPlayerSetting: setOpenPlayerSetting,
        displaySettingItem: displaySettingItem,
        setDisplaySettingItem: setDisplaySettingItem,
        showGameHistory: showGameHistory,
        setShowGameHistory: setShowGameHistory,
        // player
        myPlayerInfo: myPlayerInfo,
        setMyPlayerInfo: setMyPlayerInfo,
        otherPlayerInfo: otherPlayerInfo,
        setOtherPlayerInfo: setOtherPlayerInfo,
        onlinePlayers: onlinePlayers,
        setOnlinePlayers: setOnlinePlayers,
    }

    return (
        <GameContext.Provider value={states}>
            {children}
        </GameContext.Provider>
    )
}

export const useGame = () => useContext(GameContext)