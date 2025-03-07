import { useEffect, useState } from "react"
import change_logs from "../config/change-logs.json"
import { qS } from "../helper/helper"

export default function Updates() {
    // updates state
    const [showUpdates, setShowUpdates] = useState(false)
    const [showVersion, setShowVersion] = useState(null)
    useEffect(() => {
        // check stored version
        const storedVersion = localStorage.getItem('version') || ''
        setShowVersion(storedVersion)
    }, [])
    // updates data
    const changeLogs = change_logs.updates
    const handleShowMarkUpdates = () => {
        setShowUpdates(true)
        // get current version
        const currentVersion = (qS(`[data-version]`) as HTMLElement).dataset.version
        // store current version
        setShowVersion(currentVersion)
        localStorage.setItem('version', currentVersion)
    }

    return (
        <>
            <div className={showVersion == 'v3.0' ? `` : `after:content-['!'] after:bg-red-600 after:p-1 after:rounded-full`} data-version="v3.0">
                <button type="button" className="bg-darkblue-1 border-8bit-text active:opacity-75" onClick={handleShowMarkUpdates}> 
                    updates 
                </button>
            </div>
            <div className={`absolute -left-2 z-40 bg-black/30 
            ${showUpdates ? 'flex' : 'hidden'} items-center justify-center
            h-[calc(100vh-1rem)] w-[calc(100vw-1rem)]`}>
                <div className="flex flex-col gap-2 justify-center bg-darkblue-1 border-8bit-text p-1">
                    {/* head */}
                    <div className="flex justify-between text-center border-b-2">
                        <span> changelog </span>
                        <span> v3.0 </span>
                    </div>
                    {/* body */}
                    <div className="flex flex-col gap-2 text-green-400 w-72 lg:w-96 h-40 lg:h-52 overflow-y-scroll">
                        {/* changelog */}
                        {changeLogs.map((v, i) => 
                            <div key={i}>
                                <p> {v.version} </p>
                                {v.changes.map((v, i) => 
                                    <ul key={i} className="text-2xs lg:text-xs">
                                        <li> - {v} </li>
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="text-center border-t-2">
                        <button type="button" className="text-white px-2" onClick={() => setShowUpdates(false)}> Close </button>
                    </div>
                </div>
            </div>
        </>
    )
}