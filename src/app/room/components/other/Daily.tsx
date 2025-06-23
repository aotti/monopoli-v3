import { FormEvent, useEffect, useRef } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { applyTooltipEvent, translateUI } from "../../../../helper/helper"
import daily_rewards from "../../config/daily-rewards.json"

export default function Daily() {
    const miscState = useMisc()
    const gameState = useGame()

    const currentWeek = 1
    const dailyRewards = daily_rewards.data
    const rewardDummy = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return (
        <div className={`relative z-20 bg-darkblue-3 border-8bit-modal w-[60vw] lg:w-[50vw]
        ${miscState.showModal == 'daily' ? 'block' : 'hidden'} 
        ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'}`}>
            {/* head */}
            <div className="flex justify-center border-b-2">
                <span> daily login </span>
            </div>
            {/* body */}
            <div className="grid grid-cols-7 gap-[5.5rem] lg:gap-5 px-1 py-2 text-center text-2xs overflow-x-auto">
                {dailyRewards.map(v => {
                    return v.week === currentWeek
                        ? v.list.map((reward, i) => {
                            const rewardData = {
                                day: v.days[i],
                                name: reward.name,
                                type: reward.type,
                                items: reward.items
                            }

                            return <RewardItem key={i} rewardData={rewardData} />
                        })
                    : null
                })}
                    
            </div>
            {/* footer */}
            <div className="flex justify-around border-t-2">
                <button type="button" className="text-red-300 p-1 active:opacity-75 hover:animate-jump" onClick={() => { 
                    // set false to give zoom-out animate class
                    miscState.setAnimation(false); 
                    // timeout to wait the animation zoom-out
                    setTimeout(() => miscState.setShowModal(null), 200) 
                }}> 
                    {translateUI({lang: miscState.language, text: 'Close'})} 
                </button>
            </div>
        </div>
    )
}

function RewardItem({ rewardData }) {
    const {day, name, type, items} = rewardData
    const today = new Date().toLocaleString([], {weekday: 'long'})
    const rewardImg = 'https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=FFFFFF'
    const itemsTooltip = type == 'pack' ? items.join('\n') : null
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])
    // button ref
    const claimButtonRef = useRef<HTMLButtonElement>()
    // daily event handler
    const claimDaily = (ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault()
        alert(`claim daily ${name}`)
    }

    return (
        <form className="relative flex flex-col gap-2" onSubmit={ev => claimDaily(ev)}>
            <div data-tooltip={itemsTooltip} className={`flex flex-col items-center w-20 h-20 rounded-lg p-1 
            ${today === day ?  'bg-success' : 'bg-darkblue-2'} cursor-pointer hover:bg-opacity-75`} 
            onClick={() => claimButtonRef.current.click()}>
                <span> {day} </span>
                <img src={rewardImg} alt={name} className="inline !w-8 !h-8" draggable={false} />
                <span> {name} </span>
            </div>
            <div className="text-[10px] w-20">
                <button ref={claimButtonRef} type="submit" className="w-full"> claim </button>
            </div>
        </form>
    )
}