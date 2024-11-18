import { useMisc } from "../../../context/MiscContext";
import { translateUI } from "../../../helper/helper";

export default function TutorialGameRoom() {
    const miscState = useMisc()
    // tutorial text
    const tutorialText = {
        part_1: [
            `"help" contain info about community & chance cards, the special card effect, buff/debuff area.`,
            `"players" contain info about name, money and special card (note icon).`,
            `"player settings" (gear icon)\nauto roll dice = if u tired clicking\nsell city = sell any city owned\ngame history = see all player action\nattack city = attack other player city`
        ],
        part_2: [
            `there are 3 stage before play`,
            `\n1 = preparation, 2 = decide turn, 3 = play\n"leave" to leave the game before game start\n"surrender" to leave when the game is run\n"roll turn" to decide the turn to roll dice`,
            `all tiles have tooltip. city tooltip changes after bought. other tiles only static info, but prison. the 🔍 icon to see full image of tiles.`
        ],
        part_3: [
            `"back to room" to enter room list without leave the game. there's also tutorial button 😎 and some info about this room.`,
            `if you turn on the "game history" on player setting, it will display a box to see all player actions.`,
            `i hate css 💀`
        ]
    }

    return (
        <>
            {/* right side buttons */}
            <div className={`${miscState.showTutorial == 'tutorial_gameroom_1' ? 'block' : 'hidden'}
            absolute top-0 lg:top-[15%] right-16 lg:right-20 w-3/4 lg:w-2/5`}>
                {/* help */}
                <p className="text-balance whitespace-pre">
                    {translateUI({lang: miscState.language, text: tutorialText.part_1[0] as any})}
                </p>
                <hr className="my-1" />
                {/* players */}
                <p className="text-balance whitespace-pre">
                    {translateUI({lang: miscState.language, text: tutorialText.part_1[1] as any})}
                </p>
                <hr className="my-1" />
                <p className="text-balance whitespace-pre">
                    {translateUI({lang: miscState.language, text: tutorialText.part_1[2] as any})}
                </p>
                <hr className="my-1" />
                <button type="button" className="text-green-400 p-1"
                onClick={() => miscState.setShowTutorial('tutorial_gameroom_2')}>
                    {translateUI({lang: miscState.language, text: 'click here to continue'})}
                </button>
            </div>
            {/* game board + buttons */}
            <div className={`${miscState.showTutorial == 'tutorial_gameroom_2' ? 'flex' : 'hidden'}
            flex-col gap-[17.5vh] lg:gap-[15vh] absolute z-10 top-[13.5vh] lg:top-28 left-[calc(25%-1rem)] w-[calc(50%+2rem)] 
            text-2xs lg:text-xs lg:leading-6`}>
                <p className="whitespace-pre-line h-[4.7rem] lg:h-[8.5rem] p-px border-b">
                    {translateUI({lang: miscState.language, text: tutorialText.part_2[0] as any})}
                    <img src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/game_stages-TPqgHHAzxrEJ3JGOlOzOCK5mhGm0Sm.gif" alt="game buttons" className="!inline w-[17vw] lg:w-64 !h-[3vw] lg:!h-8 mx-1" />
                    {translateUI({lang: miscState.language, text: tutorialText.part_2[1] as any})}
                </p>
                <p className="whitespace-pre-line h-[4.5rem] lg:h-32 p-px border-t">
                    {translateUI({lang: miscState.language, text: tutorialText.part_2[2] as any})}
                    <button type="button" className="text-green-400 p-1"
                    onClick={() => miscState.setShowTutorial('tutorial_gameroom_3')}>
                        {translateUI({lang: miscState.language, text: 'click here to continue'})}
                    </button>
                </p>
            </div>
            {/* left side buttons */}
            <div className={`${miscState.showTutorial == 'tutorial_gameroom_3' ? 'block' : 'hidden'}
            absolute top-[5%] lg:top-[15%] left-[18vw] lg:left-56 w-3/4 lg:w-2/5`}>
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_3[0] as any})}
                </p>
                <hr className="my-1" />
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_3[1] as any})}
                </p>
                <hr className="my-1" />
                <p className="text-balance text-2xs"> 
                    {translateUI({lang: miscState.language, text: tutorialText.part_3[2] as any})}
                </p>
                <hr className="my-1" />
                <button type="button" className="text-green-400 p-1"
                onClick={() => miscState.setShowTutorial(null)}>
                    {translateUI({lang: miscState.language, text: 'tutorial complete'})}
                </button>
            </div>
        </>
    )
}