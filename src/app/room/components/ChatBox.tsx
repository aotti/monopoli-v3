export default function ChatBox() {
    return (
        <div className="flex flex-col gap-2 h-4/5 p-1 overflow-y-scroll bg-darkblue-1/60 border-b-2">
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> lemao: </span>
                <span> mabar bang </span>
                <small> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> dengkul: </span>
                <span> terkadang sometimes </span>
                <small> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> lemao: </span>
                <span> mangsud? </span>
                <small> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
            <div className="hover:bg-darkblue-3/30 text-2xs lg:text-xs">
                <span className="text-orange-200"> yugo oniichan: </span>
                <span> bismillah bts taun depan :pray: </span>
                <small> 
                    {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})} 
                </small>
            </div>
        </div>
    )
}