export default function GameSounds() {
    const hostname = 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
    const sounds = {
        message: `https://${hostname}/sound/message_notif-DgTswdqDvWjUqgZhXNsbgl9c6DAWPg.mp3`,
        footstep_1: `https://${hostname}/sound/footstep_1-1Q5XIEv89asfSop2tUZBchz5DeHyN5.mp3`,
        footstep_2: `https://${hostname}/sound/footstep_2-tCSGUyQcL0FtWPXsNfjSinwqNcbdzv.mp3`,
        roll_number: `https://${hostname}/sound/roll_number-ZG4g11XWaf6RLDUfSFimQoDEwgrglG.mp3`,
        special_card: `https://${hostname}/sound/special_card-L4LPGw0kifRu2iW9ylGDO9bxzkijj1.mp3`,
        player_join: `https://${hostname}/sound/player_join-wBS1tusK4djv4iki8onJHMbVda6ST1.mp3`,
        player_leave: `https://${hostname}/sound/player_leave-44H1nu79MoW1YJ9X4qwKrpvQUcQYa4.mp3`,
        player_turn: `https://${hostname}/sound/player_turn-xfALmtNybddwUtX4rakVzbBcIXMPdC.mp3`,
        city_broken: `https://${hostname}/sound/city_broken-A9OiUUnPvEWCaxHouw5rdCvJ3CJy0B.mp3`,
        area_buff: `https://${hostname}/sound/area_buff-R7jxXfMxDuB0ZmR6dU2zwnujMnmvxN.mp3`,
        area_debuff: `https://${hostname}/sound/area_debuff-w2A9Kjeu2r9pc0k8ZLkO3UZKd17Rc6.mp3`,
    }

    return (
        <div>
            {Object.entries(sounds).map(([key, value], i) => <audio key={key} id={`sound_${key}`} src={value}></audio>)}
        </div>
    )
}