"use client"

import { useEffect, useState } from "react";
import HeaderContent from "../../components/HeaderContent";
import DocsContent from "./DocsContent";

export default function DocsPage({ apidoc_secret }) {
    const [password, setPassword] = useState(null)
    useEffect(() => {
        setPassword(prompt('api doc password:'))
    }, [])
    
    return (
        <div className="text-white text-xs lg:text-sm">
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 h-screen w-screen">
                <header>
                    <HeaderContent />
                </header>
    
                <main>
                    {password == apidoc_secret ? <DocsContent /> : <span> you are not allowed </span>}
                </main>
            </div>
        </div>
    )
}