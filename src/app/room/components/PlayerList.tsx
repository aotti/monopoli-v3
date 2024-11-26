import { useMisc } from "../../../context/MiscContext";
import { translateUI } from "../../../helper/helper";
import { ILoggedUsers } from "../../../helper/types";

export default function PlayerList({ onlinePlayers }: {onlinePlayers: ILoggedUsers[]}) {
    const miscState = useMisc()

    return (
        <div className="flex flex-col gap-2 h-4/5 p-1 overflow-y-scroll border-b-2">
            {/* player */}
            {onlinePlayers.map((v, i) => 
                <div key={i} className="flex items-center justify-between mx-2">
                    <span> {v.display_name} </span>
                    <div>
                        <button type="button" className="bg-primary border-8bit-primary"> 
                            {translateUI({lang: miscState.language, text: 'view'})} 
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}