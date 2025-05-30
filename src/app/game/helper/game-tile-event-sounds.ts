import { qS } from "../../../helper/helper";
import { IMiscContext } from "../../../helper/types";

type PlayGameSoundsType = 'prison'|'parking'|'city_buy'|'city_tax'|'city_money'|'cursed'|'community'|'chance'|'game_ready'|'game_over'

export function playGameSounds(name: PlayGameSoundsType, miscState: IMiscContext) {
    // set sound language
    const soundLanguage = miscState.language == 'english' ? 'en' : 'id';
    // play sound
    const gameSound = qS(`#sound_${soundLanguage}_${name}`) as HTMLAudioElement
    gameSound?.play()
}