export const meta = {
  name: 'organizacion-catalogos-crud',
  description: 'CRUD backend+frontend en paralelo para 10 catalogos del modulo Organizacion Institucional',
  phases: [
    { title: 'CRUD catalogos', detail: '10 agentes en paralelo, uno por entidad' },
  ],
}

const HOUSE_STYLE = `
CONTEXTO DEL PROYECTO
======================
Proyecto NestJS + TypeORM (SQL Server) + Next.js 14 (App Router, sin libreria de UI, CSS plano).
Backend: C:\Users\PC-HORIZONTE\sigbo-cbvc\backend
Frontend: C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend

Ya existe el modulo "seguridad" con el mismo patron que debes imitar EXACTAMENTE. Lee estos
archivos de referencia ANTES de escribir nada:
- C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src\modules\seguridad\roles.service.ts
- C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src\modules\seguridad\roles.controller.ts
- C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src\modules\seguridad\dto\create-rol.dto.ts
- C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src\modules\seguridad\dto\update-rol.dto.ts
- C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\seguridad\roles\page.tsx
- C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src\shared\utils\guid.ts
- C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src\shared\utils\csv.ts
- C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\lib\api.ts (funcion apiFetch ya existe, usala tal cual)

GOTCHA CRITICO (ya nos costo un bug en produccion esta sesion): los GUID de SQL Server
(NEWSEQUENTIALID()) NO cumplen el formato RFC4122 que exige el decorador @IsUUID() de
class-validator -> SIEMPRE rechaza los IDs reales con 400. Para validar cualquier campo que
sea un id (uniqueidentifier), usa SIEMPRE:
  import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';
  ...
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })   // un solo id
  @Matches(GUID_REGEX, { each: true, message: GUID_REGEX_MENSAJE })  // array de ids
NUNCA uses @IsUUID() en este proyecto.

PATRON BACKEND (imita roles.service.ts / roles.controller.ts):
- DTOs en backend/src/modules/organizacion/dto/create-{slug}.dto.ts y update-{slug}.dto.ts
  (update = PartialType(Create...), como update-rol.dto.ts).
- Servicio backend/src/modules/organizacion/{slug}.service.ts inyectando el repo con
  @InjectRepository(EntidadClass) — importa la entidad desde '../../shared/entities'.
  Metodos:
    findAll(q?: string, estado?: string, incluirEliminados?: boolean):
      - filtra por defecto eliminadoEn IS NULL (usa IsNull() de 'typeorm'); si
        incluirEliminados=true, no filtres por eliminadoEn.
      - si q: filtra nombre LIKE %q% OR codigo LIKE %q% (createQueryBuilder, ILIKE no existe en
        mssql, usa LIKE con parametro).
      - si estado: filtra por ese estado exacto.
      - ordena por nombre ASC.
    findOne(id): NotFoundException si no existe.
    create(dto, actorId: string): valida que no exista ya el mismo codigo NI el mismo nombre
      (ConflictException con mensaje claro) antes de guardar; setea creadoPor=actorId.
    update(id, dto, actorId): actualiza solo campos presentes en dto; setea actualizadoPor=actorId.
    darBaja(id, actorId): UPDATE estado='INACTIVO', eliminadoEn=new Date(), actualizadoPor=actorId.
    reactivar(id, actorId): UPDATE estado='ACTIVO', eliminadoEn=null, actualizadoPor=actorId.
    exportarCsv(): trae findAll({incluirEliminados:false-like default}) y devuelve
      { csv: toCsv(filas) } importando toCsv desde '../../shared/utils/csv'. Aplana cada fila a
      un objeto plano (sin anidar objetos) con las columnas relevantes de la entidad.
- Controlador backend/src/modules/organizacion/{slug}.controller.ts:
  @Controller('organizacion/{rest-path}')
  @UseGuards(JwtAuthGuard, PermissionsGuard)  // JwtAuthGuard de '../auth/guards/jwt-auth.guard',
                                               // PermissionsGuard de './guards/permissions.guard'
                                               //   OJO: dentro de modules/organizacion NO existe
                                               //   ./guards — usa la ruta real
                                               //   '../seguridad/guards/permissions.guard'
  @RequirePermission de '../seguridad/decorators/require-permission.decorator'
  CurrentUser de '../auth/decorators/current-user.decorator', AuthenticatedUser de
  '../auth/types/authenticated-user' — en cada metodo de escritura usa
  @CurrentUser() user: AuthenticatedUser y pasa user.id como actorId (NO hace falta capturar
  ip/userAgent, este modulo no tiene auditoria detallada, a diferencia de seguridad).

  RUTAS EXACTAS (respeta el orden: /exportar DEBE declararse ANTES que /:id, si no Nest
  interpreta "exportar" como un :id y nunca llega a ese metodo):
    GET    /organizacion/{rest-path}            -> findAll (query params q, estado, incluirEliminados)
                                                     permiso 'organizacion:{recurso}_ver'
    GET    /organizacion/{rest-path}/exportar    -> exportarCsv, permiso 'organizacion:{recurso}_ver'
    GET    /organizacion/{rest-path}/:id         -> findOne, permiso 'organizacion:{recurso}_ver'
    POST   /organizacion/{rest-path}             -> create, permiso 'organizacion:{recurso}_crear'
    PATCH  /organizacion/{rest-path}/:id         -> update, permiso 'organizacion:{recurso}_editar'
    PATCH  /organizacion/{rest-path}/:id/baja    -> darBaja, permiso 'organizacion:{recurso}_eliminar'
    PATCH  /organizacion/{rest-path}/:id/reactivar -> reactivar, permiso 'organizacion:{recurso}_eliminar'

PATRON FRONTEND (imita dashboard/seguridad/roles/page.tsx, mismo estilo plano con clases
"card"/"btn-primary"/"input-field"/"badge" de globals.css, NO uses Tailwind ni ninguna libreria):
- Archivo unico: frontend/src/app/dashboard/organizacion/{route-slug}/page.tsx ('use client').
- usa apiFetch de '@/lib/api' para TODAS las llamadas (ya inyecta el Bearer token).
- Barra superior: input de busqueda (q) + select de estado (ACTIVO/INACTIVO/todos) + checkbox
  "Mostrar eliminados" + boton "Exportar CSV" (descarga via Blob, snippet exacto abajo) + boton
  "Nuevo {entidad}" que abre/cierra un formulario.
- El MISMO formulario sirve para crear y editar: un estado local editandoId (string|null); al
  hacer click en "Editar" en una fila, precarga los campos y guarda el id en editandoId; el
  submit hace PATCH si editandoId!=null, si no POST; boton "Cancelar" limpia editandoId.
- Tabla con columnas relevantes (ver "CAMPOS" de la entidad abajo), badge de estado, y por fila:
  boton "Editar", y boton "Eliminar" (si eliminadoEn es null) o "Reactivar" (si no es null).
- Snippet EXACTO para exportar CSV (usalo tal cual, cambiando el nombre de archivo):
    async function exportarCsv() {
      const res = await apiFetch('/organizacion/{rest-path}/exportar');
      if (!res.ok) return;
      const { csv } = await res.json();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '{slug}.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

LIMITES ESTRICTOS DE ARCHIVOS (para que 10 agentes en paralelo no choquen escribiendo el mismo
archivo): escribe SOLO los archivos que se listan en tu tarea especifica. NO edites ni crees:
organizacion.module.ts, app.module.ts, shared/entities/index.ts, seed-data.ts,
frontend/src/lib/modulos.ts, ni ningun archivo de otra entidad. Esos los integra otro proceso
despues. Al terminar, tu ULTIMA accion debe ser devolver (no escribir a disco) un resumen
estructurado con: los 4 archivos backend + 1 frontend que creaste, y confirmar si compilaste
mentalmente sin errores obvios de import.
`

