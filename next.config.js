/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // generate static site output in /out
    images: {
      unoptimized: true, // allows images without next/image optimization
    },
    trailingSlash: true, // ensures proper routing in static hosting
  };
  
  module.exports = nextConfig;
  