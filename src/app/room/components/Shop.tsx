import { useGame } from "../../../context/GameContext"
import { useMisc } from "../../../context/MiscContext"
import { translateUI } from "../../../helper/helper"
import shop_items from "../config/shop-items.json"
import { buyShopitem } from "../helper/functions"

export default function Shop() {
    const miscState = useMisc()
    const gameState = useGame()

    // shop items
    const specialCardItems = shop_items.special_card_list
    const buffItems = shop_items.buff_list

    return (
        <div id="shop_modal" className={`relative z-20 bg-darkblue-3 border-8bit-modal px-2 w-[50vw] lg:w-[40vw]
        ${miscState.showModal == 'shop' ? 'block' : 'hidden'} 
        ${miscState.animation ? 'animate-zoom-in' : 'animate-zoom-out'}`}>
            {/* modal head */}
            <div className="flex justify-between border-b-2 mb-2">
                <span> {translateUI({lang: miscState.language, text: 'Shop'})} </span>
                <span className="text-green-300">
                    {translateUI({lang: miscState.language, text: 'my coins'})}
                    : {gameState.myCoins}
                </span>
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
                    <div className="grid grid-cols-6 gap-1 lg:gap-2 text-center">
                        {specialCardItems.map((v,i) => {
                            const specialCardItemData = {
                                name: translateUI({lang: miscState.language, text: v.name as any}),
                                description: translateUI({lang: miscState.language, text: v.description as any}),
                                price: v.price
                            }
                            return <ShopItem key={i} type={'special card'} data={specialCardItemData} />
                        })}
                    </div>
                </div>
                {/* buff */}
                <div className="flex flex-col gap-2 lg:gap-4">
                    {/* head */}
                    <div>
                        <span className="underline"> buff </span>
                    </div>
                    {/* items */}
                    <div className="grid grid-cols-6 gap-1 lg:gap-2 text-center">
                        {buffItems.map((v,i) => {
                            const buffItemData = {
                                name: translateUI({lang: miscState.language, text: v.name as any}),
                                description: translateUI({lang: miscState.language, text: v.description as any}),
                                price: v.price
                            }
                            return <ShopItem key={i} type={'buff'} data={buffItemData} />
                        })}
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

function ShopItem({ type, data }) {
    const miscState = useMisc()
    const gameState = useGame()

    const itemData = {
        name: data.name,
        type: type,
        description: data.description,
        price: data.price,
    }
    const itemImageSrc = type == 'buff' 
                    ? 'https://img.icons8.com/?id=OMMKdOvcwXo0&format=png&color=FFFFFF'
                    : 'https://img.icons8.com/?id=GU4o4EwQmTkI&format=png&color=FFFFFF'

    return (
        <form onSubmit={ev => buyShopitem(ev, itemData, miscState, gameState)} className="col-span-2 flex flex-col items-center text-orange-300">
            <button type="submit" className="w-full h-full hover:bg-darkblue-2 hover:cursor-pointer active:bg-darkblue-2">
                <div className="flex gap-2 items-center justify-center text-green-300">
                    <img src={itemImageSrc} alt="buff" className="inline !w-8 !h-8" />
                    <span> {itemData.price} </span>
                </div>
                <span> {itemData.name} </span>
            </button>
        </form>
    )
}