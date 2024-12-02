import { useMisc } from "../context/MiscContext";
import { translateUI } from "../helper/helper";

export default function FormButtons({ text }: {text: 'Login'|'Register'|'Create'}) {
    const miscState = useMisc()
    const buttonId = text == 'Login' ? 'login_button'
                    : text == 'Register' ? 'register_button'
                    : 'create_room'
    
    return (
        <>
        <button type="button" className="text-red-300 p-1 active:opacity-75" onClick={() => { 
            // set false to give zoom-out animate class
            miscState.setAnimation(false); 
            // timeout to wait the animation zoom-out
            setTimeout(() => miscState.setShowModal(null), 200) 
        }}> 
            {translateUI({lang: miscState.language, text: 'Close'})} 
        </button>
        <button type="submit" id={buttonId} className="text-green-300 p-1 active:opacity-75"> 
            {translateUI({lang: miscState.language, text: text == 'Login' ? 'Login' : 'Create'})} 
        </button>
        </>
    )
}