import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  AsignacionGuardia,
  Bombero,
  Cargo,
  Designacion,
  EsquemaHorarioGuardia,
  Guardia,
  GrupoGuardia,
  GrupoGuardiaMiembro,
  IdentidadInstitucional,
  OrdenGuardia,
  OrdenGuardiaModificacion,
  Rango,
  VehiculoAutorizado,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { DocumentosService } from '../documentos/documentos.service';
import { OrdenGuardiaConfiguracionService } from './orden-guardia-configuracion.service';
import { CreateOrdenGuardiaDto } from './dto/create-orden-guardia.dto';
import { AnularOrdenGuardiaDto, RegistrarModificacionOrdenDto } from './dto/anular-orden-guardia.dto';
import { OrdenGuardiaSnapshot, PersonaResumen } from './types/orden-guardia-snapshot';
import { generarOrdenGuardiaPdf } from '../../shared/utils/orden-guardia-pdf';
import { generarOrdenGuardiaDocx } from '../../shared/utils/orden-guardia-docx';
import { guardarBufferRestringido, leerBufferRestringido } from '../../shared/utils/almacenamiento';
import { resolverFirmante } from '../../shared/utils/firmantes-institucionales';

type LineaDestacada = { texto: string; tipo: 'SUBTITULO' | 'DISTINCION' | 'OTRO'; visible: boolean; orden: number };

const CARPETA_ORDENES = 'ordenes-guardia';

const NOMBRES_MES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];
const DIAS_ESPANOL = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

function diaSemanaEspanol(fechaIso: string): string {
  return DIAS_ESPANOL[new Date(`${fechaIso}T00:00:00Z`).getUTCDay()];
}

function ultimoDiaMes(anio: number, mes: number): string {
  const d = new Date(Date.UTC(anio, mes, 0));
  return d.toISOString().slice(0, 10);
}

