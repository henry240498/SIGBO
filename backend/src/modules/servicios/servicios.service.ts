import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import {
  Bombero,
  ComunicacionServicio,
  LogAuditoria,
  Servicio,
  TipoServicio,
  Vehiculo,
} from '../../shared/entities';
import { CambiarEstadoComunicacionDto } from './dto/cambiar-estado-comunicacion.dto';
import { GuardarComunicacionDto } from './dto/guardar-comunicacion.dto';
import { generarPdfComunicacion } from './comunicacion-servicio.pdf';

type Formulario = Record<string, unknown>;

const MAX_FORMULARIO_BYTES = 4 * 1024 * 1024;
const ESTADOS_EDITABLES: ComunicacionServicio['estado'][] = ['BORRADOR', 'OBSERVADO'];
const TRANSICIONES: Record<ComunicacionServicio['estado'], ComunicacionServicio['estado'][]> = {
  BORRADOR: ['PENDIENTE_REVISION', 'FINALIZADA', 'ANULADO'],
  PENDIENTE_REVISION: ['OBSERVADO', 'FINALIZADA', 'ANULADO'],
  OBSERVADO: ['PENDIENTE_REVISION', 'FINALIZADA', 'ANULADO'],
  FINALIZADA: ['OBSERVADO'],
  ANULADO: [],
};

const OPCIONES_CATALOGO = {
  categoriasOtras: [
    ['ACCIDENTE', 'Accidente'], ['ANIMALES', 'Animales'], ['TRANSPORTE', 'Transporte'],
    ['RESCATE', 'Rescate'], ['COBERTURA', 'Cobertura'], ['OTRO_SERVICIO', 'Otro servicio'],
  ],
  tiposIncendio: [
    ['ESTRUCTURAL', 'Estructural'], ['FORESTAL_PASTIZAL', 'Forestal Pastizal'],
    ['FORESTAL_BOSQUE', 'Forestal Bosque'], ['VEHICULAR', 'Vehicular'], ['BASURAL', 'Basural'],
    ['ELECTRICO', 'Eléctrico'], ['MATPEL', 'MAT-PEL'], ['OTRO', 'Otro'],
  ],
  tiposAccidente: [['CHOQUE', 'Choque'], ['ARROLLAMIENTO', 'Arrollamiento'], ['VUELCO', 'Vuelco'], ['CAIDA', 'Caída'], ['OTRO', 'Otro']],
  tiposRescate: [['ACCIDENTE', 'Accidente'], ['VERTICAL', 'Vertical'], ['VIVIENDA', 'Vivienda'], ['ACUATICO', 'Acuático'], ['OTRO', 'Otro']],
  magnitudesIncendio: [['PRINCIPIO', 'Principio'], ['PEQUENA', 'Pequeña'], ['MEDIANA', 'Mediana'], ['GRANDE', 'Grande'], ['EMERGENCIA_GENERAL', 'Emergencia general']],
  unidadesSuperficie: [['METROS_CUADRADOS', 'Metros cuadrados'], ['HECTAREAS', 'Hectáreas']],
  posicionesNomina: ['SCI', ...Array.from({ length: 20 }, (_, index) => `B${index + 1}`), 'RO1', 'RO2'].map((codigo) => [codigo, codigo]),
};

