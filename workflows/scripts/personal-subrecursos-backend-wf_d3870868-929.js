export const meta = {
  name: 'personal-subrecursos-backend',
  description: 'Construye en paralelo los sub-recursos backend del modulo Personal expandido (condicion, historial, idiomas, actividad profesional, vehiculos, equipos, paneles de solo lectura)',
  phases: [
    { title: 'Sub-recursos Personal' },
  ],
}

const CONTEXTO_COMUN = `Proyecto SIGBO-CBVC: backend NestJS 10 + TypeORM + SQL Server en C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src. No toques el frontend.

Convenciones OBLIGATORIAS de este proyecto (ya establecidas, seguilas exactamente):
- Los IDs son UNIQUEIDENTIFIER de SQL Server (NEWSEQUENTIALID()). NUNCA uses @IsUUID() de class-validator (rechaza estos GUIDs). Usa siempre: import { GUID_REGEX, GUID_REGEX_MENSAJE } from '<ruta relativa>/shared/utils/guid' y @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) (con {each:true} si es array).
- Entidades TypeORM: @Entity({name: 'nombre_tabla', schema: 'nombre_schema'}), @PrimaryGeneratedColumn('uuid') id: string, columnas en camelCase (TypeORM las mapea a snake_case automaticamente via SnakeNamingStrategy global, NO pongas name: explicito salvo en columnas de fecha de auditoria donde el resto del proyecto SI lo hace, ej: @CreateDateColumn({name:'creado_en', type:'datetimeoffset', precision:3}) creadoEn: Date; y @UpdateDateColumn({name:'actualizado_en', type:'datetimeoffset', precision:3}) actualizadoEn: Date;).
- Controladores: @ApiTags(...) @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller('ruta'), cada metodo con @RequirePermission('modulo:accion'). Imports: JwtAuthGuard desde '../auth/guards/jwt-auth.guard', PermissionsGuard desde '../seguridad/guards/permissions.guard', RequirePermission desde '../seguridad/decorators/require-permission.decorator', CurrentUser desde '../auth/decorators/current-user.decorator', AuthenticatedUser (tipo) desde '../auth/types/authenticated-user'. Ajusta la profundidad relativa (../../) segun donde este tu archivo.
- Lee primero C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src\modules\personal\especialidades-bombero.controller.ts y especialidades-bombero.service.ts como el ejemplo mas simple y representativo del patron a seguir (sub-recurso de un bombero, permisos reutilizados, patron 'reemplazar todo el conjunto' para listas dinamicas).
- NO edites personal.module.ts, app.module.ts, ni shared/entities/index.ts bajo ninguna circunstancia — otro proceso registra todo lo que crees en un paso final separado, para evitar conflictos de edicion concurrente entre agentes. Simplemente crea/edita tus archivos.
- No corras npm run build ni ningun comando de terminal — solo usa herramientas de lectura/escritura de archivos.
- Al final de tu respuesta, lista EXACTAMENTE la ruta de cada archivo que creaste y el/los nombre(s) de clase(s) que exporta cada uno.`

