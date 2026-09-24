/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // 85 doar pentru fotografiile mari din carduri, unde compresia se vede
    qualities: [75, 85],
  },
};

export default nextConfig;
