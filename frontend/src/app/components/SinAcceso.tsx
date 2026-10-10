import Link from 'next/link';

/**
 * Lo que se ve al abrir (por URL o un enlace viejo) una pantalla que no se puede ver. El
 * motivo lo dice el servidor: el rol no la incluye, o una regla de Permisos por pantalla la
 * restringe. Si el modulo tiene otras pantallas visibles, se ofrecen para no quedar sin salida.
 */
export function SinAcceso({ nombre, motivo, alternativas = [] }: { nombre: string; motivo: string; alternativas?: Array<{ ruta: string; nombre: string }> }) {
  return (
    <section className="card" role="alert" style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>No tenés acceso a «{nombre}»</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
        {motivo} Si la necesitás, pedíselo a quien administra la seguridad del sistema.
      </p>
      {alternativas.length > 0 && <>
        <p style={{ marginTop: 12, fontSize: 14 }}>Otras pantallas de este módulo que podés abrir:</p>
        <ul style={{ marginTop: 6, paddingLeft: 18, display: 'grid', gap: 4 }}>
          {alternativas.map((a) => <li key={a.ruta}><Link href={a.ruta}>{a.nombre}</Link></li>)}
        </ul>
      </>}
      <p style={{ marginTop: 12 }}><Link href="/dashboard">Volver al inicio</Link></p>
    </section>
  );
}
