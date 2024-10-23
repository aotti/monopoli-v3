import { Dispatch, SetStateAction } from "react";

// translate language
export interface ITranslate {
    lang: 'english' | 'indonesia';
    text: string;
}

// tooltip
export interface ITooltip {
    key: string;
    text: string;
    pos: 'top'|'left'|'right'|'bottom';
    arrow: ['top'|'left'|'right'|'bottom', 'start'|'middle'|'end'];
}

// context
export interface IMiscContext {
    language: ITranslate['lang'];
    setLanguage: Dispatch<SetStateAction<ITranslate['lang']>>
}