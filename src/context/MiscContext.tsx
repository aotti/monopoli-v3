"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IChat, IMiscContext, IMiscProvider, ITranslate } from "../helper/types";
import { translateUI } from "../helper/helper";

const MiscContext = createContext<IMiscContext>(null)

export const MiscProvider = ({ accessSecret, children }: IMiscProvider) => {
    const [screenType, setScreenType] = useState<'landscape'|'portrait'>(null)
    const [language, setLanguage] = useState<ITranslate['lang']>('english')
    const [showModal, setShowModal] = useState<IMiscContext['showModal']>(null)
    const [showJoinModal, setShowJoinModal] = useState<string>(null)
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
        const displayOrientation = () => {
            const screenOrientation = screen.orientation.type;
            if (screenOrientation === "landscape-primary" || screenOrientation === "landscape-secondary") {
                console.log("That looks good.");
                setScreenType('landscape')
            } 
            else if (screenOrientation === "portrait-secondary" || screenOrientation === "portrait-primary") {
                console.log("Mmmh... you should rotate your device to landscape");
                setScreenType('portrait')
            } 
            else if (screenOrientation === undefined) {
                console.log("The orientation API isn't supported in this browser :(");
                setScreenType('portrait')
            }
        }
        // detect screen event
        if (screen && screen.orientation !== null) {
            try {
                window.screen.orientation.onchange = displayOrientation;
                displayOrientation();
            }
            catch (e) { console.log(e.message) }
        }
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
        language, setLanguage,
        showModal, setShowModal,
        animation, setAnimation,
        isChatFocus, setIsChatFocus,
        showTutorial, setShowTutorial,
        secret, setSecret,
        isLoading, setIsLoading,
        messageItems, setMessageItems,
        screenType, setScreenType,
        showJoinModal, setShowJoinModal,
    }

    return (
        <MiscContext.Provider value={states}>
            {children}
        </MiscContext.Provider>
    )
}

export const useMisc = () => useContext(MiscContext)