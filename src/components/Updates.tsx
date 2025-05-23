import { useEffect, useState } from "react"
import change_logs from "../config/change-logs.json"
import { qS } from "../helper/helper"

export default function Updates() {
    const currentVersion = change_logs.updates[0].version
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
        const getCurrentVersion = (qS(`[data-version]`) as HTMLElement).dataset.version
        // store current version
        setShowVersion(getCurrentVersion)
        localStorage.setItem('version', getCurrentVersion)
    }

    return (
        <>
            <div className={showVersion == currentVersion ? `hover:animate-pulse` : `after:content-['!'] after:bg-red-600 after:p-1 after:rounded-full hover:animate-pulse`} data-version={currentVersion}>
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
                        <span> {currentVersion} </span>
                    </div>
                    {/* body */}
                    <div className="flex flex-col gap-2 text-green-400 w-72 lg:w-96 h-40 lg:h-52 overflow-y-scroll">
                        {/* changelog */}
                        {changeLogs.map((v, i) => 
                            <div key={i}>
                                <p className="text-white"> {v.version} ({v.date}) </p>
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