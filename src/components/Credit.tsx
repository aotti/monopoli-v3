import { useState } from "react"

export default function Credit() {
    // credit state
    const [showCredit, setShowCredit] = useState(false)
    // game icon & image
    const gameIconImageCredits = [
        'vecteezy.com - rakibs',
        'icons8.com'
    ]
    // game sfx
    const gameSFXCredits = [
        'mixkit.co',
        'pixabay.com',
        'pond5.com',
    ]
    // game meme credit
    const gameMemeCreditsID = [
        'vernalta (yt)',
        'ghost panic team (yt)',
        'mamang garox',
        'bryan furran (yt)',
        'adit sopo jarwo (yt)',
    ]
    const gameMemeCreditsEN = [
        'cooper2723 (yt)',
        'mully (yt)',
        'bigbagofpotatoes (titkok)',
        'half-life cat'
    ]

    return (
        <>
            <div className="">
                <button type="button" className="bg-darkblue-1 border-8bit-text active:opacity-75 hover:animate-pulse" onClick={() => setShowCredit(true)}> 
                    credit 
                </button>
            </div>
            <div className={`absolute -left-2 z-40 bg-black/30 
            ${showCredit ? 'flex' : 'hidden'} items-center justify-center
            h-[calc(100vh-1rem)] w-[calc(100vw-1rem)]`}>
                <div className="flex flex-col gap-2 justify-center bg-darkblue-1 border-8bit-text p-1">
                    {/* head */}
                    <div className="flex justify-between text-center border-b-2">
                        <span> credit </span>
                    </div>
                    {/* body */}
                    <div className="flex flex-col gap-2 text-center text-green-400 w-[50vw] lg:w-[40vw] h-48 lg:h-64 overflow-y-scroll">
                        {/* people */}
                        <div className="">
                            <p className="text-orange-400"> programming </p>
                            <p> aotti </p>
                        </div>
                        <div className="">
                            <p className="text-orange-400"> sprite </p>
                            <p> C4pung </p>
                        </div>
                        <div className="">
                            <p className="text-orange-400"> tester </p>
                            <p> Acan </p>
                        </div>
                        {/* game icons */}
                        <div className="flex flex-col gap-2">
                            <p className="text-orange-400"> game icons </p>
                            {gameIconImageCredits.map((v, i) => 
                                <div key={i}>
                                    <span> {v} </span>
                                </div>
                            )}
                        </div>
                        {/* game sfx */}
                        <div className="flex flex-col gap-2">
                            <p className="text-orange-400"> game sfx </p>
                            {gameSFXCredits.map((v, i) => 
                                <div key={i}>
                                    <span> {v} </span>
                                </div>
                            )}
                        </div>
                        {/* game meme sounds */}
                        <div className="flex flex-col gap-2">
                            <p className="text-orange-400"> game meme sfx </p>
                            {/* indonesia */}
                            {gameMemeCreditsID.map((v, i) => 
                                <div key={i} className="flex justify-between">
                                    <span> {v} </span>
                                    <span className="grow mx-1 mb-1 border-b-4 border-dotted border-green-400"></span>
                                    <span> indonesia </span>
                                </div>
                            )}
                            {/* english */}
                            {gameMemeCreditsEN.map((v, i) => 
                                <div key={i} className="flex justify-between">
                                    <span> {v} </span>
                                    <span className="grow mx-1 mb-1 border-b-4 border-dotted border-green-400"></span>
                                    <span> english </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-center border-t-2">
                        <button type="button" className="text-white px-2" onClick={() => setShowCredit(false)}> Close </button>
                    </div>
                </div>
            </div>
        </>
    )
}