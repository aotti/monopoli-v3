import PubNub from "pubnub"
import { GameRoomListener, IChat, IGameContext, IMiscContext, IRollDiceData } from "../../../helper/types"
import { qS, translateUI } from "../../../helper/helper"
import { checkGameProgress, playerMoving } from "./game-prepare-playing-logic"
import { attackCityAnimation } from "./game-tile-event-attack-logic"
import { playGameSounds } from "./game-tile-event-sounds"

export function gameMessageListener(data: PubNub.Subscription.Message, miscState: IMiscContext, gameState: IGameContext) {
    const getMessage = data.message as PubNub.Payload & IChat & GameRoomListener
    // notif
    const playerTurnNotif = qS('#player_turn_notif')
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')
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
        notifTitle.textContent = translateUI({lang: miscState.language, text: 'Room Deleted'})
        notifMessage.textContent = translateUI({lang: miscState.language, text: 'this room has been deleted, redirect to room list..'})
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
        playerTurnNotif.textContent = translateUI({lang: miscState.language, text: 'ppp player(s) ready'})
                                    .replace('ppp', getMessage.readyPlayers.length.toString())
        // if > 2 players ready, set notif
        if(getMessage.readyPlayers.length >= 2) {
            // play sound
            playGameSounds('game_ready', miscState)
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
        // if game stage == play
        if(getMessage.gameStage == 'play') {
            // show notif
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
            notifTitle.textContent = translateUI({lang: miscState.language, text: 'Game Start'})
            notifMessage.textContent = translateUI({lang: miscState.language, text: 'Only buff & debuff area works on lap 1, other event starts on laps > 1'})
        }
    }
    // roll dice
    if(getMessage.playerTurn && typeof getMessage.playerDice == 'number') {
        const rollDiceData: IRollDiceData = {
            playerTurn: getMessage.playerTurn,
            playerDice: getMessage.playerDice,
            playerRNG: getMessage.playerRNG,
            playerSpecialCard: getMessage.playerSpecialCard
        }
        // check if player have special card (upgrade city)
        const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(getMessage.playerTurn)
        const tempCurrentSpecialCard = gameState.gamePlayerInfo[findPlayer].card
        // player have no special card, delete it
        if(!tempCurrentSpecialCard?.match(getMessage.playerSpecialCard?.split('-')[1]))
            rollDiceData.playerSpecialCard = null
        // save dice for history, just in case if get card \w move effect
        localStorage.setItem('subPlayerDice', `${getMessage.playerDice}`)
        // move player pos
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
    // attack city
    if(getMessage.attackType) {
        // update game history
        gameState.setGameHistory(getMessage.gameHistory)
        // show notif
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        notifTitle.textContent = translateUI({lang: miscState.language, text: 'Attack City'})
        notifMessage.textContent = translateUI({lang: miscState.language, text: `ccc city attacked by ppp with ttt`})
                                .replace('ccc', getMessage.targetCity)
                                .replace('ppp', getMessage.attackerName)
                                .replace('ttt', translateUI({lang: miscState.language, text: getMessage.attackType as any}))
                                + (getMessage.targetSpecialCard ? `\n"attack shifted"` : '')
        // attack city animation 
        const attackTimer = getMessage.attackType == 'meteor' ? 5000 : 3000
        attackCityAnimation({
            attackTimer: attackTimer,
            attackType: getMessage.attackType,
            targetCity: getMessage.targetCity,
            targetCityProperty: getMessage.targetCityProperty
        })
        setTimeout(() => {
            // set game quake city
            gameState.setGameQuakeCity(getMessage.quakeCity)
            // update player data
            gameState.setGamePlayerInfo(players => {
                const newPlayerInfo = [...players]
                // loop player data
                newPlayerInfo.forEach((np, i) => {
                    const findPlayer = getMessage.playerData.map(v => v.display_name).indexOf(np.display_name)
                    newPlayerInfo[i].money = getMessage.playerData[findPlayer].money
                    newPlayerInfo[i].city = getMessage.playerData[findPlayer].city
                    newPlayerInfo[i].card = getMessage.playerData[findPlayer].card
                })
                return newPlayerInfo
            })
        }, attackTimer);
    }
    // fix player turns
    if(getMessage.fixPlayerTurns) {
        // save playerTurns
        localStorage.setItem('playerTurns', JSON.stringify(getMessage.fixPlayerTurns))
        // show notif next player turn
        playerTurnNotif.textContent = translateUI({lang: miscState.language, text: 'ppp turn'})
                                    .replace('ppp', getMessage.fixPlayerTurns[0])
    }
    // end turn
    if(getMessage.playerTurnEnd) {
        // save playerTurns
        localStorage.setItem('playerTurns', JSON.stringify(getMessage.playerTurns))
        // show notif next player turn
        playerTurnNotif.textContent = translateUI({lang: miscState.language, text: 'ppp turn'})
                                    .replace('ppp', getMessage.playerTurns[0])
        // play player turn sound
        if(getMessage.playerTurns[0] === gameState.myPlayerInfo.display_name) {
            const soundPlayerTurn = qS('#sound_player_turn') as HTMLAudioElement
            soundPlayerTurn.play()
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
        // show notif after 1 sec
        setTimeout(() => {
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
        }, 1000);
        // set local storage for temp syncronize data
        getMessage.gameOverPlayers.forEach(v => {
            if(v.player_name == gameState.myPlayerInfo.display_name) {
                // set temp player info
                const newPlayerInfo = gameState.myPlayerInfo
                newPlayerInfo.game_played += 1
                newPlayerInfo.worst_money_lost = v.worst_money === -999999 
                                                // player won
                                                ? newPlayerInfo.worst_money_lost 
                                                // player lost, but is lost money < worst money
                                                : v.worst_money < newPlayerInfo.worst_money_lost
                                                    // yes, lost money is worst than current
                                                    ? v.worst_money
                                                    // nope
                                                    : newPlayerInfo.worst_money_lost
                // save to local storage
                localStorage.setItem('playerData', JSON.stringify(newPlayerInfo))
                // update player coins
                localStorage.setItem('playerCoins', `${v.player_coins}`)
                gameState.setMyCoins(v.player_coins)
            }
        })
    }
}
