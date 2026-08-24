'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro, resolverNombres } from '@/lib/parametros';
import { cargarCajas, cargarCuentasBancarias, Caja, CuentaBancaria } from '@/lib/finanzas';
import {
  EstadoDeCuentaSocio,
  SocioHistorialCodigo,
  cargarEstadosSocioProtector,
  cargarPeriodicidadesAporte,
  cargarMediosPagoFinanzas,
  crearAcuerdoAporte,
  estadoDeCuentaSocio,
  historialCodigoSocio,
  registrarAporte,
  anularAporte,
} from '@/lib/socios-protectores';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

function colorEstadoAcuerdo(estado: string) {
  if (estado === 'ACTIVO') return { background: '#166534', color: '#4ade80' };
  if (estado === 'FINALIZADO') return { background: '#334155', color: '#94a3b8' };
  if (estado === 'SUSPENDIDO') return { background: '#451a03', color: '#fbbf24' };
  return { background: '#7f1d1d', color: '#f87171' };
}

export default function SocioProtectorDetallePage() {
  const solicitarEntrada = useEntradaConfirmada();
  const { id } = useParams<{ id: string }>();

  const [datos, setDatos] = useState<EstadoDeCuentaSocio | null>(null);
  const [historial, setHistorial] = useState<SocioHistorialCodigo[]>([]);
  const [nombres, setNombres] = useState<Map<string, string>>(new Map());
  const [periodicidades, setPeriodicidades] = useState<Parametro[]>([]);
  const [mediosPago, setMediosPago] = useState<Parametro[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [mostrarAcuerdo, setMostrarAcuerdo] = useState(false);
  const [mostrarAporte, setMostrarAporte] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [acMonto, setAcMonto] = useState('');
  const [acPeriodicidadId, setAcPeriodicidadId] = useState('');
  const [acFechaInicio, setAcFechaInicio] = useState('');
  const [acMedioPagoId, setAcMedioPagoId] = useState('');

  const [apAcuerdoId, setApAcuerdoId] = useState('');
  const [apExtraordinario, setApExtraordinario] = useState(false);
  const [apFecha, setApFecha] = useState('');
  const [apMonto, setApMonto] = useState('');
  const [apPeriodo, setApPeriodo] = useState('');
  const [apMedioPagoId, setApMedioPagoId] = useState('');
  const [apOrigen, setApOrigen] = useState<'CAJA' | 'CUENTA'>('CAJA');
  const [apCajaId, setApCajaId] = useState('');
  const [apCuentaId, setApCuentaId] = useState('');
  const [apNumeroComprobante, setApNumeroComprobante] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('finanzas:socios_crear') || permisos.includes('finanzas:socios_editar');
  const puedeRegistrarAporte = permisos.includes('finanzas:aportes_registrar');
  const puedeEditarAporte = permisos.includes('finanzas:aportes_editar');

  const opcionesPeriodicidad = useMemo(() => periodicidades.map((p) => ({ value: p.id, label: p.nombre })), [periodicidades]);
  const opcionesMedioPago = useMemo(() => mediosPago.map((p) => ({ value: p.id, label: p.nombre })), [mediosPago]);
  const opcionesCaja = useMemo(() => cajas.map((c) => ({ value: c.id, label: c.nombre })), [cajas]);
  const opcionesCuenta = useMemo(() => cuentas.map((c) => ({ value: c.id, label: `${c.banco} - ${c.numeroCuenta}` })), [cuentas]);
  const opcionesAcuerdo = useMemo(
    () => (datos?.acuerdos ?? []).map(({ acuerdo }) => ({ value: acuerdo.id, label: `${formatearGs(acuerdo.montoAcordado)} desde ${acuerdo.fechaInicio} (${acuerdo.estado})` })),
    [datos],
  );

  async function cargar() {
    try {
      const dc = await estadoDeCuentaSocio(id);
      setDatos(dc);
      const ids = [dc.socio.estadoId, dc.socio.paisId, dc.socio.departamentoId, dc.socio.ciudadId, dc.socio.barrioId, ...dc.acuerdos.map((a) => a.acuerdo.periodicidadId), ...dc.aportes.map((a) => a.medioPagoId)];
      setNombres(await resolverNombres(ids));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarPeriodicidadesAporte().then(setPeriodicidades);
    cargarMediosPagoFinanzas().then(setMediosPago);
    cargarCajas('ACTIVA').then(setCajas);
    cargarCuentasBancarias('ACTIVA').then(setCuentas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function crearAcuerdo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearAcuerdoAporte({
        socioProtectorId: id,
        montoAcordado: Number(acMonto),
        periodicidadId: acPeriodicidadId,
        fechaInicio: acFechaInicio,
        medioPagoPreferidoId: acMedioPagoId || undefined,
      });
      setMensaje('Acuerdo de aporte creado.');
      setAcMonto('');
      setAcPeriodicidadId('');
      setAcFechaInicio('');
      setAcMedioPagoId('');
      setMostrarAcuerdo(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await registrarAporte({
        socioProtectorId: id,
        acuerdoAporteId: apExtraordinario ? undefined : apAcuerdoId || undefined,
        esExtraordinario: apExtraordinario,
        fecha: apFecha,
        monto: Number(apMonto),
        periodoCorrespondiente: apPeriodo || undefined,
        medioPagoId: apMedioPagoId || undefined,
        numeroComprobante: apNumeroComprobante || undefined,
        cajaId: apOrigen === 'CAJA' ? apCajaId : undefined,
        cuentaBancariaId: apOrigen === 'CUENTA' ? apCuentaId : undefined,
      });
      setMensaje('Aporte registrado.');
      setApAcuerdoId('');
      setApExtraordinario(false);
      setApFecha('');
      setApMonto('');
      setApPeriodo('');
      setApMedioPagoId('');
      setApCajaId('');
      setApCuentaId('');
      setApNumeroComprobante('');
      setMostrarAporte(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function anular(aporteId: string) {
    const motivoAnulacionId = await solicitarEntrada({ titulo: 'Anular aporte', mensaje: 'Indique el ID del parámetro de motivo de anulación (organización.parametros, tipo MOTIVO_ANULACION_FINANZAS).', etiqueta: 'ID del motivo', confirmar: 'Continuar', requerida: true });
    if (!motivoAnulacionId) return;
    try {
      await anularAporte(aporteId, motivoAnulacionId);
      setMensaje('Aporte anulado.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function verHistorial() {
    setMostrarHistorial(!mostrarHistorial);
    if (!mostrarHistorial && historial.length === 0) {
      try {
        setHistorial(await historialCodigoSocio(id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  }

  if (!datos) {
    return error ? <p style={{ color: '#f87171' }}>{error}</p> : <p style={{ color: '#94a3b8' }}>Cargando...</p>;
  }

  const { socio, acuerdos, aportes, facturas, totales } = datos;
  const nombreSocio = socio.tipoPersona === 'JURIDICA' ? socio.razonSocial : `${socio.nombre ?? ''} ${socio.apellido ?? ''}`.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18 }}>{socio.codigo} — {nombreSocio}</h2>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>
          {socio.tipoPersona === 'JURIDICA' ? `RUC ${socio.ruc ?? '-'}` : `CI ${socio.ci ?? '-'}`} · Estado {nombres.get(socio.estadoId) ?? '-'}
        </p>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div className="card">
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Total aportado (periodico)</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{formatearGs(totales.totalAportado)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Total extraordinario</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{formatearGs(totales.totalExtraordinario)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Total general</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#4ade80' }}>{formatearGs(totales.totalGeneral)}</div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14 }}>Acuerdos de aporte</h3>
          {puedeCrear && (
            <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setMostrarAcuerdo(!mostrarAcuerdo)}>
              {mostrarAcuerdo ? 'Cancelar' : '+ Nuevo acuerdo'}
            </button>
          )}
        </div>
        {mostrarAcuerdo && (
          <form onSubmit={crearAcuerdo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Monto acordado</label>
              <input className="input-field" type="number" min={0.01} step="1" value={acMonto} onChange={(e) => setAcMonto(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Periodicidad</label>
              <ComboBuscable opciones={opcionesPeriodicidad} value={acPeriodicidadId} onChange={setAcPeriodicidadId} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Fecha de inicio</label>
              <input className="input-field" type="date" value={acFechaInicio} onChange={(e) => setAcFechaInicio(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Medio de pago preferido</label>
              <ComboBuscable opciones={opcionesMedioPago} value={acMedioPagoId} onChange={setAcMedioPagoId} ningunaLabel="-- --" />
            </div>
            <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={guardando || !acPeriodicidadId}>
              Guardar
            </button>
          </form>
        )}
        {acuerdos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin acuerdos registrados.</p>}
        {acuerdos.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Monto acordado</th>
                <th style={{ padding: '6px 4px' }}>Periodicidad</th>
                <th style={{ padding: '6px 4px' }}>Desde</th>
                <th style={{ padding: '6px 4px' }}>Aportado (total)</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {acuerdos.map(({ acuerdo, aportadoAlAcuerdo }) => (
                <tr key={acuerdo.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{formatearGs(acuerdo.montoAcordado)}</td>
                  <td style={{ padding: '6px 4px' }}>{nombres.get(acuerdo.periodicidadId) ?? '-'}</td>
                  <td style={{ padding: '6px 4px' }}>{acuerdo.fechaInicio}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearGs(aportadoAlAcuerdo)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={colorEstadoAcuerdo(acuerdo.estado)}>{acuerdo.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14 }}>Aportes</h3>
          {puedeRegistrarAporte && (
            <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setMostrarAporte(!mostrarAporte)}>
              {mostrarAporte ? 'Cancelar' : '+ Registrar aporte'}
            </button>
          )}
        </div>
        {mostrarAporte && (
          <form onSubmit={registrar} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={apExtraordinario} onChange={(e) => setApExtraordinario(e.target.checked)} />
              Aporte extraordinario (no ligado a un acuerdo periodico)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              {!apExtraordinario && (
                <div>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Acuerdo</label>
                  <ComboBuscable opciones={opcionesAcuerdo} value={apAcuerdoId} onChange={setApAcuerdoId} ningunaLabel="-- sin acuerdo --" />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Fecha</label>
                <input className="input-field" type="date" value={apFecha} onChange={(e) => setApFecha(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Monto (efectivamente pagado)</label>
                <input className="input-field" type="number" min={0.01} step="1" value={apMonto} onChange={(e) => setApMonto(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Periodo (YYYY-MM)</label>
                <input className="input-field" placeholder="2026-08" value={apPeriodo} onChange={(e) => setApPeriodo(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8, alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Medio de pago</label>
                <ComboBuscable opciones={opcionesMedioPago} value={apMedioPagoId} onChange={setApMedioPagoId} ningunaLabel="-- --" />
              </div>
              <ComboBuscable opciones={[{ value: 'CAJA', label: 'Caja' }, { value: 'CUENTA', label: 'Cuenta' }]} value={apOrigen} onChange={(v) => setApOrigen(v as 'CAJA' | 'CUENTA')} />
              {apOrigen === 'CAJA' ? (
                <ComboBuscable opciones={opcionesCaja} value={apCajaId} onChange={setApCajaId} ningunaLabel="-- caja --" />
              ) : (
                <ComboBuscable opciones={opcionesCuenta} value={apCuentaId} onChange={setApCuentaId} ningunaLabel="-- cuenta --" />
              )}
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>N° comprobante</label>
                <input className="input-field" value={apNumeroComprobante} onChange={(e) => setApNumeroComprobante(e.target.value)} />
              </div>
              <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={guardando || (!apCajaId && !apCuentaId)}>
                Registrar
              </button>
            </div>
          </form>
        )}
        {aportes.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin aportes registrados.</p>}
        {aportes.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Fecha</th>
                <th style={{ padding: '6px 4px' }}>Monto</th>
                <th style={{ padding: '6px 4px' }}>Periodo</th>
                <th style={{ padding: '6px 4px' }}>Tipo</th>
                <th style={{ padding: '6px 4px' }}>Medio de pago</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
                <th style={{ padding: '6px 4px' }}></th>
              </tr>
            </thead>
            <tbody>
              {aportes.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{a.fecha}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearGs(a.monto)}</td>
                  <td style={{ padding: '6px 4px' }}>{a.periodoCorrespondiente ?? '-'}</td>
                  <td style={{ padding: '6px 4px' }}>{a.esExtraordinario ? 'Extraordinario' : 'Periodico'}</td>
                  <td style={{ padding: '6px 4px' }}>{a.medioPagoId ? nombres.get(a.medioPagoId) ?? '-' : '-'}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={a.estado === 'ANULADO' ? { background: '#7f1d1d', color: '#f87171' } : { background: '#166534', color: '#4ade80' }}>{a.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {puedeEditarAporte && a.estado === 'REGISTRADO' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 11, background: '#7f1d1d' }} onClick={() => anular(a.id)}>
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ fontSize: 14 }}>Facturas relacionadas</h3>
        {facturas.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin facturas registradas para este socio.</p>}
        {facturas.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>N°</th>
                <th style={{ padding: '6px 4px' }}>Fecha</th>
                <th style={{ padding: '6px 4px' }}>Concepto</th>
                <th style={{ padding: '6px 4px' }}>Total</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{f.numero}</td>
                  <td style={{ padding: '6px 4px' }}>{f.fecha}</td>
                  <td style={{ padding: '6px 4px' }}>{f.concepto}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearGs(f.total)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={f.estado === 'ANULADA' ? { background: '#7f1d1d', color: '#f87171' } : { background: '#166534', color: '#4ade80' }}>{f.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12, background: '#475569' }} onClick={verHistorial}>
          {mostrarHistorial ? 'Ocultar historial de codigo' : 'Ver historial de codigo'}
        </button>
        {mostrarHistorial && (
          <div style={{ marginTop: 10 }}>
            {historial.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Este socio nunca cambio de codigo.</p>}
            {historial.map((h) => (
              <p key={h.id} style={{ fontSize: 12, color: '#94a3b8' }}>
                {h.codigoAnterior} → {h.codigoNuevo} el {new Date(h.fechaCambio).toLocaleDateString('es-PY')} {h.motivo ? `(${h.motivo})` : ''}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
