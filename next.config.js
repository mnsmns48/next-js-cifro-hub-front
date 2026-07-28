/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "s3.twcstorage.ru",
            },
            {
                protocol: "https",
                hostname: "*.s3.twcstorage.ru",
            },
            {
                protocol: "https",
                hostname: "swift.twcstorage.ru",
            },
            {
                protocol: "https",
                hostname: "*.swift.twcstorage.ru",
            },
            {
                protocol: "https",
                hostname: "*.twcstorage.ru",
            },
            {
                protocol: "https",
                hostname: "**.twcstorage.ru",
            },
        ],
    },
};

module.exports = nextConfig;
