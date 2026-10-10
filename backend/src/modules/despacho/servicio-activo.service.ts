import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, IsNull } from 'typeorm';
import {
  Despacho, DisponibilidadPersonal, FormularioDefinicion, FormularioHistorial,
  FormularioRespuesta, PersonalServicio, PosicionMovil, Servicio, ServicioMensaje, ServicioParticipante, TipoServicio, Vehiculo,
} from '../../shared/entities';
import { instanteDelHecho } from '../../shared/utils/instante';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { PantallasService } from '../pantallas/pantallas.service';
import { DespachoTiempoReal } from './despacho-tiempo-real.service';
import { clavesCambiadas, esActivo, formularioDisponible, limpiarMensaje, parsearCampos, redactarDatos, validarCampos, validarDatos } from './servicio-activo.logica';
import { AnularRespuestaFormularioDto, CrearRespuestaFormularioDto, DefinicionFormularioDto, EnviarMensajeDto, ModificarRespuestaFormularioDto } from './dto/servicio-activo.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

const ESTADOS_ACTIVOS = ['REGISTRADO', 'DESPACHADO', 'EN_CURSO'] as const;

@Injectable()
export class ServicioActivoService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    private readonly pantallas: PantallasService,
    private readonly tiempoReal: DespachoTiempoReal,
  ) {}

  private async exigirPantalla(user: AuthenticatedUser, codigo: string, accion: 'ver' | 'crear' | 'editar' | 'eliminar' | 'confidencial') {
    await this.pantallas.exigir(user, codigo, accion);
  }

  private async servicioActivo(id: string) {
    const s = await this.dataSource.getRepository(Servicio).findOne({ where: { id } });
    if (!s) throw new NotFoundException('Servicio no encontrado.');
    if (!esActivo(s.estado)) throw new ConflictException('El servicio ya no está activo.');
    return s;
  }

  private async miembro(servicioId: string, user: AuthenticatedUser) {
    const miembro = await this.dataSource.getRepository(ServicioParticipante).findOne({ where: { servicioId, usuarioId: user.id } });
    if (!miembro || miembro.estado === 'RETIRADO' || miembro.hasta) throw new ForbiddenException('Primero debes incorporarte al servicio.');
    return miembro;
  }

  /** Lo confidencial lo decide la matriz de pantallas; sin reglas cae al permiso por rol (despacho:confidencial). */
  private puedeConfidencial(user: AuthenticatedUser, codigo = '0xA008'): Promise<boolean> {
    return this.pantallas.permite(user, codigo, 'confidencial');
  }

  async activos(user: AuthenticatedUser) {
    await this.exigirPantalla(user, '0xA006', 'ver');
    return this.resumirActivos(await this.serviciosActivos(), user);
  }

  /**
   * Emergencias en curso para el Centro de mando (spec 2026-10-09 §5.5): quien supervisa
   * (central, comandancia) ve todas; el resto, solo las que integra: participante vigente
   * del servicio o integrante del personal del servicio con su ficha de bombero.
   */
  async activosParaCentroMando(user: AuthenticatedUser, opciones: { supervisor: boolean; bomberoId: string | null }) {
    let servicios = await this.serviciosActivos();
    if (!opciones.supervisor && servicios.length) {
      const ids = servicios.map((s) => s.id);
      const participa = new Set(
        (await this.dataSource.getRepository(ServicioParticipante).find({ where: { servicioId: In(ids), usuarioId: user.id } }))
          .filter((p) => !p.hasta && p.estado !== 'RETIRADO')
          .map((p) => p.servicioId),
      );
      if (opciones.bomberoId) {
        const personal = await this.dataSource.getRepository(PersonalServicio).find({ where: { servicioId: In(ids), bomberoId: opciones.bomberoId } });
        for (const p of personal) participa.add(p.servicioId);
      }
      servicios = servicios.filter((s) => participa.has(s.id));
    }
    return { supervisor: opciones.supervisor, servicios: await this.resumirActivos(servicios, user) };
  }

  private serviciosActivos() {
    return this.dataSource.getRepository(Servicio).find({ where: { estado: In([...ESTADOS_ACTIVOS]) }, order: { fechaHoraAviso: 'DESC' }, take: 100 });
  }

  private async resumirActivos(servicios: Servicio[], user: AuthenticatedUser) {
    const tipos = await this.dataSource.getRepository(TipoServicio).find({ where: { id: In([...new Set(servicios.map((s) => s.tipoServicioId))]) } });
    const participantes = servicios.length ? await this.dataSource.getRepository(ServicioParticipante).find({ where: { servicioId: In(servicios.map((s) => s.id)) } }) : [];
    const moviles = servicios.length ? await this.dataSource.getRepository(Despacho).find({ where: { servicioId: In(servicios.map((s) => s.id)), estado: In(['DESPACHADO', 'EN_SERVICIO', 'REGRESANDO']) } }) : [];
    const tipoPorId = new Map(tipos.map((t) => [t.id, t.nombre]));
    const conf = await this.puedeConfidencial(user, '0xA006');
    const salida = servicios.map((s) => ({
      id: s.id, numeroServicio: s.numeroServicio, tipo: tipoPorId.get(s.tipoServicioId) ?? 'Servicio', estado: s.estado,
      gravedad: s.gravedad ?? null,
      fechaHoraAviso: s.fechaHoraAviso, personal: participantes.filter((p) => p.servicioId === s.id && !p.hasta && p.estado !== 'RETIRADO').length,
      enCamino: participantes.filter((p) => p.servicioId === s.id && !p.hasta && p.estado === 'EN_CAMINO').length,
      moviles: moviles.filter((m) => m.servicioId === s.id).length,
      direccion: conf ? s.direccion : null,
    }));
    if (conf && servicios.length) await this.auditar(user, 'ACCESO_CONFIDENCIAL', servicios[0].id, null, { campos: ['direccion'], servicios: servicios.length });
    return salida;
  }

  async detalle(servicioId: string, user: AuthenticatedUser) {
    await this.exigirPantalla(user, '0xA006', 'ver');
    const s = await this.servicioActivo(servicioId);
    const conf = await this.puedeConfidencial(user, '0xA006');
    const soyMiembro = await this.dataSource.getRepository(ServicioParticipante).findOne({ where: { servicioId, usuarioId: user.id, hasta: IsNull() } });
    const [tipo, participantes, moviles] = await Promise.all([
      this.dataSource.getRepository(TipoServicio).findOne({ where: { id: s.tipoServicioId } }),
      this.dataSource.getRepository(ServicioParticipante).find({ where: { servicioId, hasta: IsNull() }, order: { desde: 'ASC' } }),
      this.dataSource.getRepository(Despacho).find({ where: { servicioId, estado: In(['DESPACHADO', 'EN_SERVICIO', 'REGRESANDO']) } }),
    ]);
    if (conf) await this.auditar(user, 'ACCESO_CONFIDENCIAL', s.id, null, { campos: ['direccion', 'descripcion', 'coordenadas'] });
    return {
      id: s.id, numeroServicio: s.numeroServicio, tipo: tipo?.nombre ?? 'Servicio', estado: s.estado,
      fechaHoraAviso: s.fechaHoraAviso,
      hayConfidencial: true,
      direccion: conf ? s.direccion : null,
      descripcion: conf ? s.descripcion : null,
      coordenadasLat: conf ? s.coordenadasLat : null,
      coordenadasLon: conf ? s.coordenadasLon : null,
      soyParticipante: !!soyMiembro,
      miEstado: soyMiembro?.estado ?? null,
      participantes: participantes.map((p) => ({ usuarioId: p.usuarioId, nombre: p.usuarioNombre, rol: p.rol, estado: p.estado, desde: p.desde, llegadaEn: p.llegadaEn })),
      moviles: moviles.map((m) => ({ vehiculoId: m.vehiculoId, estado: m.estado, salida: m.horaSalida, llegada: m.horaLlegada })),
    };
  }

  async unirme(servicioId: string, user: AuthenticatedUser, ahora = new Date()) {
    await this.exigirPantalla(user, '0xA006', 'crear');
    await this.servicioActivo(servicioId);
    const repo = this.dataSource.getRepository(ServicioParticipante);
    const existente = await repo.findOne({ where: { servicioId, usuarioId: user.id } });
    if (existente && !existente.hasta && existente.estado !== 'RETIRADO') return existente;
    const guardado = existente
      ? await repo.save({ ...existente, estado: 'EN_CAMINO', desde: ahora, hasta: null, llegadaEn: null, version: existente.version + 1 })
      : await repo.save(repo.create({ servicioId, usuarioId: user.id, usuarioNombre: user.username, rol: null, estado: 'EN_CAMINO', solicitudId: null, desde: ahora, llegadaEn: null, hasta: null, version: 0 }));
    await this.auditar(user, 'INCORPORARSE_SERVICIO', servicioId, null, { participanteId: guardado.id });
    this.tiempoReal.emitir({ tipo: 'servicio_actualizado', servicioId, para: await this.idsParticipantes(servicioId), seguimiento: true, datos: { evento: 'participante' } });
    return guardado;
  }

  async cambiarEstadoParticipacion(servicioId: string, estado: 'EN_SITIO' | 'RETIRADO', user: AuthenticatedUser, ahora = new Date()) {
    await this.exigirPantalla(user, '0xA006', 'editar');
    const s = await this.servicioActivo(servicioId);
    const miembro = await this.miembro(servicioId, user);
    if (estado === 'EN_SITIO' && miembro.estado !== 'EN_CAMINO') throw new ConflictException('Solo puedes marcar llegada si estás en camino.');
    if (estado === 'RETIRADO' && miembro.estado === 'RETIRADO') throw new ConflictException('Ya registraste tu salida.');
    const actualizado = await this.dataSource.getRepository(ServicioParticipante).update(
      { id: miembro.id, version: miembro.version },
      { estado, llegadaEn: estado === 'EN_SITIO' ? ahora : miembro.llegadaEn, hasta: estado === 'RETIRADO' ? ahora : null, version: miembro.version + 1 },
    );
    if (!actualizado.affected) throw new ConflictException('El estado cambió desde otro dispositivo. Actualiza e intenta de nuevo.');
    const disponibilidad = await this.dataSource.getRepository(DisponibilidadPersonal).findOne({ where: { usuarioId: user.id } });
    if (disponibilidad) await this.dataSource.getRepository(DisponibilidadPersonal).update({ id: disponibilidad.id, version: disponibilidad.version }, {
      estado: estado === 'EN_SITIO' ? 'EN_SERVICIO' : 'AL_LLAMADO', solicitudId: estado === 'EN_SITIO' ? disponibilidad.solicitudId : null,
      desde: ahora, temporalHasta: null, version: disponibilidad.version + 1, actualizadoEn: ahora,
    });
    await this.auditar(user, estado === 'EN_SITIO' ? 'LLEGADA_SERVICIO' : 'SALIDA_SERVICIO', servicioId, { estado: miembro.estado }, { estado });
    this.tiempoReal.emitir({ tipo: 'servicio_actualizado', servicioId, para: await this.idsParticipantes(servicioId), seguimiento: true, datos: { estado } });
    return { servicioId, estado, ocurridoEn: ahora, servicioEstado: s.estado };
  }

  async mensajes(servicioId: string, user: AuthenticatedUser, desdeId?: string) {
    await this.exigirPantalla(user, '0xA007', 'ver');
    await this.servicioActivo(servicioId);
    await this.miembro(servicioId, user);
    const todos = await this.dataSource.getRepository(ServicioMensaje).find({ where: { servicioId }, order: { ocurridoEn: 'ASC' } });
    const desde = desdeId ? Number(desdeId) : null;
    return (desde === null ? todos : todos.filter((m) => Number(m.id) > desde)).slice(0, 200);
  }

  async enviarMensaje(servicioId: string, dto: EnviarMensajeDto, user: AuthenticatedUser, ahora = new Date()) {
    await this.exigirPantalla(user, '0xA007', 'crear');
    await this.servicioActivo(servicioId);
    await this.miembro(servicioId, user);
    const repo = this.dataSource.getRepository(ServicioMensaje);
    if (dto.clave) {
      const previo = await repo.findOne({ where: { servicioId, usuarioId: user.id, claveIdempotencia: dto.clave } });
      if (previo) return previo;
    }
    const mensaje = await repo.save(repo.create({ servicioId, usuarioId: user.id, usuarioNombre: user.username, texto: limpiarMensaje(dto.texto), ocurridoEn: instanteDelHecho(dto.ocurridoEn, ahora), registradoEn: ahora, claveIdempotencia: dto.clave ?? null }));
    await this.auditar(user, 'ENVIAR_MENSAJE_SERVICIO', servicioId, null, { mensajeId: mensaje.id });
    this.tiempoReal.emitir({ tipo: 'mensaje', servicioId, para: (await this.idsParticipantes(servicioId)).filter((id) => id !== user.id), seguimiento: true, datos: { id: mensaje.id, usuarioId: user.id, usuario: user.username, texto: mensaje.texto, ocurridoEn: mensaje.ocurridoEn } });
    return mensaje;
  }

  async formularios(servicioId: string, user: AuthenticatedUser) {
    await this.exigirPantalla(user, '0xA008', 'ver');
    const s = await this.servicioActivo(servicioId);
    const miembro = await this.miembro(servicioId, user);
    const [defs, propias] = await Promise.all([
      this.dataSource.getRepository(FormularioDefinicion).find({ where: { activo: true }, order: { nombre: 'ASC' } }),
      this.dataSource.getRepository(FormularioRespuesta).find({ where: { servicioId, creadoPor: user.id }, order: { creadoEn: 'DESC' } }),
    ]);
    const propiasPorDef = new Map(propias.map((r) => [r.definicionId, r]));
    const ctx = { tipoServicioId: s.tipoServicioId, estadoServicio: s.estado, roles: miembro.rol ? [miembro.rol] : [], permisos: user.permisos };
    const salida: Array<Record<string, unknown>> = [];
    const confidencial = await this.puedeConfidencial(user);
    for (const def of defs) {
      if (!formularioDisponible(def, ctx)) continue;
      if (def.confidencial && !confidencial) continue;
      const campos = parsearCampos(def.campos).filter((c) => confidencial || !c.confidencial);
      const r = propiasPorDef.get(def.id);
      salida.push({ definicion: { id: def.id, codigo: def.codigo, nombre: def.nombre, descripcion: def.descripcion, campos, version: def.version, etapa: def.etapa }, respuesta: r ? this.presentarRespuesta(r, def, confidencial) : null });
    }
    return salida;
  }

  async crearRespuesta(servicioId: string, dto: CrearRespuestaFormularioDto, user: AuthenticatedUser, ahora = new Date()) {
    await this.exigirPantalla(user, '0xA008', 'crear');
    const s = await this.servicioActivo(servicioId);
    const miembro = await this.miembro(servicioId, user);
    const def = await this.definicionDisponible(dto.definicionId, s, miembro, user);
    const campos = parsearCampos(def.campos);
    const conf = await this.puedeConfidencial(user);
    if (!conf && campos.some((c) => c.confidencial && Object.prototype.hasOwnProperty.call(dto.datos, c.clave))) throw new ForbiddenException('No tienes permiso para cargar campos confidenciales.');
    const datos = validarDatos(campos, dto.datos, dto.completar === true);
    const estado = dto.completar ? 'COMPLETADO' : 'BORRADOR';
    const ocurrido = instanteDelHecho(dto.ocurridoEn, ahora);
    const repo = this.dataSource.getRepository(FormularioRespuesta);
    const fila = await repo.save(repo.create({ servicioId, definicionId: def.id, definicionVersion: def.version, estado, datos: JSON.stringify(datos), creadoPor: user.id, creadoPorNombre: user.username, actualizadoEn: ahora, version: 1 }));
    await this.historialFormulario(fila, user, 'CREAR', null, datos, null, estado, ocurrido, ahora);
    await this.auditar(user, 'CREAR_FORMULARIO_SERVICIO', fila.id, null, { servicioId, definicion: def.codigo, estado });
    return this.presentarRespuesta(fila, def, conf);
  }

  async modificarRespuesta(id: string, dto: ModificarRespuestaFormularioDto, user: AuthenticatedUser, ahora = new Date()) {
    const repo = this.dataSource.getRepository(FormularioRespuesta);
    const r = await repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Formulario no encontrado.');
    await this.exigirPantalla(user, '0xA008', r.creadoPor === user.id ? 'editar' : 'eliminar');
    const s = await this.servicioActivo(r.servicioId);
    const miembro = await this.miembro(r.servicioId, user);
    const def = await this.definicionDisponible(r.definicionId, s, miembro, user);
    if (r.creadoPor !== user.id && !user.permisos.includes('despacho:formularios_admin')) throw new ForbiddenException('Solo puedes modificar el formulario que completaste.');
    if (r.estado === 'ANULADO') throw new ConflictException('El formulario está anulado.');
    if (r.version !== dto.version) throw new ConflictException('El formulario cambió en otro dispositivo. Recarga antes de editar.');
    const campos = parsearCampos(def.campos);
    const conf = await this.puedeConfidencial(user);
    if (!conf && campos.some((c) => c.confidencial && Object.prototype.hasOwnProperty.call(dto.datos, c.clave))) throw new ForbiddenException('No tienes permiso para cargar campos confidenciales.');
    const antes = JSON.parse(r.datos) as Record<string, unknown>;
    const despues = validarDatos(campos, dto.datos, dto.completar === true);
    const estado = dto.completar ? 'COMPLETADO' : 'BORRADOR';
    const ahoraHecho = instanteDelHecho(dto.ocurridoEn, ahora);
    const res = await repo.update({ id, version: dto.version }, { datos: JSON.stringify(despues), estado, actualizadoEn: ahora, version: r.version + 1 });
    if (!res.affected) throw new ConflictException('El formulario cambió en otro dispositivo. Recarga antes de editar.');
    const accion = dto.completar ? 'COMPLETAR' : 'MODIFICAR';
    await this.historialFormulario(r, user, accion, antes, despues, r.estado, estado, ahoraHecho, ahora);
    await this.auditar(user, 'MODIFICAR_FORMULARIO_SERVICIO', id, { claves: clavesCambiadas(antes, despues), estado: r.estado }, { claves: clavesCambiadas(antes, despues), estado });
    const guardada = await repo.findOneByOrFail({ id });
    return this.presentarRespuesta(guardada, def, conf);
  }

  async anularRespuesta(id: string, dto: AnularRespuestaFormularioDto, user: AuthenticatedUser, ahora = new Date()) {
    const repo = this.dataSource.getRepository(FormularioRespuesta);
    const r = await repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Formulario no encontrado.');
    await this.exigirPantalla(user, '0xA008', r.creadoPor === user.id ? 'editar' : 'eliminar');
    await this.servicioActivo(r.servicioId);
    await this.miembro(r.servicioId, user);
    if (r.creadoPor !== user.id && !user.permisos.includes('despacho:formularios_admin')) throw new ForbiddenException('Solo puedes anular el formulario que completaste.');
    if (r.version !== dto.version) throw new ConflictException('El formulario cambió en otro dispositivo. Recarga antes de editar.');
    if (r.estado === 'ANULADO') throw new ConflictException('El formulario ya está anulado.');
    const res = await repo.update({ id, version: dto.version }, { estado: 'ANULADO', actualizadoEn: ahora, version: r.version + 1 });
    if (!res.affected) throw new ConflictException('El formulario cambió en otro dispositivo.');
    await this.historialFormulario(r, user, 'ANULAR', JSON.parse(r.datos), null, r.estado, 'ANULADO', ahora, ahora);
    await this.auditar(user, 'ANULAR_FORMULARIO_SERVICIO', id, { estado: r.estado }, { estado: 'ANULADO', motivo: dto.motivo ?? null });
    return { id, estado: 'ANULADO', version: r.version + 1 };
  }

  async historialRespuesta(id: string, user: AuthenticatedUser) {
    const r = await this.dataSource.getRepository(FormularioRespuesta).findOne({ where: { id } });
    if (!r) throw new NotFoundException('Formulario no encontrado.');
    await this.exigirPantalla(user, '0xA008', 'ver');
    await this.miembro(r.servicioId, user);
    if (r.creadoPor !== user.id && !user.permisos.includes('despacho:formularios_admin')) throw new ForbiddenException('No puedes consultar el historial de otro participante.');
    const filas = await this.dataSource.getRepository(FormularioHistorial).find({ where: { respuestaId: id }, order: { id: 'ASC' } });
    const def = await this.dataSource.getRepository(FormularioDefinicion).findOne({ where: { id: r.definicionId } });
    const campos = parsearCampos(def?.campos ?? '[]');
    const conf = await this.puedeConfidencial(user);
    return filas.map((h) => ({ ...h, datosAntes: h.datosAntes ? redactarDatos(campos, JSON.parse(h.datosAntes), conf).datos : null, datosDespues: h.datosDespues ? redactarDatos(campos, JSON.parse(h.datosDespues), conf).datos : null }));
  }

  async guardarDefinicion(dto: DefinicionFormularioDto, user: AuthenticatedUser) {
    const campos = validarCampos(dto.campos);
    const repo = this.dataSource.getRepository(FormularioDefinicion);
    const existente = await repo.findOne({ where: { codigo: dto.codigo } });
    const fila = repo.create({
      id: existente?.id, codigo: dto.codigo, nombre: dto.nombre, descripcion: dto.descripcion ?? null,
      campos: JSON.stringify(campos), tiposServicio: dto.tiposServicio ? JSON.stringify(dto.tiposServicio) : null,
      roles: dto.roles ? JSON.stringify(dto.roles) : null, permisoRequerido: dto.permisoRequerido ?? null,
      etapa: dto.etapa ?? null, confidencial: dto.confidencial ?? false, activo: dto.activo ?? true,
      version: (existente?.version ?? 0) + 1, creadoEn: existente?.creadoEn, actualizadoEn: new Date(),
    });
    const guardada = await repo.save(fila);
    await this.auditar(user, existente ? 'EDITAR_DEFINICION_FORMULARIO' : 'CREAR_DEFINICION_FORMULARIO', guardada.id, existente ? { version: existente.version } : null, { codigo: guardada.codigo, version: guardada.version });
    return { ...guardada, campos };
  }

  private async definicionDisponible(defId: string, s: Servicio, miembro: ServicioParticipante, user: AuthenticatedUser) {
    const def = await this.dataSource.getRepository(FormularioDefinicion).findOne({ where: { id: defId } });
    if (!def) throw new NotFoundException('Formulario no encontrado.');
    const ctx = { tipoServicioId: s.tipoServicioId, estadoServicio: s.estado, roles: miembro.rol ? [miembro.rol] : [], permisos: user.permisos };
    if (!formularioDisponible(def, ctx)) throw new ForbiddenException('Este formulario no corresponde a tu rol o a esta etapa del servicio.');
    if (def.confidencial && !(await this.puedeConfidencial(user))) throw new ForbiddenException('No tienes permiso para ver este formulario confidencial.');
    return def;
  }

  private presentarRespuesta(r: FormularioRespuesta, def: FormularioDefinicion, conf: boolean) {
    const campos = parsearCampos(def.campos);
    const datos = redactarDatos(campos, JSON.parse(r.datos), conf).datos;
    return { id: r.id, definicionId: r.definicionId, definicionVersion: r.definicionVersion, estado: r.estado, datos, creadoPor: r.creadoPorNombre, creadoEn: r.creadoEn, actualizadoEn: r.actualizadoEn, version: r.version };
  }

  private async historialFormulario(r: FormularioRespuesta, user: AuthenticatedUser, accion: 'CREAR' | 'MODIFICAR' | 'COMPLETAR' | 'ANULAR', antes: unknown, despues: unknown, estadoAntes: string | null, estadoDespues: string | null, ocurridoEn: Date, registradoEn: Date) {
    const repo = this.dataSource.getRepository(FormularioHistorial);
    await repo.save(repo.create({ respuestaId: r.id, usuarioId: user.id, usuarioNombre: user.username, accion, datosAntes: antes === null ? null : JSON.stringify(antes), datosDespues: despues === null ? null : JSON.stringify(despues), estadoAntes, estadoDespues, ocurridoEn, registradoEn }));
  }

  /** Mapa: estado de cada integrante y de los moviles. La ubicacion exacta es informacion confidencial. */
  async mapa(servicioId: string, user: AuthenticatedUser) {
    await this.exigirPantalla(user, '0xA00E', 'ver');
    const s = await this.servicioActivo(servicioId);
    const [miembro, conf] = await Promise.all([
      this.dataSource.getRepository(ServicioParticipante).findOne({
        where: { servicioId, usuarioId: user.id, hasta: IsNull() },
      }),
      this.puedeConfidencial(user, '0xA00E'),
    ]);
    if (!miembro && !user.permisos.includes('despacho:seguimiento')) {
      throw new ForbiddenException('El mapa operativo es solo para integrantes y personal de seguimiento.');
    }
    const [ps, despachos] = await Promise.all([
      this.dataSource.getRepository(ServicioParticipante).find({ where: { servicioId } }),
      this.dataSource.getRepository(Despacho).find({ where: { servicioId, estado: In(['DESPACHADO', 'EN_SERVICIO', 'REGRESANDO']) } }),
    ]);
    const vehiculos = despachos.length ? await this.dataSource.getRepository(Vehiculo).find({ where: { id: In(despachos.map((d) => d.vehiculoId)) } }) : [];
    const posiciones = despachos.length && conf ? await this.dataSource.getRepository(PosicionMovil).find({ where: { vehiculoId: In(despachos.map((d) => d.vehiculoId)) } }) : [];
    if (conf) await this.auditar(user, 'ACCESO_CONFIDENCIAL', s.id, null, { campos: ['ubicacion'] });
    return {
      mapaBase: {
        urlTeselas: process.env.SIGBO_MAP_TILES_URL?.trim() || null,
        atribucion: process.env.SIGBO_MAP_ATTRIBUTION?.trim() || 'Cartografia institucional',
      },
      servicio: {
        id: s.id, numeroServicio: s.numeroServicio, estado: s.estado, ubicacionRestringida: !conf,
        ubicacion: conf && s.coordenadasLat != null ? { latitud: s.coordenadasLat, longitud: s.coordenadasLon, direccion: s.direccion } : null,
      },
      moviles: despachos.map((d) => {
        const v = vehiculos.find((x) => x.id === d.vehiculoId);
        const pos = posiciones.filter((x) => x.vehiculoId === d.vehiculoId).sort((a, b) => new Date(b.registradoEn).getTime() - new Date(a.registradoEn).getTime())[0];
        return { movil: v ? `Móvil ${v.numeroInterno}${v.alias ? ` — ${v.alias}` : ''}` : 'Móvil', estado: d.estado, posicion: conf && pos ? { latitud: pos.latitud, longitud: pos.longitud, registradoEn: pos.registradoEn } : null };
      }),
      personal: ps.map((p) => ({ nombre: p.usuarioNombre, estado: p.estado, desde: p.desde, llegadaEn: p.llegadaEn, hasta: p.hasta })),
      resumen: { enCamino: ps.filter((p) => p.estado === 'EN_CAMINO' && !p.hasta).length, enSitio: ps.filter((p) => p.estado === 'EN_SITIO' && !p.hasta).length, retirados: ps.filter((p) => p.estado === 'RETIRADO' || p.hasta).length },
    };
  }

  private async idsParticipantes(servicioId: string) {
    return (await this.dataSource.getRepository(ServicioParticipante).find({ where: { servicioId, hasta: IsNull() } })).filter((p) => p.estado !== 'RETIRADO').map((p) => p.usuarioId);
  }

  private auditar(user: AuthenticatedUser, accion: string, recursoId: string, antes: unknown, despues: unknown) {
    return this.auditoria.registrar({ usuarioId: user.id, accion, recurso: 'servicios.operacion', recursoId, datosAntes: antes ?? undefined, datosDespues: despues });
  }
}
