import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"

export default function TutorialRoomList() {
    const miscState = useMisc()
    // tutorial text
    const tutorialText = {
        part_1: [
            `display list of online player, if there's no one online, it will be empty 😭. the "view" button used to check other player stats`,
            `for chat, just type in the "chat here" box and chat box will appear, or you can type "/on" to keep chat box open and "/off" to revert it`
        ],
        part_2: [
            `display you/other player game stats. to upload avatar, click the "upload your avatar". after upload your avatar, please re-login to make sure the avatar is updated.`,
            `"worst lost" mean the worst money you have when losing a game since you install titkok, um..i mean created ur account.`
        ],
        part_3: [
            `to play the game click on "join", or "spectate" to watch others gameplay.`,
            `the rules: ??? text is a tooltip. on phone, just swipe + hold on the text as in this .gif:`,
            `delete button only show if the creator is you`,
        ],
        part_4: [
            `icon on the left is tutorial button`,
            `icons on the right are "create room" and "menu", but guest cannot create room`,
            `menu button have "ranking", "shop" and "daily" options`,
            `"ranking" to see top 10 worst lose,\n "shop" for buying any special card or buff (can have max 2 items for each type),\n "daily" to get free daily reward`,
        ]
    }

    return (
        <>
            {/* player list + chat */}
            <div className={`${miscState.showTutorial == 'tutorial_roomlist_1' ? 'block' : 'hidden'} 
            absolute mt-2 pr-1 right-0 w-2/3 lg:right-[calc(20%-1rem)] lg:w-1/2`}>
                <p className="text-green-400"> beningging of tutorial </p>
                <hr />
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_1[0] as any})}
                </p>
                <hr className="my-1" />
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_1[1] as any})}
                </p>
                <hr className="my-1" />
                <button type="button" className="text-green-400 p-1 animate-pulse animate-infinite"
                onClick={() => miscState.setShowTutorial('tutorial_roomlist_2')}>
                    {translateUI({lang: miscState.language, text: 'click here to continue'})}
                </button>
            </div>
            {/* player stats */}
            <div className={`${miscState.showTutorial == 'tutorial_roomlist_2' ? 'block' : 'hidden'} 
            absolute mt-2 pr-1 right-0 bottom-0 lg:bottom-10 w-2/3 lg:right-[calc(20%-1rem)] lg:w-1/2`}>
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_2[0] as any})}
                </p>
                <hr className="my-1" />
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_2[1] as any})}
                </p>
                <hr className="my-1" />
                <button type="button" className="text-green-400 p-1 animate-pulse animate-infinite" 
                onClick={() => miscState.setShowTutorial('tutorial_roomlist_3')}> 
                    {translateUI({lang: miscState.language, text: 'click here to continue'})}
                </button>
            </div>
            {/* room list */}
            <div className={`${miscState.showTutorial == 'tutorial_roomlist_3' ? 'block' : 'hidden'}
            absolute mt-10 w-[30%] text-right text-2xs lg:text-sm lg:!leading-6`}>
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_3[0] as any})}
                </p>
                <hr className="my-1" />
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_3[1] as any})}
                    <img src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/tooltip-jMhpG5ZcuTWhHKb4VxPirbhBl2YZ9Y.gif" alt="tap + swipe.gif" className="mx-auto w-[95%] !h-20 lg:!h-44" loading="lazy" />
                </p>
                <hr className="my-1" />
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_3[2] as any})}
                </p>
                <hr className="my-1" />
                <button type="button" className="text-green-400 p-1 animate-pulse animate-infinite" 
                onClick={() => miscState.setShowTutorial('tutorial_roomlist_4')}> 
                    {translateUI({lang: miscState.language, text: 'click here to continue'})}
                </button>
            </div>
            {/* room list buttons */}
            <div className={`${miscState.showTutorial == 'tutorial_roomlist_4' ? 'block' : 'hidden'}
            absolute right-0 mt-14 mr-4 w-2/3 text-2xs lg:text-sm lg:!leading-6`}>
                <p className="text-balance">
                    {translateUI({lang: miscState.language, text: tutorialText.part_4[0] as any})}
                </p>
                <hr className="my-1" />
                <p className="text-balance text-right">
                    {translateUI({lang: miscState.language, text: tutorialText.part_4[1] as any})}
                </p>
                <hr className="my-1" />
                <p className="text-balance text-right">
                    {translateUI({lang: miscState.language, text: tutorialText.part_4[2] as any})}
                </p>
                <hr className="my-1" />
                <p className="text-balance whitespace-pre-line">
                    {translateUI({lang: miscState.language, text: tutorialText.part_4[3] as any})}
                </p>
                <hr className="my-1" />
                <button type="button" className="text-green-400 p-1 animate-pulse animate-infinite" onClick={() => miscState.setShowTutorial(null)}> 
                    {translateUI({lang: miscState.language, text: 'tutorial complete'})}
                </button>
            </div>
        </>
    )
}