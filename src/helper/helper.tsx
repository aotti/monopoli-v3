import { MutableRefObject, PointerEvent, useEffect } from "react";
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

export function applyTooltip(ev: PointerEvent<HTMLElement>) {
    // get element position
    const elementRects = ev.currentTarget.getBoundingClientRect()
    const [top, left, right, bottom] = [elementRects.top, elementRects.left, elementRects.right, elementRects.bottom]
    // window size
    const [winWidth, winHeight] = [window.innerWidth, window.innerHeight]
    // element pos
    // winWidth/winHeight are used to check if element close to the wall
    // right + bottom values would be > 1000 if element is on far right/bottom
    const elementPos = {
        top: +top.toFixed(),
        left: +left.toFixed(),
        right: +(winWidth - right).toFixed(),
        bottom: +(winHeight - bottom).toFixed()
    }
    // check text length
    const text = ev.currentTarget.dataset['tooltip']
    switch(true) {
        // 27 = 2 rows (round to 30)
        case text.length <= 30 * 1: applyTooltipStyle(2); break
        case text.length <= 30 * 2: applyTooltipStyle(4); break
        case text.length <= 30 * 3: applyTooltipStyle(6); break
        // 8 rows
        case text.length <= 30 * 4: applyTooltipStyle(8); break
    }

    function applyTooltipStyle(rows: number) {
        // check Y axis first
        // ### LALU CEK X AXIS, LALU CEK JUMLAH ROWS
        // ### JIKA ROWS <= 2, MAKA PILIH KANAN/KIRI, SELAIN ITU ATAS/BAWAH 
        switch(true) {
            case elementPos.top >= 200:
                // top-25 | top-50 | top-75 | top-100
                if(rows === 2) ['tooltip-top-25', 'tooltip-top-25-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                if(rows === 4) ['tooltip-top-50', 'tooltip-top-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                if(rows === 6) ['tooltip-top-75', 'tooltip-top-75-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                if(rows === 8) ['tooltip-top-100', 'tooltip-top-100-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                return
            case elementPos.right >= 200:
                // right-50 | right-100
                if(rows <= 4) ['tooltip-right-50', 'tooltip-right-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                else ['tooltip-right-100', 'tooltip-right-100-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                return
            case elementPos.left >= 200:
                // left-50 | left-100
                if(rows <= 4) ['tooltip-left-50', 'tooltip-left-50-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                else ['tooltip-left-100', 'tooltip-left-100-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                return
            case elementPos.bottom >= 200:
                // bottom | bottom-lg
                ['tooltip-bottom', 'tooltip-bottom-lg'].map(cls => ev.currentTarget.classList.toggle(cls))
                return
        }
    }
}