import { useMisc } from "../../../context/MiscContext"
import { errorLoginRegister, fetcher, fetcherOptions, qS, setInputValue, translateUI } from "../../../helper/helper"
import { FormEvent, useEffect, useRef } from "react"
import { IGameContext, IMiscContext, IResponse, IUser } from "../../../helper/types"
import { useGame } from "../../../context/GameContext"
import ResultMessage from "./ResultMessage"
import FormButtons from "../../../components/FormButtons"

export default function Login() {
    const miscState = useMisc()
    const gameState = useGame()

    // input focus
    const inputFocus = useRef<HTMLInputElement>()
    useEffect(() => {
        inputFocus.current.focus()
    }, [miscState.showModal])

    return (
        <div id="login_modal" className={`${miscState.showModal == 'login' ? 'block' : 'hidden'} bg-darkblue-3 border-8bit-modal p-2 
            ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'} w-[calc(100vw-50%)] lg:w-[calc(100vw-65%)]`}>
            {/* modal head */}
            <div className="border-b-2 mb-4">
                <span> {translateUI({lang: miscState.language, text: 'Enter to the game'})} </span>
            </div>
            {/* modal body */}
            <form className="flex flex-col gap-2 lg:gap-4" onSubmit={ev => userLogin(ev, miscState, gameState)}>
                {/* username */}
                <div className="flex justify-between">
                    <label htmlFor="username" className="w-min"> Username </label>
                    <input ref={inputFocus} type="text" className="w-2/3 px-1" id="username" minLength={4} maxLength={10} placeholder={translateUI({lang: miscState.language, text: 'max 10 letters'})} autoComplete="off" required />
                </div>
                {/* password */}
                <div className="flex justify-between">
                    <label htmlFor="password" className="w-min"> Password </label>
                    <input type="password" className="w-2/3 px-1 !text-2xs" id="password" minLength={8} maxLength={16} placeholder={translateUI({lang: miscState.language, text: 'max 16 letters'})} required />
                </div>
                {/* message */}
                <ResultMessage id="result_login" />
                {/* submit */}
                <div className="flex justify-between mx-6">
                    <FormButtons text="Login" />
                </div>
            </form>
        </div>
    )
}

async function userLogin(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext, gameState: IGameContext) {
    ev.preventDefault()

    // result message
    const resultMessage = qS('#result_login')
    resultMessage.className = 'mx-auto text-center text-2xs lg:text-[12px]'
    resultMessage.textContent = ''
    // submit button
    const loginButton = qS('#login_button') as HTMLInputElement
    // input value container
    const inputValues: Required<Pick<IUser, 'username'|'password'>> = {
        username: null,
        password: null
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // filter inputs
            if(setInputValue('username', input)) inputValues.username = input.value.trim().toLowerCase()
            else if(setInputValue('password', input)) inputValues.password = input.value.trim()
            // error
            else {
                resultMessage.classList.add('text-red-300')
                resultMessage.textContent = errorLoginRegister(input.id, miscState.language)
                return
            }
        }
    }
    // submit button loading
    const tempButtonText = loginButton.textContent
    loginButton.textContent = 'Loading'
    loginButton.disabled = true
    // fetch
    const loginFetchOptions = fetcherOptions({method: 'POST', body: JSON.stringify(inputValues)})
    const loginResponse: IResponse = await (await fetcher('/login', loginFetchOptions)).json()
    // response
    switch(loginResponse.status) {
        case 200: 
            resultMessage.classList.add('text-green-400')
            resultMessage.textContent = `✅ moving to room list..`
            // save access token
            localStorage.setItem('accessToken', loginResponse.data[0].token)
            delete loginResponse.data[0].token
            // set my player data
            gameState.setMyPlayerInfo(loginResponse.data[0].player)
            // set online players
            gameState.setOnlinePlayers(loginResponse.data[0].onlinePlayers)
            localStorage.setItem('onlinePlayers', JSON.stringify(loginResponse.data[0].onlinePlayers))
            // submit button normal
            loginButton.textContent = tempButtonText
            loginButton.removeAttribute('disabled')
            // empty inputs
            for(let j=0; j<formInputs.length; j++) {
                const input = formInputs.item(j) as HTMLInputElement
                if(input.nodeName == 'INPUT') input.value = ''
            }
            // set false to give zoom-out animate class
            miscState.setAnimation(false); 
            // timeout to wait the animation zoom-out
            miscState.setShowModal(null)
            return
        // error
        default: 
            // submit button normal
            loginButton.textContent = tempButtonText
            loginButton.removeAttribute('disabled')
            // result message
            resultMessage.classList.add('text-red-300')
            resultMessage.textContent = `❌ ${loginResponse.status}: ${loginResponse.message}`
            return
    }
}
