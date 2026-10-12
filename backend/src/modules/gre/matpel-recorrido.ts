import { CatalogoMatpel, ParametrosMatpel } from './matpel-modelo';
import { perfilMatpel } from './matpel-perfil';

type Apartado = { faltantes: string[]; estado: string };
export function solicitudesMatpel(c: CatalogoMatpel, entradaIds: string[], p: ParametrosMatpel,
  r: { aislamiento: Apartado; proteccion: Apartado; tabla1: Apartado; tabla3: Apartado }) {
  const perfil = perfilMatpel(c);
  const e = entradaIds.length === 1 ? perfil.entradasPorId.get(entradaIds[0].toLowerCase()) : null;
  if (!e || !perfil.compatible) return [];
  const campos = new Map<string, { campo: string; etiqueta: string; motivo: string; referenciaIds: string[] }>();
  const agregar = (campo: string, etiqueta: string, motivo: string, regla: string) => {
    const ref = perfil.reglasPorCodigo.get(regla)?.referenciaId;
    campos.set(campo, { campo, etiqueta, motivo, referenciaIds: ref ? [ref] : [] });
  };
  if (p.incendio.valor === null) agregar('incendio', 'Incendio presente', 'Determina la consulta de distancias de incendio en la guía.', 'R14');
  const faltantes = [...new Set([r.aislamiento, r.proteccion, r.tabla1, r.tabla3].flatMap(x => x.faltantes))];
  const nombres: Record<string, [string, string, string]> = {
    cantidadVolumen: ['cantidad', 'Cantidad liberada en volumen', 'R16'],
    periodo: ['periodo', 'Periodo observado', 'R17'],
    contenedor: ['contenedor', 'Tipo de recipiente publicado', 'R23'],
    contenedorEspecifico: ['contenedor', 'Tipo de recipiente publicado', 'R23'],
    cantidadContenedor: ['cantidadContenedor', 'Cantidad de referencia por recipiente', 'R23'],
    numeroContenedores: ['numeroContenedores', 'Número de recipientes', 'R23'],
    velocidadViento: ['viento', 'Velocidad del viento', 'R24'],
    contactoAgua: ['contactoAgua', 'Medio del derrame', 'R19'],
    cantidadContenedorCompatible: ['cantidadContenedor', 'Revisar cantidad de referencia por recipiente', 'R23'],
    cantidadesCoherentes: ['cantidad', 'Revisar cantidad liberada y recipientes', 'R23'],
  };
  for (const k of faltantes) {
    const n = nombres[k]; if (n) agregar(n[0], n[1], 'Necesario para resolver la condición indicada; puede conservarse desconocido.', n[2]);
  }
  // El medio puede resolver alternativas bajo R19 sin invalidar su selección autorizada.
  if (e.resaltadoVerde && p.contactoAgua.valor === null) {
    const hayAgua = c.filas.some(f => perfil.condicionesPorFila.get(f.id.toLowerCase())?.identificador === e.identificador &&
      perfil.condicionesPorFila.get(f.id.toLowerCase())?.derrameEn === 'AGUA');
    if (hayAgua) agregar('contactoAgua', 'Medio del derrame', 'Conservar alternativas agua/tierra mientras se desconozca.', 'R19');
  }
  return [...campos.values()];
}
