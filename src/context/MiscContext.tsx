"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { IChat, IMiscContext, IMiscProvider, ITranslate } from "../helper/types";
import { translateUI } from "../helper/helper";

const MiscContext = createContext<IMiscContext>(null)

export const MiscProvider = ({ accessSecret, savedLanguage, children }: IMiscProvider) => {
    const [screenType, setScreenType] = useState<'landscape'|'portrait'>(null)
    const [language, setLanguage] = useState<ITranslate['lang']>(savedLanguage || 'english')
    const [showModal, setShowModal] = useState<IMiscContext['showModal']>(null)
    const [showJoinModal, setShowJoinModal] = useState<string>(null)
    const [animation, setAnimation] = useState<boolean>(true)
    // used to make chat box stay open (room list)
    const [isChatFocus, setIsChatFocus] = useState<IMiscContext['isChatFocus']>('on')
    const [showTutorial, setShowTutorial] = useState<IMiscContext['showTutorial']>(null)
    // access token secret
    const [secret, setSecret] = useState<string>(accessSecret)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [disableButtons, setDisableButtons] = useState<'roomlist'|'gameroom'>(null)
    // message items
    const [messageItems, setMessageItems] = useState<Omit<IChat, 'channel'|'token'>[]>(() => {
        const systemMessage: Omit<IChat, 'channel'|'token'> = {
            display_name: 'system',
            message_text: 'only player in this room can see the chat',
            message_time: new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})
        }
        systemMessage.message_text = translateUI({lang: language, text: 'only player in this room can see the chat'})
        return [systemMessage]
    })
    // emotes
    const [showEmotes, setShowEmotes] = useState(false)
    // room list menu
    const [showRoomListMenu, setShowRoomListMenu] = useState(false)

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
    }, [])

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
        disableButtons, setDisableButtons,
        showEmotes, setShowEmotes,
        showRoomListMenu, setShowRoomListMenu,
    }

    return (
        <MiscContext.Provider value={states}>
            {children}
        </MiscContext.Provider>
    )
}

export const useMisc = () => useContext(MiscContext)