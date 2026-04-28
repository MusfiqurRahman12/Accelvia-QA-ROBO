/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["playwright", "pixelmatch", "sharp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-alpha-sig.figma.com",
      },
      {
        protocol: "https",
        hostname: "api.figma.com",
      },
    ],
  },
};

module.exports = nextConfig;
