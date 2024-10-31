import Tooltip from "./Tooltip"
import { ITooltip } from "../helper/types"
import { useMisc } from "../context/MiscContext"

export default function HeaderContent() {
    const miscState = useMisc()
    // tooltip pos
    const translateTooltip: ITooltip = {
        key: '#translate',
        text: miscState.language == 'english' ? '🇮🇩 indonesia' : '🇬🇧  inggris',
        pos: 'left',
        arrow: ['right', 'start']
    }

    return (
        // height 3rem, padding .25rem
        <nav className="flex justify-center h-10 lg:h-12 p-1 border-b-2">
            {/* title */}
            <span className="font-semibold text-base lg:text-xl"> Monopoli Lemao </span>
            {/* translate button */}
            <div className="absolute top-2 w-8 lg:w-10 right-4">
                <button type="button" id="translate" 
                onTouchStart={() => miscState.setHoverTooltip(`${translateTooltip.key.substring(1)}`)}
                onTouchEnd={() => miscState.setHoverTooltip(null)}
                onMouseOver={() => miscState.setHoverTooltip(`${translateTooltip.key.substring(1)}`)} 
                onMouseOut={() => miscState.setHoverTooltip(null)}
                onClick={() => miscState.setLanguage(lang => {
                    const chosenLang = lang == 'english' ? 'indonesia' : 'english'
                    // save the language in localstorage
                    localStorage.setItem('language', chosenLang)
                    return chosenLang
                })}>
                    <img src="https://img.icons8.com/?id=12455&format=png&color=FFFFFF" alt="lang" />
                </button>
                {
                    miscState.hoverTooltip == 'translate'
                        ? <Tooltip options={translateTooltip} />
                        : null
                }
            </div>
        </nav>
    )
}