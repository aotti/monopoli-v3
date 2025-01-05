"use client"

import { useEffect } from "react";
import HeaderContent from "../../components/HeaderContent";
import ScreenPortraitWarning from "../../components/ScreenPortraitWarning";
import { useGame } from "../../context/GameContext";
import GameContent from "./GameContent";
import { qS } from "../../helper/helper";
import Link from "next/link";
import LoadingPage from "../../components/LoadingPage";

export default function GamePage({ pubnubSetting }) {
    const gameState = useGame()
    
    // navigate to room list, if no data
    useEffect(() => {
        const gotoRoom = qS('#gotoRoom') as HTMLAnchorElement
        // game room data exist
        if(gameState.gameRoomInfo.length > 0)  {
            // if the data is not match with room id, back to room list
            const gameroomParam = +location.search.match(/id=\d+$/)[0].split('=')[1]
            const isGameInfoMatch = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameroomParam)
            if(isGameInfoMatch === -1) gotoRoom.click()
        }
        // game room data is empty
        else gotoRoom.click()
    }, [gameState.gameRoomInfo])

    return (
        <div className="text-white text-xs lg:text-sm">
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 h-screen w-screen">
                <header>
                    <HeaderContent />
                </header>
    
                <main>
                    {gameState.gameRoomInfo
                        ? <GameContent pubnubSetting={pubnubSetting} />
                        : <LoadingPage />}
                </main>
            </div>
            {/* orientation portrait warning */}
            <ScreenPortraitWarning />
            <Link id="gotoRoom" href={'/room'} hidden={true}></Link>
        </div>
    )
}