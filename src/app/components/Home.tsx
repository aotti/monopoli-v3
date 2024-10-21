import { Press_Start_2P } from "next/font/google"
import MainContent from "./main/MainContent"

const retroFont = Press_Start_2P({
    subsets: ['latin'],
    weight: ['400']
})

export default function Home() {
    return (
        <div className={`${retroFont.className}`}>
            {/* padding .5rem */}
            <div className="p-2 bg-darkblue-2 text-white text-xs lg:text-sm h-screen w-screen">
                <header>
                    {/* height 3rem, padding .25rem */}
                    <nav className="flex justify-center h-12 p-1 border-b-2">
                        <span className="font-semibold text-xl"> Monopoli Lemao </span>
                    </nav>
                </header>
    
                <main>
                    <MainContent />
                </main>
            </div>
        </div>
    )
}