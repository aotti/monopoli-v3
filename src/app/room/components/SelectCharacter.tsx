import { useState } from "react"
import { translateUI } from "../../../helper/helper"
import { useMisc } from "../../../context/MiscContext"

export default function SelectCharacter({ disabledCharacters }: {disabledCharacters: string[]}) {
    const miscState = useMisc()
    const [selectedChar, setSelectedChar] = useState<string>('circle')
    // characters
    const character = {
        circle: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/characters/circle-MPxBNB61chi1TCQfEnqvWesqXT2IqM.png',
        square: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/characters/square-GcUfnpybETUDXjwbOxSTxdC6fkp4xb.png',
        triangle: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/characters/triangle-mK8MrHkoEEabrL5axYI9NzksW1CcQP.png',
        diamond: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/characters/diamond-Lmycp1sPqwqLzHgZXNntVupqIVdlir.png',
        cylinder: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/characters/cylinder-fr8MNq4VQfuGrlL4qmZBabnHyDtBor.png'
    }

    return (
        <div className="flex flex-col gap-2 text-center">
            <p> {translateUI({lang: miscState.language, text: 'select character'})} </p>
            <div className="grid grid-cols-3 gap-2">
                {Object.entries(character).map(([key, val], i) => {
                    // check if the character is disabled
                    const isCharacterDisabled = disabledCharacters.map(v => v.match(key) ? v : null).filter(i=>i)[0]

                    return (
                        <div key={i} className={isCharacterDisabled ? 'saturate-0' : ''}> 
                            <label htmlFor={`select_character_${key}`} className={`flex flex-col ${selectedChar == key ? 'bg-primary/60' : 'bg-darkblue-2'}`} onClick={() => setSelectedChar(key)}>
                                <img src={val} alt={key} className="w-8 mx-auto" draggable={false} />
                                <span className="text-2xs lg:text-xs"> 
                                    {translateUI({lang: miscState.language, text: key as any})} 
                                </span>
                            </label>
                            <input type="radio" className="hidden" id={`select_character_${key}`} name="select_character" value={val} />
                        </div>
                    )
                })}
                <input type="hidden" id="select_character" value={character[selectedChar]} />
            </div>
        </div>
    )
}