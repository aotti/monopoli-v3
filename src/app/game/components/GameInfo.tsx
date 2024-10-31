export default function GameInfo() {
    return (
        <div className="flex flex-col gap-4 text-2xs lg:text-xs">
            {/* name */}
            <div>
                <span className="text-green-400"> lele gaming </span>
            </div>
            {/* player */}
            <div>
                <span> player: </span>
                <span className="text-green-400"> 1/4 </span>
            </div>
            {/* mode */}
            <div>
                <span> mode: </span>
                <span className="text-green-400"> survive </span>
            </div>
            {/* creator */}
            <div>
                <span> creator: </span>
                <span className="text-green-400"> dengkul </span>
            </div>
        </div>
    )
}