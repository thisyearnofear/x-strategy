/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'spotify.com',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.glsl': {
        loaders: ['raw-loader', 'glslify-loader'],
        as: '*.js',
      },
      '*.vert': {
        loaders: ['raw-loader', 'glslify-loader'],
        as: '*.js',
      },
      '*.frag': {
        loaders: ['raw-loader', 'glslify-loader'],
        as: '*.js',
      },
    },
  },


  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    });
    return config;
  },
};