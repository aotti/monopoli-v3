import { FormEvent, FunctionComponent, MouseEvent, MutableRefObject, useEffect, useRef } from "react"
import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { applyTooltipEvent, qS, translateUI } from "../../../../helper/helper"
import daily_rewards from "../../config/daily-rewards.json"
import anime from "animejs"
import { startAnimation } from "../../../game/components/board/RollNumber"

export default function Daily() {
    const miscState = useMisc()
    const gameState = useGame()

    const currentWeek = 1
    const dailyRewards = daily_rewards.data
    const rewardDummy = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
            {/* body */}
            <div ref={dailyRewardsBody} className="grid grid-cols-7 gap-[5.5rem] lg:gap-5 px-1 py-2 text-center text-2xs overflow-x-hidden select-none"
            onMouseDown={startDragging} onMouseMove={move} onMouseUp={stopDragging} onMouseLeave={stopDragging}>
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
                {/* notif */}
                <div className="absolute w-[calc(60vw-1rem)] lg:w-[calc(50vw-1rem)] h-20">
                    <div className="flex items-center justify-center h-full">
                        <p id="result_shop" className="hidden relative z-10 border-8bit-text bg-darkblue-1 text-center p-1"></p>
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

interface IAnimate {
    targets: string | Element,
    translateX?: number | any[],
    translateY?: number | any[],
    scaleX?: number | any[],
    scaleY?: number | any[],
    opacity?: number[],
    backgroundColor?: string,
    rotate?: string | any[],
    duration?: number,
    easing?: 'easeInOutSine'|'linear',
    direction?: 'normal'|'reverse'|'alternate',
    delay?: number,
    loop?: boolean,
}
function RewardItem({ rewardData }) {
    const miscState = useMisc()
    const gameState = useGame()

    const {day, name, type, items} = rewardData
    const today = new Date().toLocaleString([], {weekday: 'long'})
    const rewardImg = `https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=${today == day ? '000000' : 'FFFFFF'}`
    const itemsTooltip = type == 'pack' ? items.join('\n') : null

    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])
    // claim animation
    const rewardImgRef = useRef<HTMLImageElement>(null)
    const claimAnimation = () => {
        return new Promise(resolve => {
            const animate: FunctionComponent<IAnimate> = anime
            const rotateValue = rewardImgRef.current.style.transform.match('360deg') ? 0 : 360

            animate({
                targets: rewardImgRef.current,
                // Properti yang dianimasikan
                translateY: [
                    { value: -10, duration: 300, easing: 'easeOutQuad' }, // Lompat ke atas (y negatif)
                    { value: 0, duration: 600, easing: 'easeOutBounce', delay: 100 } // Jatuh kembali (y nol)
                ],
                // spin animation
                rotate: [
                    {value: rotateValue, duration: 500, easing: 'linear'},
                ],
                // Animasi tambahan untuk efek squish (optional, tapi membuat lebih hidup)
                scaleY: [
                    { value: 0.6, duration: 100, easing: 'easeOutQuad' }, // Sedikit memendek sebelum melompat
                    { value: 1.2, duration: 200, easing: 'easeOutQuad' }, // Sedikit memanjang saat di udara
                    { value: 1, duration: 300, easing: 'easeOutBounce', delay: 200 } // Kembali normal saat mendarat
                ]
            })
            setTimeout(() => resolve(true), 1000);
        })
    } 
    // button ref
    const claimButtonRef = useRef<HTMLButtonElement>()
    // daily event handler
    const claimDaily = async (ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault()
        // if type is pack, start roll animation
        if(type == 'pack') {
            const rollPack = qS('#roll_pack')
            rollPack.classList.toggle('flex')
            rollPack.classList.toggle('hidden')
            startAnimation(items, miscState, gameState)
            setTimeout(() => {
                rollPack.classList.toggle('flex')
                rollPack.classList.toggle('hidden')
            }, 5000);
        }
        // start animation
        await claimAnimation()
    }

    return (
        <form className="relative z-10 flex flex-col gap-2" onSubmit={ev => claimDaily(ev)}>
            <div data-tooltip={itemsTooltip} className={`flex flex-col items-center w-20 h-20 rounded-lg p-1 
            ${today === day ?  'bg-success' : 'bg-darkblue-2'} cursor-pointer hover:bg-opacity-75`} 
            onClick={() => claimButtonRef.current.click()}>
                <span className={today === day ?  'text-black' : ''}> {day} </span>
                <img ref={rewardImgRef} id={`reward_${day}`} src={rewardImg} alt={name} className="inline !w-8 !h-8" draggable={false} />
                <span className={today === day ?  'text-black' : ''}> {name} </span>
            </div>
            <div className={`${today === day ?  'text-green-300' : ''} text-[10px] w-20`}>
                <button ref={claimButtonRef} type="submit" className="w-full">
                    {today === day ?  'claim' : ''}
                </button>
            </div>
        </form>
    )
}