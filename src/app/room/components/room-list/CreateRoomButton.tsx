import Image from "next/image";
import { useGame } from "../../../../context/GameContext";
import { useMisc } from "../../../../context/MiscContext";
import { translateUI } from "../../../../helper/helper";

export default function CreateRoomButton() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div data-tooltip={translateUI({lang: miscState.language, text: 'Create Room'})} 
        className={`${gameState.guestMode ? 'invisible' : ''} w-8 my-auto text-right`}>
            <button type="button" className="active:opacity-75"
            onClick={() => {
                // close join modal
                miscState.setShowJoinModal(null)
                // to give zoom-in animate class
                miscState.setAnimation(true); 
                // show the modal
                miscState.setShowModal('create room') 
            }}> 
                <Image src="https://lvu1slpqdkmigp40.public.blob.vercel-storage.com/misc/create_room-NUKqG5tw18Rb64CXsUnLjrplVns69c.png" alt="🚪" width={100} height={100} draggable={false} />
            </button>
        </div>
    )
}