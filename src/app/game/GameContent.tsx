export default function GameContent() {
    const xsWidthHeight = `w-[55px] h-[55px]`
    const smWidthHeight = `sm:w-[60px] sm:h-[60px] `
    const lgWidthHeight = `lg:w-[100px] lg:h-[100px]`

    return (
        <div className="grid grid-cols-12 h-[calc(100vh-3.75rem)]">
            <div className="flex self-start mt-6 mx-2 border-2">
                <button type="button" className="w-10 h-6 lg:w-14 p-1 bg-primary border-8bit-primary text-2xs lg:text-xs">
                    Back 
                </button>
            </div>
            {/* normal board | 28 square */}
            <section className="col-span-10 grid grid-rows-6 gap-8 justify-center 
                h-[calc(100vh-3.75rem)] scale-90 -mt-2 border-2 border-red-300">
                {/* row 1 */}
                <div className="flex row-span-1">
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="/img/city/jakarta_100.png" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="/img/city/jakarta_100.png" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="/img/city/jakarta_100.png" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                </div>
                {/* row 2 */}
                <div className="flex">
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                </div>
                {/* row 3 */}
                <div className="flex">
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                </div>
                {/* row 4 */}
                <div className="flex">
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                </div>
                {/* row 5 */}
                <div className="flex">
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]"></div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                </div>
                {/* row 6 */}
                <div className="flex row-span-1">
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="/img/city/jakarta_100.png" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="/img/city/jakarta_100.png" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="/img/city/jakarta_100.png" alt="jakarta" className="w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                    <div className="border w-[7.5vw] h-[15.5vh]">
                        <img src="" alt="" className="bg-success w-[7.5vw] h-[15.5vh]" draggable={false} />
                    </div>
                </div>
            </section>
            {/* 
                utilities
                writing-mode: vertical-lr (vertical text) 
            */}
            <div className="absolute right-[calc(0rem+1rem)]
            flex items-center [writing-mode:vertical-lr] 
            text-center text-2xs lg:text-sm 
            h-60 lg:h-96 w-7 lg:w-8
            bg-darkblue-1 border-8bit-text">
                {/* help */}
                <div className="h-20 lg:h-32 p-1">
                    <button type="button" className="h-full p-2 hover:bg-darkblue-4 hover:text-black"> help </button>
                </div>
                {/* player */}
                <div className="h-20 lg:h-32 p-1">
                    <button type="button" className="h-full p-2 hover:bg-darkblue-4 hover:text-black"> players </button>
                </div>
                {/* chat */}
                <div className="h-20 lg:h-32 p-1">
                    <button type="button" className="h-full p-2 hover:bg-darkblue-4 hover:text-black"> chat </button>
                </div>
            </div>
        </div>
    )
}