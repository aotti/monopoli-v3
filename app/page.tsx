"use client"

export default function Page() {
    return (
        // main container
        <main className="portrait:rotate-90 portrait:h-[100vw]">
            {/* game board | scale 100, 90, 80 for zoom-in/out */}
            <div className="border-4 border-pink-500 p-2
                landscape:h-screen landscape:w-screen
                portrait:h-[100vw] portrait:w-[100vh]">
                <h1 className=" text-lg"> Hello Bang Lele </h1>
                <p> Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure porro cum dolor, odio adipisci mollitia praesentium eos atque possimus eligendi alias, omnis aut explicabo facere. Velit voluptate dignissimos dolorum asperiores. </p>
            </div>
        </main>
    )
}