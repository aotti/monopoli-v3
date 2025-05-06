import { CldImage, CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { useMisc } from "../../../context/MiscContext";
import { moneyFormat, translateUI } from "../../../helper/helper";
import { ILoggedUsers, IPlayer } from "../../../helper/types";
import { useGame } from "../../../context/GameContext";
import Link from "next/link";
import { avatarUpdate, userLogout } from "../helper/functions";

export default function PlayerStats({ playerData, onlinePlayers }: {playerData: IPlayer, onlinePlayers: ILoggedUsers[]}) {
    const miscState = useMisc()
    const gameState = useGame()

    const isUploadAllowed = playerData.display_name == gameState.myPlayerInfo.display_name ? true : false
    // set my player status
    const getMyData = onlinePlayers.length > 0 ? onlinePlayers.map(v => v.display_name).indexOf(playerData.display_name) : -1
    const isPlayerOnline = getMyData === -1 
                    // token expired, assume afk/offline
                    ? translateUI({lang: miscState.language, text: 'away'}) 
                    // token active, assume online
                    : translateUI({lang: miscState.language, text: onlinePlayers[getMyData].status})

    return (
        <>
            <span> {`${playerData.display_name} stats`} </span>
            <div className="flex gap-2 text-2xs lg:text-xs mt-1 animate-fade-up">
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
                                    <CldImage id="avatar" src={playerData.avatar || '#'} alt="avatar" priority={true} 
                                    className="!w-full hover:text-2xs hover:break-all hover:text-balance" width={125} height={0} />
                                </button>
                            )
                        }}
                    </CldUploadWidget>
                    {/* logout */}
                    {playerData.display_name == gameState.myPlayerInfo.display_name
                        ? <form className="text-center mt-2" onSubmit={ev => userLogout(ev, miscState, gameState)}>
                            <button type="submit" id="logout_button" className="min-w-8 bg-darkblue-1 border-8bit-text active:opacity-75"> {translateUI({lang: miscState.language, text: 'Logout'})} </button>
                            <Link id="gotoHome" href={location.origin}></Link>
                        </form>
                        : null
                    }
                </div>
                {/* stats */}
                <div className="lg:flex lg:flex-col lg:gap-4">
                    <div>
                        <p> {translateUI({lang: miscState.language, text: 'game count'})}: </p>
                        <p className="text-green-400"> {playerData.game_played} {translateUI({lang: miscState.language, text: 'games'})} </p>
                    </div>
                    <div>
                        <p> {translateUI({lang: miscState.language, text: 'worst lost'})}: </p>
                        <p className="text-red-400"> {moneyFormat(playerData.worst_money_lost)} </p>
                    </div>
                    <div>
                        <p> status: </p>
                        <p className="text-green-400"> {isPlayerOnline} </p>
                    </div>
                </div>
            </div>
        </>
    )
}