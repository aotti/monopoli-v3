import PubNub from "pubnub"
import { IChat, IGameContext, IMiscContext, RoomListListener } from "../../../helper/types"
import { qS } from "../../../helper/helper"

export function roomMessageListener(data: PubNub.Subscription.Message, miscState: IMiscContext, gameState: IGameContext) {
    const getMessage = data.message as PubNub.Payload & IChat & RoomListListener
    // add chat
    const soundMessageNotif = qS('#sound_message_notif') as HTMLAudioElement
    if(getMessage.message_text) {
        const chatData: Omit<IChat, 'channel'|'token'> = {
            display_name: getMessage.display_name,
            message_text: getMessage.message_text,
            message_time: getMessage.message_time
        }
        miscState.setMessageItems(data => [...data, chatData])
        // play notif sound
        if(getMessage.display_name != gameState.myPlayerInfo.display_name) 
            soundMessageNotif.play()
    }
    // update online player
    if(getMessage.onlinePlayers) {
        const onlinePlayersData = getMessage.onlinePlayers
        localStorage.setItem('onlinePlayers', onlinePlayersData)
        gameState.setOnlinePlayers(JSON.parse(onlinePlayersData))
    }
    // room created
    if(getMessage.roomCreated) {
        // set to room list
        gameState.setRoomList(room => [...room, getMessage.roomCreated])
        // set game room info
        gameState.setGameRoomInfo(rooms => [...rooms, getMessage.roomInfo])
    }
    // player join
    if(getMessage.joinedRoomId) {
        // update room list
        gameState.setRoomList(rooms => {
            const updatedRooms = [...rooms]
            // find joined room
            const findJoined = rooms.map(v => v.room_id).indexOf(getMessage.joinedRoomId)
            if(findJoined !== -1) {
                // update player count
                updatedRooms[findJoined].player_count = getMessage.joinedPlayers
                // update disabled characters
                updatedRooms[findJoined].characters = getMessage.disabledCharacters
            }
            // return rooms
            return updatedRooms
        })
    }
    // player leave
    if(getMessage.leavePlayer) {
        gameState.setGamePlayerInfo(players => {
            const playersLeft = [...players]
            // remove player
            const findLeavePlayer = playersLeft.map(v => v.display_name).indexOf(getMessage.leavePlayer)
            playersLeft.splice(findLeavePlayer, 1)
            return playersLeft
        })
    }
    // room deleted
    if(getMessage.roomsLeft) {
        // set rooms left
        gameState.setRoomList(getMessage.roomsLeft)
    }
}