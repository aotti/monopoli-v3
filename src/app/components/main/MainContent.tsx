import { useContext, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import { translateUI } from "../../helper/helper";
import { MiscContext } from "../../context/MiscContext";
import { ITooltip } from "../../helper/types";
import Tooltip from "../Tooltip";

export default function MainContent() {
    const { language } = useContext(MiscContext)
    const [showModal, setShowModal] = useState<'register'|'login'>(null)
    const [onHover, setOnHover] = useState(false)
    // tooltip pos
    const tooltipOptions: ITooltip = {
        key: '#registerButton',
        text: 'klik untuk daftar dan mulai bermain!',
        pos: 'bottom',
        arrow: ['top', 'middle']
    }

    return (
        // h-[calc()] used to fill the empty (height) space 
        // 100vh = landscape using h-screen
        // must count all pixel that affected by margin, padding, height
        <div className="flex items-center justify-center h-[calc(100vh-3.75rem)]">
            <div className="text-center">
                <p className="text-xl"> {translateUI({lang: language, text: 'Do you already have an account?'})} </p>
                {/* register and login buttons */}
                <div className="flex justify-center gap-14 mt-2">
                    {/* login button */}
                    <div className="h-12 w-[calc(9rem+2rem)]">
                        <button className="bg-green-500 border-8bit-success px-2 py-1 w-36 active:opacity-75" 
                        onClick={() => setShowModal('login')}> Login </button>
                    </div>
                    {/* register button */}
                    <div id="registerButton" className="h-12 w-[calc(9rem+2rem)]">
                        <button className="bg-blue-500 border-8bit-primary px-2 py-1 w-36 active:opacity-75" 
                        onMouseOver={() => setOnHover(true)} onMouseOut={() => setOnHover(false)}
                        onClick={() => setShowModal('register')}> Register </button>
                        {
                            onHover
                                ? <Tooltip options={tooltipOptions} />
                                : null
                        }
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