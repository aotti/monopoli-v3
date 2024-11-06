import { useEffect } from "react";
import { useGame } from "../../../../context/GameContext";
import { IGameContext } from "../../../../helper/types";
import { qS, qSA } from "../../../../helper/helper";

export default function RollNumber() {
    const gameState = useGame()

    useEffect(() => {
        // ### KALAU SUDAH ADA SETTING JUMLAH dice 
        // ### ARRAY UNTUK dice HARUS DISESUAIKAN
        // ### 1 dice = [1,2,3,4,5,6] | 2 dice = [0,1,2,3,4,5,6]
        const number = gameState.rollNumber == 'dice' ? [0,1,2,3,4,5,6] : [1,2,3,4,5,6,7,8,9,0]
        startAnimation(number, gameState.rollNumber)
        // hidden the roll after end
        setTimeout(() => gameState.setRollNumber(null), 6000);
    }, [])

    return (
        gameState.rollNumber
            ? gameState.rollNumber == 'dice'
                ? <RollDice />
                : <RollTurn />
            : null
    )
}

function RollDice() {
    return (
        <div className="relative top-1/3 bg-darkblue-1 border-8bit-text w-2/5">
            <p> roll dice </p>
            {/* spinner */}
            <div className="flex justify-center text-base lg:text-2xl py-2">
                {/* 1st number */}
                <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
                {/* 2nd number */}
                <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
            </div>
            {/* result */}
            <p id="dice_result" className="py-2"></p>
        </div>
    )
}

function RollTurn() {
    return (
        <div className="relative top-1/3 bg-darkblue-1 border-8bit-text w-2/5">
            <p> roll turn </p>
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
const buildItemLists = (number: number[], resultItem: number) => {  
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
    
        // Adds the result to the last row
    	const position = s < slots.length-1 ? 0 : s;
        const resultElement = document.createElement('p')
        resultElement.classList.add('roll-result')
        resultElement.textContent = number[position + resultItem].toString()
        prizeBlocks.appendChild(resultElement);
    
        // Clear the slots and add the new ones
        removeAllChildNodes(slot);
        slot.appendChild(prizeBlocks);
    });
}

// Determine whether the player won and start the spinning animation
const startAnimation = (number: number[], type: IGameContext['rollNumber']) => {
    // less than 1024 for mobile, more than 1024 for desktop
    const windowWidth = window.innerWidth
    const defaultSize = windowWidth < 1024 ? 24 : 32
    // Get a random item from the prizes array
    const resultItem = getRandomInt(0, number.length - 3);
    
    // Rebuild the items list with the result
    buildItemLists(number, resultItem);
    
    // Determine the total height to be animated  
    const totalHeight = number.length * totalDuplicates * defaultSize;
    
    // Animate each one of the slots
    const items = document.getElementsByClassName('slot-machine__prizes');
    Array.prototype.forEach.call(items, (slot, s) => {
        slot.animate([
            {
            transform: "translateY(0)"
            },
            {
            transform: `translateY(-${totalHeight}px)`
            }
        ], {
            duration: 2000 + (s * 500),
            fill: "forwards",
            easing: 'ease-in-out'
        });
        // roll result
        if(type == 'dice') {
            const resultDice = qS('#dice_result')
            // get result number
            const dices = qSA('.roll-result')
            const diceNumber = []
            dices.forEach(dice => diceNumber.push(+dice.textContent))
            // display
            setTimeout(() => {
                resultDice.textContent = `your dice is ${diceNumber.reduce((accumulator, currentVal) => accumulator + currentVal)}`
            }, 3000);
        }
        else if(type == 'turn') {
            const resultTurn = qS('#turn_result')
            // get result number
            const turns = qSA('.roll-result')
            const turnNumber = []
            turns.forEach(turn => turnNumber.push(turn.textContent))
            // display
            setTimeout(() => {
                resultTurn.textContent = `your number is ${+(turnNumber[0] + turnNumber[1] + turnNumber[2])}`
            }, 3500);
        }
    });
}