export default function GameSounds() {
    const sounds = {
        message: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/message_notif-DgTswdqDvWjUqgZhXNsbgl9c6DAWPg.mp3',
        footstep_1: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/footstep_1-1Q5XIEv89asfSop2tUZBchz5DeHyN5.mp3',
        footstep_2: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/footstep_2-tCSGUyQcL0FtWPXsNfjSinwqNcbdzv.mp3',
        roll_number: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/roll_number-ZG4g11XWaf6RLDUfSFimQoDEwgrglG.mp3',
        special_card: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/special_card-L4LPGw0kifRu2iW9ylGDO9bxzkijj1.mp3',
    }

    return (
        <div>
            <audio id="sound_message_notif" src={sounds.message}></audio>
            <audio id="sound_footstep_1" src={sounds.footstep_1}></audio>
            <audio id="sound_footstep_2" src={sounds.footstep_2}></audio>
            <audio id="sound_roll_number" src={sounds.roll_number}></audio>
            <audio id="sound_special_card" src={sounds.special_card}></audio>
        </div>
    )
}