function primerDiaMes(anio: number, mes: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}-01`;
}

/** Documento oficial de Orden de Guardia -- capa de lectura/agregacion
 * sobre la planificacion ya existente (Guardia/AsignacionGuardia/
 * GrupoGuardia/EsquemaHorarioGuardia), nunca una fuente de datos propia.
 * `armarSnapshot` nunca escribe nada: es puramente de lectura, se puede
 * llamar tantas veces como haga falta mientras la Orden siga en BORRADOR. */
@Injectable()
export class OrdenesGuardiaService {
  constructor(
    @InjectRepository(OrdenGuardia) private readonly ordenRepo: Repository<OrdenGuardia>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(AsignacionGuardia) private readonly asignacionRepo: Repository<AsignacionGuardia>,
    @InjectRepository(GrupoGuardia) private readonly grupoRepo: Repository<GrupoGuardia>,
    @InjectRepository(GrupoGuardiaMiembro) private readonly miembroRepo: Repository<GrupoGuardiaMiembro>,
    @InjectRepository(EsquemaHorarioGuardia) private readonly esquemaRepo: Repository<EsquemaHorarioGuardia>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    @InjectRepository(VehiculoAutorizado) private readonly autorizadoRepo: Repository<VehiculoAutorizado>,
    @InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Designacion) private readonly designacionRepo: Repository<Designacion>,
    @InjectRepository(OrdenGuardiaModificacion) private readonly modificacionRepo: Repository<OrdenGuardiaModificacion>,
    @InjectRepository(IdentidadInstitucional) private readonly identidadRepo: Repository<IdentidadInstitucional>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoriaService: AuditoriaService,
    private readonly configuracionService: OrdenGuardiaConfiguracionService,
    private readonly documentosService: DocumentosService,
  ) {}

  findAll(anio?: number, mes?: number, estado?: string) {
    const query = this.ordenRepo.createQueryBuilder('o').orderBy('o.anio', 'DESC').addOrderBy('o.numero', 'DESC');
    if (anio) query.andWhere('o.anio = :anio', { anio });
    if (mes) query.andWhere('o.mes = :mes', { mes });
    if (estado) query.andWhere('o.estado = :estado', { estado });
    return query.getMany();
  }

  async findOne(id: string) {
    const orden = await this.ordenRepo.findOne({ where: { id } });
    if (!orden) throw new NotFoundException(`Orden de guardia ${id} no encontrada`);
    return orden;
  }

  /** Transaccion SERIALIZABLE + UPDLOCK/HOLDLOCK + reintento, mismo patron
   * que ServiciosService.siguienteNumero -- evita numeros duplicados ante
   * dos creaciones simultaneas. La numeracion resetea por anio. */
  private async siguienteNumero(manager: EntityManager, anio: number): Promise<number> {
    const filas = (await manager.query(
      `SELECT ISNULL(MAX(numero), 0) + 1 AS siguiente
       FROM operaciones.ordenes_guardia WITH (UPDLOCK, HOLDLOCK)
       WHERE anio = @0`,
      [anio],
    )) as Array<{ siguiente: number }>;
    const siguiente = Number(filas[0]?.siguiente);
    if (!Number.isSafeInteger(siguiente) || siguiente < 1) {
      throw new ConflictException('No se pudo calcular el numero de orden');
    }
    return siguiente;
  }

  private esViolacionUnica(error: any) {
    return error?.number === 2601 || error?.number === 2627 || /duplicate|unique/i.test(String(error?.message ?? ''));
  }

  async crear(dto: CreateOrdenGuardiaDto, actorId: string, ip?: string): Promise<OrdenGuardia> {
    if (dto.mes < 1 || dto.mes > 12) throw new BadRequestException('El mes debe estar entre 1 y 12');
    const periodoDesde = dto.periodoDesde ?? primerDiaMes(dto.anio, dto.mes);
    const periodoHasta = dto.periodoHasta ?? ultimoDiaMes(dto.anio, dto.mes);

    const existentes = await this.ordenRepo.count({ where: { anio: dto.anio, mes: dto.mes } });
    // Advertencia, no bloqueo: puede haber una reemision legitima del mismo mes.

    const snapshot = await this.armarSnapshot({
      numero: 0,
      anio: dto.anio,
      mes: dto.mes,
      periodoDesde,
      periodoHasta,
      fechaEmision: dto.fechaEmision,
    });

    let orden: OrdenGuardia | undefined;
    for (let intento = 0; intento < 3; intento += 1) {
      try {
        orden = await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
          const numero = await this.siguienteNumero(manager, dto.anio);
          const repo = manager.getRepository(OrdenGuardia);
          return repo.save(
            repo.create({
              anio: dto.anio,
              mes: dto.mes,
              numero,
              periodoDesde,
              periodoHasta,
              fechaEmision: dto.fechaEmision,
              estado: 'BORRADOR',
              contenidoJson: JSON.stringify({ ...snapshot, numero, numeroFormateado: `${numero}/${dto.anio}` }),
              generadoPor: actorId,
              observaciones: dto.observaciones ?? null,
            }),
          );
        });
        break;
      } catch (error) {
        if (intento < 2 && this.esViolacionUnica(error)) continue;
        throw error;
      }
    }
    if (!orden) throw new ConflictException('No se pudo crear la orden de guardia');

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.ordenes_guardia',
      recursoId: orden.id,
      datosDespues: orden,
      metadata: existentes > 0 ? { advertencia: `Ya existian ${existentes} orden(es) para ${dto.mes}/${dto.anio}` } : undefined,
      ip: ip ?? null,
    });

    return orden;
  }

  /** Rechaza cualquier escritura sobre `contenidoJson`/archivos/periodo una
   * vez que la Orden esta PUBLICADA -- mismo patron "inmutable, nunca
   * sobreescrito" que `Guardia.cierreResumen`. Un cambio despues de
   * publicada se registra como modificacion (`registrarModificacion`), no
   * pisando el snapshot original. */
  private assertNoPublicada(orden: OrdenGuardia, accion: string) {
    if (orden.estado === 'PUBLICADA') {
      throw new BadRequestException(`No se puede ${accion}: la orden ya esta PUBLICADA. Registra una modificacion en su lugar.`);
    }
    if (orden.estado === 'ANULADA') {
      throw new BadRequestException(`No se puede ${accion}: la orden esta ANULADA.`);
    }
  }

  /** Vuelve a armar el snapshot con los datos actuales de la planificacion
   * y lo guarda -- solo permitido mientras la Orden no este PUBLICADA. */
  async regenerarPreview(id: string, actorId: string, ip?: string): Promise<OrdenGuardia> {
    const orden = await this.findOne(id);
    this.assertNoPublicada(orden, 'regenerar la vista previa');
    const snapshot = await this.armarSnapshot(orden);
    await this.ordenRepo.update(id, { contenidoJson: JSON.stringify(snapshot) });
    const actualizada = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REGENERAR_PREVIEW_ORDEN_GUARDIA',
      recurso: 'operaciones.ordenes_guardia',
      recursoId: id,
      ip: ip ?? null,
    });
    return actualizada;
  }

  /** Genera PDF+DOCX a partir del `contenidoJson` actual de la Orden (no
   * recalcula el snapshot -- usar `regenerarPreview` antes si hace falta
   * reflejar cambios recientes de la planificacion). Mientras la Orden no
   * este PUBLICADA esto puede llamarse cuantas veces haga falta; cada
   * llamada sobreescribe los archivos anteriores. Una vez PUBLICADA, los
   * archivos definitivos se generan dentro de `publicar()` y no vuelven a
   * cambiar por esta via. */
  async generarDocumentos(id: string, actorId: string, ip?: string): Promise<OrdenGuardia> {
    const orden = await this.findOne(id);
    this.assertNoPublicada(orden, 'generar documentos');
    const snapshot = JSON.parse(orden.contenidoJson) as OrdenGuardiaSnapshot;

    const [pdfBuffer, docxBuffer] = await Promise.all([
      generarOrdenGuardiaPdf(snapshot),
      generarOrdenGuardiaDocx(snapshot),
    ]);
    const [archivoPdfUrl, archivoDocxUrl] = await Promise.all([
      guardarBufferRestringido(pdfBuffer, '.pdf', CARPETA_ORDENES),
      guardarBufferRestringido(docxBuffer, '.docx', CARPETA_ORDENES),
    ]);

    await this.ordenRepo.update(id, { archivoPdfUrl, archivoDocxUrl });
    const actualizada = await this.findOne(id);

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'GENERAR_DOCUMENTOS_ORDEN_GUARDIA',
      recurso: 'operaciones.ordenes_guardia',
      recursoId: id,
      metadata: { archivoPdfUrl, archivoDocxUrl },
      ip: ip ?? null,
    });
    return actualizada;
  }

  /** Arma el snapshot completo (solo lecturas) para el periodo indicado.
   * Nunca asume cantidad de grupos, esquemas o roles -- todo se deriva de
   * lo que ya esta configurado/generado en Guardias. */
  private async armarSnapshot(
    orden: Pick<OrdenGuardia, 'numero' | 'anio' | 'mes' | 'periodoDesde' | 'periodoHasta' | 'fechaEmision'>,
  ): Promise<OrdenGuardiaSnapshot> {
    const config = await this.configuracionService.obtener();

    const guardiasPeriodo = await this.guardiaRepo
      .createQueryBuilder('g')
      .where('CAST(g.fecha AS DATE) BETWEEN :desde AND :hasta', { desde: orden.periodoDesde, hasta: orden.periodoHasta })
      .andWhere("g.estado <> 'ANULADA'")
      .getMany();

    const guardiaIds = guardiasPeriodo.map((g) => g.id);
    const asignaciones = guardiaIds.length
      ? await this.asignacionRepo.createQueryBuilder('a').where('a.guardiaId IN (:...ids)', { ids: guardiaIds }).getMany()
      : [];
    const asignacionesPorGuardia = new Map<string, AsignacionGuardia[]>();
    for (const a of asignaciones) {
      const lista = asignacionesPorGuardia.get(a.guardiaId) ?? [];
      lista.push(a);
      asignacionesPorGuardia.set(a.guardiaId, lista);
    }

    const bomberoIdsInvolucrados = [...new Set(asignaciones.map((a) => a.bomberoId))];
    const bomberosInvolucrados = bomberoIdsInvolucrados.length
      ? await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIdsInvolucrados }).getMany()
      : [];
    const bomberoPorId = new Map(bomberosInvolucrados.map((b) => [b.id, b]));

    const rangoIdsInvolucrados = [...new Set(bomberosInvolucrados.map((b) => b.rangoId).filter((x): x is string => !!x))];
    const rangosInvolucrados = rangoIdsInvolucrados.length
      ? await this.rangoRepo.createQueryBuilder('r').where('r.id IN (:...ids)', { ids: rangoIdsInvolucrados }).getMany()
      : [];
    const rangoPorId = new Map(rangosInvolucrados.map((r) => [r.id, r]));

    function personaResumen(bomberoId: string): PersonaResumen {
      const b = bomberoPorId.get(bomberoId);
      if (!b) return { bomberoId, nombreCompleto: '(bombero no encontrado)', rango: null };
      const rango = (b.rangoId ? rangoPorId.get(b.rangoId)?.nombre : null) ?? b.rango ?? null;
      return { bomberoId, nombreCompleto: `${b.nombre} ${b.apellido}`, rango };
    }

    const esquemas = await this.esquemaRepo.find();
    const esquemaPorId = new Map(esquemas.map((e) => [e.id, e]));

    // --- grupos rotativos ---
    const grupoIds = [...new Set(guardiasPeriodo.filter((g) => g.grupoGuardiaId).map((g) => g.grupoGuardiaId as string))];
    const grupos = grupoIds.length
      ? await this.grupoRepo.createQueryBuilder('gr').where('gr.id IN (:...ids)', { ids: grupoIds }).getMany()
      : [];
    const miembrosGrupos = grupoIds.length
      ? await this.miembroRepo.createQueryBuilder('m').where('m.grupoId IN (:...ids)', { ids: grupoIds }).getMany()
      : [];

    const gruposRotativos = grupos.map((grupo) => {
      const guardiasDelGrupo = guardiasPeriodo
        .filter((g) => g.grupoGuardiaId === grupo.id)
        .sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
      const fechasDelPeriodo = guardiasDelGrupo.map((g) => g.fecha);
      const diasSemanaUnicos = new Set(fechasDelPeriodo.map((f) => diaSemanaEspanol(f)));
      const diaSemana = diasSemanaUnicos.size === 1 ? [...diasSemanaUnicos][0] : null;

      let oficialACargo: PersonaResumen | null = null;
      let chofer: PersonaResumen | null = null;
      for (const g of guardiasDelGrupo) {
        const asigs = (asignacionesPorGuardia.get(g.id) ?? []).filter((a) => a.estado !== 'REEMPLAZADO');
        if (!oficialACargo) {
          const of = asigs.find((a) => a.rol === 'OFICIAL_A_CARGO');
          if (of) oficialACargo = personaResumen(of.bomberoId);
        }
        if (!chofer) {
          const ch = asigs.find((a) => a.rol === 'CHOFER');
          if (ch) chofer = personaResumen(ch.bomberoId);
        }
      }

      const integrantes = miembrosGrupos
        .filter((m) => m.grupoId === grupo.id)
        .map((m) => ({ ...personaResumen(m.bomberoId), rolGrupo: m.rol }));

      return { grupoId: grupo.id, nombre: grupo.nombre, diaSemana, oficialACargo, chofer, integrantes, fechasDelPeriodo };
    });

    // --- rosters individuales (no especiales, sin rotacion de grupo) ---
    const individualesPorEsquema = new Map<string, Guardia[]>();
    for (const g of guardiasPeriodo) {
      if (g.grupoGuardiaId || !g.esquemaHorarioId) continue;
      const esquema = esquemaPorId.get(g.esquemaHorarioId);
      if (!esquema || esquema.usaRotacionGrupo || esquema.esEspecial) continue;
      const lista = individualesPorEsquema.get(g.esquemaHorarioId) ?? [];
      lista.push(g);
      individualesPorEsquema.set(g.esquemaHorarioId, lista);
    }
    const rostersIndividuales = [...individualesPorEsquema.entries()].map(([esquemaId, guardiasEsquema]) => {
      const esquema = esquemaPorId.get(esquemaId)!;
      const fechas = guardiasEsquema
        .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
        .map((g) => ({
          fecha: g.fecha,
          diaSemana: diaSemanaEspanol(g.fecha),
          asignaciones: (asignacionesPorGuardia.get(g.id) ?? [])
            .filter((a) => a.estado !== 'REEMPLAZADO')
            .map((a) => ({ ...personaResumen(a.bomberoId), rol: a.rol })),
        }));
      return {
        esquemaId,
        esquemaNombre: esquema.nombre,
        horaInicio: esquema.horaInicio,
        horaFin: esquema.horaFin,
        diasSemanaCsv: esquema.diasSemanaCsv,
        fechas,
      };
    });

    // --- guardias especiales (agrupadas por esquema; el nombre del esquema
    // dobla como la "modalidad" impresa, sin inventar un campo nuevo) ---
    const especialesPorEsquema = new Map<string, Guardia[]>();
    for (const g of guardiasPeriodo) {
      if (g.tipo !== 'ESPECIAL' || g.grupoGuardiaId) continue;
      const key = g.esquemaHorarioId ?? '(sin-esquema)';
      const lista = especialesPorEsquema.get(key) ?? [];
      lista.push(g);
      especialesPorEsquema.set(key, lista);
    }
    const guardiasEspeciales = [...especialesPorEsquema.entries()].map(([esquemaId, guardiasEsquema]) => {
      const esquema = esquemaId !== '(sin-esquema)' ? esquemaPorId.get(esquemaId) : null;
      const ocurrencias = guardiasEsquema
        .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
        .map((g) => ({
          fecha: g.fecha,
          asignaciones: (asignacionesPorGuardia.get(g.id) ?? [])
            .filter((a) => a.estado !== 'REEMPLAZADO')
            .map((a) => personaResumen(a.bomberoId)),
        }));
      return { esquemaId, modalidadTexto: esquema?.nombre ?? 'Guardia especial', ocurrencias };
    });

    // --- conductores disponibles: ACTIVO + autorizacion de chofer ---
    const bomberosActivos = await this.bomberoRepo.find({ where: { estado: 'ACTIVO' } });
    const autorizados = await this.autorizadoRepo.find();
    const bomberoIdsAutorizados = new Set(autorizados.map((a) => a.bomberoId));
    const rangoIdsActivos = [...new Set(bomberosActivos.map((b) => b.rangoId).filter((x): x is string => !!x))];
    const rangosActivos = rangoIdsActivos.length
      ? await this.rangoRepo.createQueryBuilder('r').where('r.id IN (:...ids)', { ids: rangoIdsActivos }).getMany()
      : [];
    const rangoPorIdActivos = new Map(rangosActivos.map((r) => [r.id, r]));
    const conductoresDisponibles = bomberosActivos
      .filter((b) => bomberoIdsAutorizados.has(b.id))
      .map((b) => ({
        bomberoId: b.id,
        rango: (b.rangoId ? rangoPorIdActivos.get(b.rangoId)?.nombre : null) ?? b.rango ?? null,
        nombreCompleto: `${b.nombre} ${b.apellido}`,
        telefono: b.telefonoPrincipal ?? null,
      }));

    // --- firmantes: quien ocupa hoy cada cargo configurado, y si SIGBO
    // puede insertar su firma digital automaticamente (ver
    // shared/utils/firmantes-institucionales.ts) ---
    const firmantesConfig: Array<[string | null, string | null]> = [
      [config.firmante1CargoId, config.firmante1Etiqueta],
      [config.firmante2CargoId, config.firmante2Etiqueta],
    ];
    const firmantes: OrdenGuardiaSnapshot['firmantes'] = [];
    for (const [cargoId, etiqueta] of firmantesConfig) {
      if (!cargoId) continue;
      firmantes.push(
        await resolverFirmante(
          { cargoRepo: this.cargoRepo, designacionRepo: this.designacionRepo, bomberoRepo: this.bomberoRepo, rangoRepo: this.rangoRepo },
          cargoId,
          etiqueta,
        ),
      );
    }

    // --- identidad institucional: membrete/datos de contacto centralizados,
    // reutilizables por cualquier modulo (no propios de Guardias) ---
    const [identidad] = await this.identidadRepo.find({ take: 1 });
    const lineasDestacadas: LineaDestacada[] = identidad?.lineasDestacadas ? JSON.parse(identidad.lineasDestacadas) : [];

    const nombreMes = NOMBRES_MES[orden.mes - 1] ?? '';
    const textoRenderizado = (config.textoIntroPlantilla ?? '')
      .replace(/\{\{mes\}\}/g, nombreMes)
      .replace(/\{\{anio\}\}/g, String(orden.anio));

    return {
      numero: orden.numero,
      anio: orden.anio,
      numeroFormateado: `${orden.numero}/${orden.anio}`,
      mes: orden.mes,
      nombreMes,
      periodoDesde: orden.periodoDesde,
      periodoHasta: orden.periodoHasta,
      fechaEmision: orden.fechaEmision,
      generadoEn: new Date().toISOString(),
      institucional: {
        nombreInstitucion: identidad?.nombreInstitucion ?? '',
        lineasDestacadas: lineasDestacadas
          .filter((l) => l.visible)
          .sort((a, b) => a.orden - b.orden)
          .map((l) => ({ texto: l.texto, tipo: l.tipo })),
        direccion: identidad?.mostrarDireccion ? identidad.direccion : null,
        telefono: identidad?.mostrarTelefono ? identidad.telefono : null,
        email: identidad?.mostrarEmail ? identidad.email : null,
        sitioWeb: identidad?.mostrarSitioWeb ? identidad.sitioWeb : null,
        personeriaJuridica: identidad?.mostrarPersoneria ? identidad.personeriaJuridica : null,
        fechaFundacion: identidad?.mostrarFechaFundacion ? identidad.fechaFundacion : null,
        logoIzquierdaUrl: identidad?.mostrarLogoIzquierda ? identidad.logoIzquierdaUrl : null,
        logoDerechaUrl: identidad?.mostrarLogoDerecha ? identidad.logoDerechaUrl : null,
        piePaginaInstitucional: {
          texto: identidad?.textoPiePagina ?? null,
          mostrarNumeroPagina: identidad?.mostrarNumeroPagina ?? false,
          mostrarGeneradoSigbo: identidad?.mostrarGeneradoSigbo ?? false,
        },
      },
      introduccion: {
        textoRenderizado,
        reglaOficialTexto: config.reglaTextoOficial ?? '',
        reglaChoferTexto: config.reglaTextoChofer ?? '',
      },
      gruposRotativos,
      rostersIndividuales,
      guardiasEspeciales,
      conductoresDisponibles,
      piePagina: { texto: config.textoPie ?? '' },
      firmantes,
    };
  }

  /** BORRADOR -> REVISADA: el encargado termino de revisar la distribucion
   * (seccion 14 del pedido). */
  async revisar(id: string, actorId: string, ip?: string): Promise<OrdenGuardia> {
    const orden = await this.findOne(id);
    if (orden.estado !== 'BORRADOR') throw new BadRequestException('Solo se puede revisar una orden en estado BORRADOR');
    await this.ordenRepo.update(id, { estado: 'REVISADA', revisadaEn: new Date(), revisadaPor: actorId });
    return this.registrarTransicion(id, 'REVISAR_ORDEN_GUARDIA', orden, actorId, ip);
  }

  /** REVISADA/APROBADA -> BORRADOR: permite corregir y volver a revisar
   * antes de publicar (flujo del pedido, seccion 29 pasos 6-9). Nunca
   * disponible desde PUBLICADA. */
  async volverABorrador(id: string, actorId: string, ip?: string): Promise<OrdenGuardia> {
    const orden = await this.findOne(id);
    if (orden.estado !== 'REVISADA' && orden.estado !== 'APROBADA') {
      throw new BadRequestException('Solo se puede volver a BORRADOR desde REVISADA o APROBADA');
    }
    await this.ordenRepo.update(id, {
      estado: 'BORRADOR',
      revisadaEn: null,
      revisadaPor: null,
      aprobadaEn: null,
      aprobadaPor: null,
    });
    return this.registrarTransicion(id, 'VOLVER_BORRADOR_ORDEN_GUARDIA', orden, actorId, ip);
  }

  /** REVISADA -> APROBADA. */
  async aprobar(id: string, actorId: string, ip?: string): Promise<OrdenGuardia> {
    const orden = await this.findOne(id);
    if (orden.estado !== 'REVISADA') throw new BadRequestException('Solo se puede aprobar una orden en estado REVISADA');
    await this.ordenRepo.update(id, { estado: 'APROBADA', aprobadaEn: new Date(), aprobadaPor: actorId });
    return this.registrarTransicion(id, 'APROBAR_ORDEN_GUARDIA', orden, actorId, ip);
  }

  /** APROBADA -> PUBLICADA: recalcula el snapshot una ultima vez con los
   * datos mas frescos de la planificacion, genera los documentos
   * definitivos, y desde aca en adelante todo queda congelado (seccion 15
   * del pedido). */
  async publicar(id: string, actorId: string, ip?: string): Promise<OrdenGuardia> {
    const orden = await this.findOne(id);
    if (orden.estado !== 'APROBADA') throw new BadRequestException('Solo se puede publicar una orden en estado APROBADA');

    const snapshotFinal = await this.armarSnapshot(orden);
    const [pdfBuffer, docxBuffer] = await Promise.all([
      generarOrdenGuardiaPdf(snapshotFinal),
      generarOrdenGuardiaDocx(snapshotFinal),
    ]);
    const [archivoPdfUrl, archivoDocxUrl] = await Promise.all([
      guardarBufferRestringido(pdfBuffer, '.pdf', CARPETA_ORDENES),
      guardarBufferRestringido(docxBuffer, '.docx', CARPETA_ORDENES),
    ]);

    await this.ordenRepo.update(id, {
      estado: 'PUBLICADA',
      publicadaEn: new Date(),
      publicadaPor: actorId,
      contenidoJson: JSON.stringify(snapshotFinal),
      archivoPdfUrl,
      archivoDocxUrl,
    });

    await this.documentosService.registrarDesdeOtroModulo(
      {
        tipoDocumentoNombre: 'Orden',
        categoriaDocumentoNombre: 'Operativo',
        titulo: `Orden de Guardia N° ${orden.numero}/${orden.anio}`,
        descripcion: `Orden de Guardia del periodo ${orden.periodoDesde} al ${orden.periodoHasta}`,
        fechaEmision: orden.fechaEmision,
        archivoUrl: archivoPdfUrl,
        archivoNombreOriginal: `orden-guardia-${orden.anio}-${orden.mes}-${orden.numero}.pdf`,
        archivoExtension: 'pdf',
        generadoPorModulo: 'guardias',
        estadoNombre: 'Publicado',
        relaciones: [{ modulo: 'guardias', entidad: 'orden_guardia', registroId: id, etiqueta: 'Orden de Guardia' }],
      },
      actorId,
    );

    return this.registrarTransicion(id, 'PUBLICAR_ORDEN_GUARDIA', orden, actorId, ip);
  }

  /** Anulacion no destructiva desde cualquier estado no-ANULADA (mismo
   * patron que `GuardiasService.anular`). Si la orden estaba PUBLICADA,
   * ademas deja un registro en el historial de modificaciones. */
  async anular(id: string, dto: AnularOrdenGuardiaDto, actorId: string, ip?: string): Promise<OrdenGuardia> {
    const orden = await this.findOne(id);
    if (orden.estado === 'ANULADA') throw new BadRequestException('Esta orden ya esta anulada');
    const eraPublicada = orden.estado === 'PUBLICADA';

    await this.ordenRepo.update(id, {
      estado: 'ANULADA',
      anuladaEn: new Date(),
      anuladaPor: actorId,
      anuladaMotivo: dto.motivo,
    });
    const actualizada = await this.findOne(id);

    if (eraPublicada) {
      await this.modificacionRepo.save(
        this.modificacionRepo.create({
          ordenId: id,
          campo: 'estado',
          descripcion: 'Anulacion de una orden ya publicada',
          valorAnterior: 'PUBLICADA',
          valorNuevo: 'ANULADA',
          motivo: dto.motivo,
          registradoPor: actorId,
        }),
      );
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ANULAR_ORDEN_GUARDIA',
      recurso: 'operaciones.ordenes_guardia',
      recursoId: id,
      datosAntes: orden,
      datosDespues: actualizada,
      metadata: { motivo: dto.motivo },
      ip: ip ?? null,
    });
    return actualizada;
  }

  private async registrarTransicion(id: string, accion: string, anterior: OrdenGuardia, actorId: string, ip?: string) {
    const actualizada = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion,
      recurso: 'operaciones.ordenes_guardia',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizada,
      ip: ip ?? null,
    });
    return actualizada;
  }

  /** Historial de cambios a una Orden ya PUBLICADA (seccion 15 del pedido):
   * nunca modifica `contenidoJson`, solo agrega un registro de que cambio y
   * por que. */
  async listarModificaciones(ordenId: string) {
    await this.findOne(ordenId);
    return this.modificacionRepo.find({ where: { ordenId }, order: { registradoEn: 'DESC' } });
  }

  async descargarArchivo(id: string, formato: 'pdf' | 'docx'): Promise<Buffer> {
    const orden = await this.findOne(id);
    const ruta = formato === 'pdf' ? orden.archivoPdfUrl : orden.archivoDocxUrl;
    if (!ruta) throw new NotFoundException(`No hay archivo ${formato.toUpperCase()} para esta orden de guardia`);
    try {
      return await leerBufferRestringido(ruta, CARPETA_ORDENES);
    } catch {
      throw new NotFoundException('El archivo de la orden de guardia no está disponible');
    }
  }

  async registrarModificacion(
    ordenId: string,
    dto: RegistrarModificacionOrdenDto,
    actorId: string,
    ip?: string,
  ): Promise<OrdenGuardiaModificacion> {
    const orden = await this.findOne(ordenId);
    if (orden.estado !== 'PUBLICADA') {
      throw new BadRequestException('Solo se pueden registrar modificaciones sobre una orden ya publicada');
    }
    const modificacion = await this.modificacionRepo.save(
      this.modificacionRepo.create({
        ordenId,
        campo: dto.campo,
        descripcion: dto.descripcion,
        valorAnterior: dto.valorAnterior ?? null,
        valorNuevo: dto.valorNuevo ?? null,
        motivo: dto.motivo,
        registradoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'MODIFICAR_ORDEN_GUARDIA_PUBLICADA',
      recurso: 'operaciones.ordenes_guardia',
      recursoId: ordenId,
      datosDespues: modificacion,
      ip: ip ?? null,
    });
    return modificacion;
  }
}
