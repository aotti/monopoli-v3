import { Dispatch, SetStateAction } from "react";
import translateUI_data from '../config/translate-ui.json'

// translate language
export interface ITranslate {
    lang: 'english' | 'indonesia',
    text: keyof typeof translateUI_data['indonesia'],
    lowercase?: boolean,
}

// tooltip
/**
 * @param key element id, ex: #test
 */
export interface ITooltip {
    text: string,
    key: string,
    pos: 'top'|'left'|'right'|'bottom',
    arrow: ['top'|'left'|'right'|'bottom', 'start'|'middle'|'end'],
}

// context
type TutorialRoomList = 'tutorial_roomlist_1'|'tutorial_roomlist_2'|'tutorial_roomlist_3'
type TutorialGameRoom = 'tutorial_gameroom_1'|'tutorial_gameroom_2'|'tutorial_gameroom_3'
export interface IMiscContext {
    language: ITranslate['lang'],
    setLanguage: Dispatch<SetStateAction<ITranslate['lang']>>,
    showModal: 'login'|'register'|'create room',
    setShowModal: Dispatch<SetStateAction<IMiscContext['showModal']>>,
    hoverTooltip: string,
    setHoverTooltip: Dispatch<SetStateAction<string>>,
    animation: boolean,
    setAnimation: Dispatch<SetStateAction<boolean>>,
    isChatFocus: 'on'|'off'|'stay',
    setIsChatFocus: Dispatch<SetStateAction<IMiscContext['isChatFocus']>>,
    showTutorial: TutorialRoomList | TutorialGameRoom,
    setShowTutorial: Dispatch<SetStateAction<IMiscContext['showTutorial']>>,
}

export interface IGameContext {
    // board
    showTileImage: 'city'|'other',
    setShowTileImage: Dispatch<SetStateAction<IGameContext['showTileImage']>>,
    showNotif: 'normal'|'with_button',
    setShowNotif: Dispatch<SetStateAction<IGameContext['showNotif']>>,
    rollNumber: 'dice'|'turn',
    setRollNumber: Dispatch<SetStateAction<IGameContext['rollNumber']>>,
    // side buttons
    gameSideButton: 'help' | 'players' | 'chat',
    setGameSideButton: Dispatch<SetStateAction<IGameContext['gameSideButton']>>,
    openPlayerSetting: boolean,
    setOpenPlayerSetting: Dispatch<SetStateAction<boolean>>,
    displaySettingItem: 'sell_city'|'game_history'|'attack_city',
    setDisplaySettingItem: Dispatch<SetStateAction<IGameContext['displaySettingItem']>>,
    showGameHistory: boolean,
    setShowGameHistory: Dispatch<SetStateAction<boolean>>,
}