import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import { translateUI } from "../../helper/helper";
import { useMisc } from "../../context/MiscContext";

export default function HomeContent() {
    const miscState = useMisc()
    const [showModal, setShowModal] = useState<'register'|'login'>(null)

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
                        <button className="bg-green-500 border-8bit-success px-2 py-1 w-36 active:opacity-75" 
                        onClick={() => {
                            // to give zoom-in animate class
                            miscState.setAnimation(true); 
                            // show the modal
                            setShowModal('login') 
                        }}> Login </button>
                    </div>
                    {/* register button */}
                    <div id="registerButton" className="h-12 w-[calc(9rem+2rem)]">
                        <button className="bg-blue-500 border-8bit-primary px-2 py-1 w-36 active:opacity-75" 
                        onClick={() => { 
                            // to give zoom-in animate class
                            miscState.setAnimation(true); 
                            // show the modal
                            setShowModal('register') 
                        }}> Register </button>
                    </div>
                </div>
            </div> 
            {/* register and login modal */}
            <div className={`absolute bg-black/30
                ${showModal === null ? 'hidden' : 'flex'} items-center justify-center
                h-[calc(100vh-4.5rem)] w-[calc(100vw-2rem)]`}>
                {/* register modal */}
                <Register showModalState={{showModal: showModal, setShowModal: setShowModal}} />
                {/* login modal */}
                <Login showModalState={{showModal: showModal, setShowModal: setShowModal}} />
            </div>
        </div>
    )
}