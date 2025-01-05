import { useMisc } from "../context/MiscContext";

export default function ScreenPortraitWarning() {
    const miscState = useMisc()

    return (
        <div className={`${miscState.screenType == 'portrait' ? 'block' : 'hidden'} absolute z-10 top-0 bg-black/50 h-screen w-screen`}>
            <div className="flex items-center justify-center h-full">
                <p className="text-center !text-lg bg-red-600 p-2"> Please rotate your screen to landscape then reload the page 🙏 </p>
            </div>
        </div>
    )
}