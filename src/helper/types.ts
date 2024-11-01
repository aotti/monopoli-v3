import { Dispatch, SetStateAction } from "react";
import translateUI_data from '../config/translate-ui.json'

// translate language
export interface ITranslate {
    lang: 'english' | 'indonesia';
    text: keyof typeof translateUI_data['indonesia'];
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

export interface IGameContext {
    gameSideButton: 'help' | 'players' | 'chat';
    setGameSideButton: Dispatch<SetStateAction<IGameContext['gameSideButton']>>;
}