import { useMisc } from "../context/MiscContext";
import { translateUI } from "../helper/helper";

export default function ScreenPortraitWarning() {
    const miscState = useMisc()

    return (
        <div className={`${miscState.screenType == 'portrait' ? 'block' : 'hidden'} absolute z-10 top-0 bg-black/50 h-screen w-screen`}>
            <div className="flex items-center justify-center h-full">
                <p className="text-center !text-lg bg-red-600 p-2">
                    <span> {translateUI({lang: miscState.language, text: 'Please rotate your screen to landscape'})}</span>
                    <img src="https://img.icons8.com/?id=11409&format=png&color=FFFFFF" alt="rotate screen" className="!inline-block !w-10 !h-10 animate-rotate-screen" />
                </p>
            </div>
        </div>
    )
}