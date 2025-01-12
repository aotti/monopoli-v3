import PubNub from "pubnub"
import { GameRoomListener, IChat, IGameContext, IMiscContext } from "../../../helper/types"
import { qS, translateUI } from "../../../helper/helper"
import { gameOver, playerMoving } from "./game-logic"

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
    // room deleted
    if(getMessage.roomsLeft) {
        // set game stage to prepare
        gameState.setGameStages('prepare')
        // set rooms left
        gameState.setRoomList(getMessage.roomsLeft)
        // show notif
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        notifTitle.textContent = 'Room Deleted'
        notifMessage.textContent = 'this room has been deleted, redirect to room list'
        // redirect to room list
        setTimeout(() => {
            // set notif to null
            gameState.setShowGameNotif(null)
            const gotoRoom = qS('#gotoRoom') as HTMLAnchorElement
            gotoRoom.click()
        }, 2000)
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
        // move player pos
        // ### player turn = display_name
        playerMoving(getMessage.playerTurn, getMessage.playerDice, miscState, gameState)
    }
    // surrender
    if(getMessage.surrendPlayer) {
        gameState.setGamePlayerInfo(players => {
            const surrendPlayerInfo = [...players]
            // find surrend player
            const findPlayer = surrendPlayerInfo.map(v => v.display_name).indexOf(getMessage.surrendPlayer)
            // update money & city
            surrendPlayerInfo[findPlayer].money = -999999
            surrendPlayerInfo[findPlayer].city = null
            // get room info
            const findRoom = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
            // check player alive
            const alivePlayers = []
            for(let spi of surrendPlayerInfo) {
                // check players money amount
                if(spi.money > gameState.gameRoomInfo[findRoom].money_lose) 
                    alivePlayers.push(spi.display_name)
            }
            // update my player data only if alive player > 1
            if(alivePlayers.length > 1) {
                gameState.setMyPlayerInfo(player => {
                    const newMyPlayer = {...player}
                    newMyPlayer.game_played += 1
                    return newMyPlayer
                })
            }
            // return data
            return surrendPlayerInfo
        })
    }
    // sell city (null = sold all city)
    if(getMessage.cityLeft === null || getMessage.cityLeft.length > 0) {
        // update game history
        gameState.setGameHistory(getMessage.gameHistory)
        // update player city
        gameState.setGamePlayerInfo(players => {
            const newPlayerInfo = [...players]
            // find player who sell city
            const findPlayer = newPlayerInfo.map(v => v.display_name).indexOf(getMessage.citySeller)
            // update city
            newPlayerInfo[findPlayer].city = getMessage.cityLeft
            newPlayerInfo[findPlayer].money += getMessage.cityPrice
            // update city owned list
            localStorage.setItem('cityOwnedList', JSON.stringify(getMessage.cityOwnedList))
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            notifTitle.textContent = translateUI({lang: miscState.language, text: 'Sell City'})
            notifMessage.textContent = `${getMessage.citySeller} sold ${getMessage.citySold} city`
            return newPlayerInfo
        })
    }
    // end turn
    if(getMessage.playerTurnEnd) {
        // show notif next player turn
        playerTurnNotif.textContent = `${getMessage.playerTurns[0]} turn`
        // update game history
        gameState.setGameHistory(getMessage.gameHistory)
        // update city owned list
        localStorage.setItem('cityOwnedList', JSON.stringify(getMessage.cityOwnedList))
        // update player
        gameState.setGamePlayerInfo(players => {
            const newPlayerInfo = [...players]
            // find turn end player
            // ### when pay tax, visitor money already reduced in db
            // ### and return as playerTurnEnd, no need to reduce it anymore
            const findPlayer = newPlayerInfo.map(v => v.display_name).indexOf(getMessage.playerTurnEnd.display_name)
            newPlayerInfo[findPlayer] = getMessage.playerTurnEnd
            // if theres taxes
            if(getMessage.taxes) {
                // ### money is in minus state (ex: -5000)
                // ### for owner use - to reduce (- with - = +)
                // add owner money
                const findOwner = newPlayerInfo.map(v => v.display_name).indexOf(getMessage.taxes.owner)
                newPlayerInfo[findOwner].money -= getMessage.taxes.money
            }
            // check player alive
            checkAlivePlayers(newPlayerInfo, miscState, gameState)
            // return data
            return newPlayerInfo
        })
        // turn off notif
        miscState.setAnimation(false)
        gameState.setShowGameNotif(null)
    }
}

function checkAlivePlayers(playersData: IGameContext['gamePlayerInfo'], miscState: IMiscContext, gameState: IGameContext) {
    // notif
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // get room info
    const findRoom = gameState.gameRoomInfo.map(v => v.room_id).indexOf(gameState.gameRoomId)
    // get alive players
    const alivePlayers = []
    for(let pd of playersData) {
        // check players money amount
        if(pd.money > gameState.gameRoomInfo[findRoom].money_lose) 
            alivePlayers.push(pd.display_name)
    }
    // if only 1 left, game over
    if(alivePlayers.length === 1) {
        // remove city owned list
        localStorage.removeItem('cityOwnedList')
        // set game stage
        gameState.setGameStages('over')
        // update my player stats
        for(let pd of playersData) {
            if(pd.display_name == gameState.myPlayerInfo.display_name) {
                gameState.setMyPlayerInfo(player => {
                    const newMyPlayer = {...player}
                    newMyPlayer.game_played += 1
                    newMyPlayer.worst_money_lost = pd.money === -999999 ? newMyPlayer.worst_money_lost : pd.money
                    // save to local storage
                    localStorage.setItem('playerData', JSON.stringify(newMyPlayer))
                    return newMyPlayer
                })
            }
        }
        // show notif
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        // winner message
        notifTitle.textContent = `Game Over`
        notifMessage.textContent = `${alivePlayers[0]} has won the game!\nback to room list in 15 seconds`
        setTimeout(() => {
            // set notif to null
            gameState.setShowGameNotif(null)
            const gotoRoom = qS('#gotoRoom') as HTMLAnchorElement
            gotoRoom ? gotoRoom.click() : null
        }, 15_000)
        // run game over
        gameOver(miscState, gameState)
    }
}

