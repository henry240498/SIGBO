'use client';

import { Fragment, useEffect, useId, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarTiposDocumentoFinanzas } from '@/lib/finanzas';
import {
  Factura,
  NotaCredito,
  SocioProtector,
  cargarFacturas,
  cargarSociosProtectores,
  cargarMediosPagoFinanzas,
  cargarMotivosNotaCredito,
  crearFactura,
  anularFactura,
  subirArchivoFactura,
  cargarNotasCredito,
  crearNotaCredito,
} from '@/lib/socios-protectores';
import { Parametro } from '@/lib/parametros';
import { Aviso } from '@/app/components/Aviso';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

function FilaNotaCredito({ factura, motivos, onCreada }: { factura: Factura; motivos: Parametro[]; onCreada: () => void }) {
  const idCampo = useId();
  const [numero, setNumero] = useState('');
  const [fecha, setFecha] = useState('');
  const [motivoId, setMotivoId] = useState('');
  const [importe, setImporte] = useState('');
  const [concepto, setConcepto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opcionesMotivo = useMemo(() => motivos.map((m) => ({ value: m.id, label: m.nombre })), [motivos]);

  async function confirmar() {
    setError(null);
    setGuardando(true);
    try {
      await crearNotaCredito({ facturaId: factura.id, numero, fecha, motivoId, importe: Number(importe), concepto: concepto || undefined });
      onCreada();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: '10px 4px', background: 'var(--surface-soft)', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
      {error && <p style={{ color: 'var(--danger)', fontSize: 12, gridColumn: '1 / -1' }}>{error}</p>}
      <div>
        <label htmlFor={`${idCampo}-n-nota-de-credito`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>N° nota de crédito</label>
        <input id={`${idCampo}-n-nota-de-credito`} className="input-field" value={numero} onChange={(e) => setNumero(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${idCampo}-fecha`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Fecha</label>
        <input id={`${idCampo}-fecha`} className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Motivo</label>
        <ComboBuscable ariaLabel="Motivo" opciones={opcionesMotivo} value={motivoId} onChange={setMotivoId} />
      </div>
      <div>
        <label htmlFor={`${idCampo}-importe-max`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Importe (max {formatearGs(factura.total)})</label>
        <input id={`${idCampo}-importe-max`} className="input-field" type="number" min={0.01} step="1" value={importe} onChange={(e) => setImporte(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${idCampo}-concepto`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Concepto</label>
        <input id={`${idCampo}-concepto`} className="input-field" value={concepto} onChange={(e) => setConcepto(e.target.value)} />
      </div>
      <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={guardando || !numero || !fecha || !motivoId || !importe} onClick={confirmar}>
        Emitir
      </button>
    </div>
  );
}

export default function FacturacionPage() {
  const idCampo = useId();
  const solicitarEntrada = useEntradaConfirmada();
  const [facturas, setFacturas] = useState<Factura[] | null>(null);
  const [socios, setSocios] = useState<SocioProtector[]>([]);
  const [tiposComprobante, setTiposComprobante] = useState<Parametro[]>([]);
  const [mediosPago, setMediosPago] = useState<Parametro[]>([]);
  const [motivosNota, setMotivosNota] = useState<Parametro[]>([]);
  const [notasPorFactura, setNotasPorFactura] = useState<Map<string, NotaCredito[]>>(new Map());

  const [filtroEstado, setFiltroEstado] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [tipoComprobanteId, setTipoComprobanteId] = useState('');
  const [numero, setNumero] = useState('');
  const [timbrado, setTimbrado] = useState('');
  const [fecha, setFecha] = useState('');
  const [socioProtectorId, setSocioProtectorId] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteRucCi, setClienteRucCi] = useState('');
  const [concepto, setConcepto] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [descuento, setDescuento] = useState('0');
  const [impuestos, setImpuestos] = useState('0');
  const [formaPagoId, setFormaPagoId] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('finanzas:facturacion_crear');
  const puedeAnular = permisos.includes('finanzas:facturacion_anular');
  const puedeEmitirNota = permisos.includes('finanzas:notas_credito_crear');

  const opcionesTipoComprobante = useMemo(() => tiposComprobante.map((t) => ({ value: t.id, label: t.nombre })), [tiposComprobante]);
  const opcionesMedioPago = useMemo(() => mediosPago.map((t) => ({ value: t.id, label: t.nombre })), [mediosPago]);
  const opcionesSocio = useMemo(() => socios.map((s) => ({ value: s.id, label: `${s.codigo} — ${s.tipoPersona === 'JURIDICA' ? s.razonSocial : `${s.nombre ?? ''} ${s.apellido ?? ''}`.trim()}` })), [socios]);
  const socioPorId = useMemo(() => new Map(socios.map((s) => [s.id, s])), [socios]);

  const total = (Number(precioUnitario) || 0) - (Number(descuento) || 0) + (Number(impuestos) || 0);

  async function cargar() {
    try {
      setFacturas(await cargarFacturas({ estado: filtroEstado || undefined }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarSociosProtectores().then(setSocios).catch(() => undefined);
    cargarTiposDocumentoFinanzas().then(setTiposComprobante);
    cargarMediosPagoFinanzas().then(setMediosPago);
    cargarMotivosNotaCredito().then(setMotivosNota);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  async function verNotas(facturaId: string) {
    if (expandidaId === facturaId) {
      setExpandidaId(null);
      return;
    }
    setExpandidaId(facturaId);
    if (!notasPorFactura.has(facturaId)) {
      const notas = await cargarNotasCredito({ facturaId });
      setNotasPorFactura((prev) => new Map(prev).set(facturaId, notas));
    }
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      let archivoUrl: string | undefined;
      if (archivo) {
        const subida = await subirArchivoFactura(archivo);
        archivoUrl = subida.archivoUrl;
      }
      await crearFactura({
        tipoComprobanteId,
        numero,
        timbrado: timbrado || undefined,
        fecha,
        socioProtectorId: socioProtectorId || undefined,
        clienteNombre: !socioProtectorId ? clienteNombre || undefined : undefined,
        clienteRucCi: !socioProtectorId ? clienteRucCi || undefined : undefined,
        concepto,
        precioUnitario: Number(precioUnitario),
        descuento: Number(descuento) || 0,
        impuestos: Number(impuestos) || 0,
        formaPagoId: formaPagoId || undefined,
        archivoUrl,
      });
      setMensaje('Factura registrada.');
      setTipoComprobanteId('');
      setNumero('');
      setTimbrado('');
      setFecha('');
      setSocioProtectorId('');
      setClienteNombre('');
      setClienteRucCi('');
      setConcepto('');
      setPrecioUnitario('');
      setDescuento('0');
      setImpuestos('0');
      setFormaPagoId('');
      setArchivo(null);
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function anular(f: Factura) {
    const motivo = await solicitarEntrada({ titulo: 'Anular factura', mensaje: 'Indique el motivo de la anulación. La factura no se borra; queda marcada como anulada.', etiqueta: 'Motivo', confirmar: 'Anular', requerida: true, peligro: true });
    if (!motivo) return;
    try {
      await anularFactura(f.id, motivo);
      setMensaje('Factura anulada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Facturación ({facturas?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Registrar factura manual'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado" opciones={[{ value: 'EMITIDA', label: 'Emitida' }, { value: 'ANULADA', label: 'Anulada' }]} value={filtroEstado} onChange={setFiltroEstado} maxWidth={180} />
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ color: 'var(--muted)', fontSize: 12 }}>Registra una factura física ya emitida por el cuartel -- SIGBO no la genera, solo la deja registrada y trazable.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de comprobante</label>
              <ComboBuscable ariaLabel="Tipo de comprobante" opciones={opcionesTipoComprobante} value={tipoComprobanteId} onChange={setTipoComprobanteId} />
            </div>
            <div>
              <label htmlFor={`${idCampo}-n-de-factura`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>N° de factura</label>
              <input id={`${idCampo}-n-de-factura`} className="input-field" value={numero} onChange={(e) => setNumero(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${idCampo}-timbrado`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Timbrado</label>
              <input id={`${idCampo}-timbrado`} className="input-field" value={timbrado} onChange={(e) => setTimbrado(e.target.value)} />
            </div>
            <div>
              <label htmlFor={`${idCampo}-fecha-2`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input id={`${idCampo}-fecha-2`} className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cliente: Socio Protector (o completar nombre/RUC-CI abajo)</label>
            <ComboBuscable ariaLabel="Cliente: Socio Protector (o completar nombre/RUC-CI abajo)" opciones={opcionesSocio} value={socioProtectorId} onChange={setSocioProtectorId} placeholderBusqueda="Buscar..." ningunaLabel="-- otro cliente --" />
          </div>
          {!socioProtectorId && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label htmlFor={`${idCampo}-nombre-del-cliente`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre del cliente</label>
                <input id={`${idCampo}-nombre-del-cliente`} className="input-field" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} />
              </div>
              <div>
                <label htmlFor={`${idCampo}-ruc-ci-del-cliente`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>RUC/CI del cliente</label>
                <input id={`${idCampo}-ruc-ci-del-cliente`} className="input-field" value={clienteRucCi} onChange={(e) => setClienteRucCi(e.target.value)} />
              </div>
            </div>
          )}
          <div>
            <label htmlFor={`${idCampo}-concepto-2`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Concepto</label>
            <input id={`${idCampo}-concepto-2`} className="input-field" value={concepto} onChange={(e) => setConcepto(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor={`${idCampo}-precio`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Precio</label>
              <input id={`${idCampo}-precio`} className="input-field" type="number" min={0} step="1" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${idCampo}-descuento`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descuento</label>
              <input id={`${idCampo}-descuento`} className="input-field" type="number" min={0} step="1" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
            </div>
            <div>
              <label htmlFor={`${idCampo}-impuestos`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Impuestos</label>
              <input id={`${idCampo}-impuestos`} className="input-field" type="number" min={0} step="1" value={impuestos} onChange={(e) => setImpuestos(e.target.value)} />
            </div>
            <div>
              <label htmlFor={`${idCampo}-total`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Total</label>
              <input id={`${idCampo}-total`} className="input-field" value={formatearGs(total)} disabled />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Forma de pago</label>
              <ComboBuscable ariaLabel="Forma de pago" opciones={opcionesMedioPago} value={formaPagoId} onChange={setFormaPagoId} ningunaLabel="-- --" />
            </div>
            <div>
              <label htmlFor={`${idCampo}-archivo-digital-pdf-jpg-png`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Archivo digital (PDF/JPG/PNG)</label>
              <input id={`${idCampo}-archivo-digital-pdf-jpg-png`} className="input-field" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar factura'}
          </button>
        </form>
      )}

      {facturas && facturas.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay facturas registradas.</p>}
      {facturas && facturas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>N°</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Cliente</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Concepto</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Total</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((f) => (
              <Fragment key={f.id}>
                <tr style={{ borderBottom: expandidaId === f.id ? 'none' : '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{f.numero}</td>
                  <td style={{ padding: '6px 4px' }}>{f.fecha}</td>
                  <td style={{ padding: '6px 4px' }}>
                    {f.socioProtectorId ? socioPorId.get(f.socioProtectorId)?.codigo ?? '-' : f.clienteNombre ?? '-'}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{f.concepto}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearGs(f.total)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={f.estado === 'ANULADA' ? { background: 'var(--bad-fill)', color: 'var(--danger)' } : { background: 'var(--ok-fill)', color: 'var(--success)' }}>{f.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {puedeEmitirNota && f.estado === 'EMITIDA' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 11, background: '#475569' }} onClick={() => verNotas(f.id)}>
                        {expandidaId === f.id ? 'Cerrar' : 'Nota de credito'}
                      </button>
                    )}
                    {puedeAnular && f.estado === 'EMITIDA' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 11, background: '#7f1d1d' }} onClick={() => anular(f)}>
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
                {expandidaId === f.id && (
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td colSpan={7} style={{ padding: 4 }}>
                      {(notasPorFactura.get(f.id) ?? []).map((n) => (
                        <p key={n.id} style={{ fontSize: 12, color: 'var(--muted)', padding: '2px 4px' }}>
                          NC {n.numero} — {formatearGs(n.importe)} el {n.fecha}
                        </p>
                      ))}
                      <FilaNotaCredito
                        factura={f}
                        motivos={motivosNota}
                        onCreada={() => {
                          setMensaje('Nota de credito emitida.');
                          setNotasPorFactura((prev) => {
                            const copia = new Map(prev);
                            copia.delete(f.id);
                            return copia;
                          });
                          cargarNotasCredito({ facturaId: f.id }).then((notas) => setNotasPorFactura((prev) => new Map(prev).set(f.id, notas)));
                        }}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
