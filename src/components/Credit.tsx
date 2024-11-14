import { useState } from "react"

export default function Credit() {
    // credit state
    const [showCredit, setShowCredit] = useState(false)

    return (
        <>
            <div className="absolute top-2 left-4">
                <button type="button" className="bg-darkblue-1 border-8bit-text" onClick={() => setShowCredit(true)}> 
                    credit 
                </button>
            </div>
            <div className={`absolute z-40 bg-black/30 
            ${showCredit ? 'flex' : 'hidden'} items-center justify-center
            h-[calc(100vh-1rem)] w-[calc(100vw-1rem)]`}>
                <div className="flex flex-col gap-2 justify-center bg-darkblue-1 border-8bit-text p-2">
                    {/* head */}
                    <div className="text-center border-b-2">
                        <span> credit </span>
                    </div>
                    {/* body */}
                    <div className="flex flex-col gap-2 justify-center text-green-400 w-96">
                        <p className="flex justify-between">
                            <span> aotti </span>
                            <span className="border-b-4 border-dotted border-green-400 grow -mt-1 mx-2"></span>
                            <span> programming </span>
                        </p>
                        <p className="flex justify-between">
                            <span> C4pung </span>
                            <span className="border-b-4 border-dotted border-green-400 grow -mt-1 mx-2"></span>
                            <span> sprite </span>
                        </p>
                        <div className="text-center">
                            <button type="button" className="text-white p-2" onClick={() => setShowCredit(false)}> Close </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}