import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'standalone',

  // Отключаем оверлей ошибок в режиме разработки для GraphQL ошибок
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  
  // Настройки для изображений
  images: {
    domains: [
      'localhost',
      // PartsAPI domains removed
    ],
    unoptimized: true
  },
  
  // Настройка CORS для API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // Переписка запросов для разработки
  async rewrites() {
    return [
      {
        source: '/api/cms/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'lucide-react': path.resolve(__dirname, '../protek-cms/node_modules/lucide-react')
    };
    return config;
  },
};

export default nextConfig;
