import { useEffect } from "react";

export default function RollNumber() {
    useEffect(() => {
        const windowWidth = window.innerWidth
        // mobile (width < 1024)
        if(windowWidth < 1024) startAnimation(24)
        // desktop (width >= 1024)
        else startAnimation(32)
    }, [])

    return (
        <div className="relative top-1/3 bg-darkblue-1 border-8bit-text w-2/5">
            <p> test roll </p>
            {/* spinner */}
            <div className="flex justify-center text-base lg:text-2xl py-2">
                {/* 1st number */}
                <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
                {/* 2nd number */}
                <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
                {/* 3rd number */}
                <div className="slot p-2 w-9 lg:w-10 h-8 lg:h-12 overflow-y-hidden border-2"></div>
            </div>
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

const prizes = [1,2,3,4,5,6,7,8,9,0]
const totalDuplicates = 4

// Clear slots and recreate random list of images
const buildItemLists = (resultItem) => {  
    const slots = document.getElementsByClassName('slot');
    // Iterate through the slot html elements
    Array.prototype.forEach.call(slots, (slot, s) => {
        let prizeBlocks = document.createElement('div');
        prizeBlocks.classList.add('slot-machine__prizes');
        
            // Multiply and shuffle prize images for visual purposes
        const randomPrizes = shuffle(prizes.flatMap(i => Array(totalDuplicates).fill(i)));
        randomPrizes.forEach((prize) => {
            const prizeElement = document.createElement('p');
            prizeElement.textContent = prize
            prizeBlocks.appendChild(prizeElement);
        })
    
            // Adds the result to the last row
        const resultElement = document.createElement('p')
        // resultElement.classList.add('roll-result')
        resultElement.textContent = resultItem
        console.log({resultItem});
        
    
            // Clear the slots and add the new ones
            removeAllChildNodes(slot);
        slot.appendChild(prizeBlocks);
    });
}

// Determine whether the player won and start the spinning animation
const startAnimation = (defaultSize: number) => {
    // Get a random item from the prizes array
    const resultItem = prizes[getRandomInt(0, prizes.length - 1)];
    
    // Rebuild the items list with the result
    buildItemLists(resultItem);
    
    // Determine the total height to be animated  
    const totalHeight = prizes.length * totalDuplicates * defaultSize;
    
    // Animate each one of the slots
    const items = document.getElementsByClassName('slot-machine__prizes');
    Array.prototype.forEach.call(items, (slot, s) => {
        slot.animate([
            {
            transform: "translateY(0)"
            },
            {
            transform: `translateY(-${totalHeight-defaultSize}px)`
            }
        ], {
            duration: 2000 + (s * 500),
            fill: "forwards",
            easing: 'ease-in-out'
        });
    });
}