import { CldImage, CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { useMisc } from "../../../context/MiscContext";
import { fetcher, fetcherOptions, moneyFormat, qS, translateUI } from "../../../helper/helper";
import { IGameContext, ILoggedUsers, IPlayer, IResponse } from "../../../helper/types";
import { useGame } from "../../../context/GameContext";
import { FormEvent } from "react";
import Link from "next/link";

export default function PlayerStats({ playerData, onlinePlayers }: {playerData: IPlayer, onlinePlayers: ILoggedUsers[]}) {
    const miscState = useMisc()
    const gameState = useGame()
    const isUploadAllowed = playerData.display_name == gameState.myPlayerInfo.display_name ? true : false

    return (
        <>
            <span> {`${playerData.display_name} stats`} </span>
            <div className="flex gap-2 text-2xs lg:text-xs mt-1">
                {/* profile picture */}
                <div className="border-2 w-[4rem] h-[4rem] lg:w-32 lg:h-32">
                    <CldUploadWidget signatureEndpoint="/api/cloudinary"
                    options={{ sources: ['local', 'url'], maxFiles: 1, clientAllowedFormats: ['jpg', 'png'], maxFileSize: 2048_000, publicId: `profile_${playerData.display_name}`, folder: 'monopoli-profiles',
                    // crop settings
                    multiple: false, cropping: true, croppingCoordinatesMode: 'custom', croppingValidateDimensions: true,
                    croppingAspectRatio: 1, croppingShowDimensions: true }}
                    onSuccess={async (result, {widget}) => {
                        // close widget
                        widget.close()
                        // save photo to db
                        const data = result.info as CloudinaryUploadWidgetInfo
                        await avatarUpdate(playerData.display_name, data.url, gameState)
                    }}>
                        {({ open }) => {
                            const uploadAvatarText = translateUI({lang: miscState.language, text: 'upload your avatar'})
                            const uploadAvatarClass = `hover:before:absolute hover:before:left-0 hover:before:z-10 hover:before:flex hover:before:items-center hover:before:bg-black/50 hover:before:w-full hover:before:h-full hover:before:content-[attr(data-text)]`
                            return (
                                <button type="button" id="upload_avatar" data-text={uploadAvatarText} className={`relative w-full h-full ${isUploadAllowed ? uploadAvatarClass : ''}`} onClick={() => open('local')} disabled={!isUploadAllowed}>
                                    <CldImage id="avatar" src={playerData.avatar || '#'} alt="avatar" 
                                    className="!w-full hover:text-2xs hover:break-all hover:text-balance" width={125} height={0} />
                                </button>
                            )
                        }}
                    </CldUploadWidget>
                    {/* logout */}
                    {
                    playerData.display_name == gameState.myPlayerInfo.display_name
                        ? <form className="text-center mt-2" onSubmit={ev => userLogout(ev, gameState)}>
                            <button type="submit" id="logout_button" className="min-w-8 bg-darkblue-1 border-8bit-text"> logout </button>
                            <Link id="gotoHome" href={location.origin}></Link>
                        </form>
                        : null
                    }
                </div>
                {/* stats */}
                <div className="lg:flex lg:flex-col lg:gap-4">
                    <div>
                        <p> {translateUI({lang: miscState.language, text: 'game count'})}: </p>
                        <p className="text-green-400"> {playerData.game_played} games </p>
                    </div>
                    <div>
                        <p> {translateUI({lang: miscState.language, text: 'worst lost'})}: </p>
                        <p className="text-red-400"> {moneyFormat(playerData.worst_money_lost)} </p>
                    </div>
                    <div>
                        {/* KALO UDAH MASUK GAME ROOM BARU BISA APDET */}
                        <p> status: </p>
                        <p className="text-green-400"> 
                            {onlinePlayers.map(v => 
                                v.display_name == playerData.display_name
                                ? translateUI({lang: miscState.language, text: v.status})
                                : null
                            )} 
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

/**
 * @param display_name player in game name
 * @param publicId avatar pathname
 * @description update player avatar
 */
async function avatarUpdate(display_name: string, avatar_url: string, gameState: IGameContext) {
    const avatarImg = qS('#avatar') as HTMLImageElement
    const uploadButton = qS('#upload_avatar') as HTMLInputElement
    // input value container
    const inputValues = {
        display_name: display_name,
        avatar: avatar_url
    }
    // disable upload button
    uploadButton.disabled = true
    // fetch
    const avatarFetchOptions = fetcherOptions({method: 'PUT', credentials: true, body: JSON.stringify(inputValues)})
    const avatarResponse: IResponse = await (await fetcher('/player/avatar', avatarFetchOptions)).json()
    // response
    switch(avatarResponse.status) {
        case 200: 
            // save access token
            if(avatarResponse.data[0].token) {
                localStorage.setItem('accessToken', avatarResponse.data[0].token)
                delete avatarResponse.data[0].token
            }
            // set my player data
            const newAvatar: IPlayer = {
                display_name: gameState.myPlayerInfo.display_name,
                game_played: gameState.myPlayerInfo.game_played,
                worst_money_lost: gameState.myPlayerInfo.worst_money_lost,
                avatar: avatarResponse.data[0].avatar,
            }
            gameState.setMyPlayerInfo(newAvatar)
            // submit button normal
            uploadButton.removeAttribute('disabled')
            return
        default: 
            // submit button normal
            uploadButton.removeAttribute('disabled')
            // result message
            avatarImg.alt = `${avatarResponse.status}: ${avatarResponse.message}`
            return
    }
}

async function userLogout(ev: FormEvent<HTMLFormElement>, gameState: IGameContext) {
    ev.preventDefault()

    // home button
    const gotoHome = qS('#gotoHome') as HTMLAnchorElement
    // submit button
    const logoutButton = qS('#logout_button') as HTMLInputElement
    logoutButton.textContent = '.'
    const loggingOut = setInterval((counter = 0) => {
        if(counter < 3) {
            logoutButton.textContent += '.'
            counter++
        }
        else {
            logoutButton.textContent = '.'
            counter = 0
        }
    }, 1000);
    
    // fetch
    const logoutFetchOptions = fetcherOptions({method: 'POST', credentials: true})
    const logoutResponse: IResponse = await (await fetcher('/logout', logoutFetchOptions)).json()
    // response
    switch(logoutResponse.status) {
        case 200: 
            // stop interval
            clearInterval(loggingOut)
            logoutButton.textContent = 'logout'
            // remove all local storage
            localStorage.removeItem('accessToken')
            localStorage.removeItem('onlinePlayers')
            gameState.setMyPlayerInfo(null)
            gameState.setOnlinePlayers(null)
            // go to home
            gotoHome.click()
            return
        default: 
            logoutButton.textContent = `error${logoutResponse.status}`
            return
    }
}