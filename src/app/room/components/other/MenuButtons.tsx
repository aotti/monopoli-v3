import Image from "next/image"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"
import { viewRanking } from "../../helper/functions"


export function MenuButton() {
    const miscState = useMisc()
    const gameState = useGame()
    const warningClass = `after:content-['!'] after:bg-red-600 after:p-1 after:rounded-full`

    return (
        <div data-tooltip="menu" className={`w-8 my-auto text-right`}>
            <button type="button" className={`invert active:opacity-75 ${gameState.dailyStatus == 'unclaim' ? `after:absolute after:-top-1 after:invert ${warningClass}` : ''}`} onClick={() => miscState.setShowRoomListMenu(true)}>
                <img src="https://img.icons8.com/?id=95245&format=png" alt="📅" width={100} height={100} draggable={false} />
            </button>
        </div>
    )
}

export function RankingButton() {
    const miscState = useMisc()
    const gameState = useGame()
    
    return (
        <div className="my-auto text-right hover:bg-darkblue-2 active:bg-darkblue-2">
            <button type="button" className="flex items-center gap-2 w-full" onClick={() => {
                // close join modal
                miscState.setShowJoinModal(null)
                // close room list menu
                miscState.setShowRoomListMenu(false)
                // to give zoom-in animate class
                miscState.setAnimation(true); 
                // show the modal
                miscState.setShowModal('ranking') 
                // get ranking
                viewRanking(miscState, gameState)
            }}>
                <Image src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/ranking-Yc5GX4VNppg95sUkXKFSGlOzl6Go1M.png" alt="👑" className="!w-8 !h-8" width={100} height={100} draggable={false} />
                <span> 
                    {translateUI({lang: miscState.language, text: 'Ranking', lowercase: true})} 
                </span>
            </button>
        </div>
    )
}

export function ShopButton() {
    const miscState = useMisc()

    return (
        <div className="my-auto text-right hover:bg-darkblue-2 active:bg-darkblue-2">
            <button type="button" className="flex items-center gap-2 w-full" onClick={() => {
                // close join modal
                miscState.setShowJoinModal(null)
                // close room list menu
                miscState.setShowRoomListMenu(false)
                // to give zoom-in animate class
                miscState.setAnimation(true); 
                // show the modal
                miscState.setShowModal('shop') 
            }}>
                <Image src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/shop-yaqaJRoTr9t5BE1HgvxQsjdILEHdRD.png" alt="🛍" className="!w-8 !h-8" width={100} height={100} draggable={false} />
                <span> 
                    {translateUI({lang: miscState.language, text: 'Shop', lowercase: true})} 
                </span>
            </button>
        </div>
    )
}

export function DailyButton() {
    const miscState = useMisc()
    const gameState = useGame()
    const warningClass = `after:content-['!'] after:bg-red-600 after:p-1 after:rounded-full`

    return (
        <div className="my-auto text-right hover:bg-darkblue-2 active:bg-darkblue-2">
            <button type="button" className={`flex items-center gap-2 w-full ${gameState.dailyStatus == 'unclaim' ? `${warningClass}` : ''}`} onClick={() => {
                // close join modal 
                miscState.setShowJoinModal(null)
                // close room list menu
                miscState.setShowRoomListMenu(false)
                // to give zoom-in animate class
                miscState.setAnimation(true); 
                // show the modal
                miscState.setShowModal('daily') 
            }}>
                <Image src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/daily-vmA8mjz1RYqrYPLL51jci2QoxxF29l.png" alt="📅" className="!w-8 !h-8" width={100} height={100} draggable={false} />
                <span> 
                    {translateUI({lang: miscState.language, text: 'Daily', lowercase: true})} 
                </span>
            </button>
        </div>
    )
}