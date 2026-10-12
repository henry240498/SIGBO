import { readFileSync } from 'fs';
import { resolve } from 'path';
import { planDeCarga } from './gre-carga';
import { MotorMatpelService } from './motor-matpel.service';
import { CatalogoMatpel, compararDecimal, normalizarMatpel, ParametrosMatpel } from './matpel-modelo';
import { validarContextoConsultaMatpel, validarParametrosMatpel } from './dto/matpel-consulta.dto';
import { perfilMatpel } from './matpel-perfil';
import { geometriaMatpel } from './matpel-geometria';

const recorte = JSON.parse(readFileSync(resolve(__dirname, '../../../../.context/gre2024/test-cases/motor-fuente.json'), 'utf8'));
const a = recorte.artefactoRecortado;
const versionGreId = '00000000-0000-4000-8000-000000000001';
let secuencia = 1;
const plan = planDeCarga(a, versionGreId, () => `00000000-0000-4000-8000-${String(++secuencia).padStart(12, '0')}`);
const catalogo: CatalogoMatpel = { ...plan, versionGreId, documento: { ...a.documento, tamanoBytes: a.documento.bytes } } as any;
const motor = new MotorMatpelService();
const dato = <T>(valor: T | null): any => ({ valor, certeza: valor === null ? 'DESCONOCIDO' : 'CONFIRMADO', origen: 'OPERADOR', observadoEn: null, evidenciaId: null, fuenteDatoId: null });
const parametros = (): ParametrosMatpel => ({ eventos: dato(['DERRAME']), incendio: dato(false), cantidad: dato({ valorDecimal: '208', unidad: 'L' }),
  contactoAgua: dato('TIERRA'), periodo: dato('DIA'), contenedor: dato(null), viento: dato(null), ubicacion: dato(null) });
const entrada = (id: string, fragmento = '') => catalogo.entradas.find(e => e.identificador === id && normalizarMatpel(e.nombreOriginal).includes(normalizarMatpel(fragmento)))!;
const evaluar = (id: string, p = parametros(), fragmento = '', c = catalogo) => motor.evaluar([entrada(id, fragmento).id], p, c);
const grande = (valor = '500') => { const p = parametros(); p.cantidad = dato({ valorDecimal: valor, unidad: 'L' }); return p; };
const t3 = () => { const p = grande(); p.contenedor = dato('Carrotanque de ferrocarril'); p.cantidadContenedor = dato({ valorDecimal: '80000', unidad: 'kg' });
  p.numeroContenedores = dato(1); p.viento = dato({ velocidadDecimal: '10', unidad: 'km/h', direccionDesdeGrados: null, proveedorId: null }); return p; };