const TAREAS = [
  {
    label: 'condicion-institucional',
    prompt: `${CONTEXTO_COMUN}

TAREA: sub-recurso "condicion institucional" de un bombero.

Ya existen (no las toques, solo leelas e importalas) las 4 entidades de detalle en shared/entities/: condicion-incorporado.entity.ts (CondicionIncorporado), condicion-combatiente.entity.ts (CondicionCombatiente), condicion-apoyo-economico.entity.ts (CondicionApoyoEconomico), condicion-honorario.entity.ts (CondicionHonorario) — cada una con bomberoId UNIQUE y sus propios campos administrativos, leelas para ver los campos exactos. El campo Bombero.condicionInstitucional (en shared/entities/bombero.entity.ts) es el discriminador: 'INCORPORADO'|'COMBATIENTE'|'APOYO_ECONOMICO'|'HONORARIO'|null. La entidad HistorialInstitucional ya existe en shared/entities/historial-institucional.entity.ts (bomberoId, tipoMovimiento, fecha (string YYYY-MM-DD), usuarioResponsableId, motivo, observacion, documentoUrl, referenciaTabla, referenciaId, creadoEn automatico).

Crea en backend/src/modules/personal/:
1. dto/actualizar-condicion.dto.ts: clase ActualizarCondicionDto con condicionInstitucional: string (@IsIn(['INCORPORADO','COMBATIENTE','APOYO_ECONOMICO','HONORARIO'])) y detalle?: any (objeto libre con los campos propios del subtipo elegido, @IsOptional, sin validacion estricta interna).
2. condicion.service.ts: clase CondicionService inyectando Repository<Bombero> y los 4 repos de condicion + Repository<HistorialInstitucional> (todos importados desde '../../shared/entities').
   - obtener(bomberoId): busca el bombero (NotFoundException si no existe); si condicionInstitucional es null devuelve {condicionInstitucional: null, detalle: null}; si no, busca en la tabla de detalle correspondiente por bomberoId (findOne) y devuelve {condicionInstitucional, detalle} (detalle null si nunca se guardo un detalle).
   - actualizar(bomberoId, dto, usuarioId): valida que el bombero exista. Si dto.condicionInstitucional difiere del actual, actualiza bombero.condicionInstitucional via el repo de Bombero (update) y guarda una fila en historial_institucional (tipoMovimiento: 'CAMBIO_CONDICION', fecha: fecha de hoy en formato YYYY-MM-DD, usuarioResponsableId: usuarioId, motivo describiendo el cambio de X a Y). Luego, en la tabla de detalle que corresponda al NUEVO condicionInstitucional, busca fila existente por bomberoId: si existe hace update con los campos de dto.detalle, si no existe hace create+save con bomberoId + los campos de dto.detalle (si dto.detalle vino). Devuelve obtener(bomberoId) al final.
3. condicion.controller.ts: clase CondicionController, @Controller('personal/bomberos'). GET ':id/condicion' (permiso personal:ver). PUT ':id/condicion' (permiso personal:editar, usa @CurrentUser() para el usuarioId de actualizar()).`,
  },
  {
    label: 'historial-institucional',
    prompt: `${CONTEXTO_COMUN}

TAREA: sub-recurso de consulta + registro manual del "historial institucional" de un bombero.

La entidad HistorialInstitucional ya existe en shared/entities/historial-institucional.entity.ts (no la toques): id, bomberoId, tipoMovimiento (union type TipoMovimientoInstitucional con 12 valores: INGRESO/ASCENSO/CAMBIO_RANGO/CAMBIO_CARGO/CAMBIO_COMPANIA/CAMBIO_CONDICION/CAMBIO_CODIGO/LICENCIA/SUSPENSION/RECONOCIMIENTO/SANCION/RETIRO), fecha (string), usuarioResponsableId, motivo, observacion, documentoUrl, referenciaTabla, referenciaId, creadoEn (automatico). La mayoria de las filas las genera el sistema automaticamente (ver backend/src/modules/personal/bomberos.service.ts como referencia de lectura, NO lo edites). Tu trabajo es exponer el LISTADO completo y permitir el registro MANUAL exclusivamente de los tipos 'RECONOCIMIENTO' y 'SANCION' (los unicos que no se generan solos).

Crea en backend/src/modules/personal/:
1. dto/crear-movimiento-historial.dto.ts: clase CrearMovimientoHistorialDto con tipoMovimiento: string (@IsIn(['RECONOCIMIENTO','SANCION'])), fecha: string (@IsNotEmpty), motivo?: string, observacion?: string, documentoUrl?: string (todos los opcionales con @IsOptional @IsString).
2. historial-institucional.service.ts: clase HistorialInstitucionalService inyectando Repository<HistorialInstitucional> y Repository<Bombero> (desde '../../shared/entities').
   - listar(bomberoId): valida que el bombero exista (NotFoundException si no), devuelve todas las filas de ese bombero ordenadas por fecha DESC.
   - registrarManual(bomberoId, dto, usuarioId): valida que el bombero exista, crea la fila con bomberoId, ...dto, usuarioResponsableId: usuarioId. Devuelve listar(bomberoId).
3. historial-institucional.controller.ts: clase HistorialInstitucionalController, @Controller('personal/bomberos'). GET ':id/historial' (permiso personal:ver). POST ':id/historial' (permiso personal:editar, usa @CurrentUser()).`,
  },
  {
    label: 'idiomas-actividad-profesional',
    prompt: `${CONTEXTO_COMUN}

TAREA: dos sub-recursos de un bombero: idiomas (lista dinamica) y actividad profesional (dato unico).

Entidades ya existentes, no las toques: IdiomaBombero en shared/entities/idioma-bombero.entity.ts (id, bomberoId, idioma, nivel, certificacion, creadoEn) y ActividadProfesional en shared/entities/actividad-profesional.entity.ts (id, bomberoId UNIQUE, profesion, empresa, cargoLaboral, experiencia, actividadesRelacionadas, actualizadoEn).

Para idiomas segui EXACTAMENTE el patron "reemplazar todo el conjunto": al guardar, borra TODAS las filas existentes de ese bombero (repo.delete({bomberoId})) y vuelve a insertar el arreglo completo recibido (igual de valido que diffear, y mas simple — es el mismo patron que ya se uso para telefonos/correos de usuario en el sistema).

Crea en backend/src/modules/personal/:
1. dto/idioma.dto.ts: clase IdiomaDto (idioma: string @IsNotEmpty, nivel?: string, certificacion?: string) y clase SetIdiomasDto (idiomas: IdiomaDto[] con @ValidateNested({each:true}) @Type(() => IdiomaDto) — importa Type desde 'class-transformer').
2. dto/actividad-profesional.dto.ts: clase ActividadProfesionalDto (profesion?, empresa?, cargoLaboral?, experiencia?, actividadesRelacionadas?, todos @IsOptional @IsString).
3. idiomas.service.ts: clase IdiomasService (inyecta Repository<IdiomaBombero>, Repository<Bombero>). listar(bomberoId): find where bomberoId ordenado por idioma ASC. reemplazar(bomberoId, idiomas: IdiomaDto[]): valida que el bombero exista, delete({bomberoId}), luego crea+guarda cada item del arreglo con bomberoId, devuelve listar(bomberoId).
4. idiomas.controller.ts: clase IdiomasController, @Controller('personal/bomberos'). GET ':id/idiomas' (permiso personal:ver). PUT ':id/idiomas' (permiso personal:editar, body SetIdiomasDto).
5. actividad-profesional.service.ts: clase ActividadProfesionalService (inyecta Repository<ActividadProfesional>, Repository<Bombero>). obtener(bomberoId): valida bombero, findOne where bomberoId (devuelve null si no existe fila, sin error). actualizar(bomberoId, dto): valida bombero, si existe fila hace update, si no existe hace create+save con bomberoId + campos del dto. Devuelve obtener(bomberoId).
6. actividad-profesional.controller.ts: clase ActividadProfesionalController, @Controller('personal/bomberos'). GET ':id/actividad-profesional' (permiso personal:ver). PUT ':id/actividad-profesional' (permiso personal:editar, body ActividadProfesionalDto).`,
  },
  {
    label: 'vehiculos',
    prompt: `${CONTEXTO_COMUN}

TAREA: dos piezas relacionadas con vehiculos. La tabla vehiculos.vehiculos YA EXISTE en la base de datos (no crees migracion SQL) — antes de escribir la entidad, lee su estructura COMPLETA y exacta en C:\Users\PC-HORIZONTE\sigbo-cbvc\database\migrations\006_vehiculos_equipos.sql (busca "CREATE TABLE vehiculos.vehiculos"). La tabla personal.vehiculos_autorizados TAMBIEN YA EXISTE (migracion 016 ya aplicada) y la entidad VehiculoAutorizado ya existe en shared/entities/vehiculo-autorizado.entity.ts (id, bomberoId, vehiculoId, categoria, fechaAutorizacion, vigencia, capacitaciones, creadoEn) — no la toques.

PARTE A - Entidad + modulo catalogo basico "vehiculos":
1. backend/src/shared/entities/vehiculo.entity.ts: entidad Vehiculo (@Entity({name:'vehiculos', schema:'vehiculos'})) con TODAS las columnas reales de la tabla (numeroInterno, tipo, marca, modelo, anio, patente, color, numeroChasis, numeroMotor, capacidadCarga, capacidadPasajeros, kilometrajeActual, combustibleActual, estado, ubicacionActual, itvFecha, itvVencimiento, seguroFecha, seguroVencimiento, seguroEmpresa, seguroPoliza, ultimoMantenimiento, proximoMantenimiento, ultimoCambioAceite, ultimoCambioCubiertas, ultimaRevisionBateria, qrCode, fotos, documentos, metadata, creadoEn, actualizadoEn — usa los nombres/tipos EXACTOS que veas en el SQL). No edites shared/entities/index.ts.
2. Modulo nuevo backend/src/modules/vehiculos/ con: dto/create-vehiculo.dto.ts, dto/update-vehiculo.dto.ts (PartialType de create), vehiculos.service.ts (CRUD basico: findAll con filtro opcional por query estado, findOne, create, update — SIN soft-delete, es un catalogo simple), vehiculos.controller.ts (@Controller('vehiculos/vehiculos'), permisos vehiculos:ver/vehiculos:crear/vehiculos:editar — estos permisos YA EXISTEN en la base de datos, no hace falta crearlos), vehiculos.module.ts (NestJS @Module completo, TypeOrmModule.forFeature([Vehiculo, VehiculoAutorizado]) — importa VehiculoAutorizado desde '../../shared/entities' para la Parte B, exporta la clase VehiculosModule). Mira backend/src/modules/organizacion/rangos.controller.ts y rangos.service.ts como referencia de un catalogo simple (pero MAS SIMPLE: sin exportar Excel/PDF, sin baja/reactivar).

PARTE B - Sub-recurso "vehiculos autorizados" de un bombero, DENTRO del mismo modulo vehiculos (para que quede autocontenido):
3. backend/src/modules/vehiculos/dto/vehiculo-autorizado.dto.ts: clase VehiculoAutorizadoDto (vehiculoId: string @Matches(GUID_REGEX), categoria?: string, fechaAutorizacion?: string, vigencia?: string, capacitaciones?: string) y clase SetVehiculosAutorizadosDto (vehiculos: VehiculoAutorizadoDto[] con @ValidateNested({each:true}) @Type(() => VehiculoAutorizadoDto)).
4. backend/src/modules/vehiculos/vehiculos-autorizados.service.ts: clase VehiculosAutorizadosService (inyecta Repository<VehiculoAutorizado>, Repository<Vehiculo>). listar(bomberoId): trae las filas de ese bombero y hace join manual contra Vehiculo (por vehiculoId) para agregar numeroInterno/patente/marca/modelo a cada item devuelto. reemplazar(bomberoId, vehiculos: VehiculoAutorizadoDto[]): patron reemplazar-todo-el-conjunto (delete({bomberoId}) + crear cada item con bomberoId), devuelve listar(bomberoId).
5. backend/src/modules/vehiculos/vehiculos-autorizados.controller.ts: clase VehiculosAutorizadosController, @Controller('personal/bomberos'). GET ':id/vehiculos-autorizados' (permiso personal:ver). PUT ':id/vehiculos-autorizados' (permiso personal:editar).

Registra VehiculosAutorizadosController/Service dentro del mismo vehiculos.module.ts (controllers/providers) para que TODO quede en un solo modulo autocontenido.`,
  },
  {
    label: 'equipos',
    prompt: `${CONTEXTO_COMUN}

TAREA: dos piezas relacionadas con equipos. Las tablas equipos.categorias_equipo, equipos.equipos y equipos.prestamos_equipos YA EXISTEN en la base de datos (no crees migracion SQL) — antes de escribir las entidades, lee su estructura COMPLETA y exacta en C:\Users\PC-HORIZONTE\sigbo-cbvc\database\migrations\006_vehiculos_equipos.sql (busca "CREATE TABLE equipos.categorias_equipo", "CREATE TABLE equipos.equipos" y "CREATE TABLE equipos.prestamos_equipos").

PARTE A - Entidades + modulo catalogo basico "equipos":
1. backend/src/shared/entities/categoria-equipo.entity.ts: entidad CategoriaEquipo (@Entity({name:'categorias_equipo', schema:'equipos'})) con sus columnas exactas (nombre, descripcion, padreId nullable autorreferencia, activo, creadoEn).
2. backend/src/shared/entities/equipo.entity.ts: entidad Equipo (@Entity({name:'equipos', schema:'equipos'})) con TODAS sus columnas exactas (categoriaId, codigoInterno, nombre, descripcion, marca, modelo, numeroSerie, estado, ubicacion, responsableId nullable, fechaCompra, fechaVencimiento, vidaUtilMeses, qrCode, fotos, documentos, metadata, creadoEn, actualizadoEn).
3. backend/src/shared/entities/prestamo-equipo.entity.ts: entidad PrestamoEquipo (@Entity({name:'prestamos_equipos', schema:'equipos'})) con sus columnas exactas (equipoId, bomberoId nullable, servicioId nullable, fechaPrestamo, fechaDevolucion nullable, estado, observaciones, creadoEn, creadoPor).
No edites shared/entities/index.ts.
4. Modulo nuevo backend/src/modules/equipos/ con CRUD basico de categorias y equipos: dto/create-categoria-equipo.dto.ts, dto/create-equipo.dto.ts (+ update DTOs con PartialType), un service (o dos, a tu criterio, mantenelo simple) con metodos CRUD basicos (SIN soft-delete) para ambas entidades, un controller con @Controller('equipos/categorias') y otro (o el mismo archivo) con @Controller('equipos/equipos'), permisos equipos:ver/equipos:crear/equipos:editar (YA EXISTEN en la base de datos, no hace falta crearlos), equipos.module.ts (NestJS @Module completo, TypeOrmModule.forFeature([CategoriaEquipo, Equipo, PrestamoEquipo]), exporta la clase EquiposModule). Mira backend/src/modules/organizacion/rangos.controller.ts como referencia simplificada (sin exportar Excel/PDF, sin baja/reactivar).

PARTE B - Sub-recurso "equipamiento" de un bombero, DENTRO del mismo modulo equipos (para que quede autocontenido):
5. backend/src/modules/equipos/dto/prestamo-equipo-bombero.dto.ts: clase CrearPrestamoDto (equipoId: string @Matches(GUID_REGEX), observaciones?: string) y clase DevolucionDto (observaciones?: string).
6. backend/src/modules/equipos/equipamiento-bombero.service.ts: clase EquipamientoBomberoService (inyecta Repository<PrestamoEquipo>, Repository<Equipo>). historial(bomberoId): todas las filas de prestamos_equipos de ese bombero (where bomberoId), con join manual a Equipo (por equipoId) para agregar nombre/codigoInterno a cada item, ordenadas por fechaPrestamo DESC. prestar(bomberoId, dto, creadoPor): crea fila con bomberoId, equipoId: dto.equipoId, fechaPrestamo: fecha de hoy YYYY-MM-DD, estado: 'PRESTADO', observaciones: dto.observaciones, creadoPor. devolver(prestamoId, dto): actualiza la fila por id (fechaDevolucion: hoy, estado: 'DEVUELTO', observaciones si vino dto.observaciones).
7. backend/src/modules/equipos/equipamiento-bombero.controller.ts: clase EquipamientoBomberoController, @Controller('personal/bomberos'). GET ':id/equipamiento' (permiso personal:ver). POST ':id/equipamiento' (permiso equipos:prestar — YA EXISTE, usa @CurrentUser() para creadoPor). PATCH 'equipamiento/:prestamoId/devolucion' (permiso equipos:prestar).

Registra EquipamientoBomberoController/Service dentro del mismo equipos.module.ts (controllers/providers) para que TODO quede en un solo modulo autocontenido.`,
  },
  {
    label: 'paneles-lectura',
    prompt: `${CONTEXTO_COMUN}

TAREA: 3 endpoints de SOLO LECTURA que muestran informacion de otros schemas ya existentes en la base de datos, para el detalle de un bombero. Los schemas operaciones, servicios y academia todavia NO tienen modulo de backend propio, asi que hoy estas tablas estan vacias — tus endpoints deben responder un array vacio sin error cuando no hay datos, eso es el comportamiento correcto y esperado (no es un bug).

Antes de escribir las entidades, lee la estructura EXACTA de estas tablas en estos archivos de migracion (rutas relativas a C:\Users\PC-HORIZONTE):
- sigbo-cbvc/database/migrations/005_operaciones.sql (tablas operaciones.guardias, operaciones.asignacion_guardias)
- sigbo-cbvc/database/migrations/007_servicios.sql (tablas servicios.tipos_servicio, servicios.servicios, servicios.personal_servicio)
- sigbo-cbvc/database/migrations/004_academia.sql (tablas academia.materias, academia.cursos, academia.inscripciones_cursos)

Crea las entidades TypeORM correspondientes (una por tabla, con TODAS sus columnas exactas) en backend/src/shared/entities/: guardia.entity.ts (Guardia), asignacion-guardia.entity.ts (AsignacionGuardia), tipo-servicio.entity.ts (TipoServicio), servicio.entity.ts (Servicio), personal-servicio.entity.ts (PersonalServicio), materia.entity.ts (Materia), curso.entity.ts (Curso), inscripcion-curso.entity.ts (InscripcionCurso). NO edites shared/entities/index.ts (otro proceso lo hace).

Crea en backend/src/modules/personal/:
1. consultas-cruzadas.service.ts: clase ConsultasCruzadasService inyectando los 8 repos de arriba (Repository<...> de cada entidad, importadas desde '../../shared/entities').
   - guardiasDeBombero(bomberoId): busca AsignacionGuardia where bomberoId; si hay resultados, hace join manual contra Guardia (por guardiaId) para devolver fecha/turno/horaInicio/horaFin/rol/estado de cada asignacion, ordenado por fecha DESC. Devuelve [] si no hay asignaciones.
   - serviciosDeBombero(bomberoId): busca PersonalServicio where bomberoId; si hay resultados, join manual contra Servicio (por servicioId) y TipoServicio (por tipoServicioId de cada Servicio), devuelve numeroServicio/fechaHoraAviso/rol/horasServicio/nombreTipoServicio de cada uno, ordenado por fechaHoraAviso DESC. Devuelve [] si no hay.
   - formacionAcademicaDeBombero(bomberoId): busca InscripcionCurso where bomberoId; si hay resultados, join manual contra Curso (por cursoId), devuelve nombreCurso/fechaInicio/fechaFin/estado/notaFinal de cada inscripcion, ordenado por fechaInscripcion DESC. Devuelve [] si no hay.
   - Todos los metodos deben usar querys normales de TypeORM (find/findBy) y manejar el caso de arrays vacios sin lanzar excepciones — NO valides que el bombero exista (no hace falta para este caso de solo-lectura), simplemente devuelve [] si no hay coincidencias.
2. consultas-cruzadas.controller.ts: clase ConsultasCruzadasController, @Controller('personal/bomberos'), guards+permiso personal:ver en los 3 metodos: GET ':id/guardias', GET ':id/servicios', GET ':id/formacion-academia'.`,
  },
]

phase('Sub-recursos Personal')
const resultados = await parallel(TAREAS.map((t) => () => agent(t.prompt, { label: t.label, phase: 'Sub-recursos Personal' })))

return TAREAS.map((t, i) => ({ tarea: t.label, resultado: resultados[i] }))
