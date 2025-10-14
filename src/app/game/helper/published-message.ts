import PubNub from "pubnub"
import { GameRoomListener, IChat, IGameContext, IMiscContext, IRollDiceData } from "../../../helper/types"
import { qS, translateUI } from "../../../helper/helper"
import { checkGameProgress, playerMoving } from "./game-prepare-playing-logic"
import { attackCityAnimation } from "./game-tile-event-attack-logic"
import { playGameSounds } from "./game-tile-event-sounds"
import { getAnswerList, minigameAnswerCorrection, minigameInfo, setCategoriesAndLetters } from "./game-tile-event-minigame"

export function gameMessageListener(data: PubNub.Subscription.Message, miscState: IMiscContext, gameState: IGameContext) {
    const getMessage = data.message as PubNub.Payload & IChat & GameRoomListener
    // notif
    const playerTurnNotif = qS('#player_turn_notif')
    const notifTitle = qS('#result_notif_title')
    const notifMessage = qS('#result_notif_message')

    /**
     * CONTENT LIST
     * - PLAYER JOIN
     * - PLAYER LEAVE
     * - ROOM DELETED
     * - GAME READY
     * - GAME START
     * - PLAYER DECIDE TURN
     * - PLAYER ROLL DICE
     * - PLAYER SURRENDER
     * - PLAYER SELL CITY
     * - PLAYER MISSING DATA
     * - PLAYER UPGRADE CITY
     * - PLAYER ATTACK CITY
     * - FIX PLAYER TURNS
     * - MINIGAME PREPARE DATA
     * - MINIGAME ANSWER CORRECTION
     * - PLAYER TURN END
     * - GAME OVER
     */

    // - PLAYER JOIN
    if(getMessage.joinPlayer) {
        gameState.setGamePlayerInfo(players => [...players, getMessage.joinPlayer])
        const soundPlayerJoin = qS('#sound_player_join') as HTMLAudioElement
        soundPlayerJoin.play()
    }
    // - PLAYER LEAVE
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
    // - ROOM DELETED
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
    // - GAME READY
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
    // - GAME START
    if(getMessage.startGame) {
        // change game stage
        gameState.setGameStages('decide')
        // remove players ready text
        playerTurnNotif.textContent = translateUI({lang: miscState.language, text: 'click roll turn'})
        // reset all player shop items
        gameState.setMyShopItems(null)
    }
    // - PLAYER DECIDE TURN
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
    // - PLAYER ROLL DICE
    if(getMessage.playerTurn && typeof getMessage.playerDice == 'number') {
        const rollDiceData: IRollDiceData = {
            playerTurn: getMessage.playerTurn,
            playerDice: getMessage.playerDice,
            playerRNG: getMessage.playerRNG,
        }
        // save dice for history, just in case if get card \w move effect
        localStorage.setItem('subPlayerDice', `${getMessage.playerDice}`)
        // move player pos
        playerMoving(rollDiceData, miscState, gameState)
    }
    // - PLAYER SURRENDER
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
    // - PLAYER SELL CITY (null = sold all city)
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
    // - PLAYER MISSING DATA
    if(getMessage.missingData) {
        const {display_name, city, card, buff, debuff} = getMessage.missingData
        // show notif
        miscState.setAnimation(true)
        gameState.setShowGameNotif('normal')
        notifTitle.textContent = 'Missing Data'
        notifMessage.textContent = `${display_name} returned data:\ncity: ${city}\ncard: ${card}`
        // update player data
        gameState.setGamePlayerInfo(players => {
            // get player data
            const allPlayerInfo = [...players]
            const findPlayer = allPlayerInfo.map(v => v.display_name).indexOf(display_name)
            // update
            allPlayerInfo[findPlayer].city = city
            allPlayerInfo[findPlayer].card = card
            allPlayerInfo[findPlayer].buff = buff
            allPlayerInfo[findPlayer].debuff = debuff
            // return data
            return allPlayerInfo
        })
    }
    // - PLAYER UPGRADE CITY
    if(getMessage.upgradeCity) {
        const {display_name, money, city, card} = getMessage.upgradeCity
        // sound effect
        const soundSpecialCard = qS('#sound_special_card') as HTMLAudioElement
        soundSpecialCard.play()
        // update game history
        gameState.setGameHistory(getMessage.gameHistory)
        // update player data
        gameState.setGamePlayerInfo(players => {
            // get player data
            const allPlayerInfo = [...players]
            const findPlayer = allPlayerInfo.map(v => v.display_name).indexOf(display_name)
            // update
            allPlayerInfo[findPlayer].money = money
            allPlayerInfo[findPlayer].city = city
            allPlayerInfo[findPlayer].card = card
            // return data
            return allPlayerInfo
        })
    }
    // - PLAYER ATTACK CITY
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
            // set missing data local storage
            getMessage.multiMissingData.forEach(data => {
                if(data?.display_name === gameState.myPlayerInfo.display_name) 
                    localStorage.setItem('missingData', JSON.stringify(data))
            })
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
    // - FIX PLAYER TURNS
    if(getMessage.fixPlayerTurns) {
        // save playerTurns
        localStorage.setItem('playerTurns', JSON.stringify(getMessage.fixPlayerTurns))
        // show notif next player turn
        playerTurnNotif.textContent = translateUI({lang: miscState.language, text: 'ppp turn'})
                                    .replace('ppp', getMessage.fixPlayerTurns[0])
    }
    // - MINIGAME PREPARE DATA
    if(getMessage.minigamePreparedData) {
        // html elements
        const minigameTimer = qS('#minigame_timer')
        // set minigame data
        const {categories, words, letters, matchedWords, hintAnswers} = getMessage.minigamePreparedData
        gameState.setMinigameWords(words)
        gameState.setMinigameMatchedWords(matchedWords)
        // set categories and letters
        setCategoriesAndLetters(categories, letters, miscState)
        // set info
        minigameInfo('success', '')
        // set timer
        const playerAmount = gameState.gamePlayerInfo.length
        let minigameCounter = playerAmount === 2 ? 25 : 30 // seconds 
        const minigameInterval = setInterval(() => {
            if(minigameCounter < 0) {
                clearInterval(minigameInterval)
                minigameInfo('success', 'times up, distributing mini game result..')
                // display answer list (all players)
                getAnswerList(miscState, gameState)
                // display 6 hint answer
                gameState.setMinigameHintAnswers(hintAnswers)
                // hide minigame modal
                return setTimeout(() => {
                    // reset categories and letters
                    setCategoriesAndLetters(
                        ['category_1', 'category_2', 'category_3'],
                        ['letter_1', 'letter_2', 'letter_3'],
                        miscState
                    )
                    // hide mini game + reset answer list
                    miscState.setAnimation(false)
                    gameState.setShowMiniGame(false)
                    gameState.setMinigameAnswerList([])
                    gameState.setMinigameHintAnswers(null)
                }, 5000);
            }
            minigameTimer.textContent = `time: ${minigameCounter}`
            minigameCounter--
        }, 1000);
    }
    // - MINIGAME ANSWER CORRECTION
    if(getMessage.minigameAnswerData) {
        minigameAnswerCorrection(getMessage.minigameAnswerData, miscState, gameState)
    }
    // - PLAYER TURN END
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
            // update player
            const allPlayerInfo = [...players]
            // find turn end player
            // ### when pay tax, visitor money already reduced in db
            // ### and return as playerTurnEnd, no need to reduce it anymore
            const findPlayer = allPlayerInfo.map(v => v.display_name).indexOf(getMessage.playerTurnEnd.display_name)
            allPlayerInfo[findPlayer] = getMessage.playerTurnEnd
            // if theres taxes
            if(getMessage?.taxes) {
                // ### money is in minus state (ex: -5000)
                // ### for owner use - to increase (- with - become +)
                // add owner money
                const findOwner = allPlayerInfo.map(v => v.display_name).indexOf(getMessage.taxes.owner)
                allPlayerInfo[findOwner].money -= getMessage.taxes.money
            }
            // if theres transfer money event
            if(getMessage?.takeMoney) {
                // update other player money
                for(let other of getMessage.takeMoney.from) {
                    const findOther = allPlayerInfo.map(v => v.display_name).indexOf(other)
                    allPlayerInfo[findOther].money -= getMessage.takeMoney.money
                }
            }
            // if theres minigame
            if(getMessage?.minigameResult) {
                // update all players except playerTurnEnd
                for(let other of getMessage?.minigameResult) {
                    // skip playerTurnEnd
                    if(other.display_name === getMessage.playerTurnEnd.display_name) continue
                    // update player data
                    const findOther = allPlayerInfo.map(v => v.display_name).indexOf(other.display_name)
                    allPlayerInfo[findOther].money += other.event_money
                }
            }
            // check player alive
            checkGameProgress(allPlayerInfo, miscState, gameState)
            // return data
            return allPlayerInfo
        })
    }
    // - GAME OVER
    if(getMessage.gameOverPlayers) {
        // show notif after 0.5 sec
        setTimeout(() => {
            miscState.setAnimation(true)
            gameState.setShowGameNotif('normal')
        }, 500);
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
