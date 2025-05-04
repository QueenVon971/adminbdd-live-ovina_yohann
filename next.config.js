/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurations pour améliorer le comportement de Swagger
  reactStrictMode: true,
  swcMinify: true,
  // Permet l'accès cross-origin pour Swagger UI et autres ressources
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With,Content-Type,Authorization' }
        ],
      },
    ];
  },
  // Configuration pour les images externals pour Swagger UI
  images: {
    domains: ['unpkg.com', 'm.media-amazon.com'],
  },
};

module.exports = nextConfig;
