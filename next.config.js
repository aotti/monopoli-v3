/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
        }]
    }
}

module.exports = nextConfig
