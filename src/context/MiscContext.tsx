"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IMiscContext, ITranslate } from "../helper/types";

const MiscContext = createContext<IMiscContext>(null)

export const MiscProvider = ({ children }: {children: React.ReactNode}) => {
    const [language, setLanguage] = useState<ITranslate['lang']>('english')
    const [hoverTooltip, setHoverTooltip] = useState<string>(null)
    const [animation, setAnimation] = useState<boolean>(true)

    useEffect(() => {
        // get language setting
        const storedLanguage = localStorage.getItem('language') as ITranslate['lang']
        setLanguage(storedLanguage)
    }, [])

    const states: IMiscContext = {
        language: language,
        setLanguage: setLanguage,
        hoverTooltip: hoverTooltip,
        setHoverTooltip: setHoverTooltip,
        animation: animation,
        setAnimation: setAnimation,
    }

    return (
        <MiscContext.Provider value={states}>
            {children}
        </MiscContext.Provider>
    )
}

export const useMisc = () => useContext(MiscContext)