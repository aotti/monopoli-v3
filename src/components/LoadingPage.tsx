export default function LoadingPage() {
    return (
        // h-[calc()] used to fill the empty (height) space 
        // 100vh = landscape using h-screen
        // must count all pixel that affected by margin, padding, height
        // 100vh - 3.75rem (header height)
        <div className="flex items-center justify-center h-[calc(100vh-3.75rem)]">
            <p className="text-center text-xl"> Loading.. </p>
        </div>
    )
}