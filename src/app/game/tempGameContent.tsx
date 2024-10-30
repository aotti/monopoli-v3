
            {/* 
                utilities
                writing-mode: vertical-lr (vertical text) 
            */}
            <div className="relative [writing-mode:vertical-lr] 
            text-center text-2xs lg:text-sm 
            h-60 lg:h-96 w-7 lg:w-8
            bg-darkblue-1 border-8bit-text">
                {/* help */}
                <div className="absolute right-0 h-20 lg:h-32 p-1 mt-0">
                    <button type="button" className="h-full p-2 -mr-[6px] hover:bg-darkblue-4 hover:text-black"> help </button>
                </div>
                {/* player */}
                <div className="absolute right-0 h-20 lg:h-32 p-1 mt-[5rem] lg:mt-[8rem]">
                    <button type="button" className="h-full p-2 -mr-[6px] hover:bg-darkblue-4 hover:text-black"> players </button>
                </div>
                {/* chat */}
                <div className="absolute right-0 h-20 lg:h-32 p-1 mt-[10rem] lg:mt-[16rem]">
                    <button type="button" className="h-full p-2 -mr-[6px] hover:bg-darkblue-4 hover:text-black"> chat </button>
                </div>
            </div>