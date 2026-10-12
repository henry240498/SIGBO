import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { DataSource } from 'typeorm';
import {
  GreActivacion, GreBloque, GreCampoFuente, GreCelda, GreDocumento, GreEntrada, GreFila,
  GreGuia, GrePagina, GreReferencia, GreRegla, GreSeccion, GreTabla, GreVersion,
} from '../../shared/entities';
import { mismoId } from './gre-artefacto';
import { GreCatalogoService } from './gre-catalogo.service';
import { GreFuentesService } from './gre-fuentes.service';
import { BuscarMatpelDto } from './dto/matpel-consulta.dto';
import { CatalogoMatpel, normalizarMatpel } from './matpel-modelo';
import { archivoPaqueteMatpel, paqueteMatpel, partesPaqueteMatpel } from './matpel-paquete';
import { MotorMatpelService } from './motor-matpel.service';
import { lecturaGuiasMatpel, perfilMatpel } from './matpel-perfil';

@Injectable()
export class MatpelConsultaService {
  private readonly cache = new Map<string, CatalogoMatpel>();
  constructor(@InjectDataSource() private readonly ds: DataSource,
    private readonly catalogo: GreCatalogoService, private readonly fuentes: GreFuentesService,
    private readonly motor: MotorMatpelService = new MotorMatpelService()) {}

  async estado() {
    const [schema] = await this.ds.query("SELECT OBJECT_ID(N'matpel.gre_versiones', N'U') AS versiones, OBJECT_ID(N'matpel.gre_activaciones', N'U') AS activaciones");
    if (!schema?.versiones || !schema?.activaciones) return { versionContrato: 1, estado: 'CATALOGO_NO_INSTALADO', versionGreId: null };
    const activa = await this.ds.getRepository(GreActivacion).findOneBy({ idioma: 'es' });
    if (!activa) return { versionContrato: 1, estado: 'SIN_EDICION_ACTIVA', versionGreId: null };
    const documento = await this.catalogo.documentoDeVersionValidada(activa.versionId);
    return { versionContrato: 1, estado: 'DISPONIBLE', versionGreId: activa.versionId,
      edicion: documento.edicion, idioma: documento.idioma, documentoSha256: documento.sha256 };
  }

  async version(versionGreId?: string) {
    if (versionGreId) {
      const documento = await this.catalogo.documentoDeVersionValidada(versionGreId);
      return { versionGreId: versionGreId.toLowerCase(), documento };
    }
    const actual = await this.estado();
    if (!actual.versionGreId) throw new ServiceUnavailableException('No hay edición GRE activa disponible.');
    return { versionGreId: actual.versionGreId.toLowerCase(),
      documento: await this.catalogo.documentoDeVersionValidada(actual.versionGreId) };
  }

  async buscar(dto: BuscarMatpelDto) {
    const { versionGreId, documento } = await this.version(dto.versionGreId);
    const q = normalizarMatpel(dto.q);
    const limite = dto.limite ?? 20;
    if (!q || q.length > 120 || !Number.isInteger(limite) || limite < 1 || limite > 50) throw new BadRequestException('Consulta o límite inválido.');
    const tipo = dto.tipo ?? (/^\d{4}$/.test(q) ? 'IDENTIFICADOR' : /^\d{3}$/.test(q) ? 'GUIA' : 'NOMBRE');
    if ((tipo === 'IDENTIFICADOR' && !/^\d{4}$/.test(q)) || (tipo === 'GUIA' && !/^\d{3}$/.test(q)) ||
        (tipo === 'NOMBRE' && q.length < 2) || !['IDENTIFICADOR', 'NOMBRE', 'GUIA'].includes(tipo)) {
      throw new BadRequestException('Identificador de cuatro dígitos, guía de tres o nombre de al menos dos caracteres.');
    }
    const firma = createHash('sha256').update(JSON.stringify({ versionGreId, q, tipo })).digest('hex');
    let despues: { nombre: string; id: string } | null = null;
    if (dto.cursor) {
      try {
        const data = JSON.parse(Buffer.from(dto.cursor, 'base64url').toString('utf8'));
        if (data.firma !== firma || typeof data.nombre !== 'string' || data.nombre.length > 400 ||
          typeof data.id !== 'string' || !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(data.id)) throw new Error();
        despues = data;
      } catch { throw new BadRequestException('El cursor no corresponde a esta consulta y edición.'); }
    }
    const qb = this.ds.getRepository(GreEntrada).createQueryBuilder('e')
      .where('e.versionId = :versionGreId', { versionGreId });
    if (tipo === 'IDENTIFICADOR') qb.andWhere('e.identificador = :q', { q });
    if (tipo === 'GUIA') qb.innerJoin(GreGuia, 'g', 'g.id = e.guiaId AND g.versionId = e.versionId').andWhere('g.numero = :q', { q });
    if (tipo === 'NOMBRE') {
      const patron = `%${q.replace(/[\\%_\[]/g, '\\$&')}%`;
      qb.andWhere("e.nombreNormalizado LIKE :patron ESCAPE '\\'", { patron });
    }
    if (despues) qb.andWhere('(e.nombreNormalizado > :nombre OR (e.nombreNormalizado = :nombre AND e.id > :id))', despues);
    const filas = await qb.orderBy('e.nombreNormalizado', 'ASC').addOrderBy('e.id', 'ASC').take(limite + 1).getMany();
    const items = filas.slice(0, limite).map(e => ({ ...e, tipoCoincidencia: tipo === 'NOMBRE' && e.nombreNormalizado === q ? 'NOMBRE_EXACTO' : tipo,
      requiereSeleccionExplicita: true }));
    const ultimo = items.at(-1);
    const cursor = filas.length > limite && ultimo ? Buffer.from(JSON.stringify({ firma, nombre: ultimo.nombreNormalizado, id: ultimo.id })).toString('base64url') : null;
    const guias = tipo === 'GUIA' ? await this.ds.getRepository(GreGuia).find({ where: { versionId: versionGreId, numero: q } }) : [];
    return { versionContrato: 1, versionGreId, edicion: documento.edicion, items, guias, cursor };
  }

