/** @type {import('next').NextConfig} */
<<<<<<< HEAD
const nextConfig = { output: 'standalone', poweredByHeader: false, reactStrictMode: true };
=======
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
export default nextConfig;
