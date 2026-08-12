import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  AsignacionGuardia,
  Bombero,
  EsquemaHorarioGuardia,
  Feriado,
  Guardia,
  GrupoGuardia,
  GrupoGuardiaMiembro,
  Rango,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ElegibilidadService } from './elegibilidad.service';
import { GuardiasService } from './guardias.service';

interface OpcionesGeneracion {
  permitirRepetirIntegrantes?: boolean;
  regenerarExistentes?: boolean;
}

const DIAS_CSV = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const DIAS_ESPANOL = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

function diaSemanaCsv(fechaIso: string): string {
  return DIAS_CSV[new Date(`${fechaIso}T00:00:00Z`).getUTCDay()];
}

function diaSemanaEspanol(fechaIso: string): string {
  return DIAS_ESPANOL[new Date(`${fechaIso}T00:00:00Z`).getUTCDay()];
}

function rangoFechas(desde: string, hasta: string): string[] {
  const fechas: string[] = [];
  let cursor = new Date(`${desde}T00:00:00Z`);
  const fin = new Date(`${hasta}T00:00:00Z`);
  while (cursor.getTime() <= fin.getTime()) {
    fechas.push(cursor.toISOString().slice(0, 10));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return fechas;
}

function sumarDias(fechaIso: string, dias: number): string {
  const d = new Date(`${fechaIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** `getRawOne()`/`getRawMany()` sobre una columna `type: 'date'` puede volver
 * un string datetime completo (ej. "2026-06-20T03:00:00.000Z", artefacto de
 * la serializacion UTC del driver mssql) en vez de "YYYY-MM-DD" -- mismo
 * problema ya diagnosticado en FeriadosService.mover(). Se normaliza siempre
 * a los primeros 10 caracteres antes de usarla en comparaciones/aritmetica
 * de fechas. */
function soloFecha(valor: string | Date): string {
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return valor.slice(0, 10);
}

/** Motor de generacion automatica de la planificacion de guardias (Fase B
 * del pedido). Es explicitamente un ASISTENTE heuristico, no un optimizador
 * exacto (secciones 13/54): prioriza por reglas simples y deterministas
 * (rotacion vencida, cantidad de guardias ya realizadas, dia preferente) y
 * deja advertencias en vez de fallar toda la corrida cuando no encuentra un
 * candidato para un rol puntual. Cada guardia generada queda inmediatamente
 * editable/anulable con las herramientas manuales ya existentes -- nunca es
 * un estado "borrador" especial que bloquee al responsable. */
@Injectable()
export class GeneracionService {
  constructor(
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(AsignacionGuardia) private readonly asignacionRepo: Repository<AsignacionGuardia>,
    @InjectRepository(EsquemaHorarioGuardia) private readonly esquemaRepo: Repository<EsquemaHorarioGuardia>,
    @InjectRepository(Feriado) private readonly feriadoRepo: Repository<Feriado>,
    @InjectRepository(GrupoGuardia) private readonly grupoRepo: Repository<GrupoGuardia>,
    @InjectRepository(GrupoGuardiaMiembro) private readonly miembroRepo: Repository<GrupoGuardiaMiembro>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    private readonly auditoriaService: AuditoriaService,
    private readonly elegibilidadService: ElegibilidadService,
    private readonly guardiasService: GuardiasService,
  ) {}

  async generar(desde: string, hasta: string, opciones: OpcionesGeneracion, actorId: string, ip?: string) {
    const permitirRepetir = opciones.permitirRepetirIntegrantes ?? false;
    const regenerar = opciones.regenerarExistentes ?? false;
    const advertencias: string[] = [];

    const fechas = rangoFechas(desde, hasta);
    if (fechas.length === 0) {
      return { guardiasCreadas: 0, guardiaIds: [], personasAsignadas: 0, advertencias: ['Rango de fechas vacio o invertido'] };
    }

    const [esquemas, gruposActivos, bomberosActivos, rangos, feriados] = await Promise.all([
      this.esquemaRepo.find({ where: { activo: true }, order: { orden: 'ASC' } }),
      this.grupoRepo.find({ where: { estado: 'ACTIVO' } }),
      this.bomberoRepo.find({ where: { estado: 'ACTIVO' } }),
      this.rangoRepo.find(),
      this.feriadoRepo.find({ where: { activo: true } }),
    ]);

    const bomberoPorId = new Map(bomberosActivos.map((b) => [b.id, b]));
    const rangoPorId = new Map(rangos.map((r) => [r.id, r]));
    const feriadoPorFecha = new Map(feriados.map((f) => [f.fecha, f]));
    const gruposConRotacion = gruposActivos.filter((g) => g.cicloRotacionDias != null);

    // Miembros de cualquier grupo activo: quedan fuera del "pool individual"
    // usado por la asignacion por frecuencia mensual (seccion 5 del pedido).
    const miembrosDeGrupoActivo = gruposActivos.length
      ? await this.miembroRepo.find({ where: { grupoId: In(gruposActivos.map((g) => g.id)) } })
      : [];
    const bomberoEnGrupo = new Set(miembrosDeGrupoActivo.map((m) => m.bomberoId));
    const poolIndividual = bomberosActivos.filter((b) => b.realizaGuardias && !bomberoEnGrupo.has(b.id));

    // Ultima fecha en que cada grupo con rotacion tuvo una guardia (para
    // calcular si ya vencio su ciclo).
    const ultimaFechaGrupo = new Map<string, string | null>();
    for (const g of gruposConRotacion) {
      const fila = await this.guardiaRepo
        .createQueryBuilder('g')
        .select('MAX(g.fecha)', 'max')
        .where('g.grupoGuardiaId = :id', { id: g.id })
        .andWhere("g.estado <> 'ANULADA'")
        .setParameter('id', g.id)
        .getRawOne<{ max: string | null }>();
      ultimaFechaGrupo.set(g.id, fila?.max ? soloFecha(fila.max) : null);
    }

    // Conteo de guardias TITULAR por bombero+mes, precargado y actualizado en
    // memoria durante toda la corrida (evita N+1 queries por candidato).
    const conteoPorBomberoMes = await this.precargarConteoMensual(fechas);
    const contar = (bomberoId: string, fecha: string) => conteoPorBomberoMes.get(`${bomberoId}:${fecha.slice(0, 7)}`) ?? 0;
    const incrementar = (bomberoId: string, fecha: string) => {
      const clave = `${bomberoId}:${fecha.slice(0, 7)}`;
      conteoPorBomberoMes.set(clave, (conteoPorBomberoMes.get(clave) ?? 0) + 1);
    };

    const guardiaIds: string[] = [];
    const guardiasIndividualesSinTitulares: { guardia: Guardia; esquema: EsquemaHorarioGuardia }[] = [];
    let personasAsignadas = 0;

    // --- Fase 1: crear la instancia de guardia para cada fecha x esquema ---
    for (const fecha of fechas) {
      const diaCsv = diaSemanaCsv(fecha);
      const feriado = feriadoPorFecha.get(fecha) ?? null;

      let esquemasAplicables = feriado
        ? esquemas.filter((e) => e.esEspecial)
        : esquemas.filter((e) => e.diasSemanaCsv?.split(',').includes(diaCsv));

      if (feriado && esquemasAplicables.length === 0) {
        advertencias.push(`${fecha}: es feriado (${feriado.nombre}) pero no hay esquemas especiales configurados; se usa el esquema normal del dia`);
        esquemasAplicables = esquemas.filter((e) => e.diasSemanaCsv?.split(',').includes(diaCsv));
      }
      if (esquemasAplicables.length === 0) continue;

      for (const esquema of esquemasAplicables) {
        // CAST(...AS DATE) en vez de find({where:{fecha}}): comparar una
        // columna `type: 'date'` con el shorthand de TypeORM contra mssql
        // puede fallar de forma intermitente (mismo problema ya diagnosticado
        // y resuelto en FeriadosService.mover()).
        const existentes = await this.guardiaRepo
          .createQueryBuilder('g')
          .where('CAST(g.fecha AS DATE) = :fecha', { fecha })
          .andWhere('g.esquemaHorarioId = :esquemaId', { esquemaId: esquema.id })
          .getMany();
        const activas = existentes.filter((g) => g.estado !== 'ANULADA' && g.estado !== 'CANCELADA');
        if (activas.length > 0 && !regenerar) {
          advertencias.push(`${fecha} (${esquema.nombre}): ya existe una guardia planificada, se omite`);
          continue;
        }
        if (activas.length > 0 && regenerar) {
          for (const g of activas) {
            await this.guardiasService.anular(g.id, 'Reemplazada por generacion automatica', actorId, ip);
          }
        }

        let grupo: GrupoGuardia | null = null;
        if (esquema.usaRotacionGrupo) {
          grupo = this.elegirGrupoDisponible(fecha, gruposConRotacion, ultimaFechaGrupo, permitirRepetir);
          if (!grupo) {
            advertencias.push(`${fecha} (${esquema.nombre}): no hay ningun grupo disponible segun su ciclo de rotacion`);
            continue;
          }
        }

        const guardia = await this.guardiaRepo.save(
          this.guardiaRepo.create({
            fecha,
            turno: esquema.cruzaMedianoche ? 'NOCTURNO' : 'DIURNO',
            horaInicio: esquema.horaInicio,
            horaFin: esquema.horaFin,
            tipo: esquema.esEspecial ? 'ESPECIAL' : 'ORDINARIA',
            grupoGuardiaId: grupo?.id ?? null,
            esquemaHorarioId: esquema.id,
            feriadoId: feriado?.id ?? null,
            observaciones: `Generada automaticamente (${esquema.nombre})`,
          }),
        );
        guardiaIds.push(guardia.id);

        const titulares: Bombero[] = [];
        if (grupo) {
          const miembros = await this.miembroRepo.find({ where: { grupoId: grupo.id } });
          for (const m of miembros) {
            const bombero = bomberoPorId.get(m.bomberoId);
            if (!bombero) continue;
            await this.asignacionRepo.save(
              this.asignacionRepo.create({
                guardiaId: guardia.id,
                bomberoId: m.bomberoId,
                rol: m.rol,
                estado: 'ASIGNADO',
                tipoParticipacion: 'TITULAR',
                fechaAsignacion: new Date(),
                asignadoPor: actorId,
              }),
            );
            incrementar(m.bomberoId, fecha);
            personasAsignadas++;
            titulares.push(bombero);
          }
          ultimaFechaGrupo.set(grupo.id, fecha);

          personasAsignadas += await this.resolverRoles(guardia, esquema, grupo, titulares, bomberosActivos, rangoPorId, contar, incrementar, actorId, advertencias);
        } else {
          // Esquema individual (sin grupo fijo): los titulares se completan
          // en la Fase 2 segun frecuencia mensual configurada por persona.
          guardiasIndividualesSinTitulares.push({ guardia, esquema });
        }
      }
    }

    // --- Fase 2: completar esquemas individuales segun frecuencia mensual ---
    personasAsignadas += await this.completarPorFrecuenciaMensual(
      guardiasIndividualesSinTitulares,
      poolIndividual,
      contar,
      incrementar,
      permitirRepetir,
      actorId,
      advertencias,
    );

    // --- Fase 3: resolver oficial/chofer de los esquemas individuales, ya
    // con sus titulares conocidos ---
    for (const { guardia, esquema } of guardiasIndividualesSinTitulares) {
      const asignaciones = await this.asignacionRepo.find({ where: { guardiaId: guardia.id } });
      const titulares = asignaciones.map((a) => bomberoPorId.get(a.bomberoId)).filter((b): b is Bombero => !!b);
      personasAsignadas += await this.resolverRoles(guardia, esquema, null, titulares, bomberosActivos, rangoPorId, contar, incrementar, actorId, advertencias);
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'GENERAR_PLANIFICACION_GUARDIAS',
      recurso: 'operaciones.guardias',
      metadata: { desde, hasta, opciones, guardiasCreadas: guardiaIds.length, personasAsignadas, advertencias },
      ip: ip ?? null,
    });

    return { guardiasCreadas: guardiaIds.length, guardiaIds, personasAsignadas, advertencias };
  }

  private async precargarConteoMensual(fechas: string[]): Promise<Map<string, number>> {
    const meses = [...new Set(fechas.map((f) => f.slice(0, 7)))];
    const filas = await this.asignacionRepo
      .createQueryBuilder('a')
      .innerJoin(Guardia, 'g', 'g.id = a.guardiaId')
      .select('a.bomberoId', 'bomberoId')
      .addSelect('CONVERT(varchar(7), g.fecha, 120)', 'mes')
      .addSelect('COUNT(*)', 'cnt')
      .where("a.tipoParticipacion = 'TITULAR'")
      .andWhere("g.estado <> 'ANULADA'")
      .andWhere('CONVERT(varchar(7), g.fecha, 120) IN (:...meses)', { meses })
      .groupBy('a.bomberoId')
      .addGroupBy('CONVERT(varchar(7), g.fecha, 120)')
      .getRawMany<{ bomberoId: string; mes: string; cnt: string }>();
    const mapa = new Map<string, number>();
    for (const f of filas) mapa.set(`${f.bomberoId}:${f.mes}`, parseInt(f.cnt, 10));
    return mapa;
  }

  /** `permitirRepetir` controla si un grupo puede volver a tomar una guardia
   * ANTES de que venza su propio ciclo de rotacion (ej. dos veces la misma
   * semana). El chequeo de vencimiento (`ultimaFechaGrupo` + `cicloRotacionDias`)
   * ya es, por si solo, la regla correcta de "no repetir dentro de su propio
   * ciclo" -- por eso `permitirRepetir=false` no necesita ningun bloqueo
   * adicional "usado una vez en esta corrida, nunca mas": un grupo cuyo ciclo
   * ya vencio (aunque haya sido usado antes en la misma corrida) debe volver
   * a estar disponible con total normalidad. */
  private elegirGrupoDisponible(
    fecha: string,
    gruposConRotacion: GrupoGuardia[],
    ultimaFechaGrupo: Map<string, string | null>,
    permitirRepetir: boolean,
  ): GrupoGuardia | null {
    const candidatos = gruposConRotacion.filter((g) => {
      const ultima = ultimaFechaGrupo.get(g.id);
      if (!ultima) return true;
      if (permitirRepetir) return true;
      return sumarDias(ultima, g.cicloRotacionDias ?? 1) <= fecha;
    });
    if (candidatos.length === 0) return null;
    candidatos.sort((a, b) => {
      const ua = ultimaFechaGrupo.get(a.id);
      const ub = ultimaFechaGrupo.get(b.id);
      if (ua === ub) return 0;
      if (!ua) return -1;
      if (!ub) return 1;
      return ua < ub ? -1 : 1;
    });
    return candidatos[0];
  }

  /** Completa los "esquemas individuales" (sin grupo fijo) con personal cuya
   * frecuencia mensual objetivo (normal o especial, segun el esquema) aun no
   * fue cubierta, priorizando su dia preferente y repartiendo por menor
   * cantidad de guardias ya realizadas este mes (seccion 5/13 del pedido). */
  private async completarPorFrecuenciaMensual(
    slots: { guardia: Guardia; esquema: EsquemaHorarioGuardia }[],
    poolIndividual: Bombero[],
    contar: (bomberoId: string, fecha: string) => number,
    incrementar: (bomberoId: string, fecha: string) => void,
    permitirRepetir: boolean,
    actorId: string,
    advertencias: string[],
  ): Promise<number> {
    if (slots.length === 0) return 0;
    let asignados = 0;
    const ocupadosPorFecha = new Map<string, Set<string>>();
    for (const s of slots) if (!ocupadosPorFecha.has(s.guardia.fecha)) ocupadosPorFecha.set(s.guardia.fecha, new Set());

    for (const especial of [false, true]) {
      const candidatosBombero = poolIndividual.filter((b) =>
        especial ? b.realizaGuardiasEspeciales && b.frecuenciaEspecialMensual != null : b.frecuenciaNormalMensual != null,
      );
      const slotsDelTipo = slots.filter((s) => s.esquema.esEspecial === especial);
      if (candidatosBombero.length === 0 || slotsDelTipo.length === 0) continue;

      // Prioriza a quien tiene menor proporcion cubierta de su objetivo.
      const ordenados = [...candidatosBombero].sort((a, b) => {
        const objA = (especial ? a.frecuenciaEspecialMensual : a.frecuenciaNormalMensual) ?? 1;
        const objB = (especial ? b.frecuenciaEspecialMensual : b.frecuenciaNormalMensual) ?? 1;
        const ratioA = contar(a.id, slotsDelTipo[0].guardia.fecha) / objA;
        const ratioB = contar(b.id, slotsDelTipo[0].guardia.fecha) / objB;
        return ratioA - ratioB;
      });

      for (const bombero of ordenados) {
        const objetivo = (especial ? bombero.frecuenciaEspecialMensual : bombero.frecuenciaNormalMensual) ?? 0;
        let faltan = objetivo - contar(bombero.id, slotsDelTipo[0].guardia.fecha);
        if (faltan <= 0) continue;

        const diaPref = bombero.diaPreferenteGuardia;
        const ordenSlots = [...slotsDelTipo].sort((a, b) => {
          const prefA = diaPref && diaPref !== 'NINGUNA' && diaSemanaEspanol(a.guardia.fecha) === diaPref ? 0 : 1;
          const prefB = diaPref && diaPref !== 'NINGUNA' && diaSemanaEspanol(b.guardia.fecha) === diaPref ? 0 : 1;
          if (prefA !== prefB) return prefA - prefB;
          return a.guardia.fecha < b.guardia.fecha ? -1 : 1;
        });

        for (const slot of ordenSlots) {
          if (faltan <= 0) break;
          const ocupadosHoy = ocupadosPorFecha.get(slot.guardia.fecha)!;
          if (!permitirRepetir && ocupadosHoy.has(bombero.id)) continue;
          const cupoMaximo = slot.esquema.cantidadMaxima;
          const asignadosSlot = await this.asignacionRepo.count({ where: { guardiaId: slot.guardia.id } });
          if (cupoMaximo != null && asignadosSlot >= cupoMaximo) continue;

          await this.asignacionRepo.save(
            this.asignacionRepo.create({
              guardiaId: slot.guardia.id,
              bomberoId: bombero.id,
              rol: null,
              estado: 'ASIGNADO',
              tipoParticipacion: 'TITULAR',
              fechaAsignacion: new Date(),
              asignadoPor: actorId,
            }),
          );
          ocupadosHoy.add(bombero.id);
          incrementar(bombero.id, slot.guardia.fecha);
          faltan--;
          asignados++;
        }

        if (faltan > 0) {
          advertencias.push(
            `${bombero.nombre} ${bombero.apellido}: solo se pudo cubrir ${objetivo - faltan}/${objetivo} guardias ${especial ? 'especiales' : 'normales'} del rango por falta de cupo disponible`,
          );
        }
      }
    }
    return asignados;
  }

  /** Resuelve oficial a cargo y chofer(es) de una guardia ya con sus
   * titulares conocidos. Prioriza al responsable predefinido del grupo /
   * titulares con rol CHOFER; si no hay disponible, cae al personal
   * habilitado de mayor rango (seccion 7/9 del pedido). Nunca asigna a
   * alguien no elegible: si no encuentra candidato, deja advertencia. */
  private async resolverRoles(
    guardia: Guardia,
    esquema: EsquemaHorarioGuardia,
    grupo: GrupoGuardia | null,
    titulares: Bombero[],
    poolCompleto: Bombero[],
    rangoPorId: Map<string, Rango>,
    contar: (bomberoId: string, fecha: string) => number,
    incrementar: (bomberoId: string, fecha: string) => void,
    actorId: string,
    advertencias: string[],
  ): Promise<number> {
    let asignadosExtra = 0;
    const ocupadosHoy = new Set(titulares.map((t) => t.id));

    if (esquema.requiereOficial) {
      const preferidoId = grupo?.oficialACargoId ?? null;
      const preferido = preferidoId ? poolCompleto.find((b) => b.id === preferidoId) : undefined;
      const candidatos = [preferido, ...titulares].filter((b): b is Bombero => !!b);
      const oficial = await this.resolverPersonaParaRol('OFICIAL_A_CARGO', candidatos, poolCompleto, ocupadosHoy, esquema.esEspecial, rangoPorId, contar, guardia.fecha);
      if (oficial) {
        await this.guardiaRepo.update(guardia.id, { jefeGuardiaId: oficial.id });
        const yaTitular = titulares.some((t) => t.id === oficial.id);
        if (!yaTitular) {
          await this.asignacionRepo.save(
            this.asignacionRepo.create({
              guardiaId: guardia.id,
              bomberoId: oficial.id,
              rol: 'OFICIAL_A_CARGO',
              estado: 'ASIGNADO',
              tipoParticipacion: 'TITULAR',
              fechaAsignacion: new Date(),
              asignadoPor: actorId,
            }),
          );
          incrementar(oficial.id, guardia.fecha);
          ocupadosHoy.add(oficial.id);
          asignadosExtra++;
        } else {
          await this.asignacionRepo.update({ guardiaId: guardia.id, bomberoId: oficial.id }, { rol: 'OFICIAL_A_CARGO' });
        }
      } else {
        advertencias.push(`${guardia.fecha} (${esquema.nombre}): no se encontro oficial a cargo disponible/elegible`);
      }
    }

    if (esquema.requiereChofer) {
      const preferidos = titulares.filter((t) => !ocupadosHoy.has(t.id) || titulares.includes(t));
      const yaChofer = new Set<string>();
      for (let i = 0; i < (esquema.cantidadChoferes ?? 1); i++) {
        const candidatos = preferidos.filter((t) => !yaChofer.has(t.id));
        const chofer = await this.resolverPersonaParaRol('CHOFER', candidatos, poolCompleto, ocupadosHoy, esquema.esEspecial, rangoPorId, contar, guardia.fecha);
        if (!chofer) {
          advertencias.push(`${guardia.fecha} (${esquema.nombre}): no se encontro chofer habilitado disponible (${i + 1}/${esquema.cantidadChoferes ?? 1})`);
          break;
        }
        yaChofer.add(chofer.id);
        const yaTitular = titulares.some((t) => t.id === chofer.id);
        if (!yaTitular) {
          await this.asignacionRepo.save(
            this.asignacionRepo.create({
              guardiaId: guardia.id,
              bomberoId: chofer.id,
              rol: 'CHOFER',
              estado: 'ASIGNADO',
              tipoParticipacion: 'TITULAR',
              fechaAsignacion: new Date(),
              asignadoPor: actorId,
            }),
          );
          incrementar(chofer.id, guardia.fecha);
          ocupadosHoy.add(chofer.id);
          asignadosExtra++;
        } else {
          await this.asignacionRepo.update({ guardiaId: guardia.id, bomberoId: chofer.id }, { rol: 'CHOFER' });
        }
      }
    }

    return asignadosExtra;
  }

  private async resolverPersonaParaRol(
    rol: 'OFICIAL_A_CARGO' | 'CHOFER',
    candidatosPreferidos: Bombero[],
    poolCompleto: Bombero[],
    ocupadosHoy: Set<string>,
    requiereEspecial: boolean,
    rangoPorId: Map<string, Rango>,
    contar: (bomberoId: string, fecha: string) => number,
    fecha: string,
  ): Promise<Bombero | null> {
    const evaluados = new Set<string>();
    const intentar = async (candidato: Bombero | undefined): Promise<Bombero | null> => {
      if (!candidato || evaluados.has(candidato.id)) return null;
      evaluados.add(candidato.id);
      if (ocupadosHoy.has(candidato.id) && !candidatosPreferidos.includes(candidato)) return null;
      if (!candidato.realizaGuardias) return null;
      if (requiereEspecial && !candidato.realizaGuardiasEspeciales) return null;
      const elegible = await this.elegibilidadService.esElegible(rol, candidato.id);
      return elegible ? candidato : null;
    };

    for (const c of candidatosPreferidos) {
      const r = await intentar(c);
      if (r) return r;
    }

    const resto = poolCompleto
      .filter((b) => !evaluados.has(b.id) && !ocupadosHoy.has(b.id))
      .sort((a, b) => {
        const na = a.rangoId ? rangoPorId.get(a.rangoId)?.nivelJerarquico ?? 0 : 0;
        const nb = b.rangoId ? rangoPorId.get(b.rangoId)?.nivelJerarquico ?? 0 : 0;
        if (na !== nb) return nb - na;
        return contar(a.id, fecha) - contar(b.id, fecha);
      });
    for (const c of resto) {
      const r = await intentar(c);
      if (r) return r;
    }
    return null;
  }
}
