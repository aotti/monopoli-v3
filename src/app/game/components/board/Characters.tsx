import { IGameContext } from "../../../../helper/types"

export default function Characters({ playerData }: {playerData: IGameContext['gamePlayerInfo'][0]}) {
    // match player in city owned list
    const cityOwned = playerData.city?.split(';').length || 0
    const cityOwnedTooltip = `city: ${cityOwned}`
    // get buff data
    const buffList = playerData.buff?.split(';').length || 0
    const buffTooltip = `buff: ${buffList}`
    // get debuff data
    const debuffList = playerData.debuff?.split(';').length || 0
    const debuffTooltip = `debuff: ${debuffList}`
    // set player tooltip (display_name & city owned)
    const playerTooltip = `${playerData.display_name};${cityOwnedTooltip};${buffTooltip};${debuffTooltip}`

    return (
        <div data-tooltip={playerTooltip.replaceAll(';', '\n')} data-player-name={playerData.display_name} 
        className="inline-block cursor-pointer w-[3.5vw] p-1 lg:p-2">
            <img src={playerData.character} alt={playerData.display_name} />
        </div>
    )
}