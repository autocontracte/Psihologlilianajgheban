/** @type {import('next').NextConfig} */
const nextConfig = {
  /* La deploy, build-ul se face în alt folder (NEXT_DIST_DIR=.next-nou) și abia
     apoi ia locul celui vechi, ca site-ul să nu ruleze dintr-un folder pe jumătate
     șters (de aici veneau erorile din timpul deploy-ului). Vezi deploy/deploy.sh. */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Programatorul intern se testează local pe http://programator.localhost:3000
  allowedDevOrigins: ["programator.localhost"],
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
