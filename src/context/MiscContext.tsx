"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IMiscContext, IMiscProvider, ITranslate } from "../helper/types";

const MiscContext = createContext<IMiscContext>(null)

export const MiscProvider = ({ accessSecret, pubnubSubSetting, children }: IMiscProvider) => {
    const [language, setLanguage] = useState<ITranslate['lang']>('english')
    const [showModal, setShowModal] = useState<IMiscContext['showModal']>(null)
    const [animation, setAnimation] = useState<boolean>(true)
    const [isChatFocus, setIsChatFocus] = useState<IMiscContext['isChatFocus']>('off')
    const [showTutorial, setShowTutorial] = useState<IMiscContext['showTutorial']>(null)
    const [secret, setSecret] = useState<string>(accessSecret)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [pubnubSub, setPubnubSub] = useState(pubnubSubSetting)

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
        animation: animation,
        setAnimation: setAnimation,
        isChatFocus: isChatFocus,
        setIsChatFocus: setIsChatFocus,
        showTutorial: showTutorial,
        setShowTutorial: setShowTutorial,
        secret: secret,
        setSecret: setSecret,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
        pubnubSub: pubnubSub,
        setPubnubSub: setPubnubSub,
    }

    return (
        <MiscContext.Provider value={states}>
            {children}
        </MiscContext.Provider>
    )
}

export const useMisc = () => useContext(MiscContext)