import { useEffect, useState } from "react";

export default function ScreenPortraitWarning() {
    const [screenType, setScreenType] = useState<'landscape'|'portrait'>(null)
    // check screen orientation
    useEffect(() => {
        const displayOrientation = () => {
            const screenOrientation = screen.orientation.type;
            if (screenOrientation === "landscape-primary" || screenOrientation === "landscape-secondary") {
                console.log("That looks good.");
                setScreenType('landscape')
            } 
            else if (screenOrientation === "portrait-secondary" || screenOrientation === "portrait-primary") {
                console.log("Mmmh... you should rotate your device to landscape");
                setScreenType('portrait')
            } 
            else if (screenOrientation === undefined) {
                console.log("The orientation API isn't supported in this browser :(");
                setScreenType(null)
            }
        }
        // detect screen event
        if (screen && screen.orientation !== null) {
            try {
                window.screen.orientation.onchange = displayOrientation;
                displayOrientation();
            }
            catch (e) { console.log(e.message) }
        }
    }, [])

    return (
        <div className={`${screenType && screenType == 'portrait' ? 'block' : 'hidden'} absolute z-10 top-0 bg-black/50 h-screen w-screen`}>
            <div className="flex items-center justify-center h-full">
                <p className="text-center !text-lg bg-red-600 p-2"> Please rotate your screen to landscape then reload the page 🙏 </p>
            </div>
        </div>
    )
}