  /** El control de validación se repite antes de usar la caché. Una lectura nunca
   * selecciona un candidato privado ni cambia el puntero de edición activa. */
  async leer(versionId: string): Promise<CatalogoMatpel> {
    const { versionGreId, documento } = await this.version(versionId);
    const version = await this.ds.getRepository(GreVersion).findOneBy({ id: versionGreId, estado: 'VALIDADA' });
    if (!version) throw new NotFoundException('La versión GRE no está validada.');
    const clave = `${versionGreId}:${documento.sha256}:${version.sha256Contenido}`;
    const previo = this.cache.get(clave);
    if (previo) return previo;
    const [entradas, guias, bloques, tablas, filas, celdas, reglas, camposFuente, referencias, paginas, secciones] = await Promise.all([
      this.ds.getRepository(GreEntrada).find({ where: { versionId: versionGreId } }),
      this.ds.getRepository(GreGuia).find({ where: { versionId: versionGreId }, order: { numero: 'ASC' } }),
      this.ds.getRepository(GreBloque).find({ where: { versionId: versionGreId }, order: { orden: 'ASC' } }),
      this.ds.getRepository(GreTabla).find({ where: { versionId: versionGreId } }),
      this.ds.getRepository(GreFila).find({ where: { versionId: versionGreId }, order: { orden: 'ASC' } }),
      this.ds.getRepository(GreCelda).find({ where: { versionId: versionGreId }, order: { orden: 'ASC' } }),
      this.ds.getRepository(GreRegla).find({ where: { versionId: versionGreId } }),
      this.ds.getRepository(GreCampoFuente).find({ where: { versionId: versionGreId } }),
      this.ds.getRepository(GreReferencia).find({ where: { versionId: versionGreId } }),
      this.ds.getRepository(GrePagina).find({ where: { versionId: versionGreId } }),
      this.ds.getRepository(GreSeccion).find({ where: { versionId: versionGreId }, order: { orden: 'ASC' } }),
    ]);
    const result: CatalogoMatpel = { versionGreId, sha256Contenido: version.sha256Contenido ?? undefined, documento, entradas, guias, bloques, tablas, filas, celdas, reglas, camposFuente, referencias, paginas, secciones };
    if ([entradas, guias, bloques, tablas, filas, celdas, reglas, camposFuente, referencias, paginas, secciones]
      .some(xs => xs.some(x => !mismoId(x.versionId, versionGreId)))) throw new ServiceUnavailableException('La lectura GRE mezcla versiones.');
    // El perfil y las partes se indexan por identidad de esta lectura inmutable.
    for (const xs of [entradas, guias, bloques, tablas, filas, celdas, reglas, camposFuente, referencias, paginas, secciones]) {
      xs.forEach(x => Object.freeze(x)); Object.freeze(xs);
    }
    Object.freeze(documento); Object.freeze(result);
    perfilMatpel(result);
    if (this.cache.size >= 2) this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(clave, result);
    return result;
  }

