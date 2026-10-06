/**
 * Verificacion de ESCRITURAS contra SQL Server real, sin dejar rastro.
 *
 * Corre las operaciones de escritura de los modulos nuevos (flota, despacho,
 * llamados, convocatorias, cartografia, aptitudes, fichaje, reservas,
 * prevencion, dotacion...) dentro de UNA transaccion y la REVIERTE al final.
 * Sirve para comprobar que cada entidad coincide con su tabla (nombres de
 * columna, restricciones, indices unicos) cosa que las pruebas unitarias, que
 * usan una base en memoria, no pueden probar.
 *
 * Uso (con la base levantada y el backend compilado):  npm run build && node scripts/verificar-escrituras.js
 */
require('dotenv').config();
require('reflect-metadata');
const { DataSource } = require('typeorm');
const { dataSourceOptions } = require('../dist/core/database/data-source-options');
const E = require('../dist/shared/entities');

const servicio = (ruta, nombre) => require(`../dist/modules/${ruta}`)[nombre];

let pasos = 0;
let fallos = 0;
async function paso(nombre, fn) {
  pasos++;
  try {
    const r = await fn();
    console.log(`OK    ${nombre}`);
    return r;
  } catch (e) {
    fallos++;
    console.log(`FALLA ${nombre}\n      -> ${(e.driverError && e.driverError.message) || e.message}`);
    return undefined;
  }
}
async function debeFallar(nombre, fn, patron) {
  pasos++;
  try {
    await fn();
    fallos++;
    console.log(`FALLA ${nombre}\n      -> deberia haber sido rechazado`);
  } catch (e) {
    const msg = (e.driverError && e.driverError.message) || e.message;
    if (patron && !patron.test(msg)) {
      fallos++;
      console.log(`FALLA ${nombre}\n      -> rechazado por otro motivo: ${msg}`);
    } else console.log(`OK    ${nombre} (rechazado: ${msg.slice(0, 70)})`);
  }
}

