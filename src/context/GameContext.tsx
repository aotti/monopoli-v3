"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IGameContext } from "../helper/types";

const GameContext = createContext<IGameContext>(null)

export const GameProvider = ({ children }: {children: React.ReactNode}) => {
    const [gameSideButton, setGameSideButton] = useState<IGameContext['gameSideButton']>(null)

    const states: IGameContext = {
        gameSideButton: gameSideButton,
        setGameSideButton: setGameSideButton
    }

    return (
        <GameContext.Provider value={states}>
            {children}
        </GameContext.Provider>
    )
}

export const useGame = () => useContext(GameContext)