@Injectable()
export class ServiciosService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(TipoServicio) private readonly tipoRepo: Repository<TipoServicio>,
    @InjectRepository(ComunicacionServicio) private readonly comunicacionRepo: Repository<ComunicacionServicio>,
    @InjectRepository(LogAuditoria) private readonly auditoriaRepo: Repository<LogAuditoria>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>,
  ) {}

  async listar() {
    const comunicaciones = await this.comunicacionRepo.find({ order: { actualizadoEn: 'DESC' } });
    if (comunicaciones.length === 0) return [];
    const servicios = await this.servicioRepo.find({ where: { id: In(comunicaciones.map((item) => item.servicioId)) } });
    const porId = new Map(servicios.map((servicio) => [servicio.id, servicio]));
    return comunicaciones.map((comunicacion) => this.presentar(comunicacion, porId.get(comunicacion.servicioId)));
  }

  async obtener(id: string) {
    const comunicacion = await this.comunicacionRepo.findOne({ where: { id } });
    if (!comunicacion) throw new NotFoundException(`Comunicación ${id} no encontrada`);
    const servicio = await this.servicioRepo.findOne({ where: { id: comunicacion.servicioId } });
    return this.presentar(comunicacion, servicio ?? undefined);
  }

  /** Catálogos de valores estables y referencias operativas sin exponer datos de contacto. */
  async catalogos(q?: string) {
    const [bomberos, vehiculos] = await Promise.all([
      this.bomberoRepo.find({
        select: { id: true, numeroBombero: true, nombre: true, apellido: true },
        where: { estado: 'ACTIVO' },
        order: { apellido: 'ASC', nombre: 'ASC' },
      }),
      this.vehiculoRepo.find({
        select: { id: true, numeroInterno: true, marca: true, modelo: true },
        where: { estado: 'OPERATIVO' },
        order: { numeroInterno: 'ASC' },
      }),
    ]);
    const coincide = (texto: string) => !q || this.normalizarBusqueda(texto).includes(this.normalizarBusqueda(q));
    return {
      tiposComunicacion: [
        { codigo: 'OTRAS_OCURRENCIAS', nombre: 'Comunicación de otras ocurrencias' },
        { codigo: 'INCENDIO', nombre: 'Comunicación de incendio' },
      ],
      personal: bomberos
        .map((bombero) => ({ id: bombero.id, codigo: bombero.numeroBombero, nombre: `${bombero.nombre} ${bombero.apellido}`.trim() }))
        .filter((item) => coincide(`${item.codigo} ${item.nombre}`)),
      moviles: vehiculos
        .map((vehiculo) => ({ id: vehiculo.id, codigo: vehiculo.numeroInterno, nombre: [vehiculo.numeroInterno, vehiculo.marca, vehiculo.modelo].filter(Boolean).join(' · ') }))
        .filter((item) => coincide(`${item.codigo} ${item.nombre}`)),
      opciones: Object.fromEntries(Object.entries(OPCIONES_CATALOGO).map(([clave, valores]) => [clave, valores.map(([codigo, nombre]) => ({ codigo, nombre }))])),
      institucionesApoyo: [
        { codigo: 'HOSPITAL', nombre: 'Hospital' }, { codigo: 'POLICIA_NACIONAL', nombre: 'Policía Nacional' },
        { codigo: 'PATRULLA_CAMINERA', nombre: 'Patrulla Caminera' }, { codigo: 'FISCALIA', nombre: 'Fiscalía' },
        { codigo: 'OTRO', nombre: 'Otro' },
      ],
    };
  }

  async crear(dto: GuardarComunicacionDto, usuarioId: string) {
    this.validarTipo(dto.tipo);
    const formulario = this.normalizarFormulario(dto.formulario);
    this.validarFormato(dto.tipo, formulario, false);

    // SERIALIZABLE + UPDLOCK en siguienteNumero evita números duplicados ante dos guardados simultáneos.
    for (let intento = 0; intento < 3; intento += 1) {
      try {
        const creado = await this.transaccion(async (manager) => {
          const tipoServicio = await this.obtenerTipo(manager, dto.tipo);
          const servicioRepo = manager.getRepository(Servicio);
          const comunicacionRepo = manager.getRepository(ComunicacionServicio);
          const servicio = await servicioRepo.save(servicioRepo.create({
            tipoServicioId: tipoServicio.id,
            numeroServicio: await this.siguienteNumero(manager),
            ...this.camposOperativos(formulario),
            estado: 'REGISTRADO',
            creadoPor: usuarioId,
          } as Servicio));
          const comunicacion = await comunicacionRepo.save(comunicacionRepo.create({
            servicioId: servicio.id,
            tipo: dto.tipo,
            estado: 'BORRADOR',
            datos: JSON.stringify(formulario),
            version: 1,
            actualizadoPor: usuarioId,
            finalizadoPor: null,
            finalizadoEn: null,
            motivoEstado: null,
          }));
          await this.registrarAuditoria(manager, usuarioId, 'CREAR', comunicacion.id, undefined, { tipo: dto.tipo, estado: comunicacion.estado, version: 1 });
          return { comunicacion, servicio };
        });
        return this.presentar(creado.comunicacion, creado.servicio);
      } catch (error) {
        if (intento < 2 && this.esViolacionUnica(error)) continue;
        throw error;
      }
    }
    throw new ConflictException('No se pudo asignar un número único a la comunicación');
  }

  async actualizar(id: string, dto: GuardarComunicacionDto, usuarioId: string) {
    this.validarTipo(dto.tipo);
    const formulario = this.normalizarFormulario(dto.formulario);
    this.validarFormato(dto.tipo, formulario, false);
    const actualizado = await this.transaccion(async (manager) => {
      const comunicacion = await this.obtenerBloqueada(manager, id);
      this.verificarVersion(comunicacion, dto.version);
      if (!ESTADOS_EDITABLES.includes(comunicacion.estado)) {
        throw new ConflictException('Solo se pueden editar comunicaciones en borrador u observadas');
      }
      const tipoServicio = await this.obtenerTipo(manager, dto.tipo);
      const servicioRepo = manager.getRepository(Servicio);
      const comunicacionRepo = manager.getRepository(ComunicacionServicio);
      const servicio = await servicioRepo.findOne({ where: { id: comunicacion.servicioId } });
      if (!servicio) throw new NotFoundException(`Servicio operativo ${comunicacion.servicioId} no encontrado`);
      await servicioRepo.update(servicio.id, { tipoServicioId: tipoServicio.id, ...this.camposOperativos(formulario) } as Partial<Servicio>);
      await comunicacionRepo.update(id, {
        tipo: dto.tipo,
        datos: JSON.stringify(formulario),
        actualizadoPor: usuarioId,
        version: comunicacion.version + 1,
      });
      const nuevaComunicacion = await comunicacionRepo.findOneByOrFail({ id });
      const nuevoServicio = await servicioRepo.findOneByOrFail({ id: servicio.id });
      await this.registrarAuditoria(manager, usuarioId, 'ACTUALIZAR', id, this.resumen(comunicacion), this.resumen(nuevaComunicacion));
      return { comunicacion: nuevaComunicacion, servicio: nuevoServicio };
    });
    return this.presentar(actualizado.comunicacion, actualizado.servicio);
  }

  async finalizar(id: string, usuarioId: string) {
    const finalizado = await this.transaccion(async (manager) => {
      const comunicacion = await this.obtenerBloqueada(manager, id);
      const servicioRepo = manager.getRepository(Servicio);
      const comunicacionRepo = manager.getRepository(ComunicacionServicio);
      const servicio = await servicioRepo.findOne({ where: { id: comunicacion.servicioId } });
      if (!servicio) throw new NotFoundException(`Servicio operativo ${comunicacion.servicioId} no encontrado`);
      if (comunicacion.estado === 'FINALIZADA') return { comunicacion, servicio };
      this.asegurarTransicion(comunicacion.estado, 'FINALIZADA');
      const formulario = this.parsearDatos(comunicacion.datos);
      this.validarFinalizacion(comunicacion.tipo, formulario);
      await servicioRepo.update(servicio.id, { estado: 'FINALIZADO' });
      await comunicacionRepo.update(id, {
        estado: 'FINALIZADA', finalizadoEn: new Date(), finalizadoPor: usuarioId,
        actualizadoPor: usuarioId, version: comunicacion.version + 1, motivoEstado: null,
      });
      const nuevaComunicacion = await comunicacionRepo.findOneByOrFail({ id });
      const nuevoServicio = await servicioRepo.findOneByOrFail({ id: servicio.id });
      await this.registrarAuditoria(manager, usuarioId, 'FINALIZAR', id, this.resumen(comunicacion), this.resumen(nuevaComunicacion));
      return { comunicacion: nuevaComunicacion, servicio: nuevoServicio };
    });
    return this.presentar(finalizado.comunicacion, finalizado.servicio);
  }

  enviarRevision(id: string, dto: CambiarEstadoComunicacionDto, usuarioId: string) {
    return this.cambiarEstado(id, 'PENDIENTE_REVISION', dto, usuarioId, 'ENVIAR_REVISION');
  }

  async observar(id: string, dto: CambiarEstadoComunicacionDto, usuarioId: string) {
    this.exigirMotivo(dto.motivo, 'observación');
    return this.cambiarEstado(id, 'OBSERVADO', dto, usuarioId, 'OBSERVAR');
  }

  async reabrir(id: string, dto: CambiarEstadoComunicacionDto, usuarioId: string) {
    this.exigirMotivo(dto.motivo, 'reapertura');
    return this.cambiarEstado(id, 'OBSERVADO', dto, usuarioId, 'REABRIR');
  }

  async anular(id: string, dto: CambiarEstadoComunicacionDto, usuarioId: string) {
    this.exigirMotivo(dto.motivo, 'anulación');
    return this.cambiarEstado(id, 'ANULADO', dto, usuarioId, 'ANULAR');
  }

  async eliminar(id: string, usuarioId: string) {
    await this.transaccion(async (manager) => {
      const comunicacion = await this.obtenerBloqueada(manager, id);
      if (comunicacion.estado !== 'BORRADOR') throw new ConflictException('Solo se pueden eliminar borradores');
      await manager.getRepository(Servicio).delete(comunicacion.servicioId); // FK CASCADE elimina la comunicación.
      await this.registrarAuditoria(manager, usuarioId, 'ELIMINAR_BORRADOR', id, this.resumen(comunicacion), undefined);
    });
    return { id, eliminado: true };
  }

  async generarPdf(id: string, usuarioId: string) {
    const comunicacion = await this.comunicacionRepo.findOne({ where: { id } });
    if (!comunicacion) throw new NotFoundException(`Comunicación ${id} no encontrada`);
    const servicio = await this.servicioRepo.findOne({ where: { id: comunicacion.servicioId } });
    if (!servicio) throw new NotFoundException(`Servicio operativo ${comunicacion.servicioId} no encontrado`);
    const buffer = await generarPdfComunicacion(comunicacion, servicio, this.parsearDatos(comunicacion.datos));
    await this.transaccion((manager) => this.registrarAuditoria(manager, usuarioId, 'EXPORTAR_PDF', id, undefined, { estado: comunicacion.estado, version: comunicacion.version }));
    return { buffer, nombreArchivo: `comunicacion-${servicio.numeroServicio}.pdf` };
  }

  private async cambiarEstado(id: string, estado: ComunicacionServicio['estado'], dto: CambiarEstadoComunicacionDto, usuarioId: string, accion: string) {
    const resultado = await this.transaccion(async (manager) => {
      const comunicacion = await this.obtenerBloqueada(manager, id);
      this.verificarVersion(comunicacion, dto.version);
      this.asegurarTransicion(comunicacion.estado, estado);
      const servicioRepo = manager.getRepository(Servicio);
      const comunicacionRepo = manager.getRepository(ComunicacionServicio);
      const servicio = await servicioRepo.findOne({ where: { id: comunicacion.servicioId } });
      if (!servicio) throw new NotFoundException(`Servicio operativo ${comunicacion.servicioId} no encontrado`);
      const motivo = this.motivoNormalizado(dto.motivo);
      await comunicacionRepo.update(id, { estado, motivoEstado: motivo, actualizadoPor: usuarioId, version: comunicacion.version + 1 });
      if (estado === 'ANULADO') await servicioRepo.update(servicio.id, { estado: 'CANCELADO' });
      if (estado === 'OBSERVADO' && comunicacion.estado === 'FINALIZADA') await servicioRepo.update(servicio.id, { estado: 'REGISTRADO' });
      const nuevaComunicacion = await comunicacionRepo.findOneByOrFail({ id });
      const nuevoServicio = await servicioRepo.findOneByOrFail({ id: servicio.id });
      await this.registrarAuditoria(manager, usuarioId, accion, id, this.resumen(comunicacion), { ...this.resumen(nuevaComunicacion), motivo });
      return { comunicacion: nuevaComunicacion, servicio: nuevoServicio };
    });
    return this.presentar(resultado.comunicacion, resultado.servicio);
  }

  private async transaccion<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction('SERIALIZABLE', callback);
  }

  private async obtenerBloqueada(manager: EntityManager, id: string) {
    const comunicacion = await manager.getRepository(ComunicacionServicio).findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
    if (!comunicacion) throw new NotFoundException(`Comunicación ${id} no encontrada`);
    return comunicacion;
  }

  private async obtenerTipo(manager: EntityManager, tipo: GuardarComunicacionDto['tipo']) {
    const codigo = tipo === 'INCENDIO' ? 'COM_INCENDIO' : 'COM_OTRAS';
    const repo = manager.getRepository(TipoServicio);
    let tipoServicio = await repo.findOne({ where: { codigo } });
    if (!tipoServicio) {
      tipoServicio = await repo.save(repo.create({
        codigo,
        nombre: tipo === 'INCENDIO' ? 'Comunicación de incendio' : 'Comunicación de otras ocurrencias',
        descripcion: 'Registro digital de comunicación de servicios', color: tipo === 'INCENDIO' ? '#D94B3D' : '#31A8B8',
        prioridad: 0, requiereRo: false, requiereVehiculo: false, activo: true,
      }));
    }
    return tipoServicio;
  }

  private async siguienteNumero(manager: EntityManager) {
    const prefijo = `CS-${new Date().getFullYear()}-`;
    const filas = await manager.query(
      `SELECT ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(numero_servicio, LEN(@0) + 1, 20))), 0) + 1 AS siguiente
       FROM servicios.servicios WITH (UPDLOCK, HOLDLOCK)
       WHERE numero_servicio LIKE @1`,
      [prefijo, `${prefijo}%`],
    ) as Array<{ siguiente: number | string }>;
    const siguiente = Number(filas[0]?.siguiente);
    if (!Number.isSafeInteger(siguiente) || siguiente < 1) throw new ConflictException('No se pudo calcular el número de comunicación');
    return `${prefijo}${String(siguiente).padStart(5, '0')}`;
  }

  private camposOperativos(formulario: Formulario): Partial<Servicio> {
    const fecha = this.textoCampo(formulario, 'fechaServicio', 'fecha') || new Date().toISOString().slice(0, 10);
    const denuncia = this.textoCampo(formulario, 'horaDenuncia', 'denuncia') || '00:00';
    const salida = this.textoCampo(formulario, 'horaSalidaGeneral', 'salida');
    const enBase = this.textoCampo(formulario, 'horaEnBaseGeneral', 'enBase');
    return {
      fechaHoraAviso: this.fechaHora(fecha, denuncia),
      fechaHoraSalida: salida ? this.fechaHora(fecha, salida) : null,
      fechaHoraFin: enBase ? this.fechaHora(fecha, enBase, salida) : null,
      direccion: this.textoCampo(formulario, 'direccion'),
      ciudad: this.textoCampo(formulario, 'localidad') || null,
      coordenadasLat: this.coordenada(formulario.coordenadasLat, 'latitud', -90, 90),
      coordenadasLon: this.coordenada(formulario.coordenadasLon, 'longitud', -180, 180),
      descripcion: this.textoCampo(formulario, 'tareasEjecutadas', 'tareas') || null,
      informe: this.textoCampo(formulario, 'datosInteres') || null,
      tiempoTotalMinutos: this.duracion(salida, enBase),
    };
  }

  private validarFinalizacion(tipo: ComunicacionServicio['tipo'], formulario: Formulario) {
    this.validarFormato(tipo, formulario, true);
    const faltantes: string[] = [];
    if (!this.textoCampo(formulario, 'fechaServicio', 'fecha')) faltantes.push('fecha del servicio');
    if (!this.textoCampo(formulario, 'horaDenuncia', 'denuncia')) faltantes.push('hora de denuncia');
    if (!this.textoCampo(formulario, 'horaSalidaGeneral', 'salida')) faltantes.push('hora general de salida');
    if (!this.textoCampo(formulario, 'horaEnBaseGeneral', 'enBase')) faltantes.push('hora general de regreso a base');
    if (!this.textoCampo(formulario, 'recibidoPor', 'recibidoPorPersonaId')) faltantes.push('recibido por');
    if (!this.textoCampo(formulario, 'localidad') && !this.textoCampo(formulario, 'barrioCompania', 'barrio') && !this.textoCampo(formulario, 'direccion')) faltantes.push('ubicación del servicio');
    if (!this.textoCampo(formulario, 'comandanteIncidente', 'comandante', 'oficialACargo')) faltantes.push('comandante de incidente u oficial a cargo');
    const categorias = tipo === 'INCENDIO'
      ? this.listaCampo(formulario, 'tiposIncendio', 'incendioTipo')
      : this.listaCampo(formulario, 'categorias');
    if (categorias.length === 0) faltantes.push('al menos una categoría o tipo de ocurrencia');
    const moviles = this.movilesSeleccionados(formulario);
    if (moviles.length === 0 && !this.textoCampo(formulario, 'sinDespachoJustificacion')) faltantes.push('al menos un móvil despachado o su justificación');
    const falsaAlarma = this.esVerdadero(this.valorCampo(formulario, 'falsaAlarma'));
    if (!this.textoCampo(formulario, 'tareasEjecutadas', 'tareas') && (!falsaAlarma || !this.textoCampo(formulario, 'datosInteres', 'justificacionNoIntervencion'))) {
      faltantes.push('tareas ejecutadas o explicación de falsa alarma/no intervención');
    }
    if (faltantes.length) throw new BadRequestException(`Faltan datos para finalizar: ${faltantes.join(', ')}`);
  }

  private validarFormato(tipo: ComunicacionServicio['tipo'], formulario: Formulario, alFinalizar: boolean) {
    const fecha = this.textoCampo(formulario, 'fechaServicio', 'fecha');
    if (fecha && !this.esFecha(fecha)) throw new BadRequestException('La fecha del servicio debe tener formato AAAA-MM-DD');
    for (const [campo, etiqueta] of [
      ['horaDenuncia', 'hora de denuncia'], ['denuncia', 'hora de denuncia'], ['horaSalidaGeneral', 'hora de salida'], ['salida', 'hora de salida'], ['horaEnBaseGeneral', 'hora de regreso a base'], ['enBase', 'hora de regreso a base'],
    ]) {
      const valor = this.textoCampo(formulario, campo);
      if (valor && !this.esHora(valor)) throw new BadRequestException(`La ${etiqueta} debe tener formato HH:mm`);
    }
    for (const campo of ['facturaMontoTotal', 'facturaMonto', 'aguaLitros', 'espumaLitros', 'pqsKilogramos', 'superficie']) this.validarDecimalNoNegativo(this.valorCampo(formulario, campo), campo);
    const facturaActiva = this.esVerdadero(this.valorCampo(formulario, 'facturaActiva')) || !!this.textoCampo(formulario, 'facturaNumero') || this.tieneValor(this.valorCampo(formulario, 'facturaMontoTotal', 'facturaMonto'));
    if (facturaActiva && alFinalizar && (!this.textoCampo(formulario, 'facturaNumero') || !this.tieneValor(this.valorCampo(formulario, 'facturaMontoTotal', 'facturaMonto')))) {
      throw new BadRequestException('La factura requiere número y monto total');
    }
    if (this.tieneValor(this.valorCampo(formulario, 'superficie')) && !this.textoCampo(formulario, 'unidadSuperficie')) throw new BadRequestException('La superficie requiere unidad de medida');
    for (const campo of ['accidenteAfectados', 'transportados', 'rescatados']) this.validarConteos(this.valorCampo(formulario, campo), campo, alFinalizar);
    this.validarPersonas(this.valorCampo(formulario, 'personas', 'personasInvolucradas'));
    this.validarMoviles(formulario, alFinalizar);
    this.validarOtros(tipo, formulario, alFinalizar);
    this.validarCoordenadas(formulario);
  }

  private validarMoviles(formulario: Formulario, alFinalizar: boolean) {
    const vistos = new Set<string>();
    for (const movil of this.movilesSeleccionados(formulario)) {
      const clave = this.texto(movil.movilId) || this.texto(movil.movil);
      if (clave) {
        if (vistos.has(clave.toLowerCase())) throw new BadRequestException('No se puede repetir un móvil despachado');
        vistos.add(clave.toLowerCase());
      }
      const salida = this.texto(movil.horaSalida) || this.texto(movil.salida);
      const enBase = this.texto(movil.horaEnBase) || this.texto(movil.enBase);
      if (salida && !this.esHora(salida)) throw new BadRequestException('La hora de salida de un móvil debe tener formato HH:mm');
      if (enBase && !this.esHora(enBase)) throw new BadRequestException('La hora de regreso de un móvil debe tener formato HH:mm');
      if (alFinalizar && (!this.texto(movil.choferPersonaId) && !this.texto(movil.chofer))) throw new BadRequestException('Cada móvil despachado debe indicar chofer');
      if (alFinalizar && (!salida || !enBase)) throw new BadRequestException('Cada móvil despachado debe indicar salida y regreso a base');
      const inicial = this.validarDecimalNoNegativo(movil.kilometrajeInicial ?? movil.kmInicial, 'kilometraje inicial');
      const final = this.validarDecimalNoNegativo(movil.kilometrajeFinal ?? movil.kmFinal, 'kilometraje final');
      if (inicial !== null && final !== null && final < inicial && !this.texto(movil.justificacionKilometraje)) throw new BadRequestException('El kilometraje final no puede ser menor al inicial sin justificación');
    }
  }

  private validarConteos(valor: unknown, etiqueta: string, alFinalizar: boolean) {
    const registros = this.registros(valor, etiqueta);
    for (const registro of registros) {
      if (!this.esVerdadero(registro.seleccionado)) continue;
      const cantidad = this.validarEnteroNoNegativo(registro.cantidad, `cantidad de ${etiqueta}`);
      if (alFinalizar && cantidad === null) throw new BadRequestException(`La cantidad de ${etiqueta} es obligatoria cuando se selecciona una fila`);
      if (this.esOtro(this.texto(registro.tipo)) && alFinalizar && !this.texto(registro.otroDescripcion) && !this.texto(registro.datos)) {
        throw new BadRequestException(`La descripción de Otro en ${etiqueta} es obligatoria`);
      }
    }
  }

  private validarPersonas(valor: unknown) {
    if (valor === undefined || valor === null || valor === '') return;
    if (!Array.isArray(valor)) throw new BadRequestException('Las personas involucradas deben ser una lista');
    for (const persona of valor) {
      if (!persona || typeof persona !== 'object' || Array.isArray(persona)) throw new BadRequestException('Cada persona involucrada debe ser un objeto');
      this.validarEnteroNoNegativo((persona as Formulario).edad, 'edad');
    }
  }

  private validarOtros(tipo: ComunicacionServicio['tipo'], formulario: Formulario, alFinalizar: boolean) {
    if (!alFinalizar) return;
    const exigir = (lista: unknown[], descripcion: string[], etiqueta: string) => {
      if (lista.some((valor) => this.esOtro(this.texto(valor))) && !this.textoCampo(formulario, ...descripcion)) throw new BadRequestException(`Debe especificar ${etiqueta} cuando selecciona Otro`);
    };
    if (tipo === 'OTRAS_OCURRENCIAS') {
      exigir(this.listaCampo(formulario, 'accidenteTipo'), ['accidenteOtroDescripcion'], 'el otro tipo de accidente');
      exigir(this.listaCampo(formulario, 'animalTipos'), ['animalOtroDescripcion', 'animalEspecie'], 'el otro tipo de animal');
      exigir(this.listaCampo(formulario, 'rescateTipos'), ['rescateOtroDescripcion'], 'el otro tipo de rescate');
      exigir(this.listaCampo(formulario, 'otrosTipos'), ['otroServicio'], 'el otro servicio');
    } else {
      exigir(this.listaCampo(formulario, 'tiposIncendio', 'incendioTipo'), ['incendioOtroDescripcion'], 'el otro tipo de incendio');
      exigir(this.listaCampo(formulario, 'combustibles'), ['combustibleOtroDescripcion'], 'el otro combustible');
      if (this.esOtro(this.texto(this.valorCampo(formulario, 'estructura'))) && !this.textoCampo(formulario, 'estructuraOtroDescripcion')) throw new BadRequestException('Debe especificar la otra estructura');
      exigir(this.listaCampo(formulario, 'electrico'), ['electricoOtroDescripcion'], 'la otra descripción eléctrica');
    }
    if (this.esVerdadero(this.valorCampo(formulario, 'problemasActivos'))) exigir(this.listaCampo(formulario, 'problemas'), ['otroProblema'], 'el otro problema');
  }

  private normalizarFormulario(valor: unknown): Formulario {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) throw new BadRequestException('El formulario debe ser un objeto JSON');
    const limpio = this.limpiarValor(valor, 0);
    if (!limpio || typeof limpio !== 'object' || Array.isArray(limpio)) throw new BadRequestException('El formulario no es válido');
    const serializado = JSON.stringify(limpio);
    if (Buffer.byteLength(serializado, 'utf8') > MAX_FORMULARIO_BYTES) throw new BadRequestException('El formulario supera el tamaño máximo permitido de 4 MB');
    return limpio as Formulario;
  }

  private limpiarValor(valor: unknown, profundidad: number): unknown {
    if (profundidad > 12) throw new BadRequestException('El formulario supera la profundidad máxima permitida');
    if (valor === null || typeof valor === 'boolean' || typeof valor === 'string') return valor;
    if (typeof valor === 'number') {
      if (!Number.isFinite(valor)) throw new BadRequestException('El formulario contiene un número no válido');
      return valor;
    }
    if (Array.isArray(valor)) {
      if (valor.length > 1000) throw new BadRequestException('El formulario contiene demasiados elementos en una lista');
      return valor.map((item) => this.limpiarValor(item, profundidad + 1));
    }
    if (typeof valor === 'object') {
      const entradas = Object.entries(valor as Record<string, unknown>);
      if (entradas.length > 500) throw new BadRequestException('El formulario contiene demasiados campos');
      const resultado: Formulario = {};
      for (const [clave, contenido] of entradas) {
        if (clave === '__proto__' || clave === 'prototype' || clave === 'constructor') continue;
        resultado[clave] = this.limpiarValor(contenido, profundidad + 1);
      }
      return resultado;
    }
    throw new BadRequestException('El formulario contiene un valor no serializable');
  }

  private parsearDatos(datos: string): Formulario {
    try {
      const valor = JSON.parse(datos);
      return valor && typeof valor === 'object' && !Array.isArray(valor) ? valor as Formulario : {};
    } catch {
      return {};
    }
  }

  private async registrarAuditoria(manager: EntityManager, usuarioId: string, accion: string, recursoId: string, datosAntes?: unknown, datosDespues?: unknown) {
    const repo = manager.getRepository(LogAuditoria);
    await repo.save(repo.create({
      usuarioId, accion, recurso: 'servicios.comunicaciones', recursoId,
      datosAntes: datosAntes === undefined ? null : JSON.stringify(datosAntes),
      datosDespues: datosDespues === undefined ? null : JSON.stringify(datosDespues),
      ip: null, userAgent: null, metadata: null,
    }));
  }

  private presentar(comunicacion: ComunicacionServicio, servicio?: Servicio) {
    return {
      id: comunicacion.id, servicioId: comunicacion.servicioId, numeroComunicacion: servicio?.numeroServicio ?? null,
      tipo: comunicacion.tipo, estado: comunicacion.estado, motivoEstado: comunicacion.motivoEstado,
      version: comunicacion.version, formulario: this.parsearDatos(comunicacion.datos),
      finalizadoEn: comunicacion.finalizadoEn, finalizadoPor: comunicacion.finalizadoPor,
      creadoEn: comunicacion.creadoEn, actualizadoEn: comunicacion.actualizadoEn, servicio,
    };
  }

  private resumen(comunicacion: ComunicacionServicio) { return { tipo: comunicacion.tipo, estado: comunicacion.estado, version: comunicacion.version }; }
  private verificarVersion(comunicacion: ComunicacionServicio, version?: number) {
    if (version !== undefined && version !== comunicacion.version) throw new ConflictException('La comunicación cambió en otra sesión. Recargue antes de guardar.');
  }
  private asegurarTransicion(origen: ComunicacionServicio['estado'], destino: ComunicacionServicio['estado']) {
    if (!TRANSICIONES[origen].includes(destino)) throw new ConflictException(`No se permite pasar de ${origen} a ${destino}`);
  }
  private validarTipo(tipo: unknown): asserts tipo is GuardarComunicacionDto['tipo'] {
    if (tipo !== 'OTRAS_OCURRENCIAS' && tipo !== 'INCENDIO') throw new BadRequestException('Tipo de comunicación inválido');
  }
  private exigirMotivo(motivo: unknown, accion: string) { if (!this.texto(motivo)) throw new BadRequestException(`El motivo de la ${accion} es obligatorio`); }
  private motivoNormalizado(motivo: unknown) { const resultado = this.texto(motivo); if (resultado.length > 2000) throw new BadRequestException('El motivo no puede superar 2000 caracteres'); return resultado || null; }
  private esViolacionUnica(error: any) { return error?.number === 2601 || error?.number === 2627 || /duplicate|unique/i.test(String(error?.message ?? '')); }
  private texto(valor: unknown): string { return typeof valor === 'string' ? valor.trim() : ''; }
  private textoCampo(formulario: Formulario, ...campos: string[]) { for (const campo of campos) { const texto = this.texto(formulario[campo]); if (texto) return texto; } return ''; }
  private valorCampo(formulario: Formulario, ...campos: string[]) { for (const campo of campos) if (Object.prototype.hasOwnProperty.call(formulario, campo)) return formulario[campo]; return undefined; }
  private listaCampo(formulario: Formulario, ...campos: string[]) { const valor = this.valorCampo(formulario, ...campos); if (valor === undefined || valor === null || valor === '') return []; if (!Array.isArray(valor)) throw new BadRequestException(`El campo ${campos[0]} debe ser una lista`); return valor; }
  private registros(valor: unknown, etiqueta: string): Formulario[] {
    if (valor === undefined || valor === null || valor === '') return [];
    const convertir = (item: unknown, tipo?: string) => item && typeof item === 'object' && !Array.isArray(item) ? { tipo: (item as Formulario).tipo ?? tipo, ...(item as Formulario) } : (() => { throw new BadRequestException(`Las filas de ${etiqueta} no son válidas`); })();
    if (Array.isArray(valor)) return valor.map((item) => convertir(item));
    if (typeof valor === 'object') return Object.entries(valor as Formulario).map(([tipo, item]) => convertir(item, tipo));
    throw new BadRequestException(`El campo ${etiqueta} debe ser una lista o tabla`);
  }
  private movilesSeleccionados(formulario: Formulario): Formulario[] { return this.listaCampo(formulario, 'movilesDespachados').filter((item): item is Formulario => !!item && typeof item === 'object' && !Array.isArray(item) && this.esVerdadero((item as Formulario).seleccionado)); }
  private esVerdadero(valor: unknown) { return valor === true || valor === 1 || valor === 'true'; }
  private esOtro(valor: string) { return this.normalizarBusqueda(valor).startsWith('otro'); }
  private normalizarBusqueda(valor: string) { return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  private tieneValor(valor: unknown) { return valor !== undefined && valor !== null && valor !== ''; }
  private coordenada(valor: unknown, etiqueta: string, min: number, max: number): number | null {
    if (!this.tieneValor(valor)) return null;
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < min || numero > max) {
      throw new BadRequestException(`La ${etiqueta} de la ubicación no es válida`);
    }
    return numero;
  }

  private validarCoordenadas(formulario: Formulario) {
    const tieneLatitud = this.tieneValor(formulario.coordenadasLat);
    const tieneLongitud = this.tieneValor(formulario.coordenadasLon);
    if (tieneLatitud !== tieneLongitud) {
      throw new BadRequestException('La ubicación requiere latitud y longitud');
    }
    if (tieneLatitud) {
      this.coordenada(formulario.coordenadasLat, 'latitud', -90, 90);
      this.coordenada(formulario.coordenadasLon, 'longitud', -180, 180);
    }
  }
  private esFecha(valor: string) { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor); if (!match) return false; const fecha = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))); return fecha.getUTCFullYear() === Number(match[1]) && fecha.getUTCMonth() === Number(match[2]) - 1 && fecha.getUTCDate() === Number(match[3]); }
  private esHora(valor: string) { return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(valor); }
  private validarDecimalNoNegativo(valor: unknown, etiqueta: string): number | null {
    if (!this.tieneValor(valor)) return null;
    const texto = typeof valor === 'number' ? String(valor) : this.texto(valor).replace(',', '.');
    if (!/^\d+(?:\.\d+)?$/.test(texto)) throw new BadRequestException(`${etiqueta} debe ser un número no negativo`);
    const numero = Number(texto); if (!Number.isFinite(numero) || numero < 0) throw new BadRequestException(`${etiqueta} debe ser un número no negativo`); return numero;
  }
  private validarEnteroNoNegativo(valor: unknown, etiqueta: string): number | null {
    const numero = this.validarDecimalNoNegativo(valor, etiqueta); if (numero !== null && !Number.isInteger(numero)) throw new BadRequestException(`${etiqueta} debe ser un entero no negativo`); return numero;
  }
  private fechaHora(fecha: string, hora: string, horaInicio?: string): Date {
    if (!this.esFecha(fecha) || !this.esHora(hora)) throw new BadRequestException('La fecha u hora del servicio no es válida');
    const [anio, mes, dia] = fecha.split('-').map(Number); const [horas, minutos] = hora.split(':').map(Number);
    const resultado = new Date(anio, mes - 1, dia, horas, minutos, 0);
    if (horaInicio && this.esHora(horaInicio) && hora < horaInicio) resultado.setDate(resultado.getDate() + 1);
    return resultado;
  }
  private duracion(salida: string, enBase: string): number | null {
    if (!salida || !enBase) return null; if (!this.esHora(salida) || !this.esHora(enBase)) throw new BadRequestException('Las horas generales no son válidas');
    const [sh, sm] = salida.split(':').map(Number); const [eh, em] = enBase.split(':').map(Number);
    let minutos = eh * 60 + em - sh * 60 - sm; if (minutos < 0) minutos += 24 * 60; return minutos;
  }
}
