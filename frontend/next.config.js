/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El repositorio contiene lockfiles independientes para backend y frontend.
  // Fijar la raíz evita que Turbopack infiera el directorio padre.
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
