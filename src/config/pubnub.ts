import PubNub from "pubnub"

export default function pubnub(pubnubSetting) {
    // pubnub
    const pubnub = new PubNub(pubnubSetting)
    if(!pubnub) {
        console.log('pubnub error');
        return null
    }
    return pubnub
}