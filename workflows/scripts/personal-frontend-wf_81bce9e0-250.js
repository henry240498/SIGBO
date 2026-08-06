export const meta = {
  name: 'personal-frontend',
  description: 'Construye en paralelo las pantallas de frontend del modulo Personal expandido (listado, alta, detalle con pestanas, catalogos equipos/vehiculos)',
  phases: [
    { title: 'Pantallas Personal' },
  ],
}

const CONTEXTO_COMUN = `Proyecto SIGBO-CBVC: frontend Next.js 14 (App Router, TypeScript, React) en C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src. NO toques el backend.

Convenciones OBLIGATORIAS de este proyecto (ya establecidas, seguilas exactamente):
- NO hay libreria de UI. Estilos con CSS plano via clases ya definidas en globals.css: 'card' (contenedor con borde redondeado), 'btn-primary' (boton), 'input-field' (inputs/selects/textareas), 'badge' (etiquetas de estado). Usalas tal cual, no inventes clases nuevas salvo estilos inline puntuales.
- Todas las paginas del dashboard son 'use client' y usan el hook useEffect + useState para cargar datos. Import de la API: import { apiFetch } from '@/lib/api' para llamadas JSON normales (siempre agrega el Bearer token automaticamente y setea Content-Type json). Para descargar archivos binarios (exportar Excel/PDF, descargar PDF/DOCX de la Foja de Servicio), usa fetch manual: import { API_ORIGIN, obtenerSesion } from '@/lib/api'; construye la URL completa con la variable de entorno equivalente a la de apiFetch (revisa '@/lib/api' — API_URL no esta exportado pero API_ORIGIN si; para las descargas usa \`\${API_ORIGIN}/api/v1/<ruta>\` con header Authorization: Bearer <token de obtenerSesion()?.accessToken>, y dispara la descarga con URL.createObjectURL(blob) + un <a> temporal con .click()).
- Lee PRIMERO estos archivos de referencia (patrones ya probados en este proyecto, replicalos):
  - C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\organizacion\rangos\page.tsx (patron de LISTADO: busqueda, filtro, tabla, botones exportar Excel/PDF, boton nuevo, badges de estado).
  - C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\seguridad\usuarios\[id]\page.tsx (patron de DETALLE: secciones en cards, formularios con muchos campos, listas dinamicas con agregar/quitar, guardar por seccion).
  - C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\mi-perfil\page.tsx (patron de listas dinamicas simples: agregar/quitar filas de un arreglo antes de guardar).
- Todas las rutas de la API backend van bajo el prefijo /api/v1 que ya maneja apiFetch internamente (o sea, apiFetch('/personal/bomberos') alcanza).
- Los permisos del usuario logueado estan en obtenerSesion()?.usuario.permisos (array de strings 'modulo:accion'). Oculta botones de accion (crear/editar) segun corresponda, siguiendo el patron ya usado en las paginas de referencia.
- No corras npm run build ni ningun comando — solo crea/edita archivos.
- Al final de tu respuesta, lista los archivos que creaste/editaste.`

