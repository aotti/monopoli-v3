"use client"

import HeaderContent from "../../components/HeaderContent";
import ScreenPortraitWarning from "../../components/ScreenPortraitWarning";
import RoomContent from "./RoomContent";
import LoadingPage from "../../components/LoadingPage";
import { useGame } from "../../context/GameContext";
import { useEffect } from "react";
import { useMisc } from "../../context/MiscContext";
import { checkAccessToken, qS } from "../../helper/helper";
import Link from "next/link";

export default function RoomPage({ pubnubSetting }) {
    const miscState = useMisc()
    const gameState = useGame()
    
    useEffect(() => {
        // back to home
        if(!gameState.myPlayerInfo || !gameState.onlinePlayers) {
            const gotoHome = qS('#gotoHome') as HTMLAnchorElement
            gotoHome.click()
        }
        // check token for auto login
        if(miscState.secret) checkAccessToken(miscState, gameState)
    }, [miscState.secret])
    
    return (
        <div className="text-white text-xs lg:text-sm">
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 h-screen w-screen">
                <header>
                    <HeaderContent />
                </header>
    
                <main>
                    {gameState.myPlayerInfo && gameState.onlinePlayers
                        ? <RoomContent pubnubSetting={pubnubSetting} />
                        : <LoadingPage />}
                </main>
            </div>
            {/* orientation portrait warning */}
            <ScreenPortraitWarning />
            <Link id="gotoHome" href={'/'} hidden={true}></Link>
        </div>
    )
}