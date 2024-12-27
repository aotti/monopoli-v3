import { useEffect } from "react";
import { useGame } from "../../../../context/GameContext";
import { IGameContext, IMiscContext, IResponse } from "../../../../helper/types";
import { fetcher, fetcherOptions, qS, qSA, translateUI } from "../../../../helper/helper";
import { useMisc } from "../../../../context/MiscContext";

export default function RollNumber({ roomId }: {roomId: number}) {
    const miscState = useMisc()
    const gameState = useGame()
    // get room info
    const getGameRoomInfo = gameState.gameRoomInfo.map(v => v.room_id).indexOf(roomId)

    // roll animation
    useEffect(() => {
        if(!gameState.rollNumber) return
        return () => {
            const diceNumber = gameState.rollNumber == 'dice' ? [1,2,3,4,5,6] : [1,2,3,4,5,6,7,8,9,0]
            startAnimation(diceNumber, miscState, gameState)
            // hidden the roll after end
            setTimeout(() => gameState.setRollNumber(null), 3500);
        }
    }, [gameState.rollNumber])

    return (
        gameState.rollNumber == 'turn'
            ? <RollTurn />
            : gameState.rollNumber == 'dice'
                ? <RollDice amount={gameState.gameRoomInfo[getGameRoomInfo]?.dice} />
                : null
    )
}

function RollDice({ amount }: {amount: number}) {
    const miscState = useMisc()

    return (
        <div className="relative z-10 top-1/3 bg-darkblue-1 border-8bit-text w-2/5">
            <p> {translateUI({lang: miscState.language, text: 'roll dice'})} </p>
            {/* spinner */}
            <div className="flex justify-center text-base lg:text-2xl py-2">
                {// set dice amount
                amount === 1
                    // 1 dice
                    ? <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
                    // 2 dices
                    : <>
                        <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
                        <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
                    </>
                }
            </div>
            {/* result */}
            <p id="dice_result" className="py-2"></p>
        </div>
    )
}

function RollTurn() {
    const miscState = useMisc()

    return (
        <div className="relative z-10 top-1/3 bg-darkblue-1 border-8bit-text w-2/5">
            <p> {translateUI({lang: miscState.language, text: 'roll turn'})} </p>
            {/* spinner */}
            <div className="flex justify-center text-base lg:text-2xl py-2">
                {/* 1st number */}
                <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
                {/* 2nd number */}
                <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
                {/* 3rd number */}
                <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
            </div>
            {/* result */}
            <p id="turn_result" className="py-2"></p>
        </div>
    )
}

