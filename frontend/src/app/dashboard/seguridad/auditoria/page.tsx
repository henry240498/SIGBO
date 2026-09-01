'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';

interface LogAuditoria {
  id: string;
  usuarioId: string | null;
  accion: string;
  recurso: string;
  recursoId: string | null;
  ip: string | null;
  fecha: string;
}

interface Resultado {
  items: LogAuditoria[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AuditoriaPage() {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recurso, setRecurso] = useState('');
  const [accion, setAccion] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (recurso) params.set('recurso', recurso);
      if (accion) params.set('accion', accion);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const res = await apiFetch(`/seguridad/auditoria?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar la auditoria');
      setResultado(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function filtrar(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    cargar();
  }

  const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / resultado.pageSize)) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 16 }}>Auditoria ({resultado?.total ?? 0})</h2>

      <form onSubmit={filtrar} className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label htmlFor="recurso" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Recurso</label>
          <input id="recurso" className="input-field" value={recurso} onChange={(e) => setRecurso(e.target.value)} placeholder="usuario, rol, auth..." />
        </div>
        <div>
          <label htmlFor="accion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Acción</label>
          <input id="accion" className="input-field" value={accion} onChange={(e) => setAccion(e.target.value)} placeholder="LOGIN, CREAR..." />
        </div>
        <button type="submit" className="btn-primary">Filtrar</button>
      </form>

      {error && <Aviso tipo="error" texto={error} />}

      {resultado && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Acción</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Recurso</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Recurso ID</th>
                <th scope="col" style={{ padding: '6px 4px' }}>IP</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {resultado.items.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{l.accion}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{l.recurso}</td>
                  <td style={{ padding: '6px 4px', color: 'var(--muted)', fontSize: 11 }}>{l.recursoId}</td>
                  <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>{l.ip}</td>
                  <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>{new Date(l.fecha).toLocaleString('es-PY')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
            <button type="button" className="btn-primary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </button>
            <span>
              Pagina {resultado.page} de {totalPaginas}
            </span>
            <button type="button" className="btn-primary" disabled={page >= totalPaginas} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
