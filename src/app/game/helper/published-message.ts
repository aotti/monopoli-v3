import PubNub from "pubnub"
import { GameRoomListener, IChat, IGameContext, IMiscContext, IRollDiceData } from "../../../helper/types"
import { qS, translateUI } from "../../../helper/helper"
import { checkGameProgress, playerMoving } from "./game-logic"

export function gameMessageListener(data: PubNub.Subscription.Message, miscState: IMiscContext, gameState: IGameContext) {
    const getMessage = data.message as PubNub.Payload & IChat & GameRoomListener
    // notif
    const playerTurnNotif = qS('#player_turn_notif')
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
    // add chat
    if(getMessage.message_text) {
        const chatData: Omit<IChat, 'channel'|'token'> = {
            display_name: getMessage.display_name,
            message_text: getMessage.message_text,
            message_time: getMessage.message_time
        }
        miscState.setMessageItems(data => [...data, chatData])
        // play notif sound
        const soundMessageNotif = qS('#sound_message_notif') as HTMLAudioElement
        if(getMessage.display_name != gameState.myPlayerInfo.display_name) 
            soundMessageNotif.play()
    }
    // join
    if(getMessage.joinPlayer) {
        gameState.setGamePlayerInfo(players => [...players, getMessage.joinPlayer])
        const soundPlayerJoin = qS('#sound_player_join') as HTMLAudioElement
        soundPlayerJoin.play()
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
        const soundPlayerLeave = qS('#sound_player_leave') as HTMLAudioElement
        soundPlayerLeave.play()
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
    if(getMessage.playerTurn && typeof getMessage.playerDice == 'number') {
        const rollDiceData: IRollDiceData = {
            playerTurn: getMessage.playerTurn,
            playerDice: getMessage.playerDice,
            playerRNG: getMessage.playerRNG,
            playerSpecialCard: getMessage.playerSpecialCard
        }
        // save dice for history, just in case if get card \w move effect
        localStorage.setItem('subPlayerDice', `${getMessage.playerDice}`)
        // move player pos
        // ### player turn = display_name
        playerMoving(rollDiceData, miscState, gameState)
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
            // update my player data only if alive player > 2
            if(alivePlayers.length > 2) {
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
    if(getMessage.cityLeft === null || getMessage.cityLeft?.length > 0) {
        // update game history
        gameState.setGameHistory(getMessage.gameHistory)
        // update player city
        gameState.setGamePlayerInfo(players => {
            const cityLeftInfo = [...players]
            // find player who sell city
            const findPlayer = cityLeftInfo.map(v => v.display_name).indexOf(getMessage.citySeller)
            // update city
            cityLeftInfo[findPlayer].city = getMessage.cityLeft
            cityLeftInfo[findPlayer].money += getMessage.cityPrice
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            notifTitle.textContent = translateUI({lang: miscState.language, text: 'Sell City'})
            notifMessage.textContent = `${getMessage.citySeller} sold ${getMessage.citySold} city`
            return cityLeftInfo
        })
    }
    // end turn
    if(getMessage.playerTurnEnd) {
        // save playerTurns
        localStorage.setItem('playerTurns', JSON.stringify(getMessage.playerTurns))
        // show notif next player turn
        playerTurnNotif.textContent = `${getMessage.playerTurns[0]} turn`
        // turn off notif for buttons
        if(gameState.showGameNotif?.match('with_button')) {
            miscState.setAnimation(false)
            gameState.setShowGameNotif(null)
        }
        // update game history
        gameState.setGameHistory(getMessage.gameHistory)
        // update player
        gameState.setGamePlayerInfo(players => {
            const newPlayerInfo = [...players]
            // find turn end player
            // ### when pay tax, visitor money already reduced in db
            // ### and return as playerTurnEnd, no need to reduce it anymore
            const findPlayer = newPlayerInfo.map(v => v.display_name).indexOf(getMessage.playerTurnEnd.display_name)
            newPlayerInfo[findPlayer] = getMessage.playerTurnEnd
            // if theres taxes
            if(getMessage?.taxes) {
                // ### money is in minus state (ex: -5000)
                // ### for owner use - to reduce (- with - = +)
                // add owner money
                const findOwner = newPlayerInfo.map(v => v.display_name).indexOf(getMessage.taxes.owner)
                newPlayerInfo[findOwner].money -= getMessage.taxes.money
            }
            if(getMessage?.takeMoney) {
                // update other player money
                for(let other of getMessage.takeMoney.from) {
                    const findOther = newPlayerInfo.map(v => v.display_name).indexOf(other)
                    newPlayerInfo[findOther].money -= getMessage.takeMoney.money
                }
            }
            // check player alive
            checkGameProgress(newPlayerInfo, miscState, gameState)
            // return data
            return newPlayerInfo
        })
    }
    // game over
    if(getMessage.gameOverPlayers) {
        // set local storage for temp syncronize data
        getMessage.gameOverPlayers.forEach(v => {
            if(v.player == gameState.myPlayerInfo.display_name) {
                // set temp player info
                const newPlayerInfo = gameState.myPlayerInfo
                newPlayerInfo.game_played += 1
                newPlayerInfo.worst_money_lost = v.worst_money === -999999 
                                                ? newPlayerInfo.worst_money_lost 
                                                : v.worst_money
                // save to local storage
                localStorage.setItem('playerData', JSON.stringify(newPlayerInfo))
            }
        })
    }
}
