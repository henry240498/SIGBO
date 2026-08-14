'use client';
<<<<<<< Updated upstream
export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="public-empty" id="contenido-principal"><h1>No se pudo mostrar esta página</h1><p>El resto del sistema continúa disponible. Intentá cargarla nuevamente.</p><button type="button" className="btn-primary" onClick={reset}>Reintentar</button></main>}
=======
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){return <main id="contenido-principal" className="error-boundary" role="alert"><p className="topbar-eyebrow">Error de aplicación</p><h1>No pudimos mostrar esta sección</h1><p>{error.message||'Ocurrió un problema inesperado. Tus datos no fueron modificados.'}</p><button type="button" className="btn-primary" onClick={reset}>Volver a intentar</button></main>}
>>>>>>> Stashed changes
