/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Ghidul și evaluarea gratuită au devenit kitul „Cum stai, de fapt, cu relația ta?"
  async redirects() {
    return [
      { source: "/consiliere", destination: "/kit", permanent: true },
      { source: "/evaluare-gratuita", destination: "/kit", permanent: true },
      { source: "/consiliere/rezultat/:token", destination: "/kit/rezultat/:token", permanent: true },
      { source: "/evaluare-gratuita/rezultat/:token", destination: "/kit/rezultat/:token", permanent: true },
      { source: "/admin/consiliere", destination: "/admin/kit", permanent: false },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // 85 doar pentru fotografiile mari din carduri, unde compresia se vede
    qualities: [75, 85],
  },
};

export default nextConfig;
