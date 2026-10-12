import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import { planDeCarga } from './gre-carga';
import { CatalogoMatpel } from './matpel-modelo';
import { archivoPaqueteMatpel, paqueteMatpel, partesPaqueteMatpel } from './matpel-paquete';

const root = resolve(__dirname, '../../../..');
const a = JSON.parse(readFileSync(resolve(root, '.context/gre2024/test-cases/motor-fuente.json'), 'utf8')).artefactoRecortado;
let n = 1;
const versionGreId = '00000000-0000-4000-8000-000000000001';
const c = { ...planDeCarga(a, versionGreId, () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`), versionGreId, documento: a.documento } as CatalogoMatpel;
const pdf = readFileSync(resolve(root, 'docs/Manuales/GRE2024-Spa-Web-a.pdf'));
const hash = (b: string | Buffer) => createHash('sha256').update(b).digest('hex');

describe('Paquete documental GRE: fuente real, sin incidentes ni publicación', () => {
  it('entrega partes verificables sin cambiar fuente, interpretación manual ni bytes del catálogo anterior', () => {
    const v1 = paqueteMatpel(c, pdf); const v2 = partesPaqueteMatpel(c, pdf);
    expect(v2.catalogo.toString('utf8')).toBe(v1.catalogoJson);
    expect(v2.pdf.equals(pdf)).toBe(true);
    expect(v2.manifest.versionPaquete).toBe(2);
    expect(v2.manifest.interpretacionSha256).toBe(hash(v2.interpretacion));
    expect(v2.manifest.interpretacionBytes).toBe(v2.interpretacion.length);
    const definiciones = JSON.parse(v2.interpretacion.toString('utf8'));
    expect(definiciones.cantidadesTabla3).toHaveLength(5);
    expect(definiciones.reglasDocumentales).toHaveLength(54);
    expect(definiciones.validacionOperacional).toBe('PENDIENTE');
    expect(v2.manifest.motorDisponibleOffline).toBe(false);
    expect(v2.catalogo.length + v2.pdf.length + v2.interpretacion.length).toBeLessThan(Buffer.byteLength(JSON.stringify(v1)));
  });
  it('incluye los bytes originales, trazabilidad y hashes verificables; no promete motor desconectado', () => {
    const p = paqueteMatpel(c, pdf);
    const incluido = Buffer.from(p.pdfBase64, 'base64');
    expect(incluido.length).toBe(pdf.length);
    expect(hash(incluido)).toBe(hash(pdf));
    expect(p.manifest.documentoSha256).toBe(hash(pdf));
    expect(p.manifest.catalogoSha256).toBe(hash(p.catalogoJson));
    expect(p.manifest.catalogoBytes).toBe(Buffer.byteLength(p.catalogoJson));
    expect(p.manifest.motorDisponibleOffline).toBe(false);
    const contenido = JSON.parse(p.catalogoJson);
    expect(contenido.paginas).toHaveLength(392);
    expect(contenido.secciones).toHaveLength(42);
    expect(contenido.referencias).toHaveLength(c.referencias.length);
  });
  it('exporta una lista explícita de campos; excluye actores, rutas privadas y campos ajenos a la GRE', () => {
    const copia = { ...c, incidenteId: 'NO_EXPORTAR_INCIDENTE', documento: { ...c.documento, referenciaPrivada: 'NO_EXPORTAR_RUTA', incorporadaPor: 'NO_EXPORTAR_ACTOR' }, entradas: c.entradas.map(e => ({ ...e, datoPersonal: 'NO_EXPORTAR_PERSONA' })) };
    const p = paqueteMatpel(copia, pdf);
    expect(JSON.stringify(p)).not.toContain('NO_EXPORTAR');
    expect(JSON.parse(p.catalogoJson).entradas[0].nombreOriginal).toBe(c.entradas[0].nombreOriginal);
  });
  it('no entrega PDF alterado, aunque conserve una cabecera PDF', () => {
    const alterado = Buffer.from(pdf); alterado[alterado.length - 10] ^= 1;
    expect(() => paqueteMatpel(c, alterado)).toThrow('no corresponden');
    expect(() => paqueteMatpel(c, Buffer.from('texto'))).toThrow('no corresponden');
  });
  it('el contenido literal no puede cerrar el contenedor JSON ni introducir scripts HTML', () => {
    const literal = '</script><script>window.datoInyectado=1</script>';
    const copia = { ...c, entradas: [{ ...c.entradas[0], nombreOriginal: literal }] };
    const p = paqueteMatpel(copia, pdf);
    const html = archivoPaqueteMatpel(p);
    expect(html).not.toContain(literal);
    const datos = /<script type="application\/json" id="datos">([\s\S]*?)<\/script>/.exec(html)!;
    expect(JSON.parse(JSON.parse(datos[1]).catalogoJson).entradas[0].nombreOriginal).toBe(literal);
    expect((html.match(/<script>/g) || [])).toHaveLength(1);
    expect(html).not.toMatch(/<script[^>]+src=/);
  });
});
