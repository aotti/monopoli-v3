import { useGame } from "../../../context/GameContext"
import { useMisc } from "../../../context/MiscContext"
import { translateUI } from "../../../helper/helper"

export default function Shop() {
    const miscState = useMisc()
    const gameState = useGame()

    const specialCardItems = [
        {name: 'nerf tax', price: 10},
        {name: 'anti prison', price: 10},
        {name: 'gaming dice', price: 20},
        {name: 'dice controller', price: 20},
        {name: 'attack city', price: 30},
        {name: 'upgrade city', price: 30},
        {name: 'curse reverser', price: 40},
    ]
    const buffItems = [
        {name: 'reduce price', price: 10},
        {name: 'the void', price: 20},
        {name: 'start 2 laps', price: 30},
    ]

    return (
        <div id="shop_modal" className={`relative z-20 bg-darkblue-3 border-8bit-modal px-2 w-[50vw] lg:w-[40vw]
        ${miscState.showModal == 'shop' ? 'block' : 'hidden'} 
        ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'}`}>
            {/* modal head */}
            <div className="flex justify-between border-b-2 mb-2">
                <span> {translateUI({lang: miscState.language, text: 'Shop'})} </span>
                <span className="text-green-300"> my coin: 0 </span>
            </div>
            {/* modal body */}
            <div className="flex flex-col gap-2 lg:gap-4 h-[50vh] overflow-y-scroll">
                {/* special card */}
                <div className="flex flex-col gap-2 lg:gap-4">
                    {/* head */}
                    <div>
                        <span className="underline">
                            {translateUI({lang: miscState.language, text: 'special card'})}
                        </span>
                    </div>
                    {/* items */}
                    <div className="grid grid-cols-6 lg:gap-2 text-center">
                        {specialCardItems.map((v,i) => 
                            <div key={i} className="col-span-2 flex flex-col items-center text-orange-300 hover:bg-darkblue-2 hover:cursor-pointer active:bg-darkblue-2">
                                <div className="flex gap-2 items-center text-green-300">
                                    <img src="https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=FFFFFF" alt="card" className="!w-10 !h-10" />
                                    <span> {v.price} </span>
                                </div>
                                <span> {v.name} </span>
                            </div>
                        )}
                    </div>
                </div>
                {/* buff */}
                <div className="flex flex-col gap-2 lg:gap-4">
                    {/* head */}
                    <div>
                        <span className="underline"> buff </span>
                    </div>
                    {/* items */}
                    <div className="grid grid-cols-6 lg:gap-2 text-center">
                        {buffItems.map((v,i) => 
                            <div key={i} className="col-span-2 flex flex-col items-center text-orange-300 hover:bg-darkblue-2 hover:cursor-pointer active:bg-darkblue-2">
                                <div className="flex gap-2 items-center text-green-300">
                                    <img src="https://img.icons8.com/?id=OMMKdOvcwXo0&format=png&color=FFFFFF" alt="buff" className="inline !w-8 !h-8" />
                                    <span> {v.price} </span>
                                </div>
                                <span> {v.name} </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* modal footer */}
            <div className="flex justify-around mt-2 border-t-2">
                <button type="button" className="text-red-300 p-1 active:opacity-75 hover:animate-jump" onClick={() => { 
                    // set false to give zoom-out animate class
                    miscState.setAnimation(false); 
                    // timeout to wait the animation zoom-out
                    setTimeout(() => miscState.setShowModal(null), 200) 
                }}> 
                    {translateUI({lang: miscState.language, text: 'Close'})} 
                </button>
            </div>
        </div>
    )
}