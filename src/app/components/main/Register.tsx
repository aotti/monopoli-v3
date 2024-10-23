import { useContext } from "react"
import { translateUI } from "../../helper/helper"
import { MiscContext } from "../../context/MiscContext"

export default function Register({ showModalState }) {
    const { language } = useContext(MiscContext)
    const { showModal, setShowModal } = showModalState

    return ( 
        <div id="register_modal" className={`${showModal == 'register' ? 'block' : 'hidden'} bg-darkblue-3 border-8bit-modal p-2 
            w-[calc(100vw-50%)] lg:w-[calc(100vw-65%)]`}>
            {/* modal head */}
            <div className="border-b-2 mb-4">
                <span> {translateUI({lang: language, text: 'Create Account'})} </span>
            </div>
            {/* modal body */}
            <div>
                <form className="flex flex-col gap-2 lg:gap-4" onSubmit={ev => ev.preventDefault()}>
                    {/* username */}
                    <div className="flex justify-between">
                        <label htmlFor="username" className="w-min"> Username </label>
                        <input type="text" className="w-2/3 px-1 text-black" id="username" maxLength={10} required />
                    </div>
                    {/* password */}
                    <div className="flex justify-between">
                        <label htmlFor="password" className="w-min"> Password </label>
                        <input type="password" className="w-2/3 px-1 text-black !text-2xs" id="password" maxLength={16} required />
                    </div>
                    {/* confirm password */}
                    <div className="flex justify-between">
                        <label htmlFor="confirm_password" className="w-min"> {translateUI({lang: language, text: 'Confirm Password'})} </label>
                        <input type="password" className="w-2/3 px-1 text-black !text-2xs" id="confirm_password" maxLength={16} required />
                    </div>
                    {/* name */}
                    <div className="flex justify-between">
                        <label htmlFor="display_name" className="w-min"> {translateUI({lang: language, text: 'Name'})} </label>
                        <input type="text" className="w-2/3 px-1 text-black" id="display_name" maxLength={16} required />
                    </div>
                    {/* message */}
                    <div className="flex justify-between">
                        {/* error = text-red-300 | success = text-green-300 */}
                        <p id="result_message" className="mx-auto text-center"></p>
                    </div>
                    {/* submit */}
                    <div className="flex justify-between mx-6">
                        <button type="button" className="text-red-300 p-1" onClick={() => setShowModal(null)}> {translateUI({lang: language, text: 'Close'})} </button>
                        <button type="submit" className="text-green-300 p-1"> {translateUI({lang: language, text: 'Create'})} </button>
                    </div>
                </form>
            </div>
        </div>
    )
}