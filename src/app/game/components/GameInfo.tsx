import { useMisc } from "../../../context/MiscContext";
import { translateUI } from "../../../helper/helper";

export default function GameInfo() {
    const miscState = useMisc()

    return (
        <div className="flex flex-col gap-2 text-2xs lg:text-xs">
            {/* name */}
            <div>
                <span className="text-green-400"> lele gaming </span>
            </div>
            {/* player */}
            <div>
                <span> {translateUI({lang: miscState.language, text: 'players'})}: </span>
                <span className="text-green-400"> 1/4 </span>
            </div>
            {/* mode */}
            <div>
                <span> mode: </span>
                <span className="text-green-400"> survive </span>
            </div>
            {/* creator */}
            <div>
                <span> {translateUI({lang: miscState.language, text: 'Creator', lowercase: true})}: </span>
                <span className="text-green-400"> dengkul </span>
            </div>
        </div>
    )
}