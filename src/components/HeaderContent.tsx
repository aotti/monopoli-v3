import { useMisc } from "../context/MiscContext"
import { useEffect, useState } from "react"
import { applyTooltip, qSA } from "../helper/helper"

export default function HeaderContent() {
    const miscState = useMisc()
    // credit state
    const [showCredit, setShowCredit] = useState(false)
    // tooltip (the element must have position: relative)
    useEffect(() => {
        qSA('[data-tooltip]').forEach((el: HTMLElement) => {
            // mouse event
            el.onpointerover = ev => applyTooltip(ev as any)
            el.onpointerout = ev => applyTooltip(ev as any)
            // touch event
            el.ontouchstart = ev => applyTooltip(ev as any)
            el.ontouchend = ev => applyTooltip(ev as any)
        })
    }, [])

    return (
        // height 3rem, padding .25rem
        <nav className="flex justify-center h-10 lg:h-12 p-1 border-b-2">
            {/* credit button */}
            <div className="absolute top-2 left-4">
                <button type="button" className="bg-darkblue-1 border-8bit-text" onClick={() => setShowCredit(true)}> 
                    credit 
                </button>
            </div>
            {/* credit modal */}
            <div className={`absolute z-10 bg-black/30 
            ${showCredit ? 'flex' : 'hidden'} items-center justify-center
            h-[calc(100vh-1rem)] w-[calc(100vw-1rem)]`}>
                <div className="flex flex-col gap-2 justify-center bg-darkblue-1 border-8bit-text p-2">
                    {/* head */}
                    <div className="text-center border-b-2">
                        <span> credit </span>
                    </div>
                    {/* body */}
                    <div className="flex flex-col gap-2 justify-center text-green-400 w-96">
                        <p className="flex justify-between">
                            <span> aotti </span>
                            <span className="border-b-4 border-dotted border-green-400 grow -mt-1 mx-2"></span>
                            <span> programming </span>
                        </p>
                        <p className="flex justify-between">
                            <span> C4pung </span>
                            <span className="border-b-4 border-dotted border-green-400 grow -mt-1 mx-2"></span>
                            <span> sprite </span>
                        </p>
                        <div className="text-center">
                            <button type="button" className="text-white p-2" onClick={() => setShowCredit(false)}> Close </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* title */}
            <span className="font-semibold text-base lg:text-xl"> Monopoli Lemao </span>
            {/* translate button */}
            <div data-tooltip={miscState.language == 'english' ? '🇮🇩 indonesia' : '🇬🇧  inggris'} 
            className="absolute top-2 w-8 lg:w-10 right-4">
                <button type="button" id="translate" 
                onClick={() => miscState.setLanguage(lang => {
                    const chosenLang = lang == 'english' ? 'indonesia' : 'english'
                    // save the language in localstorage
                    localStorage.setItem('language', chosenLang)
                    return chosenLang
                })}>
                    <img src="https://img.icons8.com/?id=12455&format=png&color=FFFFFF" alt="lang" draggable={false} />
                </button>
            </div>
        </nav>
    )
}