function shuffle(array: any[]) {
    let currentIndex = array.length,  
        randomIndex;
  
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
  
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function removeAllChildNodes(parent: HTMLElement) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// total duplicate number
const totalDuplicates = 4

// Clear slots and recreate random list of images
const buildItemLists = (number: number[]) => {  
    const slots = document.getElementsByClassName('slot');
    // Iterate through the slot html elements
    Array.prototype.forEach.call(slots, (slot, s) => {
        let prizeBlocks = document.createElement('div');
        prizeBlocks.classList.add('slot-machine__prizes');
        
        // Multiply and shuffle prize images for visual purposes
        const randomPrizes = shuffle(number.flatMap(i => Array(totalDuplicates).fill(i)));
        randomPrizes.forEach((prize) => {
            const prizeElement = document.createElement('p');
            prizeElement.textContent = prize
            prizeBlocks.appendChild(prizeElement);
        })
    
        // Get a random item from the prizes array
        const resultItem = getRandomInt(0, number.length - 1);
        // Adds the result to the last row
        const resultElement = document.createElement('p')
        resultElement.classList.add('roll-result')
        resultElement.textContent = number[resultItem].toString()
        prizeBlocks.appendChild(resultElement);
    
        // Clear the slots and add the new ones
        removeAllChildNodes(slot);
        slot.appendChild(prizeBlocks);
    });
}

// Determine whether the player won and start the spinning animation
const startAnimation = (number: number[], miscState: IMiscContext, gameState: IGameContext) => {
    // less than 1024 for mobile, more than 1024 for desktop
    const windowWidth = window.innerWidth
    const defaultSize = windowWidth < 1024 ? 24 : 32
    
    // Rebuild the items list with the result
    buildItemLists(number);
    
    // Determine the total height to be animated  
    const totalHeight = number.length * totalDuplicates * defaultSize;
    
    // Animate each one of the slots
    const items = document.getElementsByClassName('slot-machine__prizes');
    Array.prototype.forEach.call(items, (slot, s) => {
        slot.animate([
            { transform: "translateY(0)" }, // from
            { transform: `translateY(-${totalHeight}px)` } // to
        ], {
            duration: 1000 + (s * 500),
            fill: "forwards",
            easing: 'ease-in-out'
        });
        // roll result
        if(gameState.rollNumber == 'dice') {
            const diceRollResult = qS('#dice_result')
            // get result number
            const dices = qSA('.roll-result')
            const diceResult = []
            dices.forEach(dice => diceResult.push(+dice.textContent))
            // display
            setTimeout(async () => {
                const diceResultReduce = +diceResult.reduce((accumulator, currentVal) => accumulator + currentVal)
                diceRollResult.textContent = `${translateUI({lang: miscState.language, text: 'your dice is'})} ${diceResultReduce}`
                // input values container
                const inputValues = {
                    action: 'game roll dice',
                    channel: `monopoli-gameroom-${gameState.gameRoomId}`,
                    display_name: gameState.myPlayerInfo.display_name,
                    rolled_dice: diceResultReduce.toString()
                }
                // result message
                const notifTitle = qS('#result_notif_title')
                const notifMessage = qS('#result_notif_message')
                // fetch
                const rollDiceFetchOptions = fetcherOptions({method: 'POST', credentials: true, body: JSON.stringify(inputValues)})
                const rollDiceResponse: IResponse = await (await fetcher('/game', rollDiceFetchOptions)).json()
                // response
                switch(rollDiceResponse.status) {
                    case 200: 
                        // save access token
                        if(rollDiceResponse.data[0].token) {
                            localStorage.setItem('accessToken', rollDiceResponse.data[0].token)
                            delete rollDiceResponse.data[0].token
                        }
                        return
                    default: 
                        // show notif
                        miscState.setAnimation(true)
                        gameState.setShowGameNotif('normal')
                        // error message
                        notifTitle.textContent = `error ${rollDiceResponse.status}`
                        notifMessage.textContent = `${rollDiceResponse.message}`
                        return
                }
            }, 2000);
        }
        else if(gameState.rollNumber == 'turn') {
            const resultTurn = qS('#turn_result')
            // get result number
            const turns = qSA('.roll-result')
            const turnNumber = []
            turns.forEach(turn => turnNumber.push(turn.textContent))
            // set rolled number to form input
            const rolledNumber = qS('#rolled_number') as HTMLInputElement
            rolledNumber.value = turnNumber[0] + turnNumber[1] + turnNumber[2]
            // display
            setTimeout(() => {
                resultTurn.textContent = `${translateUI({lang: miscState.language, text: 'your number is'})} ${+(turnNumber[0] + turnNumber[1] + turnNumber[2])}`
            }, 2500);
        }
    });
}

/**
 * @param numberTarget dice result number
 */
export function playerMoving(playerTurn: string, numberTarget: number, miscState: IMiscContext, gameState: IGameContext) {
    // get player path
    const playerPaths = qSA(`[data-player-path]`) as NodeListOf<HTMLElement>
    // get players
    const playerNames = qSA(`[data-player-name]`) as NodeListOf<HTMLElement>
    // match player name
    playerNames.forEach(player => {
        if(player.dataset.playerName != playerTurn) return
        // find current player
        const findPlayer = gameState.gamePlayerInfo.map(v => v.display_name).indexOf(playerTurn)
        // moving params
        let numberStep = 0
        let numberLaps = gameState.gamePlayerInfo[findPlayer].lap
        const currentPos = gameState.gamePlayerInfo[findPlayer].pos
        const nextPos = (currentPos + numberTarget) === playerPaths.length 
                        ? playerPaths.length 
                        : ((currentPos + numberTarget) % playerPaths.length)
        // move function
        const stepInterval = setInterval(() => moving(), 750);

        async function moving() {
            // count step
            ++numberStep
            // stop moving
            if(numberStep > numberTarget) {
                clearInterval(stepInterval)
                // turn off roll dice
                gameState.setRollNumber(null)
                // ====== ONLY MOVING PLAYER WILL FETCH ======
                if(gameState.gamePlayerInfo[findPlayer].display_name != gameState.myPlayerInfo.display_name) return
                // ====== ONLY MOVING PLAYER WILL FETCH ======
                console.log(gameState.myPlayerInfo.display_name, 'fetching');
                
                // result message
                const notifTitle = qS('#result_notif_title')
                const notifMessage = qS('#result_notif_message')
                // input values container
                const inputValues = {
                    action: 'game turn end',
                    channel: `monopoli-gameroom-${gameState.gameRoomId}`,
                    display_name: gameState.gamePlayerInfo[findPlayer].display_name,
                    pos: nextPos.toString(),
                    lap: numberLaps.toString(),
                    // history = rolled_dice: num;buy_city: str;sell_city: str;get_card: str;use_card: str
                    history: `rolled_dice: ${numberTarget}`
                }
                // fetch
                const playerTurnEndFetchOptions = fetcherOptions({method: 'PUT', credentials: true, body: JSON.stringify(inputValues)})
                const playerTurnEndResponse: IResponse = await (await fetcher('/game', playerTurnEndFetchOptions)).json()
                // response
                switch(playerTurnEndResponse.status) {
                    case 200: 
                        // save access token
                        if(playerTurnEndResponse.data[0].token) {
                            localStorage.setItem('accessToken', playerTurnEndResponse.data[0].token)
                            delete playerTurnEndResponse.data[0].token
                        }
                        break
                    default: 
                        // show notif
                        miscState.setAnimation(true)
                        gameState.setShowGameNotif('normal')
                        // error message
                        notifTitle.textContent = `error ${playerTurnEndResponse.status}`
                        notifMessage.textContent = `${playerTurnEndResponse.message}`
                        break
                }
                return
            }
            // moving
            playerPaths.forEach(path => {
                // prevent tile number == 0
                const tempStep = currentPos + numberStep
                const fixedNextStep = tempStep === playerPaths.length ? playerPaths.length : (tempStep % playerPaths.length)
                // match paths & move
                if(+path.dataset.playerPath === fixedNextStep) {
                    gameState.setGamePlayerInfo(players => {
                        const newPosInfo = [...players]
                        newPosInfo[findPlayer].pos = fixedNextStep
                        return newPosInfo
                    })
                    // update laps for moving player
                    if(tempStep === playerPaths.length) {
                        numberLaps += 1
                        gameState.setGamePlayerInfo(players => {
                            const newLapInfo = [...players]
                            newLapInfo[findPlayer].lap = numberLaps
                            return newLapInfo
                        })
                    }
                }
            })
        }
    })
}

function playerStopBy() {
    
}