/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-inventorymanagement.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn3.gstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tse3.mm.bing.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tse2.mm.bing.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tse4.mm.bing.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tse1.mm.bing.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.sssports.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com", // Added missing hostname
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "content.competitivecyclist.com", // Added missing hostname
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
