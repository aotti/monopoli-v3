"use client"

import HeaderContent from "../../components/HeaderContent"
import HomeContent from "../home/HomeContent"
import ScreenPortraitWarning from "../../components/ScreenPortraitWarning"
import { useMisc } from "../../context/MiscContext"
import LoadingPage from "../../components/LoadingPage"
import { useGame } from "../../context/GameContext"
import { useEffect } from "react"
import { checkAccessToken, generateIdentifier, qS, resetAllData } from "../../helper/helper"
import Link from "next/link"

export default function HomePage({ isRefreshTokenExist }) {
    const miscState = useMisc()
    const gameState = useGame()

    useEffect(() => {
        // create identifier
        generateIdentifier()
        // check token for auto login
        if(miscState.secret) checkAccessToken(miscState, gameState)
        // navigate to room list
        if(isRefreshTokenExist) {
            const gotoRoom = qS('#gotoRoom') as HTMLAnchorElement
            gotoRoom.click()
        }
    }, [miscState.secret])

    return (
        <div className="text-white text-xs lg:text-sm">
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 h-screen w-screen">
                <header>
                    <HeaderContent />
                </header>
    
                <main>
                    {miscState.isLoading 
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