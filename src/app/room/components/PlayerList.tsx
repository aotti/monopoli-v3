import { useMisc } from "../../../context/MiscContext";
import { translateUI } from "../../../helper/helper";
import { ILoggedUsers } from "../../../helper/types";
import { useGame } from "../../../context/GameContext";
import { viewPlayerStats } from "../helper/functions";

export default function PlayerList({ onlinePlayers }: {onlinePlayers: ILoggedUsers[]}) {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className="flex flex-col gap-2 h-4/5 p-1 overflow-y-scroll border-b-2">
            {/* player */}
            {onlinePlayers.map((v, i) => 
                <form key={i} className="flex justify-between" onSubmit={ev => viewPlayerStats(ev, gameState)}>
                    <input type="text" id="display_name" value={v.display_name} className="w-3/5 lg:w-3/4 bg-transparent text-white pointer-events-none" readOnly />
                    <button type="submit" className="bg-primary border-8bit-primary active:opacity-75"> 
                        {translateUI({lang: miscState.language, text: 'view'})} 
                    </button>
                </form>
            )}
        </div>
    )
}