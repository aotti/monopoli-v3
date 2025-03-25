import Image from "next/image"

export default function PreloadCardImages() {
    const hostname = 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
    const cardImageList = [
        {name: 'chance', url: `https://${hostname}/cards/Chance_Card_Backside-O5k7QzCQoO6AeHNDkXYrEDVQBa2Bls.png`},
        {name: 'community', url: `https://${hostname}/cards/Community_Card_Backside-FBtLAKUSyJyXjxPThnvo1874A5bw8f.png`},
    ]
    
    return (
        <div id="preloadCardImages">
            {cardImageList.map((v, i) => 
                <Image key={i} src={v.url} alt={v.name} width={75} height={100} className="!hidden" priority={true} />
            )}
        </div>
    )
}