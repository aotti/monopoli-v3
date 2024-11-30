"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IChat, IMiscContext, IMiscProvider, ITranslate } from "../helper/types";
import { translateUI } from "../helper/helper";

const MiscContext = createContext<IMiscContext>(null)

export const MiscProvider = ({ accessSecret, pubnubSubSetting, children }: IMiscProvider) => {
    const [language, setLanguage] = useState<ITranslate['lang']>('english')
    const [showModal, setShowModal] = useState<IMiscContext['showModal']>(null)
    const [animation, setAnimation] = useState<boolean>(true)
    const [isChatFocus, setIsChatFocus] = useState<IMiscContext['isChatFocus']>('off')
    const [showTutorial, setShowTutorial] = useState<IMiscContext['showTutorial']>(null)
    const [secret, setSecret] = useState<string>(accessSecret)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    // pubnub setting
    const [pubnubSub, setPubnubSub] = useState(pubnubSubSetting)
    // message items
    const systemMessage = {
        display_name: 'system',
        message_text: translateUI({lang: language, text: 'only player in this room can see the chat'}),
        time: new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})
    }
    const [messageItems, setMessageItems] = useState<Omit<IChat, 'channel'|'token'>[]>([systemMessage])

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
        messageItems: messageItems,
        setMessageItems: setMessageItems,
    }

    return (
        <MiscContext.Provider value={states}>
            {children}
        </MiscContext.Provider>
    )
}

export const useMisc = () => useContext(MiscContext)