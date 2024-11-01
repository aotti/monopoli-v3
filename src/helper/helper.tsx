import { MutableRefObject, useEffect } from "react";
import { ITranslate } from "./types";
import translateUI_data from '../config/translate-ui.json'

export function translateUI(params: ITranslate) {
    const { lang, text } = params
    return lang == 'indonesia' ? translateUI_data[lang][text] : text
}

/**
 * @param el element id/class/attribute 
 * @returns selected HTML element
 */
export function qS(el: string) {
    return document.querySelector(el)
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