"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IChat, IMiscContext, IMiscProvider, ITranslate } from "../helper/types";
import { translateUI } from "../helper/helper";

const MiscContext = createContext<IMiscContext>(null)

export const MiscProvider = ({ accessSecret, children }: IMiscProvider) => {
    const [language, setLanguage] = useState<ITranslate['lang']>('english')
    const [showModal, setShowModal] = useState<IMiscContext['showModal']>(null)
    const [animation, setAnimation] = useState<boolean>(true)
    const [isChatFocus, setIsChatFocus] = useState<IMiscContext['isChatFocus']>('on')
    const [showTutorial, setShowTutorial] = useState<IMiscContext['showTutorial']>(null)
    const [secret, setSecret] = useState<string>(accessSecret)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    // message items
    const systemMessage: Omit<IChat, 'channel'|'token'> = {
        display_name: 'system',
        message_text: 'only player in this room can see the chat',
        message_time: new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})
    }
    const [messageItems, setMessageItems] = useState<Omit<IChat, 'channel'|'token'>[]>([])

    useEffect(() => {
        // get language setting
        const storedLanguage = localStorage.getItem('language') as ITranslate['lang']
        setLanguage(storedLanguage)
        // system message
        if(language == storedLanguage) {
            systemMessage.message_text = translateUI({lang: language, text: 'only player in this room can see the chat'})
            setMessageItems(data => [...data, systemMessage])
        }
    }, [language])

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