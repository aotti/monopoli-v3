import { useGame } from "../../../../context/GameContext";
import { useMisc } from "../../../../context/MiscContext";
import { moneyFormat, translateUI } from "../../../../helper/helper";

export default function GameInfo({ roomId }: {roomId: number}) {
    const miscState = useMisc()
    const gameState = useGame()
    // get room info
    const getGameRoomInfo = gameState.gameRoomInfo.map(v => v.room_id).indexOf(roomId)

    return (
        <div className="flex flex-col gap-2 text-2xs lg:text-xs">
            {/* name */}
            <div className="flex flex-col">
                <span> {translateUI({lang: miscState.language, text: 'Name', lowercase: true})}: </span>
                <span className="text-green-400"> {gameState.gameRoomInfo[getGameRoomInfo]?.room_name} </span>
            </div>
            {/* mode */}
            <div className="flex flex-col">
                <span> mode: </span>
                <span className="text-green-400"> 
                    {translateUI({lang: miscState.language, text: gameState.gameRoomInfo[getGameRoomInfo]?.mode as any})} 
                </span>
            </div>
            {/* money lose */}
            <div className="flex flex-col">
                <span> {translateUI({lang: miscState.language, text: 'lose condition'})}: </span>
                <span className="text-red-400"> {moneyFormat(gameState.gameRoomInfo[getGameRoomInfo]?.money_lose)} </span>
            </div>
            {/* creator */}
            <div className="flex flex-col">
                <span> {translateUI({lang: miscState.language, text: 'Creator', lowercase: true})}: </span>
                <span className="text-green-400"> {gameState.gameRoomInfo[getGameRoomInfo]?.creator} </span>
            </div>
        </div>
    )
}