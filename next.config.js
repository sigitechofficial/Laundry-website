const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },

      // ✅ YOUR BACKEND
      { protocol: 'https', hostname: 'prodlaundry.sigisolutions.net' },
    ],
  },
};

module.exports = nextConfig;



