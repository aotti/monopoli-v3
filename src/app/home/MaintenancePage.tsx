"use client"

import { generateIdentifier, translateUI } from "../../helper/helper";
import { useMisc } from "../../context/MiscContext";
import HeaderContent from "../../components/HeaderContent";
import { useEffect } from "react";

export default function MaintenancePage() {
    const miscState = useMisc()
    // create identifier
    useEffect(() => generateIdentifier(), [])
    
    return (
        <div className="text-white text-xs lg:text-sm">
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 h-screen w-screen">
                <header>
                    <HeaderContent />
                </header>
    
                <main>
                    {/* // h-[calc()] used to fill the empty (height) space 
                    // 100vh = landscape using h-screen
                    // must count all pixel that affected by margin, padding, height
                    // 100vh - 3.75rem (header height) */}
                    <div className="flex items-center justify-center h-[calc(100vh-3.75rem)]">
                        <div className="text-center">
                            <p className="text-xl"> 
                                {translateUI({lang: miscState.language, text: 'Game is under maintenance 😓'})} 
                            </p>
                        </div> 
                    </div>
                </main>
            </div>
        </div>
    )
}