const TAREAS = [
  {
    label: 'listado-personal',
    prompt: `${CONTEXTO_COMUN}

TAREA: reescribir por completo C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\personal\page.tsx (hoy es un placeholder minimo sin busqueda ni exportacion).

Endpoints del backend a usar (leelos antes en C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src\modules\personal\bomberos.controller.ts y bomberos.service.ts para confirmar campos exactos):
- GET /personal/bomberos?estado=X — listado (campos: id, numeroBombero, nombre, apellido, rango, cargo, estado, condicionInstitucional, telefonoPrincipal, email).
- GET /personal/bomberos/exportar/excel?estado=X y /personal/bomberos/exportar/pdf?estado=X — descarga de archivo (usa el patron de descarga binaria descrito arriba).

Requisitos de la pantalla:
- Buscador de texto libre (filtra client-side por nombre/apellido/numeroBombero/cedula ya cargados, no hace falta un endpoint de busqueda server-side).
- Filtro por estado (select con las 7 opciones: ASPIRANTE, ACTIVO, SUSPENDIDO, LICENCIA, RETIRADO, FALLECIDO, HONORARIO) que SI dispara una nueva llamada a GET /personal/bomberos?estado=X.
- Botones 'Exportar a Excel' y 'Exportar a PDF' (nunca ofrezcas CSV).
- Boton 'Nuevo bombero' (link a /dashboard/personal/nuevo) visible solo si el usuario tiene el permiso 'personal:crear'.
- Tabla con columnas: Codigo, Nombre completo, Rango, Cargo, Estado (badge con color segun estado), Condicion institucional. Cada fila es un link a /dashboard/personal/[id].
- Estado vacio ('Todavia no hay bomberos registrados...') si el listado esta vacio.`,
  },
  {
    label: 'alta-personal',
    prompt: `${CONTEXTO_COMUN}

TAREA: crear C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\personal\nuevo\page.tsx — formulario de alta de un bombero nuevo.

Antes de escribir el formulario, lee C:\Users\PC-HORIZONTE\sigbo-cbvc\backend\src\modules\personal\dto\create-bombero.dto.ts para la lista EXACTA y completa de campos (obligatorios vs opcionales) que acepta POST /personal/bomberos.

Para los selects de integracion con Organizacion Institucional (rangoId, cargoPrincipalId, companiaId, cuartelId, brigadaId, departamentoId, unidadId, turnoId, tipoGuardiaId) carga las opciones desde los endpoints ya existentes: GET /organizacion/rangos, GET /organizacion/cargos, GET /organizacion/companias, GET /organizacion/cuarteles, GET /organizacion/brigadas, GET /organizacion/departamentos, GET /organizacion/unidades, GET /organizacion/turnos, GET /organizacion/tipos-guardia (todos devuelven un array con al menos {id, nombre}) — mostralos como <select> con la propiedad 'nombre', enviando el 'id' como value. Todos estos selects son opcionales (el bombero puede crearse sin asignarlos todavia).

Estructura sugerida: agrupa el formulario en secciones dentro de cards (Datos personales, Contacto, Datos institucionales/laborales) igual que el patron de mi-perfil o usuarios/[id]. Al enviar, POST a /personal/bomberos con apiFetch; si responde ok, redirige (useRouter().push) a /dashboard/personal/[id nuevo] (el backend devuelve el bombero creado con su id). Muestra errores de validacion del backend (message del body de error) si la respuesta no es ok. Boton 'Cancelar' que vuelve a /dashboard/personal.`,
  },
  {
    label: 'detalle-personal',
    prompt: `${CONTEXTO_COMUN}

TAREA: crear C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\personal\[id]\page.tsx — la pagina de detalle/expediente completo de un bombero, con secciones (no hace falta un componente de "tabs" con libreria, podes usar botones que cambian una seccion activa en useState, o simplemente todas las secciones apiladas verticalmente en cards separadas — a tu criterio, prioriza que sea navegable y no abrumador dado que son muchas secciones).

Esta es la pantalla mas grande del modulo. Antes de escribir nada, lee TODOS estos archivos backend para conocer los campos y rutas EXACTOS (no asumas nombres de campo, confirmalos leyendo):
- backend/src/modules/personal/bomberos.controller.ts + bomberos.service.ts + dto/create-bombero.dto.ts + dto/update-bombero.dto.ts (datos base del bombero, PATCH para editar, PATCH :id/baja con {motivo} en el body)
- backend/src/modules/personal/especialidades-bombero.controller.ts + dto/set-especialidades.dto.ts (especialidades: GET/PUT, el PUT espera {especialidades: [{especialidadId, fechaObtencion?, nivel?, institucionCertificadora?, vigencia?}]} — para el selector de especialidades disponibles usa GET /organizacion/especialidades)
- backend/src/modules/personal/condicion.controller.ts + dto/actualizar-condicion.dto.ts (condicion institucional: GET/PUT ':id/condicion', body {condicionInstitucional, detalle})
- backend/src/modules/personal/historial-institucional.controller.ts + dto/crear-movimiento-historial.dto.ts (historial: GET ':id/historial' listado read-only con badges por tipoMovimiento, POST ':id/historial' SOLO permite tipoMovimiento RECONOCIMIENTO o SANCION con {tipoMovimiento, fecha, motivo?, observacion?, documentoUrl?})
- backend/src/modules/personal/idiomas.controller.ts + dto/idioma.dto.ts (lista dinamica agregar/quitar antes de guardar, PUT ':id/idiomas' con {idiomas: [{idioma, nivel?, certificacion?}]})
- backend/src/modules/personal/actividad-profesional.controller.ts + dto/actividad-profesional.dto.ts (dato unico, GET puede devolver null, PUT ':id/actividad-profesional' con {profesion?, empresa?, cargoLaboral?, experiencia?, actividadesRelacionadas?})
- backend/src/modules/vehiculos/vehiculos-autorizados.controller.ts + dto/vehiculo-autorizado.dto.ts (lista dinamica, PUT ':id/vehiculos-autorizados' con {vehiculos: [{vehiculoId, categoria?, fechaAutorizacion?, vigencia?, capacitaciones?}]} — para el selector de vehiculos usa GET /vehiculos/vehiculos)
- backend/src/modules/equipos/equipamiento-bombero.controller.ts + dto/prestamo-equipo-bombero.dto.ts (GET ':id/equipamiento' historial de prestamos read-only, POST ':id/equipamiento' con {equipoId, observaciones?} para prestar — selector de equipos via GET /equipos/equipos —, PATCH 'personal/bomberos/equipamiento/:prestamoId/devolucion' con {observaciones?} para marcar devuelto, boton 'Devolver' visible solo en prestamos con estado PRESTADO)
- backend/src/modules/personal/consultas-cruzadas.controller.ts (3 paneles READ-ONLY: GET ':id/guardias', GET ':id/servicios', GET ':id/formacion-academia' — muestra 'Sin registros todavia (el modulo correspondiente aun no esta implementado)' cuando el array viene vacio, no lo trates como error)
- backend/src/modules/personal/foja-servicio.controller.ts (Foja de Servicio: GET ':id/foja-servicio' devuelve array de anios con foja generada [2025,2026,...]; selector de anio; al elegir uno, GET ':id/foja-servicio/:anio' trae {archivoPdfUrl, archivoDocxUrl, generadoEn}; boton 'Generar/Regenerar Foja de este anio' hace POST ':id/foja-servicio' sin body, visible solo con permiso personal:generar_foja; los links de descarga PDF/DOCX son \`\${API_ORIGIN}\${archivoPdfUrl}\` y \`\${API_ORIGIN}\${archivoDocxUrl}\` con target='_blank')
- backend/src/modules/personal/certificacion.entity.ts en shared/entities (para saber que 'Formacion' del bombero hoy no tiene endpoint propio construido en este turno — OMITILO de esta pantalla, no inventes un endpoint que no existe; en su lugar, dentro del panel 'Formacion' solo muestra el resultado de GET ':id/formacion-academia' ya mencionado arriba).

Secciones a construir (en este orden):
1. Encabezado: foto (fotoUrl si existe, si no un icono generico), nombre completo, codigo (numeroBombero), rango, cargo, badge de estado, badge de condicion institucional. Boton 'Editar' que habilita edicion inline o navega a un modo edicion de la seccion Datos Generales (a tu criterio, mantenelo simple).
2. Datos Personales + Contacto + Institucional (edicion via PATCH /personal/bomberos/:id) — agrupa los campos logicamente.
3. Rangos y Cargos: simplemente dos links/botones hacia /dashboard/organizacion/ascensos?bomberoId=X y /dashboard/organizacion/designaciones?bomberoId=X con una nota 'El historial completo de ascensos y designaciones se administra desde el modulo Organizacion Institucional' (esos endpoints YA EXISTEN — GET /organizacion/ascensos y GET /organizacion/designaciones aceptan filtros, revisa esos controllers si queres mostrar un resumen inline en vez de solo linkear, a tu criterio segun el tiempo).
4. Especialidades (lista dinamica).
5. Historial Institucional (listado read-only + formulario para agregar RECONOCIMIENTO/SANCION).
6. Formacion (panel read-only de formacion-academia).
7. Actividad Profesional (formulario dato unico).
8. Idiomas (lista dinamica).
9. Guardias y Servicios (2 paneles read-only lado a lado o apilados).
10. Equipamiento (historial de prestamos + formulario para prestar + boton devolver).
11. Vehiculos Autorizados (lista dinamica).
12. Foja de Servicio (selector de anio, boton generar, links de descarga PDF/Word).

Todas las acciones de escritura deben respetar los permisos correspondientes (oculta botones si el usuario no tiene 'personal:editar' o el permiso especifico indicado arriba).`,
  },
  {
    label: 'catalogo-vehiculos',
    prompt: `${CONTEXTO_COMUN}

TAREA: crear C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\vehiculos\page.tsx — catalogo simple de vehiculos.

Antes de escribir, lee backend/src/modules/vehiculos/vehiculos.controller.ts, vehiculos.service.ts, dto/create-vehiculo.dto.ts y dto/update-vehiculo.dto.ts (rutas: GET/POST /vehiculos/vehiculos, PATCH /vehiculos/vehiculos/:id, permisos vehiculos:ver/crear/editar) para conocer los campos EXACTOS.

Pantalla: listado en tabla (numeroInterno, tipo, marca, modelo, patente, estado con badge) + boton 'Nuevo vehiculo' que abre un formulario (puede ser una seccion que aparece arriba de la tabla al hacer click, no hace falta una ruta separada) con TODOS los campos del CreateVehiculoDto agrupados razonablemente (identificacion, capacidad, estado/ubicacion, mantenimiento/seguro — todos opcionales excepto numeroInterno y tipo). Click en una fila abre el mismo formulario en modo edicion (PATCH). Sigue el patron visual de C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\organizacion\rangos\page.tsx (cards, input-field, btn-primary, badges) pero simplificado (sin exportar Excel/PDF, sin baja/reactivar).`,
  },
  {
    label: 'catalogo-equipos',
    prompt: `${CONTEXTO_COMUN}

TAREA: crear C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\equipos\page.tsx — catalogo simple de equipos y sus categorias.

Antes de escribir, lee backend/src/modules/equipos/equipos.controller.ts, categorias-equipo.controller.ts, sus services y todos los dto/*.ts (rutas: GET/POST/PATCH/DELETE /equipos/categorias y /equipos/equipos, permisos equipos:ver/crear/editar) para conocer los campos EXACTOS.

Pantalla con dos secciones: 
1. 'Categorias de Equipo' — lista simple (nombre, activo) + formulario de alta/edicion basico (nombre, descripcion, padreId opcional con select de las mismas categorias, activo).
2. 'Equipos' — tabla (codigoInterno, nombre, categoria (resuelve el nombre desde la lista de categorias cargada), marca, modelo, estado con badge) + boton 'Nuevo equipo' con formulario (categoriaId select, codigoInterno, nombre, descripcion, marca, modelo, numeroSerie, estado, ubicacion, fechaCompra, fechaVencimiento, vidaUtilMeses — todos opcionales excepto categoriaId/codigoInterno/nombre). Click en fila abre el mismo formulario en modo edicion (PATCH).

Sigue el patron visual de C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend\src\app\dashboard\organizacion\rangos\page.tsx (cards, input-field, btn-primary, badges) pero simplificado (sin exportar Excel/PDF, sin soft-delete — el backend expone DELETE fisico, usalo con una confirmacion antes de borrar).`,
  },
]

phase('Pantallas Personal')
const resultados = await parallel(TAREAS.map((t) => () => agent(t.prompt, { label: t.label, phase: 'Pantallas Personal' })))

return TAREAS.map((t, i) => ({ tarea: t.label, resultado: resultados[i] }))
