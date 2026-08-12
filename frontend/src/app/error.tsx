'use client';
export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="public-empty" id="contenido-principal"><h1>No se pudo mostrar esta página</h1><p>El resto del sistema continúa disponible. Intentá cargarla nuevamente.</p><button type="button" className="btn-primary" onClick={reset}>Reintentar</button></main>}