  fuentesPorCampo(c: CatalogoMatpel, campoId: 'entradaId' | 'guiaId' | 'bloqueId' | 'filaId' | 'celdaId', id: string) {
    return c.camposFuente.filter(x => mismoId(x[campoId], id)).map(x => ({ campo: x.campo, referenciaId: x.referenciaId }));
  }
  async material(versionId: string, id: string) {
    const c = await this.leer(versionId); const entrada = c.entradas.find(e => mismoId(e.id, id));
    if (!entrada) throw new NotFoundException('El material no pertenece a esta versión GRE.');
    const desconocido = { valor: null, certeza: 'DESCONOCIDO' as const, origen: 'OPERADOR' as const,
      observadoEn: null, evidenciaId: null, fuenteDatoId: null };
    const parametros = Object.fromEntries(['eventos', 'incendio', 'cantidad', 'contactoAgua', 'periodo', 'contenedor', 'viento', 'ubicacion'].map(k => [k, desconocido])) as any;
    const recorrido = this.motor.evaluar([entrada.id], parametros, c);
    return { versionContrato: 1, versionGreId: c.versionGreId, edicion: c.documento.edicion, entrada,
      fuentes: this.fuentesPorCampo(c, 'entradaId', id), guia: c.guias.find(g => mismoId(g.id, entrada.guiaId)),
      solicitudes: recorrido.solicitudes, guiasLectura: recorrido.guiasLectura,
      versionInterpretacion: recorrido.versionInterpretacion,
      contenedoresTabla3: c.filas.filter(f => {
        const t = c.tablas.find(t => mismoId(t.id, f.tablaId));
        const p = JSON.parse(f.condicionesJson ?? '{}');
        return t?.codigo === 'TABLA_3' && (p.identificadores ?? []).includes(entrada.identificador);
      }).map(f => ({ id: f.id, nombre: f.etiquetaOriginal, referenciaId: f.referenciaId })) };
  }
  async guia(versionId: string, numero: string) {
    const c = await this.leer(versionId); const guia = c.guias.find(g => g.numero === numero);
    if (!guia) throw new NotFoundException('La guía no existe en esta versión.');
    return { versionContrato: 1, versionGreId: c.versionGreId, edicion: c.documento.edicion, guia,
      lectura: lecturaGuiasMatpel(c, [guia.id])[0],
      fuentes: this.fuentesPorCampo(c, 'guiaId', guia.id), bloques: c.bloques.filter(b => mismoId(b.guiaId, guia.id))
        .map(b => ({ ...b, fuentes: this.fuentesPorCampo(c, 'bloqueId', b.id) })) };
  }
  async secciones(versionId: string, id?: string) {
    const c = await this.leer(versionId);
    const secciones = id ? c.secciones.filter(s => mismoId(s.id, id)) : c.secciones;
    if (id && !secciones.length) throw new NotFoundException('La sección no existe en esta versión.');
    return { versionContrato: 1, versionGreId: c.versionGreId, secciones,
      bloques: id ? c.bloques.filter(b => mismoId(b.seccionId, id) && !b.guiaId) : [] };
  }
  async tabla(versionId: string, codigo: string, pagina: number, limite: number, identificador?: string) {
    const c = await this.leer(versionId); const tabla = c.tablas.find(t => t.codigo === codigo || mismoId(t.id, codigo));
    if (!tabla) throw new NotFoundException('La tabla no existe en esta versión.');
    const filas = c.filas.filter(f => {
      const p = JSON.parse(f.condicionesJson ?? '{}');
      return mismoId(f.tablaId, tabla.id) && (!identificador || p.identificador === identificador || p.identificadores?.includes(identificador));
    });
    const items = filas.slice((pagina - 1) * limite, pagina * limite).map(f => ({ ...f,
      condiciones: JSON.parse(f.condicionesJson ?? '{}'), fuentes: this.fuentesPorCampo(c, 'filaId', f.id),
      celdas: c.celdas.filter(x => mismoId(x.filaId, f.id)).map(x => ({ ...x, fuentes: this.fuentesPorCampo(c, 'celdaId', x.id) })) }));
    return { versionContrato: 1, versionGreId: c.versionGreId, tabla, estructura: JSON.parse(tabla.estructuraJson), items, total: filas.length, pagina, limite };
  }
  async fuente(versionId: string, id: string) {
    const r = await this.catalogo.fuenteDeVersionValidada(versionId, id);
    const pagina = await this.ds.getRepository(GrePagina).findOneByOrFail({ versionId, paginaPdf: r.paginaPdf });
    return { versionContrato: 1, versionGreId: versionId, referenciaId: id, paginaPdf: r.paginaPdf,
      etiquetasImpresas: JSON.parse(pagina.etiquetasImpresasJson), textoOriginal: r.textoOriginal,
      cajaPt: r.cajaPtJson ? JSON.parse(r.cajaPtJson) : null,
      archivo: `/matpel/versiones/${versionId}/archivo#page=${r.paginaPdf}` };
  }
  async archivo(versionId: string) {
    const { documento } = await this.version(versionId);
    return { documento, buffer: await this.fuentes.leerDocumento(documento) };
  }
  async paquete(versionId: string, archivo = false) {
    const c = await this.leer(versionId);
    const { buffer } = await this.archivo(versionId);
    const paquete = paqueteMatpel(c, buffer);
    return archivo ? archivoPaqueteMatpel(paquete) : paquete;
  }
  async partes(versionId: string) {
    const c = await this.leer(versionId);
    const { buffer } = await this.archivo(versionId);
    return partesPaqueteMatpel(c, buffer);
  }
}
