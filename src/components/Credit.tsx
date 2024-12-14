import { useState } from "react"

export default function Credit() {
    // credit state
    const [showCredit, setShowCredit] = useState(false)
    // game sounds credit
    const gameSoundCreditsID = [
        'vernalta'
    ]
    const gameSoundCreditsEN = [
        'cooper2723'
    ]

    return (
        <>
            <div className="absolute top-2 left-4">
                <button type="button" className="bg-darkblue-1 border-8bit-text active:opacity-75" onClick={() => setShowCredit(true)}> 
                    credit 
                </button>
            </div>
            <div className={`absolute z-40 bg-black/30 
            ${showCredit ? 'flex' : 'hidden'} items-center justify-center
            h-[calc(100vh-1rem)] w-[calc(100vw-1rem)]`}>
                <div className="flex flex-col gap-2 justify-center bg-darkblue-1 border-8bit-text p-1">
                    {/* head */}
                    <div className="text-center border-b-2">
                        <span> credit </span>
                    </div>
                    {/* body */}
                    <div className="flex flex-col gap-2 text-center text-green-400 w-72 lg:w-96 h-40 lg:h-52 overflow-y-scroll">
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
                        {/* game sounds */}
                        <div className="flex flex-col gap-2">
                            <p className="text-orange-400"> game sounds </p>
                            {/* indonesia */}
                            {gameSoundCreditsID.map((v, i) => 
                                <div key={i} className="flex justify-between">
                                    <span> {v} </span>
                                    <span className="grow mx-1 mb-1 border-b-4 border-dotted border-green-400"></span>
                                    <span> indonesia </span>
                                </div>
                            )}
                            {/* english */}
                            {gameSoundCreditsEN.map((v, i) => 
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