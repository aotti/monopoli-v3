import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"

export default function PlayerSettingSellCity() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className={`${gameState.displaySettingItem == 'sell_city' ? 'block' : 'hidden'}
        absolute top-9 bg-darkblue-2 
        w-[calc(100%-.5rem)] h-[calc(100%-2.5rem)]`}>
            <div className="flex flex-col p-1">
                {/* title */}
                <div>
                    <span className="border-b-2 pb-1">
                        {translateUI({lang: miscState.language, text: 'Sell City', lowercase: true})}
                    </span>
                </div>
                {/* city list */}
                <div className="flex flex-col gap-2 h-36 lg:h-[17rem] overflow-y-scroll">
                    {/* city 1 */}
                    <form className="flex items-center justify-between" onSubmit={ev => ev.preventDefault()}>
                        <span> jakarta </span>
                        <span> Rp 70.000 </span>
                        <div className="mr-2">
                            <button type="submit" className="bg-primary border-8bit-primary">
                                {translateUI({lang: miscState.language, text: 'sell'})}
                            </button>
                        </div>
                    </form>
                    {/* city 2 */}
                    <form className="flex items-center justify-between" onSubmit={ev => ev.preventDefault()}>
                        <span> bandung </span>
                        <span> Rp 70.000 </span>
                        <div className="mr-2">
                            <button type="submit" className="bg-primary border-8bit-primary">
                                {translateUI({lang: miscState.language, text: 'sell'})}
                            </button>
                        </div>
                    </form>
                    {/* city 3 */}
                    <form className="flex items-center justify-between" onSubmit={ev => ev.preventDefault()}>
                        <span> semarang </span>
                        <span> Rp 70.000 </span>
                        <div className="mr-2">
                            <button type="submit" className="bg-primary border-8bit-primary">
                                {translateUI({lang: miscState.language, text: 'sell'})}
                            </button>
                        </div>
                    </form>
                    {/* city 4 */}
                    <form className="flex items-center justify-between" onSubmit={ev => ev.preventDefault()}>
                        <span> jokja </span>
                        <span> Rp 70.000 </span>
                        <div className="mr-2">
                            <button type="submit" className="bg-primary border-8bit-primary">
                                {translateUI({lang: miscState.language, text: 'sell'})}
                            </button>
                        </div>
                    </form>
                    {/* city 5 */}
                    <form className="flex items-center justify-between" onSubmit={ev => ev.preventDefault()}>
                        <span> depok </span>
                        <span> Rp 70.000 </span>
                        <div className="mr-2">
                            <button type="submit" className="bg-primary border-8bit-primary">
                                {translateUI({lang: miscState.language, text: 'sell'})}
                            </button>
                        </div>
                    </form>
                </div>
                {/* close button */}
                <div className="w-[calc(100%-.5rem)] p-1 border-t-2">
                    <button type="button" onClick={() => gameState.setDisplaySettingItem(null)}>
                        {translateUI({lang: miscState.language, text: 'Close'})}
                    </button>
                </div>
            </div>
        </div>
    )
}