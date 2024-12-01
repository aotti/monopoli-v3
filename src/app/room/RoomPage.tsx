"use client"

import HeaderContent from "../../components/HeaderContent";
import ScreenPortraitWarning from "../../components/ScreenPortraitWarning";
import { Press_Start_2P } from "next/font/google"
import RoomContent from "./RoomContent";
import LoadingPage from "../../components/LoadingPage";
import { useGame } from "../../context/GameContext";
import { useEffect } from "react";
import { useMisc } from "../../context/MiscContext";
import { checkAccessToken } from "../../helper/helper";
import Pubnub from "pubnub";
import { PubNubProvider } from "pubnub-react";

const retroFont = Press_Start_2P({
    subsets: ['latin'],
    weight: ['400']
})

export default function RoomPage({ pubnubSetting }) {
    const miscState = useMisc()
    const gameState = useGame()

    // pubnub
    const pubnubClient = new Pubnub(pubnubSetting)
    
    // check token for auto login
    useEffect(() => {
        if(miscState.secret) checkAccessToken(miscState, gameState)
    }, [miscState.secret])
    
    return (
        <div className={`${retroFont.className} text-white text-xs lg:text-sm`}>
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 h-screen w-screen">
                <header>
                    <HeaderContent />
                </header>
    
                <PubNubProvider client={pubnubClient}>
                    <main>
                        {gameState.myPlayerInfo && gameState.onlinePlayers
                            ? <RoomContent />
                            : <LoadingPage />}
                    </main>
                </PubNubProvider>
            </div>
            {/* orientation portrait warning */}
            <ScreenPortraitWarning />
        </div>
    )
}