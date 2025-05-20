import { useEffect } from "react"
import { useMisc } from "../context/MiscContext"
import { applyTooltipEvent } from "../helper/helper"

export default function LanguageButton() {
    const miscState = useMisc()
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    return (
        <div data-tooltip={miscState.language == 'english' ? '🇬🇧  inggris' : '🇮🇩 indonesia'}>
            <button type="button" id="translate" className="active:opacity-75 hover:animate-pulse"
            onClick={() => miscState.setLanguage(lang => {
                const chosenLang = lang == 'english' ? 'indonesia' : 'english'
                // save the language in localstorage
                localStorage.setItem('language', chosenLang)
                return chosenLang
            })}>
                <img src="https://img.icons8.com/?id=12455&format=png&color=FFFFFF" alt="lang" className="!w-8 !h-8 lg:!w-10 lg:!h-10" draggable={false} />
            </button>
        </div>
    )
}