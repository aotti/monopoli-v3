import PubNub from "pubnub"
import { IChat, IGameContext, IMiscContext, RoomListListener } from "../../../helper/types"

export function roomMessageListener(data: PubNub.Subscription.Message, miscState: IMiscContext, gameState: IGameContext) {
    const getMessage = data.message as PubNub.Payload & IChat & RoomListListener
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
            const findJoined = updatedRooms.map(v => v.room_id).indexOf(getMessage.joinedRoomId)
            if(findJoined !== -1) {
                // update player count
                updatedRooms[findJoined].player_count = getMessage.playerCount
                // update disabled characters
                updatedRooms[findJoined].characters = getMessage.disabledCharacters
            }
            // return rooms
            return updatedRooms
        })
    }
    // player leave
    if(getMessage.leavePlayer) {
        // update room list
        gameState.setRoomList(rooms => {
            const updatedRooms = [...rooms]
            // find joined room
            const findJoined = updatedRooms.map(v => v.room_id).indexOf(getMessage.leaveRoomId)
            if(findJoined !== -1) {
                // update player count
                updatedRooms[findJoined].player_count = getMessage.playerCount
            }
            // return rooms
            return updatedRooms
        })
    }
    // room deleted
    if(getMessage.roomsLeft) {
        // set game stage to prepare
        gameState.setGameStages('prepare')
        // set rooms left
        gameState.setRoomList(getMessage.roomsLeft)
        // if the room player wanna join deleted, reset join prompt
        getMessage.roomsLeft.forEach(v => {
            if(!miscState.showJoinModal.match(`${v.room_id}`))
                miscState.setShowJoinModal(null)
        })
    }
    // update room status
    if(getMessage.roomGame) {
        gameState.setRoomList(rooms => {
            const newRoomStatus = [...rooms]
            // find updated room
            const findRoom = newRoomStatus.map(v => v.room_id).indexOf(getMessage.roomGame)
            newRoomStatus[findRoom].status = 'playing'
            return newRoomStatus
        })
    }
    // game over
    if(getMessage.roomOverId) {
        // update room list
        gameState.setRoomList(rooms => {
            const newRoomList = [...rooms]
            // find room over
            const findRoom = newRoomList.map(v => v.room_id).indexOf(getMessage.roomOverId)
            if(findRoom === -1) return newRoomList
            // delete room
            newRoomList.splice(findRoom, 1)
            return newRoomList
        })
    }
}