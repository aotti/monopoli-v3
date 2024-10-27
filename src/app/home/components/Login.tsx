import Link from "next/link"
import { useMisc } from "../../../context/MiscContext"
import { qS, translateUI } from "../../../helper/helper"

export default function Login() {
    const miscState = useMisc()

    return (
        <div id="login_modal" className={`${miscState.showModal == 'login' ? 'block' : 'hidden'} bg-darkblue-3 border-8bit-modal p-2 
            ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'} w-[calc(100vw-50%)] lg:w-[calc(100vw-65%)]`}>
            {/* modal head */}
            <div className="border-b-2 mb-4">
                <span> Login </span>
            </div>
            {/* modal body */}
            <div>
                <form className="flex flex-col gap-2 lg:gap-4" onSubmit={ev => {
                    ev.preventDefault()
                    // hide the modal
                    miscState.setShowModal(null)
                    const link = qS('#goToRoom') as HTMLAnchorElement
                    link.click()
                }}>
                    {/* username */}
                    <div className="flex justify-between">
                        <label htmlFor="username" className="w-min"> Username </label>
                        <input type="text" className="w-2/3 px-1" id="username" maxLength={10} required />
                    </div>
                    {/* password */}
                    <div className="flex justify-between">
                        <label htmlFor="password" className="w-min"> Password </label>
                        <input type="password" className="w-2/3 px-1 !text-2xs" id="password" maxLength={16} required />
                    </div>
                    {/* message */}
                    <div className="flex justify-between">
                        {/* error = text-red-300 | success = text-green-300 */}
                        <p id="result_message" className="mx-auto text-center"></p>
                    </div>
                    {/* submit */}
                    <div className="flex justify-between mx-6">
                        <button type="button" className="text-red-300 p-1" onClick={() => {
                            // set false to give zoom-out animate class
                            miscState.setAnimation(false); 
                            // timeout to wait the animation zoom-out
                            setTimeout(() => miscState.setShowModal(null), 200) 
                        }}> 
                            {translateUI({lang: miscState.language, text: 'Close'})} 
                        </button>
                        <button type="submit" className="text-green-300 p-1"> 
                            Login 
                        </button>
                        <Link id="goToRoom" href={'/room'} hidden={true}></Link>
                    </div>
                </form>
            </div>
        </div>
    )
}