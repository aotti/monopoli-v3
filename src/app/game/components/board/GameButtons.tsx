export default function GameButtons() {
    return (
        <>
            {/* username + laps */}
            <div className="flex justify-around mx-auto w-52 lg:w-72">
                <p> dengkul </p>
                <p> lap: 1 </p>
            </div>
            {/* ready + leave */}
            <div className="flex mx-auto w-52 lg:w-72">
                <button type="button" className="bg-primary border-8bit-primary"> ready </button>
                <button type="button" className="bg-primary border-8bit-primary"> leave </button>
            </div>
            {/* roll dice + roll turn */}
            {/* <div className="flex mx-auto w-52 lg:w-72">
                <button type="button" className="bg-primary border-8bit-primary"> roll dice </button>
                <button type="button" className="bg-primary border-8bit-primary"> roll turn </button>
            </div> */}
            {/* roll dice + leave */}
            {/* <div className="flex mx-auto w-52 lg:w-72">
                <button type="button" className="bg-primary border-8bit-primary"> roll dice </button>
                <button type="button" className="bg-primary border-8bit-primary"> leave </button>
            </div> */}
        </>
    )
}