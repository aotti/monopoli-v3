import PubNub from "pubnub"
import { GameRoomListener, IChat, IGameContext, IMiscContext } from "../../../helper/types"
import { qS, translateUI } from "../../../helper/helper"
import { playerMoving } from "../components/board/RollNumber"

export function gameMessageListener(data: PubNub.Subscription.Message, miscState: IMiscContext, gameState: IGameContext) {
    const getMessage = data.message as PubNub.Payload & IChat & GameRoomListener
    // notif
    const playerTurnNotif = qS('#player_turn_notif')
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
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
    // join
    if(getMessage.joinPlayer) {
        gameState.setGamePlayerInfo(players => [...players, getMessage.joinPlayer])
    }
    // leave
    if(getMessage.leavePlayer) {
        gameState.setGamePlayerInfo(players => {
            const playersLeft = [...players]
            // remove player
            const findLeavePlayer = playersLeft.map(v => v.display_name).indexOf(getMessage.leavePlayer)
            playersLeft.splice(findLeavePlayer, 1)
            return playersLeft
        })
    }
    // ready
    if(getMessage.readyPlayers) {
        // set players ready text
        playerTurnNotif.textContent = `${getMessage.readyPlayers.length} player(s) ready`
        // if > 2 players ready, set notif
        if(getMessage.readyPlayers.length >= 2) {
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            notifTitle.textContent = translateUI({lang: miscState.language, text: 'Preparation'})
            notifMessage.textContent = translateUI({lang: miscState.language, text: 'if all players are ready, room creator have to click the "start" button'})
        }
    }
    // start
    if(getMessage.startGame) {
        // change game stage
        gameState.setGameStages('decide')
        // set fixed player number
        gameState.setGameFixedPlayers(getMessage.fixedPlayers)
        // remove players ready text
        playerTurnNotif.textContent = translateUI({lang: miscState.language, text: 'click roll turn'})
    }
    // decide
    if(getMessage.decidePlayers) {
        // display rolled number
        const decidePlayersRank = []
        for(let dp of getMessage.decidePlayers) 
            decidePlayersRank.push(`${dp.rolled_number} - ${dp.display_name}`)
        playerTurnNotif.textContent = decidePlayersRank.join('\n')
        // change game stage
        gameState.setGameStages(getMessage.gameStage)
    }
    // roll dice
    if(getMessage.playerTurn && getMessage.playerDice) {
        console.log(getMessage.playerTurn, getMessage.playerDice);
        
        // move player pos
        // ### player turn = display_name
        playerMoving(getMessage.playerTurn, getMessage.playerDice, miscState, gameState)
    }
    // end turn
    if(getMessage.playerTurnEnd) {
        // update game history
        gameState.setGameHistory(getMessage.gameHistory)
        // update player
        gameState.setGamePlayerInfo(players => {
            const newPlayerInfo = [...players]
            // find turn end player
            const findPlayer = newPlayerInfo.map(v => v.display_name).indexOf(getMessage.playerTurnEnd.display_name)
            newPlayerInfo[findPlayer] = getMessage.playerTurnEnd
            return newPlayerInfo
        })
        // show notif next player turn
        playerTurnNotif.textContent = `${getMessage.playerTurns[0]} turn`
    }
}