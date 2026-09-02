/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El repositorio contiene lockfiles independientes para backend y frontend.
  // Fijar la raíz evita que Turbopack infiera el directorio padre.
  turbopack: {
    root: __dirname,
  },
  // Dos pantallas cambiaron de módulo para quedar donde manda su permiso:
  // planificación usa `guardias:editar` y el catálogo usa `organizacion:tipos_guardia_*`.
  // Las direcciones viejas siguen funcionando para no romper enlaces ni favoritos.
  async redirects() {
    return [
      {
        source: '/dashboard/organizacion/guardias/planificacion',
        destination: '/dashboard/guardias/planificacion',
        permanent: true,
      },
      {
        source: '/dashboard/organizacion/guardias',
        destination: '/dashboard/organizacion/tipos-guardia',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
