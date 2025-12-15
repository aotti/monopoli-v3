export default function GameSounds() {
    const hostname = 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
    const sounds = {
        // game sfx
        message: `https://${hostname}/sound/message_notif-DgTswdqDvWjUqgZhXNsbgl9c6DAWPg.mp3`,
        game_notif: `https://${hostname}/sound/game_notif-YzBafun0qLBhCH4Qhdzsp1IaE9yvLW.mp3`,
        game_start: `https://${hostname}/sound/game_start-ekkpsIDG10QOCmin3I0D62GVcjCYNt.mp3`,
        footstep_1: `https://${hostname}/sound/footstep_1-1Q5XIEv89asfSop2tUZBchz5DeHyN5.mp3`,
        footstep_2: `https://${hostname}/sound/footstep_2-tCSGUyQcL0FtWPXsNfjSinwqNcbdzv.mp3`,
        roll_number: `https://${hostname}/sound/roll_number-ZG4g11XWaf6RLDUfSFimQoDEwgrglG.mp3`,
        special_card: `https://${hostname}/sound/special_card-L4LPGw0kifRu2iW9ylGDO9bxzkijj1.mp3`,
        player_join: `https://${hostname}/sound/player_join-wBS1tusK4djv4iki8onJHMbVda6ST1.mp3`,
        player_leave: `https://${hostname}/sound/player_leave-44H1nu79MoW1YJ9X4qwKrpvQUcQYa4.mp3`,
        player_turn: `https://${hostname}/sound/player_turn-xfALmtNybddwUtX4rakVzbBcIXMPdC.mp3`,
        city_quake: `https://${hostname}/sound/city_quake-T7V5iXu89utARVBqjxMLIevPPtsSiK.mp3`,
        city_meteor: `https://${hostname}/sound/city_meteor-Pnna8rJnAq1KktrXY8vYxAFGweFOz8.mp3`,
        area_buff: `https://${hostname}/sound/area_buff-R7jxXfMxDuB0ZmR6dU2zwnujMnmvxN.mp3`,
        area_debuff: `https://${hostname}/sound/area_debuff-w2A9Kjeu2r9pc0k8ZLkO3UZKd17Rc6.mp3`,
        create_room: `https://${hostname}/sound/create_room-kpRv5RboBBYBIpOKZIslDz43gG9cdn.mp3`,
        claim_reward: `https://${hostname}/sound/claim_reward-n10xCcu0IUK88MVjVjYLlzJCDuShn3.mp3`,
        missing_data: `https://${hostname}/sound/missing_data-spcwpdgPdKjs4hmnd9ys1wlewCIDI7.mp3`,
        // meme sfx indonesia
        id_prison: `https://${hostname}/sound/indonesia/id_prison-Zeriq61Yy6LWzMrw27eYTrPYoZz5yE.mp3`,
        id_parking: `https://${hostname}/sound/indonesia/id_parking-qMb7AGBS89Bj9STTUfQYl860kPc1lS.mp3`,
        id_city_buy: `https://${hostname}/sound/indonesia/id_city_buy-icv4pSd7tAJEfEYaXCUCHhABnebt2a.mp3`,
        id_city_tax: `https://${hostname}/sound/indonesia/id_city_tax-qAhbq0ll57rWX1qPYucMVDG06hD0RO.mp3`,
        id_city_money: `https://${hostname}/sound/indonesia/id_city_money-iJT351U3Q3vsTRPOJD7LaEbkCzqudm.mp3`,
        id_cursed: `https://${hostname}/sound/indonesia/id_cursed-SCCP5mBMIjFTDPqyXHdXTT7jV0dds8.mp3`,
        id_community: `https://${hostname}/sound/indonesia/id_community-cAhTjhlTzkr7q1n4ATz0tHnJ4JrNQc.mp3`,
        id_chance: `https://${hostname}/sound/indonesia/id_chance-fdDIVgtYntKhrBu5m2aljn1GyWaoYc.mp3`,
        id_game_ready: `https://${hostname}/sound/indonesia/id_game_ready-hXSO80Es1g1g3pidk2jKC7pT7IPKIA.mp3`,
        id_game_over: `https://${hostname}/sound/indonesia/id_game_over-WixI8yLbhJQFxfxJ1ZS8kNqJ6rW57H.mp3`,
        // meme sfx english
        en_prison: `https://${hostname}/sound/english/en_prison-GBTWPv2FSMc6dIBz784mmJjRxMlig4.mp3`,
        en_parking: `https://${hostname}/sound/english/en_parking-U4a6SKFSeEdJq6Ij53BuAed4bDM0DG.mp3`,
        en_city_buy: `https://${hostname}/sound/english/en_city_buy-dADBCz5ydjB5u2hVL32Y3JxOo1pmFp.mp3`,
        // en_city_tax: `https://${hostname}/sound/english/en_city_tax-qAhbq0ll57rWX1qPYucMVDG06hD0RO.mp3`,
        en_city_money: `https://${hostname}/sound/english/en_city_money-pxzF7Oj6a2sH1Mzt78L1aRSG7npQtV.mp3`,
        en_cursed: `https://${hostname}/sound/english/en_cursed-XZQqdeA2kVFgonpCIIPre9jBdgE0U3.mp3`,
        en_community: `https://${hostname}/sound/english/en_community-DqFE8T0GL6T1SWsVKnDuLUgkxQpi4X.mp3`,
        en_chance: `https://${hostname}/sound/english/en_chance-PXhbFZW8HjPJab4Zft9mAQfgCBSABg.mp3`,
        // en_game_ready: `https://${hostname}/sound/english/en_game_ready-bLAOFnSUhZz9ZHlvrgtqBB5CEoYkwV.mp3`,
        en_game_over: `https://${hostname}/sound/english/en_game_over-TLZ3WstWI5sYlLq2Qh8N74LBqJ3wXR.mp3`,
    }

    return (
        <div>
            {Object.entries(sounds).map(([key, value], i) => <audio key={key} id={`sound_${key}`} src={value} preload="none"></audio>)}
        </div>
    )
}