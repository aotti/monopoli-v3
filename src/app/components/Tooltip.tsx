import { qS } from "../helper/helper"
import { ITooltip } from "../helper/types"

export default function Tooltip({ options }: {options: ITooltip}) {
    const { key, text, pos, arrow } = options
    // get element position
    const elementRects = qS(key).getBoundingClientRect()
    const [elWidth, elHeight] = [elementRects.width, elementRects.height]
    const [top, left, right, bottom] = [elementRects.top, elementRects.left, elementRects.right, elementRects.bottom]
    // window size
    const [winWidth, winHeight] = [window.innerWidth, window.innerHeight]
    // element pos
    const elementPos = {
        top: +top.toFixed(),
        left: +left.toFixed(),
        right: +(winWidth - right).toFixed(),
        bottom: +(winHeight - bottom).toFixed()
    }
    // determine tooltip pos
    const elementSize = () => {
        // return [x, y]
        if(pos == 'top') {
            let minusRem = null
            // count the text character
            switch(true) {
                case text.length > (14*9): minusRem = 16*10; break
                case text.length > (14*8): minusRem = 16*9; break
                case text.length > (14*7): minusRem = 16*8; break
                case text.length > (14*6): minusRem = 16*7; break
                case text.length > (14*5): minusRem = 16*6; break
                case text.length > (14*4): minusRem = 16*5; break
                case text.length > (14*3): minusRem = 16*4; break
                case text.length > (14*2): minusRem = 16*3; break
                default: minusRem = 16*2; break
            }
            return [0, minusRem + elHeight + 32]
        }
        else if(pos == 'bottom') return [0, 16] 
        else if(pos == 'left') return [208, 40]
        else if(pos == 'right') return [elWidth + (208/8), 40]
    }
    const elemSize = elementSize()
    console.log({elemSize});
    
    // set X position
    let xPosClass = null
    let yPosClass = null
    switch(true) {
        // left is free space
        case elementPos.left > 100 && pos == 'left': xPosClass = setTooltipPos('left', elemSize[0]); break
        // right is free space
        case elementPos.right > 100 && pos == 'right': xPosClass = setTooltipPos('right', elemSize[0]); break
    }
    // set Y position
    switch(true) {
        // bottom is free space
        case elementPos.bottom > 100: yPosClass = setTooltipPos('bottom', elemSize[1]); break
        // top is free space
        case elementPos.top > 100 && (pos == 'left' || pos == 'right'): yPosClass = setTooltipPos('top', elemSize[1]); break
    }
    console.log(elementPos, xPosClass, yPosClass);
    
    return (
        <div className={`relative ${yPosClass} ${xPosClass} w-40 max-h-40 bg-darkblue-1 border-8bit-normal ${arrowDirection(arrow)}`}>
            <p className="text-center text-xs"> {text} </p>
        </div>
    )
}

function setTooltipPos(pos: ITooltip['pos'], size: number) {
    const pixelToRem = +(size / 16).toFixed(1)
    
    switch(true) {
        // size > 7rem
        case pixelToRem > 13: 
            console.log(size, pixelToRem, 13);
            if(pos == 'top') return `-bottom-[15rem]`
            else if(pos == 'bottom') return `-top-[15rem]`
            else if(pos == 'left') return `right-[14rem]`
            else if(pos == 'right') return `left-[14rem]`
        // size > 6rem
        case pixelToRem > 11: 
            console.log(size, pixelToRem, 11);
            if(pos == 'top') return `-bottom-[13rem]`
            else if(pos == 'bottom') return `-top-[13rem]`
            else if(pos == 'left') return `right-[12rem]`
            else if(pos == 'right') return `left-[12rem]`
        // size > 5rem
        case pixelToRem > 9: 
            console.log(size, pixelToRem, 9);
            if(pos == 'top') return `-bottom-[11rem]`
            else if(pos == 'bottom') return `-top-[11rem]`
            else if(pos == 'left') return `right-[10rem]`
            else if(pos == 'right') return `left-[10rem]`
        // size > 4rem
        case pixelToRem > 7: 
            console.log(size, pixelToRem, 8);
            if(pos == 'top') return `-bottom-[9rem]`
            else if(pos == 'bottom') return `-top-[9rem]`
            else if(pos == 'left') return `right-[8rem]`
            else if(pos == 'right') return `left-[8rem]`
        // size > 3rem
        case pixelToRem > 5: 
            console.log(size, pixelToRem, 6);
            if(pos == 'top') return `-bottom-[7rem]`
            else if(pos == 'bottom') return `-top-[7rem]`
            else if(pos == 'left') return `right-[6rem]`
            else if(pos == 'right') return `left-[6rem]`
        // size > 3rem
        case pixelToRem > 3: 
            console.log(size, pixelToRem, 4);
            if(pos == 'top') return `-bottom-[5rem]`
            else if(pos == 'bottom') return `-top-[5rem]`
            else if(pos == 'left') return `right-[4rem]`
            else if(pos == 'right') return `left-[4rem]`
        // size > 3rem
        case pixelToRem > 1: 
            console.log(size, pixelToRem, 2);
            if(pos == 'top') return `-bottom-[3rem]`
            else if(pos == 'bottom') return `-top-[3rem]`
            else if(pos == 'left') return `right-[2rem]`
            else if(pos == 'right') return `left-[2rem]`
        // size == 3rem
        default: 
            console.log(size, pixelToRem, 0);
            if(pos == 'top') return `-bottom-[1rem]`
            else if(pos == 'bottom') return `top-[1rem]`
            else if(pos == 'left') return `right-[0rem]`
            else if(pos == 'right') return `left-[0rem]`
    }
}

// set arrow direction
function arrowDirection(arrow: string[]) {
    // border top = bottom arrow
    const topArrow = `before:absolute before:-top-5 before:border-x-8 before:border-x-transparent before:border-b-[.9rem] before:border-b-[#F5E8C7]`
    // border left = right arrow
    const leftArrow = `before:absolute before:-left-5 before:border-y-8 before:border-y-transparent before:border-r-[.9rem] before:border-r-[#F5E8C7]`
    // border right = left arrow
    const rightArrow = `before:absolute before:-right-5 before:border-y-8 before:border-y-transparent before:border-l-[.9rem] before:border-l-[#F5E8C7]`
    // border bottom = top arrow
    const bottomArrow = `after:absolute after:-bottom-5 after:border-x-8 after:border-x-transparent after:border-t-[.9rem] after:border-t-[#F5E8C7]`
    // direction
    switch(arrow[0]) {
        case 'top': 
            // position
            if(arrow[1] == 'start') return topArrow + ' before:left-0'
            else if(arrow[1] == 'middle') return topArrow + ' before:left-1/2'
            else if(arrow[1] == 'end') return topArrow + ' before:right-0'
        case 'bottom': 
            // position
            if(arrow[1] == 'start') return bottomArrow + ' after:left-0'
            else if(arrow[1] == 'middle') return bottomArrow + ' after:left-1/2'
            else if(arrow[1] == 'end') return bottomArrow + ' after:right-0'
        case 'left': 
            // position
            if(arrow[1] == 'start') return leftArrow + ' before:top-0'
            else if(arrow[1] == 'middle') return leftArrow + ' before:top-1/2'
            else if(arrow[1] == 'end') return leftArrow + ' before:bottom-0'
        case 'right': 
            // position
            if(arrow[1] == 'start') return rightArrow + ' before:top-0'
            else if(arrow[1] == 'middle') return rightArrow + ' before:top-1/2'
            else if(arrow[1] == 'end') return rightArrow + ' before:bottom-0'
    }
}