import { useMisc } from "../context/MiscContext"
import { useEffect, useState } from "react"
import { applyTooltip, qSA } from "../helper/helper"
import Credit from "./Credit"

export default function HeaderContent() {
    const miscState = useMisc()
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
            {/* credit button & modal */}
            <Credit />
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