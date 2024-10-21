import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

export default function MainContent() {
    const [showModal, setShowModal] = useState<'register'|'login'>(null)

    return (
        // h-[calc()] used to fill the empty (height) space 
        // 100vh = landscape using h-screen
        // must count all pixel that affected by margin, padding, height
        <div className="flex items-center justify-center h-[calc(100vh-3.75rem)]">
            <div className="text-center">
                <p className="text-xl"> Do you already have an account? </p>
                {/* register and login buttons */}
                <div className=" mt-2">
                    {/* login button */}
                    <button className="bg-green-500 border-8bit-success px-2 py-1 w-36 active:opacity-75" 
                    onClick={() => setShowModal('login')}> Login </button>
                    {/* separator */}
                    <span className=" mx-4"></span>
                    {/* register button */}
                    <button className="bg-blue-500 border-8bit-primary px-2 py-1 w-36 active:opacity-75" 
                    onClick={() => setShowModal('register')}> Register </button>
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