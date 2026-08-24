'use client';

import { useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { CursoExterno, cargarCursosExternos, refrescarCursosExternos } from '@/lib/academia';

export default function CursosExternosPage() {
  const [cursos, setCursos] = useState<CursoExterno[] | null>(null);
  const [urlLogin, setUrlLogin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [refrescando, setRefrescando] = useState(false);

  const puedeConfigurar = !!obtenerSesion()?.usuario.permisos.includes('academia:configurar');

  async function cargar() {
    try {
      const datos = await cargarCursosExternos();
      setCursos(datos.cursos);
      setUrlLogin(datos.urlLogin);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function refrescar() {
    setError(null);
    setMensaje(null);
    setRefrescando(true);
    try {
      const res = await refrescarCursosExternos();
      setMensaje(`Catálogo actualizado: ${res.actualizados} cursos.`);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefrescando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 16 }}>Cursos externos recomendados</h2>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            Catálogo público de OBA (Academia Virtual de Bomberos, sitio externo a SIGBO). SIGBO solo muestra
            información pública del curso; inscribirse, cursarlo y descargar el certificado es responsabilidad del
            usuario en el sitio de OBA.
          </p>
        </div>
        {puedeConfigurar && (
          <button type="button" className="btn-primary" onClick={refrescar} disabled={refrescando}>
            {refrescando ? 'Actualizando...' : 'Actualizar catálogo'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {urlLogin && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>¿Ya tenés una cuenta en OBA?</span>
          <a href={urlLogin} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', background: '#475569' }}>
            Iniciar sesión en OBA (sitio externo) ↗
          </a>
        </div>
      )}

      {cursos && cursos.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>
          Sin cursos en cache todavía. {puedeConfigurar ? 'Usá "Actualizar catálogo" para consultarlos.' : ''}
        </p>
      )}

      {cursos && cursos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {cursos.map((c) => (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="card"
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {c.imagenUrl && (
                <img src={c.imagenUrl} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 6 }} />
              )}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.categoria && <span className="badge">{c.categoria}</span>}
                <span className="badge" style={{ background: '#475569' }}>externo · OBA</span>
              </div>
              <strong style={{ fontSize: 13 }}>{c.titulo}</strong>
              {c.duracionTexto && <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.duracionTexto}</span>}
              <span style={{ fontSize: 11, color: '#60a5fa' }}>Ver curso en OBA ↗</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
