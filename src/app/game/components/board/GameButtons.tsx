import { useGame } from "../../../../context/GameContext"

export default function GameButtons() {
    const gameState = useGame()

    return (
        <>
            {/* username + laps */}
            <div className="flex justify-around mx-auto w-52 lg:w-72">
                <p> dengkul </p>
                <p> lap: 1 </p>
            </div>
            {/* ready + leave */}
            {/* <div className="flex mx-auto w-52 lg:w-72">
                <button type="button" className="bg-primary border-8bit-primary"> ready </button>
                <button type="button" className="bg-primary border-8bit-primary"> leave </button>
            </div> */}
            {/* roll dice + roll turn */}
            <div className="flex mx-auto w-52 lg:w-72">
                <button type="button" className="bg-primary border-8bit-primary active:opacity-50"
                onClick={() => gameState.setRollNumber('dice')}> roll dice </button>
                <button type="button" className="bg-primary border-8bit-primary active:opacity-50"
                onClick={() => gameState.setRollNumber('turn')}> roll turn </button>
            </div>
            {/* roll dice + leave */}
            {/* <div className="flex mx-auto w-52 lg:w-72">
                <button type="button" className="bg-primary border-8bit-primary"> roll dice </button>
                <button type="button" className="bg-primary border-8bit-primary"> leave </button>
            </div> */}
        </>
    )
}