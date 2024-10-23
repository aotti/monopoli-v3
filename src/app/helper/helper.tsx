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