describe('Motor MATPEL con recorte literal de la GRE2024; sin base, publicación ni activación', () => {
  it('PDF3 / impresa1: referencia de agua conserva condición del extintor con literal/fuente y no elige un agente', () => {
    const p = parametros(); p.contactoAgua = dato('AGUA');
    const r = evaluar('1689', p);
    const a = r.avisos.find(a => a.codigo === 'GRE24-FLOW-AGUA-EXTINTOR')!;
    expect(a.motivo).toContain('no utilice agua cómo agente extintor');
    expect(a.referenciaIds.some(id => catalogo.referencias.some(ref => ref.id === id && ref.paginaPdf === 3))).toBe(true);
    expect(a.motivo).toContain('no equivale a prohibir todo uso del agua');
  });
  it('referencia de agua sigue visible en seco; varios materiales no usan ese flujo', () => {
    expect(evaluar('1689').avisos.some(a => a.codigo === 'GRE24-FLOW-AGUA-EXTINTOR')).toBe(true);
    const r = motor.evaluar([entrada('1689').id, entrada('1005').id], parametros(), catalogo);
    expect(r.avisos.some(a => a.codigo === 'GRE24-FLOW-AGUA-EXTINTOR')).toBe(false);
  });
  it('PDF297 / impresa295: viento desde norte genera cuadrado al sur, anchoD y longitudD', () => {
    const p = parametros(); p.ubicacion = dato({ latitud: 0, longitud: 0, precisionM: 10 });
    p.viento = dato({ velocidadDecimal: '5', unidad: 'km/h', direccionDesdeGrados: 0, proveedorId: null });
    const g = geometriaMatpel(evaluar('1005', p), p, catalogo);
    expect(g.aislamiento?.radioM).toBe(30); expect(g.proteccion?.distanciaM).toBe(100);
    const vs = g.proteccion!.coordinates[0];
    expect(vs).toHaveLength(5); expect(vs[0]).toEqual(vs[4]);
    expect(Math.abs(vs[0][1])).toBeLessThan(1e-8); expect(Math.abs(vs[1][1])).toBeLessThan(1e-8);
    expect(vs[2][1]).toBeLessThan(0); expect(vs[3][1]).toBeLessThan(0);
    expect(Math.abs(vs[1][0] - vs[0][0])).toBeCloseTo(Math.abs(vs[2][1] - vs[1][1]), 7);
  });
  it('viento desde este representa protección al oeste; coordenadas en orden GeoJSON', () => {
    const p = parametros(); p.ubicacion = dato({ latitud: 0, longitud: 0, precisionM: null });
    p.viento = dato({ velocidadDecimal: '5', unidad: 'km/h', direccionDesdeGrados: 90, proveedorId: null });
    const vs = geometriaMatpel(evaluar('1005', p), p, catalogo).proteccion!.coordinates[0];
    expect(vs[2][0]).toBeLessThan(0); expect(vs[3][0]).toBeLessThan(0);
    expect(Math.abs(vs[0][0])).toBeLessThan(1e-8);
  });
  it('geometría sin ubicación/viento o con incendio se abstiene; círculo no exige viento', () => {
    const p = parametros(); expect(geometriaMatpel(evaluar('1005', p), p, catalogo).aislamiento).toBeNull();
    p.ubicacion = dato({ latitud: 0, longitud: 0, precisionM: null });
    const g = geometriaMatpel(evaluar('1005', p), p, catalogo); expect(g.aislamiento?.radioM).toBe(30); expect(g.proteccion).toBeNull();
    p.incendio = dato(true); expect(geometriaMatpel(evaluar('1005', p), p, catalogo).aislamiento).toBeNull();
  });
  it('protección11.0+ no dibuja borde máximo; material reactivo en agua no fija origen', () => {
    const p = t3(); p.periodo = dato('NOCHE'); p.viento = dato({ velocidadDecimal: '5', unidad: 'km/h', direccionDesdeGrados: 0, proveedorId: null });
    p.ubicacion = dato({ latitud: 0, longitud: 0, precisionM: null });
    expect(geometriaMatpel(evaluar('1017', p), p, catalogo).proteccion).toBeNull();
    const agua = parametros(); agua.contactoAgua = dato('AGUA'); agua.ubicacion = p.ubicacion;
    expect(geometriaMatpel(evaluar('1689', agua), agua, catalogo).aislamiento).toBeNull();
  });
  it('no genera polígonos inválidos en polos ni antimeridiano', () => {
    const p = parametros(); p.viento = dato({ velocidadDecimal: '5', unidad: 'km/h', direccionDesdeGrados: 270, proveedorId: null });
    p.ubicacion = dato({ latitud: 0, longitud: 179.99999, precisionM: null });
    expect(geometriaMatpel(evaluar('1005', p), p, catalogo).proteccion).toBeNull();
    p.ubicacion.valor!.latitud = 89; expect(geometriaMatpel(evaluar('1005', p), p, catalogo).aislamiento).toBeNull();
  });
  it('una condición estimada conserva calidad y advierte sin convertirla en confirmada', () => {
    const p = parametros(); p.cantidad.certeza = 'ESTIMADO';
    const r = evaluar('1005', p);
    expect(r.parametros.cantidad.certeza).toBe('ESTIMADO');
    expect(r.avisos.some(a => a.codigo === 'CONDICIONES_PROVISIONALES')).toBe(true);
  });
  it('usa fuente identificada y conserva catálogo/inputs; resultados repetibles', () => {
    const p = parametros(); const antes = JSON.stringify({ catalogo, p });
    expect(evaluar('1005', p)).toEqual(evaluar('1005', p));
    expect(JSON.stringify({ catalogo, p })).toBe(antes);
    expect(evaluar('1005', p).documentoSha256).toBe(recorte.fuenteSha256);
  });
  it('PDF298 / impresa296: 208L es pequeño, 208.000000000000001L remite a Tabla3', () => {
    expect(evaluar('1005').aislamiento.celdas.map(c => c.valorDecimal)).toEqual(['30']);
    expect(evaluar('1005').proteccion.celdas.map(c => c.valorDecimal)).toEqual(['0.1']);
    expect(evaluar('1005', grande('208.000000000000001')).tabla3.estado).toBe('INDETERMINADO');
  });
  it('convierte m3 a L exactamente; nunca kg a L', () => {
    const p = parametros(); p.cantidad = dato({ valorDecimal: '0.208', unidad: 'm3' });
    expect(evaluar('1005', p).aislamiento.celdas[0].valorDecimal).toBe('30');
    p.cantidad = dato({ valorDecimal: '208', unidad: 'kg' });
    expect(evaluar('1005', p).aislamiento.estado).toBe('INDETERMINADO');
  });
  it('ONU1613: menos del5% sin verde y máximo20% verde no se intercambian', () => {
    expect(evaluar('1613', parametros(), 'menos del 5%').tabla1.estado).toBe('NO_APLICABLE');
    expect(evaluar('1613', parametros(), 'máximo del 20%').tabla1.estado).toBe('APLICABLE');
  });
  it('ONU3171 conserva guías por batería; nunca se elige la primera por ONU', () => {
    expect(evaluar('3171', parametros(), 'ión litio').guias[0].numero).toBe('147');
    expect(evaluar('3171', parametros(), 'metal litio').guias[0].numero).toBe('138');
    expect(evaluar('3171', parametros(), 'electrolito líquido').guias[0].numero).toBe('154');
  });
  it('ONU1689 seco: Tablas1/2 no aplican; en agua conserva gas informativo', () => {
    expect(evaluar('1689').tabla1.estado).toBe('NO_APLICABLE');
    const p = parametros(); p.contactoAgua = dato('AGUA');
    const r = evaluar('1689', p);
    expect(r.tabla2.estado).toBe('APLICABLE');
    expect(r.entradas[0].identificador).toBe('1689');
    expect(r.proteccion.celdas[0].valorDecimal).toBe('0.1');
    expect(r.tabla2.celdas[0].textoOriginal).toContain('HCN');
  });
  it('PDF305 / impresa303: agua/tierra desconocido elige1.7km de protección, no máximo automático de aislamiento', () => {
    const p = grande(); p.periodo = dato('NOCHE'); p.contactoAgua = dato(null);
    const r = evaluar('1754', p);
    expect(r.proteccion.celdas[0].valorDecimal).toBe('1.7');
    expect(r.aislamiento.estado).toBe('INDETERMINADO');
    p.contactoAgua = dato('TIERRA');
    expect(evaluar('1754', p).proteccion.celdas[0].valorDecimal).toBe('0.3');
  });
  it('cantidad/periodo desconocidos conservan faltantes; no son0 ni día', () => {
    const p = parametros(); p.cantidad = dato(null);
    expect(evaluar('1005', p).proteccion.faltantes).toContain('cantidadVolumen');
    p.cantidad = dato({ valorDecimal: '208', unidad: 'L' }); p.periodo = dato(null);
    expect(evaluar('1005', p).proteccion.faltantes).toContain('periodo');
    expect(evaluar('1005', p).aislamiento.estado).toBe('APLICABLE');
  });
  it('incendio conserva guía y protección residual, sin asignar aislamiento de derrame al incendio', () => {
    const p = parametros(); p.incendio = dato(true);
    const r = evaluar('1005', p);
    expect(r.aislamiento.estado).toBe('INDETERMINADO');
    expect(r.proteccion.celdas[0].valorDecimal).toBe('0.1');
    expect(r.avisos.some(a => a.codigo === 'INCENDIO_Y_RESIDUAL')).toBe(true);
    p.incendio = dato(null); expect(evaluar('1005', p).aislamiento.faltantes).toContain('incendio');
  });
  it('desconocido ofrece111; varios materiales no se evalúan como mezcla', () => {
    expect(motor.evaluar([], parametros(), catalogo).guias.map(g => g.numero)).toEqual(['111']);
    const r = motor.evaluar([entrada('1005').id, entrada('1017').id], parametros(), catalogo);
    expect(r.proteccion.estado).toBe('INDETERMINADO');
  });
  it('otra fuente/entrada ajena y duplicación no pasan como correspondencia', () => {
    const c = structuredClone(catalogo); c.documento.sha256 = 'f'.repeat(64);
    expect(evaluar('1005', parametros(), '', c).tabla1.estado).toBe('DATOS_NO_DISPONIBLES');
    expect(() => motor.evaluar(['ffffffff-ffff-4fff-8fff-ffffffffffff'], parametros(), catalogo)).toThrow('no pertenece');
    expect(() => motor.evaluar([entrada('1005').id, entrada('1005').id], parametros(), catalogo)).toThrow('distintas');
  });
  it('PDF341 / impresa339: límites10 y20km/h son moderados;20.000000001 es fuerte', () => {
    const p = t3();
    expect(evaluar('1005', p).aislamiento.celdas[0].valorDecimal).toBe('300');
    expect(evaluar('1005', p).proteccion.celdas[0].valorDecimal).toBe('1.5');
    p.viento.valor!.velocidadDecimal = '20';
    expect(evaluar('1005', p).proteccion.celdas[0].valorDecimal).toBe('1.5');
    p.viento.valor!.velocidadDecimal = '20.000000001';
    expect(evaluar('1005', p).proteccion.celdas[0].valorDecimal).toBe('1.1');
  });
  it('mph conserva umbrales publicados y m/s identifica conversión SIGBO', () => {
    const p = t3(); p.viento.valor!.unidad = 'mph'; p.viento.valor!.velocidadDecimal = '6';
    expect(evaluar('1005', p).proteccion.celdas[0].valorDecimal).toBe('1.5');
    p.viento.valor!.velocidadDecimal = '12.0000001';
    expect(evaluar('1005', p).proteccion.celdas[0].valorDecimal).toBe('1.1');
    p.viento.valor!.unidad = 'm/s'; p.viento.valor!.velocidadDecimal = '5';
    expect(evaluar('1005', p).avisos.some(a => a.codigo === 'CONVERSION_VIENTO_SIGBO')).toBe(true);
  });
  it('Tabla3 requiere capacidad y número separados del volumen liberado', () => {
    const p = t3(); delete p.cantidadContenedor;
    expect(evaluar('1005', p).tabla3.faltantes).toContain('cantidadContenedor');
    p.cantidadContenedor = dato({ valorDecimal: '79000', unidad: 'kg' });
    expect(evaluar('1005', p).tabla3.estado).toBe('INDETERMINADO');
  });
  it('no extrapola tanque agrícola de amoniaco a cloro', () => {
    const p = t3(); p.contenedor = dato('Tanque de agricultura'); p.cantidadContenedor = dato({ valorDecimal: '3785', unidad: 'L' });
    expect(evaluar('1017', p).tabla3.estado).toBe('INDETERMINADO');
    expect(evaluar('1005', p).aislamiento.celdas[0].valorDecimal).toBe('60');
  });
  it('un cilindro pequeño no cumple fila de múltiples y no infiere volumen derramado', () => {
    const p = t3(); p.contenedor = dato('Múltiples cilindros pequeños'); p.cantidadContenedor = dato({ valorDecimal: '72', unidad: 'L' });
    p.numeroContenedores = dato(1); expect(evaluar('1005', p).tabla3.estado).toBe('INDETERMINADO');
    p.numeroContenedores = dato(2); expect(evaluar('1005', p).tabla3.estado).toBe('INDETERMINADO');
    p.numeroContenedores = dato(10); expect(evaluar('1005', p).aislamiento.celdas[0].valorDecimal).toBe('30');
    p.cantidad = dato(null); expect(evaluar('1005', p).aislamiento.estado).toBe('INDETERMINADO');
  });
  it('cloro noche con viento leve conserva11.0+ sin convertirlo en máximo', () => {
    const p = t3(); p.periodo = dato('NOCHE'); p.viento.valor!.velocidadDecimal = '5';
    const c = evaluar('1017', p).proteccion.celdas[0];
    expect(c.valorDecimal).toBe('11.0'); expect(c.modificador).toBe('+');
  });
  it('conserva P y no duplica automáticamente distancias por advertencias', () => {
    const r = evaluar('1092');
    expect(r.avisos.some(a => a.codigo === 'POLIMERIZACION_CONDICIONAL')).toBe(true);
    expect(r.proteccion.celdas[0].valorDecimal).toBe('1.3');
    expect(r.reglas.find(r => r.codigo === 'R28')?.ejecutable).toBe(false);
  });
  it('rechaza desconocido con valor, booleano textual, claves extra y contradicción de incendio', () => {
    const p = parametros(); p.incendio.certeza = 'DESCONOCIDO'; expect(() => validarParametrosMatpel(p)).toThrow('incendio');
    p.incendio = dato('false') as any; expect(() => validarParametrosMatpel(p)).toThrow('incendio');
    p.incendio = dato(false); (p.cantidad.valor as any).densidadInventada = '1'; expect(() => validarParametrosMatpel(p)).toThrow('cantidad');
    const otro = parametros(); otro.eventos = dato(['INCENDIO']); expect(() => validarParametrosMatpel(otro)).toThrow('contradictorios');
  });
  it('comparación exacta y normalización conservan ceros y guiones químicos', () => {
    expect(compararDecimal('208.000000000000001', '208')).toBe(1);
    expect(compararDecimal('0.208', '208', 1000n)).toBe(0);
    expect(normalizarMatpel('1,2-Dicloroetano')).toBe('1,2-DICLOROETANO');
    expect(normalizarMatpel('(BAE-\nII)')).toBe('(BAE-II)');
  });
  it('PDF244 / impresa242: excluir Tabla1 no excluye distancias de guía154 ni asigna un número sin escenario', () => {
    const r = evaluar('1613', parametros(), 'menos del 5%');
    expect(r.tabla1.estado).toBe('NO_APLICABLE');
    expect(r.aislamiento.estado).toBe('DATOS_NO_DISPONIBLES');
    expect(r.aislamiento.fuenteResultado).toBe('GUIA_NARANJA');
    expect(r.aislamiento.celdas).toHaveLength(0);
    expect(r.guiasLectura[0].distancias[0].textoOriginal).toContain('50 metros (150 pies) para líquidos');
    expect(r.guiasLectura[0].distancias[0].textoOriginal).toContain('25 metros (75 pies) para sólidos');
    expect(r.guiasLectura[0].estadoImplementacion).toBe('LECTURA_COMPLETA_SIN_SELECCION_AUTOMATICA');
  });
  it('ONU1689 seco remite a guía sin declarar inaplicables todas las distancias', () => {
    const r = evaluar('1689');
    expect(r.tabla1.estado).toBe('NO_APLICABLE');
    expect(r.proteccion.estado).toBe('DATOS_NO_DISPONIBLES');
    expect(r.proteccion.fuenteResultado).toBe('GUIA_NARANJA');
  });
  it('solicita datos por dependencia; viento/recipiente no bloquean una consulta pequeña', () => {
    const p = parametros(); p.cantidad = dato(null); p.incendio = dato(null); p.periodo = dato(null);
    expect(evaluar('1005', p).solicitudes.map(s => s.campo)).toEqual(['incendio', 'cantidad']);
    p.cantidad = dato({ valorDecimal: '208', unidad: 'L' });
    expect(evaluar('1005', p).solicitudes.map(s => s.campo)).toEqual(['incendio', 'periodo']);
    p.cantidad.valor!.valorDecimal = '500';
    expect(evaluar('1005', p).solicitudes.map(s => s.campo)).toContain('contenedor');
    expect(evaluar('1005', p).solicitudes.some(s => s.campo === 'viento')).toBe(false);
  });
  it('cantidades de referencia preparadas pierden aplicabilidad si falta la fuente en el catálogo', () => {
    expect(perfilMatpel(catalogo).cantidadesTabla3).toHaveLength(5);
    const c = structuredClone(catalogo); c.referencias = c.referencias.filter(r => r.paginaPdf !== 340);
    expect(perfilMatpel(c).cantidadesTabla3).toHaveLength(0);
    expect(evaluar('1005', t3(), '', c).tabla3.estado).toBe('INDETERMINADO');
  });
  it('conserva calidad de identificación y ámbito; sus cambios forman parte de la evaluación histórica', () => {
    const id = entrada('1005').id;
    const i = { entradaId: id, certeza: 'NO_CONFIRMADO' as const, metodo: 'PLACA' as const, observacionOriginal: '1005', observadoEn: null, evidenciaId: null };
    const a = motor.evaluar([id], parametros(), catalogo, { identificaciones: [i], ambito: 'INSTALACION_FIJA' });
    expect(a.identificaciones[0].certeza).toBe('NO_CONFIRMADO');
    expect(a.avisos.some(x => x.codigo === 'IDENTIFICACION_PROVISIONAL')).toBe(true);
    expect(a.avisos.some(x => x.codigo === 'AMBITO_GRE')).toBe(true);
    const b = motor.evaluar([id], parametros(), catalogo, { identificaciones: [{ ...i, certeza: 'CONFIRMADO' }], ambito: 'INSTALACION_FIJA' });
    expect(a.inputsHash).not.toBe(b.inputsHash);
    expect(a.sha256Contenido).toMatch(/^[a-f0-9]{64}$/);
    expect(a.sha256Interpretacion).toMatch(/^[a-f0-9]{64}$/);
    expect(a.traza.some(x => x.paso === 'TAMANO_DERRAME')).toBe(true);
    expect(() => validarContextoConsultaMatpel([id], { identificaciones: [{ ...i, entradaId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' }] })).toThrow('Identificación');
  });
});
