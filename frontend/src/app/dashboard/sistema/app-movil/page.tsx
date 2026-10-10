'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { AppMovil, ConexionMovil, tamanio } from '../tipos';

/** Lo que hacia conectar-celulares.bat, dentro del sistema: QR para instalar y para conectar la app. */
export default function SistemaAppMovilPage() {
  const [app, setApp] = useState<AppMovil | null>(null);
  const [conexion, setConexion] = useState<ConexionMovil | null>(null);
  const [qrs, setQrs] = useState<Record<string, { conectar: string; instalar: string }>>({});
  const [errorQr, setErrorQr] = useState('');

  const cargar = useCallback(async () => {
    const [a, c] = await Promise.all([apiFetch('/sistema/app-movil'), apiFetch('/sistema/conexion-movil')]);
    if (!a.ok || !c.ok) {
      const cuerpo = await (a.ok ? c : a).json().catch(() => ({}));
      throw new Error(cuerpo.message ?? 'No se pudo consultar la app móvil.');
    }
    setApp(await a.json());
    setConexion(await c.json());
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, 30_000);

  // Los QR se generan aqui, en el navegador: ningun servicio externo ve las direcciones del cuartel.
  // Clave estable: los QR se rehacen solo si cambian las direcciones, no en cada refresco de 30 s.
  const claveQr = useMemo(() => (conexion ? JSON.stringify(conexion.direcciones.map((d) => ({ ip: d.ip, qrConectar: d.qrConectar, urlInstalar: d.urlInstalar }))) : ''), [conexion]);
  useEffect(() => {
    if (!claveQr) return;
    const direcciones = JSON.parse(claveQr) as Array<{ ip: string; qrConectar: string; urlInstalar: string }>;
    let vigente = true;
    void Promise.all(direcciones.map(async (d) => [d.ip, {
      conectar: await QRCode.toDataURL(d.qrConectar, { width: 220, margin: 2 }),
      instalar: await QRCode.toDataURL(d.urlInstalar, { width: 220, margin: 2 }),
    }] as const)).then((pares) => {
      if (!vigente) return;
      setQrs(Object.fromEntries(pares));
      setErrorQr('');
    }).catch(() => { if (vigente) setErrorQr('No se pudieron generar los códigos QR. Las direcciones se muestran debajo de cada tarjeta.'); });
    return () => { vigente = false; };
  }, [claveQr]);

  if (!app || !conexion) return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Consultando la app móvil…" />;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera"><p>Versión publicada de la app y códigos para instalarla y conectarla desde la red del cuartel.</p><MarcaActualizacion {...actualizacion} /></div>
      {actualizacion.error && <Aviso tipo="error" texto={`No se pudo actualizar: ${actualizacion.error}. Se muestran los últimos datos.`} />}
      {errorQr && <Aviso tipo="error" texto={errorQr} fontSize={12} />}

      <section className="cm-panel" aria-labelledby="m-apk">
        <h2 id="m-apk"><span>APK publicado</span><span className="badge" style={{ background: app.disponible ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{app.disponible ? `Versión ${app.versionNombre}` : 'Sin publicar'}</span></h2>
        {!app.disponible ? <p className="cm-vacio">No hay un APK publicado (o el archivo no coincide con su version.json). Se publica desde la terminal con <code>.movile\scripts\publicar-apk.ps1</code>.</p> : <ul className="cm-lista">
          <li><span>Código de versión</span><span>{app.versionCodigo}{app.obligatoria ? ' · actualización obligatoria' : ''}</span></li>
          <li><span>Tamaño</span><span>{app.tamanioBytes ? tamanio(app.tamanioBytes) : '—'}</span></li>
          <li><span>SHA-256</span><code style={{ fontSize: 11, wordBreak: 'break-all' }}>{app.sha256}</code></li>
          <li><span>Huella del certificado</span><code style={{ fontSize: 11, wordBreak: 'break-all' }}>{app.huellaCertificado ?? 'No publicada'}</code></li>
          {app.notas && <li><span>Notas</span><span>{app.notas}</span></li>}
        </ul>}
      </section>

      <section className="cm-panel" aria-labelledby="m-conexion">
        <h2 id="m-conexion">Conectar los celulares (puerto {conexion.puerto})</h2>
        {conexion.direcciones.length === 0 ? <p className="cm-vacio">Este servidor no tiene ninguna dirección de red local (Wi-Fi o Ethernet).</p> : <div className="qr-grid">
          {conexion.direcciones.flatMap((d) => [
            <div key={`${d.ip}-i`} className="qr-tarjeta">
              <strong>Instalar la app</strong>
              {qrs[d.ip] && conexion.apkDisponible ? <img src={qrs[d.ip].instalar} alt={`Código QR para descargar la app desde ${d.ip}`} width={200} height={200} /> : <p className="cm-vacio">{conexion.apkDisponible ? 'Generando…' : 'No hay APK publicado.'}</p>}
              <code>{d.urlInstalar}</code>
              <span className="badge" style={{ background: d.responde ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{d.nombre} · {d.responde ? 'responde' : 'no responde'}</span>
            </div>,
            <div key={`${d.ip}-c`} className="qr-tarjeta">
              <strong>Conectar la app</strong>
              {qrs[d.ip] ? <img src={qrs[d.ip].conectar} alt={`Código QR para conectar la app al servidor ${d.ip}`} width={200} height={200} /> : <p className="cm-vacio">Generando…</p>}
              <code>{d.api}</code>
              <span className="cm-vacio">En la app: Conectar con el servidor › Escanear.</span>
            </div>,
          ])}
        </div>}
        {conexion.direcciones.some((d) => !d.responde) && <p className="cm-vacio">Si una dirección no responde, el firewall de Windows puede estar bloqueando el puerto {conexion.puerto} para la red privada.</p>}
      </section>
    </div>
  );
}
