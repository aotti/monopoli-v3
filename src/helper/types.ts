import { Dispatch, SetStateAction } from "react";

// translate language
export interface ITranslate {
    lang: 'english' | 'indonesia';
    text: string;
}

// tooltip
/**
 * @param key element id, ex: #test
 */
export interface ITooltip {
    text: string;
    key: string;
    pos: 'top'|'left'|'right'|'bottom';
    arrow: ['top'|'left'|'right'|'bottom', 'start'|'middle'|'end'];
}

// context
export interface IMiscContext {
    language: ITranslate['lang'];
    setLanguage: Dispatch<SetStateAction<ITranslate['lang']>>;
    showModal: string;
    setShowModal: Dispatch<SetStateAction<string>>;
    hoverTooltip: string;
    setHoverTooltip: Dispatch<SetStateAction<string>>;
    animation: boolean;
    setAnimation: Dispatch<SetStateAction<boolean>>;
    isChatFocus: boolean;
    setIsChatFocus: Dispatch<SetStateAction<boolean>>;
}