"use client"

import { Press_Start_2P } from "next/font/google"
import HeaderContent from "../../components/HeaderContent"
import HomeContent from "../home/HomeContent"
import ScreenPortraitWarning from "../../components/ScreenPortraitWarning"
import { useMisc } from "../../context/MiscContext"
import LoadingPage from "../../components/LoadingPage"
import { useGame } from "../../context/GameContext"
import { useEffect } from "react"
import { checkAccessToken, qS } from "../../helper/helper"
import Link from "next/link"

const retroFont = Press_Start_2P({
    subsets: ['latin'],
    weight: ['400']
})

export default function HomePage() {
    const miscState = useMisc()
    const gameState = useGame()

    useEffect(() => {
        const resetData = location.search.match('reset=true')
        if(resetData) {
            // remove local storages
            localStorage.removeItem('accessToken')
            localStorage.removeItem('onlinePlayers')
        }
        // check token for auto login
        if(miscState.secret) checkAccessToken(miscState, gameState)
    }, [miscState.secret])

    // navigate to room list
    useEffect(() => {
        if(gameState.onlinePlayers) {
            const gotoRoom = qS('#gotoRoom') as HTMLAnchorElement
            gotoRoom.click()
        }
    }, [gameState.onlinePlayers])

    return (
        <div className={`${retroFont.className} text-white text-xs lg:text-sm`}>
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 h-screen w-screen">
                <header>
                    <HeaderContent />
                </header>
    
                <main>
                    {miscState.isLoading 
                    ? <LoadingPage />
                    : gameState.myPlayerInfo && gameState.onlinePlayers
                        ? <LoadingPage />
                        : <HomeContent />}
                </main>
            </div>
            {/* orientation portrait warning */}
            <ScreenPortraitWarning />
            <Link id="gotoRoom" href={'/room'} hidden={true}></Link>
        </div>
    )
}