const ENTIDADES = [
  {
    slug: 'rangos',
    restPath: 'rangos',
    entityClass: 'Rango',
    entityFile: 'backend/src/shared/entities/rango.entity.ts',
    campos: `codigo (string, unico), nombre (string, unico), nivelJerarquico (number), descripcion
(string|null), insigniaUrl (string|null, un campo de texto para URL de imagen, no hay upload de
archivos), color (string hex, input type="color"), ordenJerarquico (number), estado
('ACTIVO'|'INACTIVO'), observaciones (string|null). Sin relaciones a otras entidades. En la
tabla del listado muestra: codigo, nombre, nivelJerarquico, ordenJerarquico, color (como swatch),
estado.`,
  },
  {
    slug: 'cargos',
    restPath: 'cargos',
    entityClass: 'Cargo',
    entityFile: 'backend/src/shared/entities/cargo.entity.ts',
    campos: `codigo (string, unico), nombre (string, unico), descripcion (string|null), area
(string|null), nivel (number|null), dependenciaCargoId (string|null, es un ID que referencia OTRO
cargo, o sea es una relacion de auto-referencia: en el formulario mostrala como un <select> que
depenciaCargoId (string|null, es un ID que referencia OTRO cargo, o sea es una relacion de auto-referencia: en el formulario mostrala como un <select> que
lista los cargos existentes obtenidos de GET /organizacion/cargos, mostrando su "nombre"),
estado ('ACTIVO'|'INACTIVO'). En el listado muestra: codigo, nombre, area, nivel, estado.`,
  },
  {
    slug: 'especialidades',
    restPath: 'especialidades',
    entityClass: 'Especialidad',
    entityFile: 'backend/src/shared/entities/especialidad.entity.ts',
    campos: `codigo (string, unico), nombre (string, unico), descripcion (string|null),
requisitos (string|null, textarea de texto libre), estado ('ACTIVO'|'INACTIVO'). Sin relaciones.
En el listado muestra: codigo, nombre, requisitos (truncado), estado.`,
  },
  {
    slug: 'companias',
    restPath: 'companias',
    entityClass: 'Compania',
    entityFile: 'backend/src/shared/entities/compania.entity.ts',
    campos: `codigo (string, unico), nombre (string, unico), ciudad (string|null), direccion
(string|null), fechaCreacion (string|null, formato 'YYYY-MM-DD', input type="date"), estado
('ACTIVO'|'INACTIVO'). Sin relaciones. En el listado muestra: codigo, nombre, ciudad,
fechaCreacion, estado.`,
  },
  {
    slug: 'cuarteles',
    restPath: 'cuarteles',
    entityClass: 'Cuartel',
    entityFile: 'backend/src/shared/entities/cuartel.entity.ts',
    campos: `codigo (string, unico), nombre (string, NO unico), companiaId (string, OBLIGATORIO,
FK a Compania: en el formulario es un <select> obligatorio que lista GET /organizacion/companias
mostrando su "nombre"), direccion (string|null), telefono (string|null), responsableBomberoId
(string|null, FK opcional a un Bombero del modulo Personal: <select> opcional que lista
GET /personal/bomberos mostrando "numeroBombero - nombre apellido"), estado
('ACTIVO'|'INACTIVO'). En el listado muestra: codigo, nombre, el NOMBRE de la compania (no el id
crudo — resuelve el nombre haciendo un segundo fetch a /organizacion/companias y mapeando por
id), telefono, estado.`,
  },
  {
    slug: 'brigadas',
    restPath: 'brigadas',
    entityClass: 'Brigada',
    entityFile: 'backend/src/shared/entities/brigada.entity.ts',
    campos: `codigo (string, unico), nombre (string, unico), descripcion (string|null), estado
('ACTIVO'|'INACTIVO'). Sin relaciones. En el listado muestra: codigo, nombre, descripcion
(truncada), estado.`,
  },
  {
    slug: 'departamentos',
    restPath: 'departamentos',
    entityClass: 'Departamento',
    entityFile: 'backend/src/shared/entities/departamento.entity.ts',
    campos: `codigo (string, unico), nombre (string, unico), descripcion (string|null), estado
('ACTIVO'|'INACTIVO'). Sin relaciones. OJO: esto es "departamento institucional" (ej.
Administracion, Operaciones, Recursos Humanos) — NO tiene nada que ver con el campo
personal.bomberos.departamento que es una direccion/provincia, son conceptos distintos aunque el
nombre se parezca. En el listado muestra: codigo, nombre, descripcion (truncada), estado.`,
  },
  {
    slug: 'unidades',
    restPath: 'unidades',
    entityClass: 'Unidad',
    entityFile: 'backend/src/shared/entities/unidad.entity.ts',
    campos: `codigo (string, unico), nombre (string, NO unico), descripcion (string|null),
brigadaId (string|null, FK opcional a Brigada: <select> opcional que lista
GET /organizacion/brigadas mostrando su "nombre"), estado ('ACTIVO'|'INACTIVO'). En el listado
muestra: codigo, nombre, el NOMBRE de la brigada si tiene (resuelve igual que en cuarteles),
estado.`,
  },
  {
    slug: 'turnos',
    restPath: 'turnos',
    entityClass: 'Turno',
    entityFile: 'backend/src/shared/entities/turno.entity.ts',
    campos: `codigo (string, unico), nombre (string, unico; ejemplos: "Turno A", "Turno B"),
horaInicio (string|null, formato 'HH:MM:SS', input type="time" en el form — el input de HTML da
'HH:MM', conviertelo a 'HH:MM:SS' agregando ':00' antes de enviarlo), horaFin (igual formato),
responsableBomberoId (string|null, FK opcional a Bombero: <select> opcional igual que en
cuarteles, listando GET /personal/bomberos), estado ('ACTIVO'|'INACTIVO'). En el listado muestra:
codigo, nombre, horaInicio, horaFin, estado.`,
  },
  {
    slug: 'guardias',
    restPath: 'tipos-guardia',
    entityClass: 'TipoGuardia',
    entityFile: 'backend/src/shared/entities/tipo-guardia.entity.ts',
    campos: `codigo (string, unico), nombre (string, unico; ejemplos: "24 horas", "12 horas",
"Nocturna", "Diurna", "Especial"), duracionHoras (number|null), descripcion (string|null), estado
('ACTIVO'|'INACTIVO'). Sin relaciones. IMPORTANTE: la entidad/tabla/ruta backend se llaman
"tipos-guardia" / "TipoGuardia" (para no chocar con la tabla operaciones.guardias que ya existe y
es otra cosa — guardias programadas reales), PERO la carpeta del frontend y el titulo visible en
la UI deben decir "Guardias" (route: frontend/src/app/dashboard/organizacion/guardias/page.tsx,
titulo del <h2> "Tipos de Guardia"). En el listado muestra: codigo, nombre, duracionHoras, estado.`,
  },
]

