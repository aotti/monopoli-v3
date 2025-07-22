import { useEffect } from "react"
import { useMisc } from "../context/MiscContext"
import { applyTooltipEvent, fetcher, fetcherOptions, qS } from "../helper/helper"
import { IMiscContext, IResponse } from "../helper/types"

export default function LanguageButton() {
    const miscState = useMisc()
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])

    return (
        <div data-tooltip={miscState.language == 'english' ? '🇬🇧  inggris' : '🇮🇩 indonesia'}>
            <button type="button" id="translate" className="active:opacity-75 hover:animate-pulse"
            onClick={() => handleSetLanguage(miscState)}>
                <img src="https://img.icons8.com/?id=12455&format=png&color=FFFFFF" alt="lang" className="!w-8 !h-8 lg:!w-10 lg:!h-10" draggable={false} />
            </button>
        </div>
    )
}

async function handleSetLanguage(miscState: IMiscContext) {
    const translateButton = qS('#translate') as HTMLButtonElement

    const chosenLang = miscState.language == 'english' ? 'indonesia' : 'english'
    const inputValues = {
        language: chosenLang
    }
    const languageFetchOptions = fetcherOptions({method: 'POST', body: JSON.stringify(inputValues)})
    const languageResponse: IResponse = await (await fetcher('/player/language', languageFetchOptions)).json()
    // response
    switch(languageResponse.status) {
        case 200:
            // set new language
            miscState.setLanguage(chosenLang)
            // show green on success
            translateButton.classList.add('bg-green-400')
            setTimeout(() => translateButton.classList.remove('bg-green-400'), 1500);
            return
        default:
            // show red on error
            translateButton.classList.add('bg-red-400')
            setTimeout(() => translateButton.classList.remove('bg-red-400'), 1500);
            return
    }
}