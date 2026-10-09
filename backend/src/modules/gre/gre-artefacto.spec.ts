import { ArtefactoInvalidoError, mismoId, validarArtefacto } from './gre-artefacto';
import { planDeCarga } from './gre-carga';

const SHA = 'a'.repeat(64);

/** Artefacto mínimo con la forma del contrato: estructura de prueba, no datos de la GRE. */
function artefacto(): any {
  const ref = (id: string, paginaPdf = 1) => ({ id, documentoSha256: SHA, paginaPdf, etiquetaPdf: '1',
    cajaPt: [1, 1, 10, 10], textoOriginal: id, metodo: 'NATIVO', estadoRevision: 'PENDIENTE' });
  const entrada = (indice: string, id: string, r: string) => ({ id, indice, paginaPdf: 1, identificador: '0001',
    identificadorOriginal: '0001', tipoIdentificador: 'ID_GRE', nombreOriginal: 'Nombre', nombreNormalizado: 'NOMBRE',
    guiaNumero: '111', guiaOriginal: '111P', polimerizable: true, resaltadoVerde: true, fuentes: { nombre: [r] } });
  return {
    tipo: 'gre_catalogo_candidato', schemaVersion: 1, versionParser: 'p', versionNormalizador: 'n',
    herramienta: { nombre: 'x', version: '1' }, sistemaCoordenadas: 'PYMUPDF_SIN_ROTAR_PT',
    estadoCatalogo: 'NO_IMPORTADA', aptoActivacion: false,
    documento: { sha256: SHA, bytes: 10, paginas: 2, edicion: '2024', idioma: 'es', titulo: 't', identificacion: {} },
    paginas: [1, 2].map((n) => ({ paginaPdf: n, etiquetaPdf: String(n), etiquetasImpresas: [], anchoPt: 100, altoPt: 100,
      rotacion: 0, sha256TextoNativo: 'b'.repeat(64), caracteresTexto: 1, requiereRevisionNumeracion: false })),
    secciones: [{ id: 's1', tituloOriginal: 'S', pdfDesde: 1, pdfHasta: 2, tratamiento: 't' }],
    entradas: [entrada('AMARILLO', 'am', 'r1'), entrada('AZUL', 'az', 'r2')],
    relacionesIndices: [{ id: 'entrada-00001', identificador: '0001', nombreNormalizado: 'NOMBRE', amarilloIds: ['am'],
      azulIds: ['az'], estado: 'CONCILIADA', guiaNumero: '111', polimerizable: true, resaltadoVerde: true }],
    guias: [{ numero: '111', tituloOriginal: 'G', estadoContenido: 'CON_CONTENIDO', paginasPdf: [2],
      fuentes: { numero: ['r3'] }, bloques: [
        { id: 'b2', orden: 2, nivel: 2, padreId: 'b1', encabezadoOriginal: 'H2', lineas: ['x'], fuentes: ['r4'], textoOriginal: 'x' },
        { id: 'b1', orden: 1, nivel: 1, padreId: null, encabezadoOriginal: 'H1', lineas: ['y'], fuentes: ['r3'], textoOriginal: 'y' }] }],
    tablas: [{ codigo: 'TABLA_1', seccionId: 's1', tituloOriginal: 'T', estructura: { columnas: [] }, fuentes: ['r5'], notas: [],
      filas: [{ id: 'f1', orden: 1, paginaPdf: 2, grupo: 'g', entradaId: 'entrada-00001', identificador: '0001',
        nombreOriginal: 'Nombre', nombreNormalizado: 'NOMBRE', condiciones: { derrameEn: null },
        fuentes: { nombre: ['r5'], grupo: ['r6'] },
        celdas: [{ columna: 'C', orden: 0, textoOriginal: '30 m', valorDecimal: '30', unidad: 'm', modificador: null,
          estadoDato: 'DATO', condiciones: null, fuentes: ['r6'] }] }] }],
    textos: [], reglas: [{ codigo: 'R16', tipoUso: 'SELECCION', ejecutable: true, versionInterpretacion: 'motor-1',
      paginaPdf: 1, textoOriginal: 'x', extractoNormalizado: 'X', parametros: { pequenoHastaLitros: '208' }, fuentes: ['r1'] }],
    referencias: [ref('r1'), ref('r2'), ref('r3', 2), ref('r4', 2), ref('r5', 2), ref('r6', 2)],
    hallazgos: [], resumen: {}, pendientes: [],
  };
}

describe('Artefacto GRE: contrato validado antes de persistir', () => {
  it('acepta un artefacto completo y coherente', () => {
    expect(() => validarArtefacto(artefacto(), SHA)).not.toThrow();
  });

  it('rechaza otra fuente, estados impropios y procedencia faltante', () => {
    const casos: [string, (a: any) => void][] = [
      ['otro documento', (a) => { a.documento.sha256 = 'c'.repeat(64); }],
      ['se declara apto', (a) => { a.aptoActivacion = true; }],
      ['referencia inexistente', (a) => { a.tablas[0].filas[0].celdas[0].fuentes = ['zz']; }],
      ['caja fuera de página', (a) => { a.referencias[0].cajaPt = [1, 1, 500, 10]; }],
      ['valor no decimal', (a) => { a.tablas[0].filas[0].celdas[0].valorDecimal = '30 m'; }],
      ['vacío con valor', (a) => { a.tablas[0].filas[0].celdas[0].estadoDato = 'VACIO_EXPLICITO'; }],
      ['regla ejecutable de advertencia', (a) => { a.reglas[0].tipoUso = 'ADVERTENCIA'; }],
      ['nombre excede el modelo', (a) => { a.entradas[0].nombreOriginal = 'x'.repeat(1001); }],
    ];
    for (const [caso, alterar] of casos) {
      const a = artefacto();
      alterar(a);
      expect(() => validarArtefacto(a, SHA)).toThrow(ArtefactoInvalidoError);
    }
  });

  it('el plan vincula cada campo a su fuente y respeta el orden padre-hijo', () => {
    let n = 0;
    const plan = planDeCarga(validarArtefacto(artefacto(), SHA), 'v', () => `id-${++n}`);
    expect(plan.entradas).toHaveLength(1);
    expect(plan.entradas[0]).toMatchObject({ identificador: '0001', polimerizable: true, resaltadoVerde: true });
    // Fuente de ambos índices para la misma entrada.
    expect(plan.camposFuente.filter((c) => c.entradaId).map((c) => c.campo).sort()).toEqual(['amarillo.nombre', 'azul.nombre']);
    const [padre, hijo] = plan.bloques;
    expect(padre.encabezadoOriginal).toBe('H1');
    expect(hijo.padreId).toBe(padre.id);
    expect(plan.filas[0].entradaId).toBe(plan.entradas[0].id);
    expect(plan.celdas[0]).toMatchObject({ valorDecimal: '30', unidadOriginal: 'm', estadoDato: 'DATO' });
    expect(JSON.parse(plan.reglas[0].parametrosJson!)).toEqual({ pequenoHastaLitros: '208' });
    const ids = new Set(plan.referencias.map((r) => r.id));
    expect(plan.camposFuente.every((c) => ids.has(c.referenciaId!))).toBe(true);
  });

  it('compara identificadores sin distinguir mayúsculas', () => {
    expect(mismoId('ABC-1', 'abc-1')).toBe(true);
    expect(mismoId(null, 'x')).toBe(false);
  });
});
