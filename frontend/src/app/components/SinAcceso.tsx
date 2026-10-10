import Link from 'next/link';

/** Lo que se ve al abrir (por URL o un enlace viejo) una pantalla que una regla restringe. */
export function SinAcceso({ nombre }: { nombre: string }) {
  return (
    <section className="card" role="alert" style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>No tenés acceso a «{nombre}»</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
        Una regla de Seguridad › Pantallas restringe esta pantalla para tu usuario, rol, rango o cargo.
        Si la necesitás, pedíselo a quien administra la seguridad del sistema.
      </p>
      <p style={{ marginTop: 12 }}><Link href="/dashboard">Volver al inicio</Link></p>
    </section>
  );
}
