import { useMisc } from "../context/MiscContext";
import { translateUI } from "../helper/helper";

export default function ScreenPortraitWarning() {
    const miscState = useMisc()

    return (
        <div className={`${miscState.screenType == 'portrait' ? 'block' : 'hidden'} absolute z-10 top-0 bg-black/50 h-screen w-screen`}>
            <div className="flex items-center justify-center h-full">
                <p className="text-center !text-lg bg-red-600 p-2">
                    {translateUI({
                        lang: miscState.language, 
                        text: 'Please rotate your screen to landscape 🙏'
                    })}
                </p>
            </div>
        </div>
    )
}