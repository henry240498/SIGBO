import Link from 'next/link';

/**
 * Sin este archivo, Next sirve su pantalla por defecto: "404 · This page could not be
 * found", en ingles y sin ninguna salida, dentro de un sistema que esta todo en espanol.
 */
export default function NoEncontrado() {
  return (
    <main className="error-boundary" id="contenido-principal">
      <h1>No encontramos esta página</h1>
      <p>
        La dirección no corresponde a ninguna pantalla del sistema. Puede que el enlace
        esté desactualizado o que la dirección tenga un error de tipeo.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
          Ir al panel
        </Link>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none', background: '#475569' }}>
          Ir al sitio público
        </Link>
      </div>
    </main>
  );
}
