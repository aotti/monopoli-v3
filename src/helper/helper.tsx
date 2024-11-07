import { MutableRefObject, useEffect } from "react";
import { ITranslate } from "./types";
import translateUI_data from '../config/translate-ui.json'

export function translateUI(params: ITranslate) {
    const { lang, text, lowercase } = params
    const translated = lang == 'indonesia' ? translateUI_data[lang][text] : text
    return lowercase ? translated.toLowerCase() : translated
}

/**
 * @param el element id/class/attribute 
 * @returns selected HTML element
 */
export function qS(el: string) {
    return document.querySelector(el)
}
/**
 * @param el element id/class/attribute 
 * @returns all selected HTML element
 */
export function qSA(el: string) {
    return document.querySelectorAll(el)
}

export function moneyFormat(number: number) {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        trailingZeroDisplay: 'stripIfInteger',
    })
    // format number to currency
    return formatter.format(number)
}

export function clickOutsideElement(ref: MutableRefObject<any>, handler: () => void) {
    useEffect(() => {
        const listener = (ev: Event) => {
            // do nothing if clicking ref's element or descendent elements
            if(!ref?.current || ref.current.contains(ev.target)) return

            handler()
        }

        // event listener
        document.addEventListener('click', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('click', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler])
}