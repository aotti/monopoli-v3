import { useMisc } from "../../../context/MiscContext";
import { translateUI } from "../../../helper/helper";

export default function PlayerList() {
    const miscState = useMisc()

    return (
        <div className="flex flex-col gap-2 h-4/5 p-1 overflow-y-scroll border-b-2">
            {/* player */}
            <div className="flex items-center justify-between mx-2">
                <span> dengkul </span>
                <div>
                    <button type="button" className="bg-primary border-8bit-primary"> 
                        {translateUI({lang: miscState.language, text: 'view'})} 
                    </button>
                </div>
            </div>
            {/* player */}
            <div className="flex items-center justify-between mx-2">
                <span> lemao pisan </span>
                <div>
                    <button type="button" className="bg-primary border-8bit-primary"> 
                        {translateUI({lang: miscState.language, text: 'view'})} 
                    </button>
                </div>
            </div>
            {/* player */}
            <div className="flex items-center justify-between mx-2">
                <span> yugo oniichan </span>
                <div>
                    <button type="button" className="bg-primary border-8bit-primary"> 
                        {translateUI({lang: miscState.language, text: 'view'})} 
                    </button>
                </div>
            </div>
            {/* player */}
            <div className="flex items-center justify-between mx-2">
                <span> wawan </span>
                <div>
                    <button type="button" className="bg-primary border-8bit-primary"> 
                        {translateUI({lang: miscState.language, text: 'view'})} 
                    </button>
                </div>
            </div>
        </div>
    )
}