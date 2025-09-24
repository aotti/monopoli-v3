import { applyTooltipEvent, errorLoginRegister, fetcher, fetcherOptions, qS, questionMark, setInputValue, sha256, translateUI } from "../../../helper/helper"
import { useMisc } from "../../../context/MiscContext"
import { FormEvent, useEffect, useRef } from "react";
import { IUser, IResponse, IMiscContext } from "../../../helper/types";
import ResultMessage from "./ResultMessage";
import FormButtons from "../../../components/FormButtons";

export default function Register() {
    const miscState = useMisc()

    const tooltip = {
        username: 'used for login',
        name: 'player name',
    }
    // tooltip (the element must have position: relative)
    useEffect(() => {
        applyTooltipEvent()
    }, [])
    // input focus
    const inputFocus = useRef<HTMLInputElement>()
    useEffect(() => {
        inputFocus.current.focus()
    }, [miscState.showModal])

    return ( 
        <div id="register_modal" className={`${miscState.showModal == 'register' ? 'block' : 'hidden'} bg-darkblue-3 border-8bit-modal p-2
            ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'} w-[calc(100vw-50%)] lg:w-[calc(100vw-65%)]`}>
            {/* modal head */}
            <div className="border-b-2 mb-4">
                <span> {translateUI({lang: miscState.language, text: 'Create Account'})} </span>
            </div>
            {/* modal body */}
            <form className="flex flex-col gap-2 lg:gap-4" onSubmit={ev => userRegister(ev, miscState)}>
                {/* username */}
                <div className="flex justify-between">
                    <label htmlFor="username" data-tooltip={tooltip.username} className="relative flex w-max">
                        <span className={questionMark()}> Username </span>
                    </label>
                    <input ref={inputFocus} type="text" className="w-2/3 px-1" id="username" minLength={4} maxLength={10} placeholder={translateUI({lang: miscState.language, text: 'max 10 letters'})}  autoComplete="off" required />
                </div>
                {/* password */}
                <div className="flex justify-between">
                    <label htmlFor="password" className="w-min"> Password </label>
                    <input type="password" className="w-2/3 px-1 !text-2xs" id="password" minLength={8} maxLength={16} placeholder={translateUI({lang: miscState.language, text: 'max 16 letters'})} required />
                </div>
                {/* confirm password */}
                <div className="flex justify-between">
                    <label htmlFor="confirm_password" className="w-min"> {translateUI({lang: miscState.language, text: 'Confirm Password'})} </label>
                    <input type="password" className="w-2/3 px-1 !text-2xs" id="confirm_password" maxLength={16} placeholder={translateUI({lang: miscState.language, text: 're-type your password'})} required />
                </div>
                {/* name */}
                <div className="flex justify-between">
                    <label htmlFor="display_name" data-tooltip={tooltip.name} className="relative flex w-max">
                        <span className={questionMark()}> {translateUI({lang: miscState.language, text: 'Name'})} </span>
                    </label>
                    <input type="text" className="w-2/3 px-1" id="display_name" minLength={4} maxLength={12} placeholder={translateUI({lang: miscState.language, text: 'max 12 letters'})} required />
                </div>
                {/* message */}
                <ResultMessage id="result_register" />
                {/* submit */}
                <div className="flex justify-between mx-6">
                    <FormButtons text="Register" />
                </div>
            </form>
        </div>
    )
}

async function userRegister(ev: FormEvent<HTMLFormElement>, miscState: IMiscContext) {
    ev.preventDefault()

    // result message
    const resultMessage = qS('#result_register')
    resultMessage.className = 'mx-auto text-center text-2xs lg:text-[12px]'
    resultMessage.textContent = ''
    // submit button
    const registerButton = qS('#register_button') as HTMLInputElement
    // input value container
    const inputValues: Required<Omit<IUser, 'photo'>> = {
        username: null,
        password: null,
        confirm_password: null,
        display_name: null
    }
    // get input elements
    const formInputs = ev.currentTarget.elements
    for(let i=0; i<formInputs.length; i++) {
        const input = formInputs.item(i) as HTMLInputElement
        if(input.nodeName == 'INPUT') {
            // filter inputs
            if(setInputValue('username', input)) inputValues.username = input.value.trim().toLowerCase()
            else if(setInputValue('password', input)) inputValues.password = input.value.trim()
            else if(setInputValue('confirm_password', input)) inputValues.confirm_password = input.value.trim()
            else if(setInputValue('display_name', input)) inputValues.display_name = input.value.trim().toLowerCase()
            // error
            else {
                resultMessage.classList.add('text-red-300')
                resultMessage.textContent = errorLoginRegister(input.id, miscState.language)
                return
            }
        }
    }
    // confirm password
    if(inputValues.password != inputValues.confirm_password) {
        resultMessage.classList.add('text-red-300')
        resultMessage.textContent = translateUI({lang: miscState.language, text: 'confirm password doesnt match!'})
        return
    }
    // confirm password matched
    delete inputValues.confirm_password
    // hash password
    inputValues.password = sha256(inputValues.password)
    // submit button loading
    const tempButtonText = registerButton.textContent
    registerButton.textContent = 'Loading'
    registerButton.disabled = true
    // fetch
    const registerFetchOptions = fetcherOptions({method: 'POST', body: JSON.stringify(inputValues)})
    const registerResponse: IResponse = await (await fetcher('/register', registerFetchOptions)).json()
    // response
    switch(registerResponse.status) {
        // success 
        case 201: 
            resultMessage.classList.add('text-green-400')
            resultMessage.textContent = translateUI({
                lang: miscState.language, 
                text: '✅ xxx registered!'
            }).replace('xxx', registerResponse.data[0].display_name)
            // submit button normal
            registerButton.textContent = tempButtonText
            registerButton.removeAttribute('disabled')
            // empty inputs
            for(let j=0; j<formInputs.length; j++) {
                const input = formInputs.item(j) as HTMLInputElement
                if(input.nodeName == 'INPUT') input.value = ''
            }
            return
        default: 
            // submit button normal
            registerButton.textContent = tempButtonText
            registerButton.removeAttribute('disabled')
            // error
            resultMessage.classList.add('text-red-300')
            resultMessage.textContent = `❌ ${registerResponse.status}: ${registerResponse.message}`
            return
    }
}