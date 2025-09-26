/** @type {import('next').NextConfig} */

const nextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)", // applies to all routes
				headers: [{
					key: "Content-Security-Policy",
					value: "img-src 'self' https://lvu1slpqdkmigp40.public.blob.vercel-storage.com https://res.cloudinary.com https://img.icons8.com;"
				}]
			}
		]
	},
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'lvu1slpqdkmigp40.public.blob.vercel-storage.com'
        }]
    }
}

module.exports = nextConfig