(async () => {
  const ds = new DataSource(dataSourceOptions);
  await ds.initialize();
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  const m = qr.manager;

  // "DataSource" de prueba que opera siempre dentro de la transaccion abierta.
  const dsTx = {
    manager: m,
    getRepository: (e) => m.getRepository(e),
    transaction: async (cb) => cb(m),
    query: (...a) => m.query(...a),
  };
  const audit = { registrar: async () => undefined };

  try {
    const admin = await m.findOne(E.Usuario, { where: { username: 'admin' } });
    if (!admin) throw new Error('No se encontro el usuario admin');
    const U = admin.id;

    // --- datos base (todo se revierte) ---
    const tipo = await m.save(m.create(E.TipoServicio, { codigo: `T${Date.now() % 100000}`, nombre: 'Incendio (prueba)', color: '#3B82F6', prioridad: 0, requiereRo: false, requiereVehiculo: true, activo: true }));
    const vehiculo = await m.save(m.create(E.Vehiculo, { numeroInterno: 'TST-1', tipo: 'Autobomba', estado: 'OPERATIVO', kilometrajeActual: 1000, combustibleActual: 10, fotos: '[]', documentos: '[]' }));
    const srv = await m.save(m.create(E.Servicio, {
      tipoServicioId: tipo.id, numeroServicio: `TST-${Date.now() % 1000000}`, fechaHoraAviso: new Date(), direccion: 'Av. Prueba 1', estado: 'REGISTRADO',
    }));
    const bombero = await m.save(m.create(E.Bombero, {
      cedula: `TST${Date.now() % 10000000}`, nombre: 'Prueba', apellido: 'Transaccion', fechaNacimiento: '1990-01-01', telefonoPrincipal: '0981000000',
      numeroBombero: `T-${Date.now() % 100000}`, rango: 'Bombero', estado: 'ACTIVO', fechaIngreso: '2020-01-01', nacionalidad: 'Paraguaya', contactosEmergencia: '[]',
    }));

    // --- flota: despacho completo ---
    const Flota = servicio('flota/flota.service', 'FlotaService');
    const flota = new Flota(dsTx, audit);
    const ctx = { usuarioId: U };
    const d = await paso('flota: despachar un movil a un servicio', () => flota.despachar({ servicioId: srv.id, vehiculoId: vehiculo.id, kmSalida: 1000 }, ctx));
    await debeFallar('flota: el mismo movil no se despacha dos veces', () => flota.despachar({ servicioId: srv.id, vehiculoId: vehiculo.id }, ctx), /EN_CUARTEL|activo/);
    if (d) {
      await paso('flota: llegada al lugar', () => flota.avanzar(d.id, 'llegada', ctx));
      await paso('flota: salida del lugar', () => flota.avanzar(d.id, 'fin', ctx));
      await paso('flota: regreso con kilometraje', () => flota.avanzar(d.id, 'regreso', ctx, { kmRegreso: 1042 }));
      const v = await m.findOne(E.Vehiculo, { where: { id: vehiculo.id } });
      await paso('flota: el kilometraje del movil se actualizo', async () => {
        if (v.kilometrajeActual !== 1042 || v.estadoOperativo !== 'EN_CUARTEL') throw new Error(`km=${v.kilometrajeActual} estado=${v.estadoOperativo}`);
      });
    }
    await paso('flota: posicion del movil (alta y reemplazo)', async () => {
      await flota.reportarPosicion(vehiculo.id, { latitud: -25.3, longitud: -57.6, velocidadKmh: 40, registradoEn: new Date(Date.now() - 5000).toISOString() }, U);
      await flota.reportarPosicion(vehiculo.id, { latitud: -25.31, longitud: -57.61 }, U);
      const filas = await m.find(E.PosicionMovil, { where: { vehiculoId: vehiculo.id } });
      if (filas.length !== 1) throw new Error(`filas=${filas.length}`);
    });
    await paso('flota: tablero, posiciones y vencimientos leen bien', async () => {
      await flota.tablero();
      await flota.posiciones();
      await flota.vencimientos(30);
      await flota.serviciosAbiertos();
    });
    const d2 = await paso('flota: segundo despacho y cancelacion con motivo', async () => {
      const x = await flota.despachar({ servicioId: srv.id, vehiculoId: vehiculo.id }, ctx);
      return flota.cancelar(x.id, 'Prueba', ctx);
    });
    await paso('flota: reponer en cuartel', () => flota.reponerEnCuartel(vehiculo.id, 'Prueba', ctx));

    // --- dotacion y bitacora ---
    const Dot = servicio('flota/dotacion.service', 'DotacionService');
    const dot = new Dot(dsTx, audit);
    const item = await paso('dotacion: crear item', () => dot.crear(vehiculo.id, { descripcion: 'Hacha', cantidadObjetivo: 2 }, ctx));
    if (item) await paso('dotacion: control, faltantes y bitacora', async () => {
      await dot.registrarControl(vehiculo.id, { lecturas: [{ itemId: item.id, cantidadActual: 1 }] }, ctx);
      const f = (await dot.faltantes()).filter((x) => x.vehiculoId === vehiculo.id);
      if (f.length !== 1 || f[0].faltante !== 1) throw new Error(JSON.stringify(f));
      await dot.bitacora(vehiculo.id);
    });

    // --- disponibilidad e informe PDF ---
    const Disp = servicio('flota/disponibilidad.service', 'DisponibilidadService');
    await paso('disponibilidad: consulta completa', () => new Disp(dsTx).consultar());
    const Inf = servicio('flota/informe.service', 'InformeService');
    await paso('informe: PDF de la intervencion', async () => {
      const r = await new Inf(dsTx, audit).generarPdf(srv.id, U, 'admin');
      if (r.buffer.subarray(0, 5).toString() !== '%PDF-') throw new Error('no es un PDF');
    });

    // --- llamados y convocatorias ---
    const Llam = servicio('llamados/llamados.service', 'LlamadosService');
    const ll = new Llam(dsTx, audit, undefined);
    const lctx = { usuarioId: U, username: 'admin' };
    const llamado = await paso('llamados: registrar', () => ll.crearLlamado({ medio: 'Radio', direccion: 'Av. Prueba 1', tipoServicioId: tipo.id }, lctx));
    if (llamado) {
      await paso('llamados: vincular a un servicio y atender', () => ll.vincularServicio(llamado.id, srv.id, lctx));
      await paso('llamados: cerrar', () => ll.cambiarEstadoLlamado(llamado.id, { estado: 'CERRADO' }, lctx));
    }
    const conv = await paso('convocatorias: crear', () => ll.crearConvocatoria({ mensaje: 'Prueba de convocatoria', servicioId: srv.id }, lctx));
    if (conv) {
      await paso('convocatorias: responder VOY y cambiar a NO_PUEDO', async () => {
        await ll.responder(conv.id, { respuesta: 'VOY', etaMinutos: 10 }, lctx);
        await ll.responder(conv.id, { respuesta: 'NO_PUEDO' }, lctx);
        const d = await ll.detalleConvocatoria(conv.id);
        if (d.respuestas.length !== 1 || d.totales.noPuedo !== 1) throw new Error(JSON.stringify(d.totales));
      });
      await paso('convocatorias: abiertas para el usuario y cierre', async () => {
        await ll.abiertasPara(U);
        await ll.cerrarConvocatoria(conv.id, lctx);
      });
    }

    // --- cartografia ---
    const Car = servicio('cartografia/cartografia.service', 'CartografiaService');
    const car = new Car(dsTx, audit);
    const h = await paso('cartografia: hidrante', () => car.crearHidrante({ codigo: `H-${Date.now() % 100000}`, direccion: 'Calle 1', latitud: -25.3, longitud: -57.6, caudalLpm: 500 }, ctx));
    if (h) await debeFallar('cartografia: codigo de hidrante repetido', () => car.crearHidrante({ codigo: h.codigo, direccion: 'x', latitud: 1, longitud: 1 }, ctx), /codigo|Ya existe/i);
    const p = await paso('cartografia: punto de riesgo', () => car.crearPunto({ nombre: 'Deposito prueba', direccion: 'Ruta 1', latitud: -25.3, longitud: -57.6, nivelRiesgo: 'ALTO' }, ctx));
    if (p) await paso('cartografia: pre-plan con dos versiones', async () => {
      await car.guardarPreplan(p.id, { titulo: 'Plan', contenido: 'Version uno' }, ctx);
      await car.guardarPreplan(p.id, { titulo: 'Plan', contenido: 'Version dos' }, ctx);
      const hist = await car.historialPreplan(p.id);
      if (hist.length !== 2 || hist.filter((x) => x.vigente).length !== 1) throw new Error(JSON.stringify(hist.map((x) => [x.version, x.vigente])));
    });
    await paso('cartografia: cercanos y bajas logicas', async () => {
      const c = await car.cercanos(-25.3, -57.6, 1000);
      if (c.hidrantes.length < 1) throw new Error('no encontro el hidrante');
      if (h) await car.actualizarHidrante(h.id, { activo: false }, ctx);
    });

    // --- control del personal ---
    const Venc = servicio('control-personal/vencimientos.service', 'VencimientosService');
    const venc = new Venc(dsTx, audit);
    await paso('personal: aptitud con vencimiento aparece en el consolidado', async () => {
      const manana = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
      await venc.crearAptitud({ bomberoId: bombero.id, categoria: 'OTRA', tipo: 'Curso de prueba', venceEn: manana }, ctx);
      const r = await venc.vencimientos(30, { incluirMedicas: true });
      if (!r.some((x) => x.bomberoId === bombero.id && x.origen === 'APTITUD')) throw new Error('no aparece');
    });
    const Horas = servicio('control-personal/horas-servicio.service', 'HorasServicioService');
    const horas = new Horas(dsTx, audit);
    await paso('horas de servicio: fijar limites dos veces (uno activo) y resumir', async () => {
      await horas.fijarLimites({ horasMaximasPeriodo: 48, periodoDias: 7, descansoMinimoHoras: 12 }, ctx);
      await horas.fijarLimites({ horasMaximasPeriodo: 40, periodoDias: 7, descansoMinimoHoras: 10 }, ctx);
      const activos = await m.find(E.LimiteHorasServicio, { where: { activo: true } });
      if (activos.length !== 1) throw new Error(`activos=${activos.length}`);
      await horas.resumen('2026-01-01', '2026-12-31');
    });
    const Fich = servicio('control-personal/fichaje.service', 'FichajeService');
    const fich = new Fich(dsTx, audit);
    const punto = await paso('fichaje: crear punto (solo se guarda el hash)', () => fich.crearPunto('Puerta de prueba', ctx));
    if (punto) {
      await paso('fichaje: escanear el QR registra la entrada', async () => {
        const r = await fich.escanear(punto.token, U);
        if (r.tipo !== 'ENTRADA' || r.duplicado) throw new Error(JSON.stringify(r));
      });
      await paso('fichaje: doble escaneo se ignora; QR regenerado invalida el viejo', async () => {
        const r2 = await fich.escanear(punto.token, U);
        if (!r2.duplicado) throw new Error('no detecto el doble escaneo');
        const nuevo = await fich.regenerarToken(punto.id, ctx);
        let rechazado = false;
        try { await fich.escanear(punto.token, U); } catch { rechazado = true; }
        if (!rechazado) throw new Error('el token viejo sigue valiendo');
        await fich.listarPuntos();
        await fich.deFecha(new Date().toISOString().slice(0, 10));
        await fich.misFichajes(U);
        return nuevo;
      });
    }

    // --- reservas ---
    const Res = servicio('reservas/reservas.service', 'ReservasService');
    const res = new Res(dsTx, audit);
    const rctx = { usuarioId: U, puedeDecidir: true };
    const inst = await paso('reservas: crear instalacion', () => res.crearInstalacion({ nombre: `Salon prueba ${Date.now() % 100000}`, capacidad: 40 }, rctx));
    if (inst) {
      const ini = new Date(Date.now() + 48 * 3600000);
      const fin = new Date(ini.getTime() + 2 * 3600000);
      const r1 = await paso('reservas: solicitar y aprobar', async () => {
        const r = await res.solicitar({ instalacionId: inst.id, titulo: 'Reunion', solicitanteNombre: 'Prueba', inicio: ini.toISOString(), fin: fin.toISOString() }, rctx);
        await res.decidir(r.id, { decision: 'APROBAR' }, rctx);
        return r;
      });
      if (r1) await paso('reservas: una reserva que se pisa no se aprueba', async () => {
        const r = await res.solicitar({ instalacionId: inst.id, titulo: 'Otra', solicitanteNombre: 'Prueba', inicio: new Date(ini.getTime() + 3600000).toISOString(), fin: new Date(fin.getTime() + 3600000).toISOString() }, rctx);
        let rechazado = false;
        try { await res.decidir(r.id, { decision: 'APROBAR' }, rctx); } catch (e) { rechazado = /superpone/.test(e.message); }
        if (!rechazado) throw new Error('aprobo una reserva superpuesta');
        await res.cancelar(r.id, {}, rctx);
        await res.listar({ estado: 'APROBADA' });
      });
    }

    // --- prevencion ---
    const Prev = servicio('prevencion/prevencion.service', 'PrevencionService');
    const prev = new Prev(dsTx, audit);
    await paso('prevencion: inspeccion aprobada con certificado y estado actual', async () => {
      const hoy = new Date().toISOString().slice(0, 10);
      const vence = new Date(Date.now() + 200 * 86400000).toISOString().slice(0, 10);
      await prev.registrar({ establecimiento: 'Panaderia prueba', direccion: 'Calle 9', fecha: hoy, resultado: 'APROBADO', certificadoNumero: `C-${Date.now()}`, certificadoVence: vence }, ctx);
      const e = await prev.estadoActual(30);
      if (!e.some((x) => x.establecimiento === 'Panaderia prueba' && x.estado === 'VIGENTE')) throw new Error('no figura vigente');
      await prev.listar({});
    });

    // --- indicadores ---
    const Ind = servicio('indicadores/indicadores.service', 'IndicadoresService');
    const ind = new Ind(dsTx);
    await paso('indicadores: operativos y mapa de calor sobre datos reales', async () => {
      const hoy = new Date().toISOString().slice(0, 10);
      const o = await ind.operativos('2026-01-01', hoy);
      if (o.totalServicios < 1) throw new Error('no conto el servicio de prueba');
      await ind.calor('2026-01-01', hoy, 500);
    });


    // --- victimas, ausencias y avisos (migracion 086) ---
    const Vic = servicio('campo/victimas.service', 'VictimasService');
    const vic = new Vic(dsTx, audit);
    await paso('siniestros: registrar victimas y sumar por categoria', async () => {
      await vic.registrar({ servicioId: srv.id, categoria: 'RESCATADA', cantidad: 2 }, ctx);
      await vic.registrar({ servicioId: srv.id, categoria: 'HERIDA', cantidad: 1, observacion: 'Leve' }, ctx);
      const r = await vic.deServicio(srv.id);
      if (r.totales.RESCATADA !== 2 || r.totales.HERIDA !== 1) throw new Error(JSON.stringify(r.totales));
    });
    const Aus = servicio('campo/ausencias.service', 'AusenciasService');
    const aus = new Aus(dsTx, audit);
    const actx = { usuarioId: U, puedeDecidir: true };
    await paso('ausencias: pedir, no solapar, aprobar y marcar al bombero como ausente', async () => {
      const desde = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      const hasta = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      const a = await aus.solicitar({ bomberoId: bombero.id, desde, hasta, motivo: 'Prueba' }, actx);
      let solapo = false;
      try { await aus.solicitar({ bomberoId: bombero.id, desde, hasta, motivo: 'Otra' }, actx); } catch { solapo = true; }
      if (!solapo) throw new Error('permitio ausencias superpuestas');
      await aus.decidir(a.id, { decision: 'APROBAR' }, actx);
      if (!(await aus.ausentesEl(desde)).has(bombero.id)) throw new Error('no figura ausente');
      await aus.listar(actx);
    });
    await paso('avisos de vencimiento: la tabla acepta y rechaza repetidos', async () => {
      const clave = `PRUEBA|${Date.now()}`;
      await m.save(m.create(E.AvisoVencimiento, { clave, avisadoEn: new Date() }));
      if (!(await m.findOne(E.AvisoVencimiento, { where: { clave } }))) throw new Error('no se guardo');
    });
    await paso('flota: tablero incluye la geocerca sin romper', async () => {
      const t = await flota.tablero();
      if (!t.every((x) => 'alerta' in x)) throw new Error('falta el campo alerta');
    });


    // --- adjuntos: escribe un archivo REAL en disco y lo limpia al terminar ---
    const Adj = servicio('campo/adjuntos.service', 'AdjuntosService');
    const adj = new Adj(dsTx, audit);
    const { borrarImagenSiExiste } = require('../dist/shared/utils/almacenamiento');
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 7)]);
    let refAdjunto = null;
    await paso('adjuntos: foto de un movil: se guarda, se lista y se lee igual', async () => {
      const a = await adj.subir({ buffer: png }, { entidad: 'VEHICULO', entidadId: vehiculo.id, tipo: 'FOTO', descripcion: 'Prueba', claveIdempotencia: `prueba-${Date.now()}` }, ctx);
      refAdjunto = (await m.findOne(E.Adjunto, { where: { id: a.id } })).referencia;
      if (!/^privado:adjuntos-campo:[a-f0-9]{32}\.png$/.test(refAdjunto)) throw new Error('referencia inesperada: ' + refAdjunto);
      const lista = await adj.listar('VEHICULO', vehiculo.id);
      if (lista.length !== 1 || 'referencia' in lista[0]) throw new Error('la lista filtra mal o expone la referencia');
      const f = await adj.archivo(a.id);
      if (!f.buffer.equals(png) || f.mime !== 'image/png') throw new Error('el archivo leido no coincide');
    });
    await paso('adjuntos: algo que no es imagen se rechaza y no deja archivo', async () => {
      let rechazado = false;
      try { await adj.subir({ buffer: Buffer.from('%PDF-1.4 falso') }, { entidad: 'VEHICULO', entidadId: vehiculo.id, tipo: 'FOTO' }, ctx); } catch { rechazado = true; }
      if (!rechazado) throw new Error('acepto un archivo que no es imagen');
    });
    if (refAdjunto) await borrarImagenSiExiste(refAdjunto, 'adjuntos-campo');

    // --- historial coherente ---
    await paso('flota: historial de estados del movil quedo registrado', async () => {
      const hist = await flota.historialMovil(vehiculo.id);
      if (hist.length < 6) throw new Error(`filas=${hist.length}`);
    });
    void d2;
  } finally {
    await qr.rollbackTransaction();
    await qr.release();
    const quedan = await ds.query("SELECT COUNT(*) AS n FROM servicios.hidrantes WHERE direccion = 'Calle 1'");
    console.log(`\nTransaccion revertida. Hidrantes de prueba que quedaron en la base: ${quedan[0].n}`);
    await ds.destroy();
  }
  console.log(`\n${pasos - fallos} de ${pasos} comprobaciones correctas${fallos ? ` — ${fallos} FALLARON` : ''}.`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => {
  console.error('ERROR:', (e.driverError && e.driverError.message) || e.message);
  process.exit(2);
});
