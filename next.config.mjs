/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: no Node server at runtime. Files are processed in the browser only.
  output: 'export',
  // The image optimizer needs a server, so it is off for static export.
  images: { unoptimized: true },
};

export default nextConfig;
