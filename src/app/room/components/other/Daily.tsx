import { MouseEvent, useEffect, useRef } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { applyTooltipEvent, translateUI } from "../../../../helper/helper"
import daily_rewards from "../../config/daily-rewards.json"
import { claimDaily } from "../../helper/functions"

export default function Daily() {
    const miscState = useMisc()
    const gameState = useGame()

    const dailyRewards = daily_rewards.data
    // ### JIKA lastDailyStatus = 1-1 (Monday-1) LALU PLAYER LOGIN LAGI Monday
    // ### MAKA DIANGGAP Monday-8 (week 2)
    // ### TAPI, JIKA PLAYER LOGIN Tuesday WALAUPUN SUDAH MASUK week 2
    // ### AKAN DIANGGAP Tuesday-2 (week 1)
    const today = new Date().toLocaleString([], {weekday: 'long'})
    const dayOfWeek = {
        week_1: ['Monday-1', 'Tuesday-2', 'Wednesday-3', 'Thursday-4', 'Friday-5', 'Saturday-6', 'Sunday-7'],
        week_2: ['Monday-8', 'Tuesday-9', 'Wednesday-10', 'Thursday-11', 'Friday-12', 'Saturday-13', 'Sunday-14'],
    }
    const [lastDayNumber, lastWeekNumber] = gameState.lastDailyStatus 
                                        ? gameState.lastDailyStatus.split('-')
                                        : ['1', '1']
    // get day number
    const currentDayNumber = dayOfWeek.week_1.map(v => v.match(today) ? v.split('-')[1] : null).filter(i => i)[0]
    // if today > last day, then continue last week reward
    // else assume its week 2 reward
    const currentWeek = +lastDayNumber < +currentDayNumber ? +lastWeekNumber : 2
    
    const convertDate = (rewardDate: string) => {
        const [day, date] = rewardDate.split(', ')
        const newDate = new Date(date).toLocaleString('id', {day: 'numeric', month: 'numeric', year: 'numeric'})
        return `${day}, ${newDate}`
    }

    // drag scroll
    const dailyRewardsBody = useRef<HTMLDivElement>()
    let mouseDown = false;
    let startX, scrollLeft;
    
    const startDragging = (ev: MouseEvent<HTMLDivElement & MouseEvent>) => {
        mouseDown = true;
        startX = ev.pageX - dailyRewardsBody.current.offsetLeft;
        scrollLeft = dailyRewardsBody.current.scrollLeft;
    }
    const stopDragging = () => {
        mouseDown = false;
    }
    const move = (ev: MouseEvent<HTMLDivElement & MouseEvent>) => {
        ev.preventDefault();
        if(!mouseDown) { return; }
        const x = ev.pageX - dailyRewardsBody.current.offsetLeft;
        const scroll = x - startX;
        dailyRewardsBody.current.scrollLeft = scrollLeft - scroll;
    }

    return (
        <div className={`relative z-20 bg-darkblue-3 border-8bit-modal w-[60vw] lg:w-[50vw]
        ${miscState.showModal == 'daily' ? 'block' : 'hidden'} 
        ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'}`}>
            {/* head */}
            <div className="flex justify-center border-b-2">
                <span> daily rewards </span>
            </div>
            {/* body rewards */}
            <div ref={dailyRewardsBody} className="grid grid-cols-7 gap-[5.5rem] lg:gap-5 px-1 py-2 text-center text-2xs overflow-x-scroll lg:overflow-x-hidden select-none"
            onMouseDown={startDragging} onMouseMove={move} onMouseUp={stopDragging} onMouseLeave={stopDragging}>
                {dailyRewards.map(v => {
                    return v.week === currentWeek
                        ? v.list.map((reward, i) => {
                            const rewardData = {
                                week: v.week,
                                day: v.days[i],
                                name: reward.name,
                                type: reward.type,
                                items: reward.items
                            }

                            return <RewardItem key={i} rewardData={rewardData} />
                        })
                        : null
                })}
                {/* notif */}
                <div className="absolute w-[calc(60vw-1rem)] lg:w-[calc(50vw-1rem)] h-20">
                    <div className="flex items-center justify-center h-full">
                        <p id="result_daily" className="hidden relative z-10 border-8bit-text bg-darkblue-1 text-center p-1"></p>
                    </div>
                </div>
                {/* roll prize */}
                <div id="roll_pack" className="hidden absolute z-10 items-center justify-center w-[calc(60vw-.5rem)] lg:w-[calc(50vw-.5rem)] h-32 bg-black/50">
                    <div className="flex flex-col gap-1 border-8bit-text bg-darkblue-1 text-center p-1">
                        <span> roll pack </span>
                        <div className="slot relative z-10 text-[10px] lg:text-xs p-1 w-48 lg:w-48 h-6 lg:h-6 bg-darkblue-2 overflow-y-hidden border-2"></div>
                    </div>
                </div>
            </div>
            {/* body history */}
            <div className="flex flex-col">
                <p className="text-center"> history </p>
                <div className="grid grid-cols-4 h-[calc(25vh)] p-1 text-2xs lg:text-xs overflow-y-scroll">
                    <div className="flex flex-col gap-2">
                        <span className="text-orange-300 border-b"> type </span>
                        {gameState.dailyHistory 
                            ? gameState.dailyHistory.map((v,i) => <span key={i}> {v.reward_type} </span>)
                            : null}
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-orange-300 border-b"> item </span>
                        {gameState.dailyHistory 
                            ? gameState.dailyHistory.map((v,i) => <span key={i}> {v.reward_item} </span>)
                            : null}
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                        <span className="text-orange-300 border-b"> date </span>
                        {gameState.dailyHistory 
                            ? gameState.dailyHistory.map((v,i) => <span key={i}> {convertDate(v.reward_date)} </span>)
                            : null}
                    </div>
                </div>
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
    const miscState = useMisc()
    const gameState = useGame()

    const {week, day, name, type, items} = rewardData
    const today = new Date().toLocaleString([], {weekday: 'long'})
    const rewardImg = `https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=${today == day ? '000000' : 'FFFFFF'}`
    const itemsTooltip = type == 'pack' ? items.join('\n') : null

    // element refs
    const claimButtonRef = useRef<HTMLButtonElement>()
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    return (
        <form className="relative z-10 flex flex-col gap-2" onSubmit={ev => claimDaily(ev, rewardData, miscState, gameState)}>
            {/* reward item */}
            <div data-tooltip={itemsTooltip} className={`flex flex-col items-center w-20 h-20 rounded-lg p-1 
            ${today === day ?  'bg-success' : 'bg-darkblue-2'} cursor-pointer hover:bg-opacity-75`} 
            onClick={() => claimButtonRef.current.click()}>
                <span className={today === day ?  'text-black' : ''}> {day} </span>
                <img id={`reward_${day}`} src={rewardImg} alt={name} className="inline !w-8 !h-8" draggable={false} />
                <span className={today === day ?  'text-black' : ''}> {name} </span>
            </div>
            {/* claim button */}
            <div className={`${today === day && gameState.dailyStatus == 'unclaim' ?  'text-green-300' : 'invisible'} text-[10px] w-20`}>
                <button ref={claimButtonRef} id="daily_claim_button" type="submit" className="w-full">
                    {today === day ?  'claim' : ''}
                </button>
            </div>
        </form>
    )
}