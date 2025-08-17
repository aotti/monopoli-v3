import Credit from "./Credit"
import Updates from "./Updates"
import FixBugs from "./FixBugs"
import LanguageButton from "./LanguageButton"
import { useGame } from "../context/GameContext"
import ReportBugs from "./ReportBugs"

export default function HeaderContent() {
    const gameState = useGame()

    return (
        // height 3rem, padding .25rem
        <nav className="flex justify-center h-10 lg:h-12 p-1 border-b-2">
            <div className="absolute top-2 left-4 flex gap-6">
                {/* credit button & modal */}
                <Credit />
                {/* updates, change log */}
                <Updates />
            </div>
            {/* title */}
            <span className="font-semibold text-base lg:text-xl"> Monopoli Lemao </span>
            <div className="absolute top-2 right-4 flex gap-4">
                {/* fix bug only admin */}
                {gameState.myPlayerInfo?.display_name == 'gandesblood' ? <FixBugs /> : null}
                {/* report bug*/}
                {gameState.myPlayerInfo?.display_name != 'guest' ? <ReportBugs /> : null}
                {/* translate button */}
                <LanguageButton />
            </div>
        </nav>
    )
}