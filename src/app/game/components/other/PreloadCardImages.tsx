import Image from "next/image"

export default function PreloadCardImages() {
    const hostname = 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
    const cardImageList = [
        {name: 'chance_s', url: `https://${hostname}/cards/Chance_Card_S-HeOnWKulBma1kRBB97laqdfLCJpVh3.png`},
        {name: 'chance_a', url: `https://${hostname}/cards/Chance_Card_A-PqkByzOifuXooKWUliXPdxR4kfDBI9.png`},
        {name: 'chance_b', url: `https://${hostname}/cards/Chance_Card_B-tBnyXbzhrDNoINBlOssLPe0f79lvoR.png`},
        {name: 'chance_c', url: `https://${hostname}/cards/Chance_Card_C-cI6wyoLk6OjqhTIPrjNHq01wcXKTF4.png`},
        {name: 'chance_d', url: `https://${hostname}/cards/Chance_Card_D-9SWrEHsNrr9QEvvT8n9zQPKcqVWcb2.png`},
        {name: 'community_s', url: `https://${hostname}/cards/Community_Card_S-Y3gSceoeaywaS2ABkaIresagoyBHRh.png`},
        {name: 'community_a', url: `https://${hostname}/cards/Community_Card_A-uCDUMj13x0hEW8aBUbIR4TY5JBB15r.png`},
        {name: 'community_b', url: `https://${hostname}/cards/Community_Card_B-OVAgCjtrKXrwtHbrVHqBmlZy0b1ypH.png`},
        {name: 'community_c', url: `https://${hostname}/cards/Community_Card_C-NjfXu7sczMwZY5oEUWuhyCT4SL9eDk.png`},
        {name: 'community_d', url: `https://${hostname}/cards/Community_Card_D-XUzERZjUnFjj7p7Bbnob38eygzCt2C.png`},
    ]
    
    return (
        <div id="preloadCardImages">
            {cardImageList.map((v, i) => 
                <Image key={i} src={v.url} alt={v.name} width={75} height={100} className="!hidden" loading="lazy" unoptimized />
            )}
        </div>
    )
}