import { useMisc } from "../../../context/MiscContext";
import { translateUI } from "../../../helper/helper";

export default function PlayerStats() {
    const miscState = useMisc()

    return (
        <>
            <span> {`${'dengkul'}'s stats`} </span>
            <div className="flex gap-2 text-2xs lg:text-xs mt-1">
                {/* profile picture */}
                <div className="border-2 w-[4rem] h-[4rem] lg:w-32 lg:h-32">
                    <img src="" alt={translateUI({lang: miscState.language, text: 'upload your avatar'})} />
                    {/* logout */}
                    <form className="text-center mt-2" onSubmit={ev => ev.preventDefault()}>
                        <button type="submit" className="bg-darkblue-1 border-8bit-text"> logout </button>
                    </form>
                </div>
                {/* stats */}
                <div className="lg:flex lg:flex-col lg:gap-4">
                    <div>
                        <p> {translateUI({lang: miscState.language, text: 'game count'})}: </p>
                        <p className="text-green-400"> {5} games </p>
                    </div>
                    <div>
                        <p> {translateUI({lang: miscState.language, text: 'worst lost'})}: </p>
                        <p className="text-red-400"> {`Rp -985.000`} </p>
                    </div>
                    <div>
                        <p> status: </p>
                        <p className="text-green-400"> {translateUI({lang: miscState.language, text: `playing`})} </p>
                    </div>
                </div>
            </div>
        </>
    )
}