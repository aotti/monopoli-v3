import { IGameContext, IResponse, IShop } from "../../../helper/types";
import Controller from "../Controller";
import shop_items from "../../room/config/shop-items.json"

export default class ShopController extends Controller {
    private async filters(action: string, payload: any) {
        let filterResult: IResponse = null
        // get token payload
        const tokenPayload = await this.getTokenPayload({ token: payload.token })
        if(tokenPayload.status !== 200) return tokenPayload
        // token payload data
        const { tpayload, token } = tokenPayload.data[0]
        // renew log online player
        const onlinePlayers = await this.getOnlinePlayers(tpayload, payload.user_agent, action)
        if(onlinePlayers.status !== 200) return onlinePlayers
        // filter payload
        const filteredPayload = this.filterPayload(action, payload)
        if(filteredPayload.status !== 200) return filteredPayload
        // return success
        return filterResult = {
            status: 200,
            message: 'filter success',
            data: [{token, onlinePlayersData: onlinePlayers.data}]
        }
    }

    private async checkStuffBeforeBuy(itemType: string, buyingData: IShop['buying_data'], itemList: any[]) {
        const {action, displayName, itemName, playerCoins} = buyingData
        const isItemExist = itemList.map(v => v.name).indexOf(itemName)

        // item not exist in game
        if(isItemExist === -1) 
            return {status: 400, message: `${action} failed`, data: []} as IResponse

        // is player coins enough
        const shopItem = itemList[isItemExist]
        if(playerCoins < shopItem.price) 
            return {status: 400, message: `coins not enough`, data: []} as IResponse

        // is player already have the item
        const getPlayerShopItems: IGameContext['myShopItems'] = await this.redisGet(`${displayName}_shopItems`)
        // check item list
        const findItemKey = Object.keys(getPlayerShopItems).indexOf(itemType)
        // found item type
        if(findItemKey !== -1) {
            const isItemOwned = getPlayerShopItems[findItemKey][itemType].indexOf(itemName)
            // item is owned, return error
            if(isItemOwned !== -1) 
                return {status: 400, message: `already have this item`, data: []} as IResponse

            // is player already have 2 items per type
            const isItemPerTypeOnLimit = getPlayerShopItems[findItemKey][itemType].length === 2
            if(isItemPerTypeOnLimit)
                return {status: 400, message: `only allowed to have 2 items per type`, data: []} as IResponse
        }

        // all conds met
        return {
            status: 200, 
            message: `buying item`, 
            data: [{
                itemName: shopItem.name, 
                itemPrice: shopItem.price
            }]
        } as IResponse
    }

    private async buyingShopItem(itemType: string, buyingData: IShop['buying_data'], areAllBuyCondsMetData: any) {
        const {displayName, playerCoins} = buyingData
        const {itemName, itemPrice} = areAllBuyCondsMetData as {itemName: string, itemPrice: number}
        // update player coins
        const coinsLeft = playerCoins - itemPrice
        await this.redisSet(`${displayName}_coins`, [coinsLeft])
        // set player shop items
        const getPlayerShopItems = await this.redisGet(`${displayName}_shopItems`)
        const setPlayerShopItems = [...getPlayerShopItems] 
        // get shop item types
        const shopItemTypes = setPlayerShopItems.map(v => Object.keys(v)).flat()
        const isItemTypeExist = shopItemTypes.indexOf(itemType)
        // item type not exist
        if(isItemTypeExist === -1) {
            setPlayerShopItems.push({[itemType]: [itemName]})
        }
        // item type exist
        else {
            const itemList = setPlayerShopItems[isItemTypeExist][itemType]
            setPlayerShopItems[isItemTypeExist][itemType] = [...itemList, itemName]
        }
        // update player shop items
        await this.redisSet(`${displayName}_shopItems`, setPlayerShopItems)
        // return item data
        return {
            coinsLeft: coinsLeft,
            playerShopItems: setPlayerShopItems 
        }
    }

    async buyItem(action: string, payload: IShop['buy_item']) {
        let result: IResponse

        const filtering = await this.filters(action, payload)
        if(filtering.status !== 200) return filtering
        delete payload.token
        // get filter data
        const {token, onlinePlayersData} = filtering.data[0]
        // get shop items
        const specialCardItems = shop_items.special_card_list
        const buffItems = shop_items.buff_list
        // get player coins
        const getPlayerCoins = await this.redisGet(`${payload.display_name}_coins`)
        // set buying data
        const buyingData: IShop['buying_data'] = {
            action: action, 
            displayName: payload.display_name,
            itemName: payload.item_name, 
            playerCoins: getPlayerCoins[0],
        }
        // check item type
        if(payload.item_type == 'special_card') {
            const areAllBuyCondsMet = await this.checkStuffBeforeBuy(payload.item_type, buyingData, specialCardItems)
            // condition not met, return
            if(areAllBuyCondsMet.status !== 200) return areAllBuyCondsMet
            // condition met
            const buyResult = await this.buyingShopItem(payload.item_type, buyingData, areAllBuyCondsMet.data[0])
            // set result
            const resultData = {
                ...buyResult,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        else if(payload.item_type == 'buff') {
            const areAllBuyCondsMet = await this.checkStuffBeforeBuy(payload.item_type, buyingData, buffItems)
            // condition not met, return
            if(areAllBuyCondsMet.status !== 200) return areAllBuyCondsMet
            // condition met
            const buyResult = await this.buyingShopItem(payload.item_type, buyingData, areAllBuyCondsMet.data[0])
            // set result
            const resultData = {
                ...buyResult,
                token: token
            }
            result = this.respond(200, `${action} success`, [resultData])
        }
        // return buy data
        return result
    }
}