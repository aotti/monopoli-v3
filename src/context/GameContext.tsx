"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IGameContext } from "../helper/types";

const GameContext = createContext<IGameContext>(null)

export const GameProvider = ({ children }: {children: React.ReactNode}) => {
    // board
    const [showTileImage, setShowTileImage] = useState<IGameContext['showTileImage']>(null)
    // side buttons
    const [gameSideButton, setGameSideButton] = useState<IGameContext['gameSideButton']>(null)
    const [openPlayerSetting, setOpenPlayerSetting] = useState(false)
    const [displaySettingItem, setDisplaySettingItem] = useState<IGameContext['displaySettingItem']>(null)
    const [showGameHistory, setShowGameHistory] = useState(false)

    const states: IGameContext = {
        // board
        showTileImage: showTileImage,
        setShowTileImage: setShowTileImage,
        // side buttons
        gameSideButton: gameSideButton,
        setGameSideButton: setGameSideButton,
        openPlayerSetting: openPlayerSetting,
        setOpenPlayerSetting: setOpenPlayerSetting,
        displaySettingItem: displaySettingItem,
        setDisplaySettingItem: setDisplaySettingItem,
        showGameHistory: showGameHistory,
        setShowGameHistory: setShowGameHistory,
    }

    return (
        <GameContext.Provider value={states}>
            {children}
        </GameContext.Provider>
    )
}

export const useGame = () => useContext(GameContext)