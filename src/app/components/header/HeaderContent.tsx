import { useContext, useState } from "react"
import { MiscContext } from "../../context/MiscContext"
import Tooltip from "../Tooltip"
import { ITooltip } from "../../helper/types"

export default function HeaderContent() {
    const { language, setLanguage } = useContext(MiscContext)
    const [onHover, setOnHover] = useState(false)
    // tooltip pos
    const tooltipOptions: ITooltip = {
        key: '#translate',
        text: language == 'english' ? '🇮🇩 indonesia' : '🇬🇧  inggris',
        pos: 'left',
        arrow: ['right', 'start']
    }

    return (
        // height 3rem, padding .25rem
        <nav className="flex justify-center h-12 p-1 border-b-2">
            {/* title */}
            <span className="font-semibold text-lg lg:text-xl"> Monopoli Lemao </span>
            {/* translate button */}
            <div className="absolute top-2 w-10 right-4">
                <button type="button" id="translate" onMouseOver={() => setOnHover(true)} onMouseOut={() => setOnHover(false)}
                    onClick={() => setLanguage(lang => lang == 'english' ? 'indonesia' : 'english') }>
                    <img src="https://img.icons8.com/?id=12455&format=png&color=FFFFFF" alt="lang" />
                </button>
                {
                    onHover
                        ? <Tooltip options={tooltipOptions} />
                        : null
                }
            </div>
        </nav>
    )
}