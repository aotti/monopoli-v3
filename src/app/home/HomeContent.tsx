import Login from "./components/Login";
import Register from "./components/Register";
import { qS, translateUI } from "../../helper/helper";
import { useMisc } from "../../context/MiscContext";

export default function HomeContent() {
    const miscState = useMisc()

    return (
        // h-[calc()] used to fill the empty (height) space 
        // 100vh = landscape using h-screen
        // must count all pixel that affected by margin, padding, height
        // 100vh - 3.75rem (header height)
        <div className="flex items-center justify-center h-[calc(100vh-3.75rem)]">
            <div className="text-center">
                <p className="text-xl"> 
                    {translateUI({lang: miscState.language, text: 'Do you already have an account?'})} 
                </p>
                {/* register and login buttons */}
                <div className="flex justify-center gap-14 mt-2">
                    {/* login button */}
                    <div className="h-12 w-[calc(9rem+2rem)]">
                        <button type="button" className="bg-green-500 border-8bit-success px-2 py-1 w-36 active:opacity-75 hover:animate-jump" 
                        onClick={() => {
                            // to give zoom-in animate class
                            miscState.setAnimation(true); 
                            // show the modal
                            miscState.setShowModal('login') 
                        }}> {translateUI({lang: miscState.language, text: 'Login'})} </button>
                    </div>
                    {/* register button */}
                    <div className="h-12 w-[calc(9rem+2rem)]">
                        <button type="button" className="bg-blue-500 border-8bit-primary px-2 py-1 w-36 active:opacity-75 hover:animate-jump" 
                        onClick={() => { 
                            // to give zoom-in animate class
                            miscState.setAnimation(true); 
                            // show the modal
                            miscState.setShowModal('register') 
                        }}> {translateUI({lang: miscState.language, text: 'Register'})} </button>
                    </div>
                </div>
                {/* view as guest */}
                <div className="flex flex-col gap-2 mt-4">
                    <span> {translateUI({lang: miscState.language, text: 'or view as'})} </span>
                    <button type="button" className="bg-blue-500 border-8bit-primary px-2 py-1 w-36 active:opacity-75 hover:animate-jump" onClick={() => (qS('#gotoRoom') as HTMLAnchorElement).click()}> 
                        {translateUI({lang: miscState.language, text: 'Guest'})} 
                    </button>
                </div>
            </div> 
            {/* register and login modal */}
            <div className={`absolute bg-black/30
                ${miscState.showModal === null ? 'hidden' : 'flex'} items-center justify-center
                h-[calc(100vh-4.5rem)] w-[calc(100vw-2rem)]`}>
                {/* register modal */}
                <Register />
                {/* login modal */}
                <Login />
            </div>
        </div>
    )
}