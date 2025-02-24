export default function GameSounds() {
    const sounds = {
        message: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/message_notif-DgTswdqDvWjUqgZhXNsbgl9c6DAWPg.mp3',
        footstep_1: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/footstep_1-1Q5XIEv89asfSop2tUZBchz5DeHyN5.mp3',
        footstep_2: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/footstep_2-tCSGUyQcL0FtWPXsNfjSinwqNcbdzv.mp3',
        roll_number: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/roll_number-ZG4g11XWaf6RLDUfSFimQoDEwgrglG.mp3',
        special_card: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/special_card-L4LPGw0kifRu2iW9ylGDO9bxzkijj1.mp3',
        player_join: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/player_join-wBS1tusK4djv4iki8onJHMbVda6ST1.mp3',
        player_leave: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/player_leave-44H1nu79MoW1YJ9X4qwKrpvQUcQYa4.mp3',
        city_broken: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/city_broken-A9OiUUnPvEWCaxHouw5rdCvJ3CJy0B.mp3',
        area_buff: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/area_buff-R7jxXfMxDuB0ZmR6dU2zwnujMnmvxN.mp3',
        area_debuff: 'https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/sound/area_debuff-w2A9Kjeu2r9pc0k8ZLkO3UZKd17Rc6.mp3',
    }

    return (
        <div>
            <audio id="sound_message_notif" src={sounds.message}></audio>
            <audio id="sound_footstep_1" src={sounds.footstep_1}></audio>
            <audio id="sound_footstep_2" src={sounds.footstep_2}></audio>
            <audio id="sound_roll_number" src={sounds.roll_number}></audio>
            <audio id="sound_special_card" src={sounds.special_card}></audio>
            <audio id="sound_player_join" src={sounds.player_join}></audio>
            <audio id="sound_player_leave" src={sounds.player_leave}></audio>
            <audio id="sound_city_broken" src={sounds.city_broken}></audio>
            <audio id="sound_area_buff" src={sounds.area_buff}></audio>
            <audio id="sound_area_debuff" src={sounds.area_debuff}></audio>
        </div>
    )
}