phase('CRUD catalogos')

const resultados = await parallel(
  ENTIDADES.map((e) => () =>
    agent(
      `Implementa el CRUD completo (backend + frontend) de la entidad "${e.entityClass}" (catalogo
"${e.slug}") del modulo Organizacion Institucional de SIGBO-CBVC, siguiendo ESTRICTAMENTE esta
guia de estilo del proyecto:

${HOUSE_STYLE}

TU ENTIDAD ESPECIFICA
======================
La entidad TypeORM YA EXISTE en ${e.entityFile} — leela primero para confirmar los nombres
exactos de campo (son camelCase en TS, snake_case en la columna real de SQL Server, TypeORM lo
mapea solo). Clase a importar: ${e.entityClass} (import { ${e.entityClass} } from '../../shared/entities';)

CAMPOS: ${e.campos}

Prefijo de permiso para este recurso: 'organizacion:${e.slug === 'guardias' ? 'tipos_guardia' : e.slug}_{ver|crear|editar|eliminar}'
(ej. 'organizacion:${e.slug === 'guardias' ? 'tipos_guardia' : e.slug}_ver'). Estos permisos YA
EXISTEN en la base de datos (migracion ya aplicada), no los crees ni los toques.

Ruta REST: /organizacion/${e.restPath}
Ruta frontend: frontend/src/app/dashboard/organizacion/${e.slug}/page.tsx

ARCHIVOS A CREAR (exactamente estos 5, ningun otro):
1. backend/src/modules/organizacion/dto/create-${e.slug === 'guardias' ? 'tipo-guardia' : e.slug.replace(/s$/, '')}.dto.ts
2. backend/src/modules/organizacion/dto/update-${e.slug === 'guardias' ? 'tipo-guardia' : e.slug.replace(/s$/, '')}.dto.ts
3. backend/src/modules/organizacion/${e.slug === 'guardias' ? 'tipos-guardia' : e.slug}.service.ts
4. backend/src/modules/organizacion/${e.slug === 'guardias' ? 'tipos-guardia' : e.slug}.controller.ts
5. frontend/src/app/dashboard/organizacion/${e.slug}/page.tsx

Nombra las clases de forma consistente con el resto del proyecto (ej. Create${e.entityClass}Dto,
Update${e.entityClass}Dto, ${e.entityClass}sService o el plural que corresponda en espanol,
${e.entityClass}sController). Al terminar, responde con un resumen breve: lista de los 5 archivos
escritos y cualquier duda de import que no hayas podido resolver con certeza.`,
      { label: `organizacion:${e.slug}`, schema: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          archivos: { type: 'array', items: { type: 'string' } },
          notas: { type: 'string' },
        },
        required: ['slug', 'archivos'],
      } },
    ).then((r) => ({ entidad: e.slug, resultado: r })),
  ),
)

log(`Completados ${resultados.filter(Boolean).length}/${ENTIDADES.length} catalogos`)

return resultados
