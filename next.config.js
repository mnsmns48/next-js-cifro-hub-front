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
                protocol: "http",
                hostname: "s3.twcstorage.ru",
            },
            {
                protocol: "https",
                hostname: "*.s3.twcstorage.ru",
            },
            {
                protocol: "http",
                hostname: "*.s3.twcstorage.ru",
            },
            {
                protocol: "https",
                hostname: "swift.twcstorage.ru",
            },
            {
                protocol: "http",
                hostname: "swift.twcstorage.ru",
            },
            {
                protocol: "https",
                hostname: "*.swift.twcstorage.ru",
            },
            {
                protocol: "http",
                hostname: "*.swift.twcstorage.ru",
            },
            {
                protocol: "https",
                hostname: "*.twcstorage.ru",
            },
            {
                protocol: "http",
                hostname: "*.twcstorage.ru",
            },
        ],
    },


    allowedDevOrigins: ["192.168.88.223"],

    async rewrites() {
        return [
            {
                source: "/api3/:path*",
                destination: `${process.env.BACKEND_API_URL}/api3/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
