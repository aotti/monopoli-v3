"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IMiscContext, ITranslate } from "../helper/types";

const MiscContext = createContext<IMiscContext>(null)

export const MiscProvider = ({ children }: {children: React.ReactNode}) => {
    const [language, setLanguage] = useState<ITranslate['lang']>('english')
    const [showModal, setShowModal] = useState<IMiscContext['showModal']>(null)
    const [hoverTooltip, setHoverTooltip] = useState<string>(null)
    const [animation, setAnimation] = useState<boolean>(true)
    const [isChatFocus, setIsChatFocus] = useState<boolean>(false)

    useEffect(() => {
        // get language setting
        const storedLanguage = localStorage.getItem('language') as ITranslate['lang']
        setLanguage(storedLanguage)
    }, [])

    const states: IMiscContext = {
        language: language,
        setLanguage: setLanguage,
        showModal: showModal,
        setShowModal: setShowModal,
        hoverTooltip: hoverTooltip,
        setHoverTooltip: setHoverTooltip,
        animation: animation,
        setAnimation: setAnimation,
        isChatFocus: isChatFocus,
        setIsChatFocus: setIsChatFocus,
    }

    return (
        <MiscContext.Provider value={states}>
            {children}
        </MiscContext.Provider>
    )
}

export const useMisc = () => useContext(MiscContext)