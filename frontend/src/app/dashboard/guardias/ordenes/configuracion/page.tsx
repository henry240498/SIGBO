'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Catalogo, cargarCatalogo } from '@/lib/personal';
import { actualizarConfiguracionOrdenes, cargarConfiguracionOrdenes } from '@/lib/guardias';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

export default function ConfiguracionOrdenesPage() {
  const router = useRouter();
  const [cargos, setCargos] = useState<Catalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [tituloDocumento, setTituloDocumento] = useState('');
  const [textoIntroPlantilla, setTextoIntroPlantilla] = useState('');
  const [reglaTextoOficial, setReglaTextoOficial] = useState('');
  const [reglaTextoChofer, setReglaTextoChofer] = useState('');
  const [exigirRangoIgualOSuperiorOficial, setExigirRangoIgualOSuperiorOficial] = useState(true);
  const [textoPie, setTextoPie] = useState('');
  const [firmante1CargoId, setFirmante1CargoId] = useState('');
  const [firmante1Etiqueta, setFirmante1Etiqueta] = useState('');
  const [firmante2CargoId, setFirmante2CargoId] = useState('');
  const [firmante2Etiqueta, setFirmante2Etiqueta] = useState('');

  useEffect(() => {
    Promise.all([cargarConfiguracionOrdenes(), cargarCatalogo('/organizacion/cargos')])
      .then(([config, cargosData]) => {
        setTituloDocumento(config.tituloDocumento ?? '');
        setTextoIntroPlantilla(config.textoIntroPlantilla ?? '');
        setReglaTextoOficial(config.reglaTextoOficial ?? '');
        setReglaTextoChofer(config.reglaTextoChofer ?? '');
        setExigirRangoIgualOSuperiorOficial(config.exigirRangoIgualOSuperiorOficial);
        setTextoPie(config.textoPie ?? '');
        setFirmante1CargoId(config.firmante1CargoId ?? '');
        setFirmante1Etiqueta(config.firmante1Etiqueta ?? '');
        setFirmante2CargoId(config.firmante2CargoId ?? '');
        setFirmante2Etiqueta(config.firmante2Etiqueta ?? '');
        setCargos(cargosData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const opcionesCargo = cargos.map((c) => ({ value: c.id, label: c.nombre }));

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await actualizarConfiguracionOrdenes({
        tituloDocumento,
        textoIntroPlantilla: textoIntroPlantilla || undefined,
        reglaTextoOficial: reglaTextoOficial || undefined,
        reglaTextoChofer: reglaTextoChofer || undefined,
        exigirRangoIgualOSuperiorOficial,
        textoPie: textoPie || undefined,
        firmante1CargoId: firmante1CargoId || null,
        firmante1Etiqueta: firmante1Etiqueta || undefined,
        firmante2CargoId: firmante2CargoId || null,
        firmante2Etiqueta: firmante2Etiqueta || undefined,
      });
      setMensaje('Configuracion guardada');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando texto="Cargando configuracion…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Configuración de la Orden de Guardia</h2>
        <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/guardias/ordenes')}>
          Volver
        </button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Estos textos y reglas se usan al generar cada Orden — pueden modificarse cuando cambie la normativa o la
        forma de comunicacion institucional, sin tocar codigo.
      </p>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Titulo</h3>
          <div>
            <label htmlFor="titulo-del-documento-placeholders-y" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Titulo del documento (placeholders: {'{{numero}}'} y {'{{anio}}'})
            </label>
            <input id="titulo-del-documento-placeholders-y" className="input-field" value={tituloDocumento} onChange={(e) => setTituloDocumento(e.target.value)} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            El membrete (nombre, logos, direccion, contacto) ahora se configura en un solo lugar para todo SIGBO —{' '}
            <a href="/dashboard/organizacion/documentos" style={{ color: 'var(--signal)' }}>
              Organizacion → Configuracion de Documentos
            </a>
            .
          </p>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Texto introductorio y reglas de reemplazo</h3>
          <div>
            <label htmlFor="texto-introductorio-placeholders-y" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Texto introductorio (placeholders: {'{{mes}}'} y {'{{anio}}'})
            </label>
            <textarea id="texto-introductorio-placeholders-y" className="input-field" rows={4} value={textoIntroPlantilla} onChange={(e) => setTextoIntroPlantilla(e.target.value)} />
          </div>
          <div>
            <label htmlFor="regla-de-reemplazo-oficial-a-cargo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Regla de reemplazo — Oficial a cargo</label>
            <textarea id="regla-de-reemplazo-oficial-a-cargo" className="input-field" rows={2} value={reglaTextoOficial} onChange={(e) => setReglaTextoOficial(e.target.value)} />
          </div>
          <div>
            <label htmlFor="regla-de-reemplazo-chofer" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Regla de reemplazo — Chofer</label>
            <textarea id="regla-de-reemplazo-chofer" className="input-field" rows={2} value={reglaTextoChofer} onChange={(e) => setReglaTextoChofer(e.target.value)} />
          </div>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={exigirRangoIgualOSuperiorOficial} onChange={(e) => setExigirRangoIgualOSuperiorOficial(e.target.checked)} />
            Exigir que el reemplazo de un Oficial a Cargo sea de rango igual o mayor (se aplica como validacion real,
            no solo como texto)
          </label>
          <div>
            <label htmlFor="pie-de-pagina-nota-de-horarios" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pie de pagina (nota de horarios)</label>
            <textarea id="pie-de-pagina-nota-de-horarios" className="input-field" rows={2} value={textoPie} onChange={(e) => setTextoPie(e.target.value)} />
          </div>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Firmantes</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Se resuelve automaticamente a quien ocupa hoy el cargo indicado (organizacion.designaciones) — nunca un
            nombre fijo.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Firmante 1 — Cargo</label>
              <ComboBuscable ariaLabel="Firmante 1 — Cargo" opciones={opcionesCargo} value={firmante1CargoId} onChange={setFirmante1CargoId} placeholderBusqueda="Buscar cargo..." ningunaLabel="Sin firmante" />
            </div>
            <div>
              <label htmlFor="firmante-1-etiqueta-impresa" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Firmante 1 — Etiqueta impresa</label>
              <input id="firmante-1-etiqueta-impresa" className="input-field" value={firmante1Etiqueta} onChange={(e) => setFirmante1Etiqueta(e.target.value)} placeholder="DPTO. DE PERSONAL" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Firmante 2 — Cargo</label>
              <ComboBuscable ariaLabel="Firmante 2 — Cargo" opciones={opcionesCargo} value={firmante2CargoId} onChange={setFirmante2CargoId} placeholderBusqueda="Buscar cargo..." ningunaLabel="Sin firmante" />
            </div>
            <div>
              <label htmlFor="firmante-2-etiqueta-impresa" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Firmante 2 — Etiqueta impresa</label>
              <input id="firmante-2-etiqueta-impresa" className="input-field" value={firmante2Etiqueta} onChange={(e) => setFirmante2Etiqueta(e.target.value)} placeholder="COMANDANTE" />
            </div>
          </div>
        </section>

        <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
          {guardando ? 'Guardando...' : 'Guardar configuracion'}
        </button>
      </form>
    </div>
  );
}
