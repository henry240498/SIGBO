import { readFileSync } from 'fs';
import { resolve } from 'path';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { createContext, runInContext } from 'vm';
import { planDeCarga } from './gre-carga';
import { MotorMatpelService } from './motor-matpel.service';
import { geometriaMatpel } from './matpel-geometria';
import { partesPaqueteMatpel } from './matpel-paquete';

const root = resolve(__dirname, '../../../..');
const a = JSON.parse(readFileSync(resolve(root, '.context/gre2024/test-cases/motor-fuente.json'), 'utf8')).artefactoRecortado;
const versionGreId = '00000000-0000-4000-8000-000000000001';
let n = 1;
const c: any = { ...planDeCarga(a, versionGreId, () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`), versionGreId, documento: a.documento };
const p = partesPaqueteMatpel(c, readFileSync(resolve(root, 'docs/Manuales/GRE2024-Spa-Web-a.pdf')));
const paquete = { manifest: p.manifest, contenido: JSON.parse(p.catalogo.toString()), interpretacion: JSON.parse(p.interpretacion.toString()) };
function local() {
  const ctx = createContext({ SigboCrypto: { sha256: (s: string) => createHash('sha256').update(s).digest('hex') } });
  runInContext(readFileSync(resolve(root, '.movile/assets/gre/motor.js'), 'utf8'), ctx, { timeout: 10000 });
  const motor = (ctx as any).SigboMotor;
  motor.inicializar(JSON.parse(JSON.stringify(paquete)));
  return { motor, ctx };
}
const dato = (valor: any) => ({ valor, certeza: valor === null ? 'DESCONOCIDO' : 'CONFIRMADO', origen: 'OPERADOR', observadoEn: null, evidenciaId: null, fuenteDatoId: null });
const params = () => ({ eventos: dato(['DERRAME']), incendio: dato(false), cantidad: dato({ valorDecimal: '208', unidad: 'L' }),
  contactoAgua: dato('TIERRA'), periodo: dato('DIA'), contenedor: dato(null), viento: dato(null), ubicacion: dato(null) });

describe('Motor Android generado desde las fuentes del servidor; sin SQL ni red', () => {
  it('el bundle y manifiesto corresponden a las fuentes actuales', () => {
    expect(() => execFileSync(process.execPath, ['scripts/matpel/compilar_motor_local.cjs', '--check'], { cwd: root })).not.toThrow();
  });
  it('paridad de distancias, condiciones, geometría, solicitudes y hashes en toda la matriz literal', () => {
    const { motor } = local();
    const server = new MotorMatpelService();
    const casos: any[] = [params()];
    for (const valor of ['0','208','208.000000000000001','500']) for (const periodo of ['DIA','NOCHE']) {
      const x = params(); x.cantidad = dato({ valorDecimal: valor, unidad: 'L' }); x.periodo = dato(periodo); casos.push(x);
    }
    for (const medio of ['AGUA','AMBOS',null]) { const x = params(); x.contactoAgua = dato(medio); casos.push(x); }
    for (const incendio of [true,null]) { const x = params(); x.incendio = dato(incendio); casos.push(x); }
    for (const velocidad of ['5','10','12','20']) {
      const x = params(); x.cantidad = dato({ valorDecimal: '500', unidad: 'L' }); x.contenedor = dato('Carrotanque de ferrocarril');
      (x as any).cantidadContenedor = dato({ valorDecimal: '80000', unidad: 'kg' }); (x as any).numeroContenedores = dato(1);
      x.viento = dato({ velocidadDecimal: velocidad, unidad: 'km/h', direccionDesdeGrados: 90, proveedorId: null });
      x.ubicacion = dato({ latitud: -25.8, longitud: -57.2, precisionM: 10 }); casos.push(x);
    }
    const partes = ['aislamiento','proteccion','tabla1','tabla2','tabla3','avisos','traza','solicitudes','guiasLectura','inputsHash','sha256Interpretacion','sha256Contenido'];
    for (const entrada of c.entradas) for (const parametros of casos) {
      const body = { versionGreId, entradaIds: [entrada.id], parametros, ambito: 'TRANSPORTE_TERRESTRE',
        identificaciones: [{ entradaId: entrada.id, certeza: 'NO_CONFIRMADO', metodo: 'PLACA', observacionOriginal: entrada.identificador, observadoEn: null, evidenciaId: null }] };
      const esperado: any = server.evaluar(body.entradaIds, parametros, c,
        { ambito: body.ambito, identificaciones: body.identificaciones } as any);
      // Contexto solo permite ámbito/identificaciones, como el controlador real.
      const real = motor.evaluar(JSON.parse(JSON.stringify(body)));
      for (const k of partes) expect(JSON.parse(JSON.stringify(real[k]))).toEqual(JSON.parse(JSON.stringify(esperado[k])));
      expect(JSON.parse(JSON.stringify(real.geometria))).toEqual(geometriaMatpel(esperado, parametros as any, c));
    }
  });
  it('rechaza fuente o interpretación incompatibles y versión distinta', () => {
    const { motor } = local();
    expect(() => motor.inicializar({ ...paquete, manifest: { ...paquete.manifest, documentoSha256: '0'.repeat(64) } })).toThrow();
    expect(() => motor.inicializar({ ...paquete, interpretacion: { ...paquete.interpretacion, sha256Definiciones: '0'.repeat(64) } })).toThrow();
    expect(() => motor.evaluar({ versionGreId, entradaIds: [], parametros: params() })).toThrow();
    expect(() => motor.evaluar({ versionGreId: 'otra', entradaIds: [], parametros: params() })).toThrow();
  });
  it('datos desconocidos, contradictorios y decimales mantienen las mismas abstenciones', () => {
    const { motor } = local();
    const e = c.entradas.find((e: any) => e.identificador === '1005');
    const x = params(); x.cantidad = dato(null);
    const body = { versionGreId, entradaIds: [e.id], parametros: x };
    expect(motor.evaluar(body).aislamiento.estado).toBe('INDETERMINADO');
    x.eventos = dato(['INCENDIO']);
    expect(() => motor.evaluar(body)).toThrow(/contradictorios/);
  });
  it('el motor no dispone de filesystem, red ni ejecución de dependencias externas', () => {
    const { motor, ctx } = local();
    expect(runInContext('typeof fetch + ":" + typeof XMLHttpRequest + ":" + typeof require', ctx)).toBe('undefined:undefined:undefined');
    const result = JSON.parse(motor.dispatch(JSON.stringify({ accion: 'exec', datos: 'fetch("https://example.invalid")' })));
    expect(result.ok).toBe(false);
    expect(() => motor.evaluar({ versionGreId, entradaIds: [], parametros: params(), actor: 'inventado' })).toThrow(/Contrato/);
  });
});
