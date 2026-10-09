import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { DataSource } from 'typeorm';
import { mismoId } from './gre-artefacto';

const LIMITE_DETALLE = 300;
const CARGADAS = ['REQUIERE_REVISION', 'VALIDADA', 'VALIDANDO'];

interface Diferencias<T> { altas: T[]; bajas: T[]; cambios: { clave: string; antes: unknown; despues: unknown }[]; totales: { altas: number; bajas: number; cambios: number } }

// La procedencia tiene ids distintos en cada carga; las condiciones y notas sí
// son contenido que puede cambiar la selección de una distancia.
function estructuraComparable(v: any): any {
  if (Array.isArray(v)) return v.map(estructuraComparable);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort()
    .filter((k) => !['fuentes', 'filaArtefacto', 'grupo', 'grupoFilas', 'materialId'].includes(k))
    .map((k) => [k, estructuraComparable(v[k])]));
  return v;
}

function comparar<T>(antes: Map<string, T>, despues: Map<string, T>, igual: (a: T, b: T) => boolean): Diferencias<T> {
  const altas = [...despues.keys()].filter((k) => !antes.has(k));
  const bajas = [...antes.keys()].filter((k) => !despues.has(k));
  const cambios = [...despues.keys()].filter((k) => antes.has(k) && !igual(antes.get(k)!, despues.get(k)!));
  return { altas: altas.slice(0, LIMITE_DETALLE).map((k) => despues.get(k)!), bajas: bajas.slice(0, LIMITE_DETALLE).map((k) => antes.get(k)!),
    cambios: cambios.slice(0, LIMITE_DETALLE).map((k) => ({ clave: k, antes: antes.get(k), despues: despues.get(k) })),
    totales: { altas: altas.length, bajas: bajas.length, cambios: cambios.length } };
}

/** Diferencias entre dos versiones cargadas: entradas, guías, filas/celdas y reglas.
 * Las claves son de contenido (identificador + nombre, número de guía, tabla + fila);
 * nunca ids internos, que cambian en cada importación. */
@Injectable()
export class GreComparacionService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async comparar(anteriorId: string, candidataId: string) {
    if (mismoId(anteriorId, candidataId)) throw new BadRequestException('Elegí dos versiones distintas.');
    const versiones: { id: string; estado: string }[] = await this.ds.query(
      `SELECT id, estado FROM matpel.gre_versiones WHERE id IN (@0, @1)`, [anteriorId, candidataId]);
    if (versiones.length !== 2) throw new NotFoundException('Alguna de las versiones no existe.');
    if (versiones.some((v) => !CARGADAS.includes(v.estado))) throw new BadRequestException('Ambas versiones deben tener contenido cargado.');
    const [a, b] = await Promise.all([this.contenido(anteriorId), this.contenido(candidataId)]);
    const json = (x: unknown) => JSON.stringify(x);
    return {
      versionAnteriorId: anteriorId, versionCandidataId: candidataId,
      entradas: comparar(a.entradas, b.entradas, (x, y) => json(x) === json(y)),
      guias: comparar(a.guias, b.guias, (x, y) => json(x) === json(y)),
      tablas: comparar(a.tablas, b.tablas, (x, y) => json(x) === json(y)),
      filas: comparar(a.filas, b.filas, (x, y) => json(x) === json(y)),
      reglas: comparar(a.reglas, b.reglas, (x, y) => json(x) === json(y)),
    };
  }

  private async contenido(versionId: string) {
    const entradas: any[] = await this.ds.query(`SELECT e.identificador, e.nombre_normalizado, e.nombre_original, g.numero AS guia,
      e.polimerizable, e.resaltado_verde FROM matpel.gre_entradas e LEFT JOIN matpel.gre_guias g ON g.id = e.guia_id
      WHERE e.version_id = @0`, [versionId]);
    const guias: any[] = await this.ds.query(`SELECT g.numero, g.titulo_original, g.estado_contenido,
      (SELECT STRING_AGG(CAST(b.texto_original AS NVARCHAR(MAX)), NCHAR(10)) WITHIN GROUP (ORDER BY b.orden)
        FROM matpel.gre_bloques b WHERE b.guia_id = g.id) AS texto
      FROM matpel.gre_guias g WHERE g.version_id = @0`, [versionId]);
    const filas: any[] = await this.ds.query(`SELECT t.codigo, f.etiqueta_original, f.condiciones_json,
      (SELECT c.columna_codigo, c.texto_original, c.valor_decimal, c.unidad_original, c.modificador, c.estado_dato, c.condiciones_json
        FROM matpel.gre_celdas c WHERE c.fila_id = f.id ORDER BY c.orden FOR JSON PATH) AS celdas
      FROM matpel.gre_filas f JOIN matpel.gre_tablas t ON t.id = f.tabla_id WHERE f.version_id = @0
      ORDER BY t.codigo, f.orden`, [versionId]);
    const tablas: any[] = await this.ds.query(`SELECT codigo, titulo_original, estructura_json
      FROM matpel.gre_tablas WHERE version_id = @0`, [versionId]);
    const reglas: any[] = await this.ds.query(`SELECT codigo, tipo_uso, texto_original, parametros_json, ejecutable, version_interpretacion
      FROM matpel.gre_reglas WHERE version_id = @0`, [versionId]);
    const hash = (s: string | null) => createHash('sha256').update(s ?? '').digest('hex');
    const repetidas = new Map<string, number>();
    return {
      entradas: new Map(entradas.map((e) => [`${e.identificador ?? '—'}|${e.nombre_normalizado}`, {
        identificador: e.identificador, nombre: e.nombre_original, guia: e.guia, polimerizable: !!e.polimerizable,
        resaltadoVerde: e.resaltado_verde === null ? null : !!e.resaltado_verde }])),
      guias: new Map(guias.map((g) => [g.numero, { numero: g.numero, titulo: g.titulo_original, estado: g.estado_contenido,
        textoSha256: hash(g.texto) }])),
      tablas: new Map(tablas.map((t) => [t.codigo, { codigo: t.codigo, titulo: t.titulo_original,
        estructura: estructuraComparable(JSON.parse(t.estructura_json ?? '{}')) }])),
      filas: new Map(filas.map((f) => {
        const c = JSON.parse(f.condiciones_json ?? '{}');
        const base = [f.codigo, c.identificador ?? (c.identificadores ?? []).join('+'), c.nombreNormalizado ?? c.contenedorNormalizado].join('|');
        // Una fila repetida con la misma clave de contenido no se pierde: se numera.
        repetidas.set(base, (repetidas.get(base) ?? 0) + 1);
        return [`${base}#${repetidas.get(base)}`, { tabla: f.codigo, etiqueta: f.etiqueta_original,
          condiciones: estructuraComparable(c), celdas: JSON.parse(f.celdas ?? '[]') }];
      })),
      reglas: new Map(reglas.map((r) => [r.codigo, { codigo: r.codigo, tipoUso: r.tipo_uso, ejecutable: !!r.ejecutable,
        parametros: r.parametros_json ? estructuraComparable(JSON.parse(r.parametros_json)) : null,
        versionInterpretacion: r.version_interpretacion, textoSha256: hash(r.texto_original) }])),
    };
  }
}
