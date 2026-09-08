# REPORTE DE REPLICACIÓN DE BASE DE DATOS — SIGBO-CBVC

**Fecha del análisis:** 2026-08-07
> **ARCHIVO HISTÓRICO.** Este reporte describe una reconstrucción realizada el
> 2026-08-07 a partir de fuentes externas. No representa el estado actual del
> repositorio, no es una guía de instalación y no debe usarse para elegir
> versiones, autenticación ni scripts de migración. Consulte
> [README.md](README.md) y `run-migrations.ps1` para la ruta vigente.

**Alcance:** proyecto `SIGBO` (`C:\Users\PC-HORIZONTE\Documents\GitHub\SIGBO`)

> **Regla fundamental de este reporte:** todo lo escrito aquí distingue explícitamente
> entre **"evidencia documental"** (dato leído literalmente de una fuente verificable)
> e **"inferencia"** (deducción razonable cuando el dato exacto no estaba disponible).
> Nada se inventa. Cuando algo no pudo determinarse se indica como **"No determinado"**.
> Ver sección 10 para el listado completo de vacíos de información.

---

## 0. Nota metodológica — de dónde sale cada dato de este reporte

Antes de leer el resto del documento, es imprescindible entender **qué se inspeccionó
realmente** y por qué la fuente de este reporte no es el código fuente de la base de
datos, sino su documentación.

### 0.1 Lo que existe en el repositorio de GitHub `SIGBO`

El repositorio `C:\Users\PC-HORIZONTE\Documents\GitHub\SIGBO` (rama `main`, remoto
`https://github.com/henry240498/SIGBO.git`) contiene, a la fecha de este análisis,
**4 commits** y los siguientes archivos:

| Ruta | Contenido |
|---|---|
| `backend/package.json` | Proyecto NestJS 10 recién iniciado (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `rxjs`, `reflect-metadata`). **Sin TypeORM, sin driver `mssql`, sin ninguna dependencia de base de datos.** |
| `backend/src/app.module.ts` | `@Module({ imports: [], controllers: [], providers: [] })` — módulo raíz **vacío**. |
| `backend/src/main.ts` | Bootstrap mínimo de NestJS (`app.listen(3001)`), sin configuración de base de datos. |
| `frontend/package.json`, `frontend/src/**` | Next.js 14 con páginas de login/dashboard que **consumen** una API REST (`/api/v1/...`), pero no contienen SQL ni definición de esquema. |
| `workflows/scripts/backup_sqlserver.ps1` | Script de backup con `Invoke-Sqlcmd`/`sqlcmd`, `BACKUP DATABASE [$Database] TO DISK = ...`. Confirma el uso de **SQL Server**, pero no contiene el nombre real de la base ni su estructura (son parámetros). |
| `workflows/scripts/organizacion-catalogos-crud-wf_*.js`, `personal-frontend-wf_*.js`, `personal-subrecursos-backend-wf_*.js` | **Prompts de orquestación de agentes de IA** (no código de la app) que instruyen a otros agentes a generar CRUDs. Contienen, como texto dentro de los prompts, referencias muy valiosas: nombres de entidades, rutas de archivos, convenciones del proyecto y — crucialmente — la ruta del proyecto real. |

**No existe en este repositorio ningún archivo `.sql`, ninguna carpeta `migrations/`,
ninguna entidad TypeORM (`*.entity.ts`), ningún archivo de configuración de conexión
(`.env`, `ormconfig`, `data-source.ts`), ni ningún dato semilla.** Es decir: el
repositorio de GitHub, por sí solo, **no permite reconstruir la base de datos**.

### 0.2 El proyecto real referenciado

Los tres scripts de `workflows/scripts/` mencionan repetidamente, como ruta absoluta,
un proyecto **distinto y mucho más completo**:

```
C:\Users\PC-HORIZONTE\sigbo-cbvc\backend   (NestJS + TypeORM + SQL Server)
C:\Users\PC-HORIZONTE\sigbo-cbvc\frontend  (Next.js 14)
C:\Users\PC-HORIZONTE\sigbo-cbvc\database\migrations\*.sql
```

Se verificó (`ls`) que **esa carpeta no existe en esta máquina**. No está en el
historial de git del repositorio `SIGBO` en ningún momento (se revisaron los 4
commits). Es decir, el código fuente real del backend/frontend y los archivos de
migración `.sql` (`000_create_database.sql` … `015_perfil_usuario.sql`) **no están
disponibles** para este análisis.

### 0.3 La fuente que sí se pudo usar

Se localizó, dentro de `C:\Users\PC-HORIZONTE\Documents\`, el archivo
**`SIGBO-CBVC_Documentacion_Sistema_2026-08-04.docx`** (generado 3 días antes de este
análisis), un documento técnico de ~90 páginas que incluye, en su sección 6
"Diccionario de Datos", una descripción **columna por columna** de las 59 tablas del
sistema (tipo de dato exacto, nulabilidad, default, PK/FK/UQ/CHECK y notas de qué
migración agregó cada elemento), más una sección de "Notas Adicionales de
Migraciones" que resume el contenido de cada archivo `000_*.sql`…`015_*.sql`.

**Este documento es la única fuente de este reporte para todo lo referente a
estructura de base de datos.** Es documentación **derivada** del código fuente real
(aparentemente producida leyendo los propios archivos de migración), no el código
fuente en sí. Por decisión explícita del usuario de este análisis, se usa como fuente
primaria — ver siguiente aclaración de alcance — pero esto tiene consecuencias que se
detallan en la sección 10 "Información faltante": no se pudo verificar de forma
independiente ninguno de los datos contra el `.sql` o el servidor real, y el propio
documento contiene algunas inconsistencias internas (marcadas explícitamente donde
aparecen).

**Alcance por decisión del usuario:** ante la ausencia del proyecto real, se optó por
construir este reporte y sus scripts a partir del `.docx`, en vez de limitarse a
documentar el repositorio vacío. Cada sección de este reporte dejará explícito qué
proviene del `.docx` (evidencia documental de segunda mano) y qué es inferencia propia
de quien escribe este reporte.

---

## 1. Resumen

| Campo | Valor | Fuente |
|---|---|---|
| **Motor** | Microsoft SQL Server | Evidencia directa: `backup_sqlserver.ps1` (`Invoke-Sqlcmd`, `BACKUP DATABASE`), confirmado por el `.docx` |
| **Versión** | SQL Server 2019 Express | Declarado explícitamente en el `.docx`, sección "2.1 Stack Tecnológico". No verificable de forma independiente (no hay acceso al servidor) |
| **Nombre de la base de datos** | `sigbo_cbvc` | Nota de migración `000_create_database.sql` en el `.docx` |
| **Esquemas** | 11 (`seguridad`, `organizacion`, `personal`, `academia`, `operaciones`, `vehiculos`, `equipos`, `servicios`, `finanzas`, `deposito`, `documentos`) | `.docx`, sección "2.3 Esquemas de la Base de Datos" y "Resumen Numérico" |
| **Tablas detectadas** | 59 | `.docx`, "Resumen Numérico"; verificado por conteo propio de las 59 tablas documentadas en la sección 6 (ver 14_validation.sql) |
| **Columnas relevadas** | 752 (cifra del documento fuente) | `.docx`, "Resumen Numérico" — ver nota de reconciliación en sección 10 |
| **Views** | 0 detectadas | `.docx` confirma explícitamente ausencia de `CREATE VIEW` en las migraciones revisadas |
| **Functions** | 0 detectadas | ídem, ausencia de `CREATE FUNCTION` |
| **Procedures** | 0 detectadas | ídem, ausencia de `CREATE PROCEDURE` |
| **Triggers** | 0 detectados | ídem, ausencia de `CREATE TRIGGER` |
| **Sequences** | 0 objetos `SEQUENCE` (se usa `NEWSEQUENTIALID()` como DEFAULT de columna, no un objeto de secuencia) | Patrón repetido en las 59 tablas |
| **Índices no clusterizados** | 56 (documentados: 42 en migración 010 + 12 en migración 012 + 2 en migración 015) — ver discrepancia numérica en sección 10 | `.docx`, notas de migraciones 010/012/015 |
| **ORM** | TypeORM | `.docx` sección 2.1 y los 3 scripts de `workflows/` (mencionan `@InjectRepository`, `SnakeNamingStrategy` implícita: columnas TS en camelCase mapeadas a snake_case en la columna real) |
| **Backend** | NestJS 10 (Node.js/TypeScript), API REST bajo `/api/v1`, Swagger | `.docx` sección 2.1 |
| **Frontend** | Next.js 14 (App Router), TypeScript/React, CSS plano | `.docx` sección 2.1, confirmado por el código real en `frontend/` del repo GitHub |
| **Autenticación** | JWT + guard de permisos (RBAC) | `.docx` sección 2.1, confirmado por `frontend/src/lib/api.ts` (maneja `accessToken`/`refreshToken`) |

---

## 2. Arquitectura de la BD

### 2.1 Patrones de diseño verificados (evidencia documental explícita)

- **PK universal:** todas las claves primarias son `UNIQUEIDENTIFIER` con
  `DEFAULT NEWSEQUENTIALID()` (GUID secuencial, favorece el índice clustered frente a
  `NEWID()`), **excepto** `seguridad.logs_auditoria.id` (`BIGINT IDENTITY(1,1)`, tabla
  de auditoría de alto volumen).
- **Fechas/horas:** `DATETIMEOFFSET(3)` con `DEFAULT SYSDATETIMEOFFSET()` en casi toda
  columna temporal de auditoría; columnas de fecha "de negocio" (`fecha_nacimiento`,
  `fecha_ingreso`, etc.) usan `DATE`; horas puntuales usan `TIME(0)`.
  `personal.bomberos.domicilio_lat/lon` y varias columnas de coordenadas usan
  `DECIMAL(10,8)`/`DECIMAL(11,8)` explícitamente como **reemplazo del tipo `POINT` de
  PostgreSQL** (comentario textual encontrado en el script original según el `.docx`),
  lo que sugiere que el esquema fue **migrado desde un diseño previo en PostgreSQL**.
- **JSON como texto:** SQL Server no tiene tipo nativo JSON; el sistema usa
  `NVARCHAR(MAX)` + `CHECK (ISJSON(columna) = 1)` en toda columna que almacena arreglos
  u objetos (fotos, documentos, metadata, `datos_antes`/`datos_despues` de auditoría,
  `contactos_emergencia`, etc.).
- **Baja lógica, nunca `DELETE` físico** sobre catálogos y tablas maestras: columnas
  `estado` (`ACTIVO`/`INACTIVO`) + `eliminado_en` (marca de tiempo, `NULL` = vigente).
  Documentado explícitamente para el esquema `organizacion` y como principio general
  del sistema (usuarios/bomberos también se desactivan, no se borran).
- **Auditoría uniforme:** `creado_en`, `actualizado_en`, `creado_por`,
  `actualizado_por` en la mayoría de tablas "maestras"; las tablas de tipo bitácora
  (marcaciones, movimientos, mantenimientos) suelen omitir `actualizado_en` porque no
  se editan tras su creación.
- **RBAC con excepciones directas:** permiso = `'módulo:acción'`
  (ej. `organizacion:rangos_ver`). Los permisos se agrupan en roles
  (`seguridad.roles` ← `seguridad.asignacion_permisos_rol` →
  `seguridad.permisos`), los roles se asignan a usuarios
  (`seguridad.asignacion_roles`), y un usuario puede recibir permisos directos que
  **priorizan sobre el rol**, incluso para *denegar* explícitamente
  (`seguridad.asignacion_permisos_directos.concedido = 0`).
- **Configuración de fila única (singleton):** `seguridad.configuracion_sistema`
  nunca tiene más de una fila; toda escritura es `UPDATE`, nunca `INSERT` nuevo.
- **Validación de GUID no-RFC4122:** como `NEWSEQUENTIALID()` no genera GUID que
  cumplan estrictamente RFC 4122, la capa de aplicación usa una expresión regular
  propia (`GUID_REGEX`) en vez de `@IsUUID()` de `class-validator` — detalle
  confirmado además directamente en los 3 scripts de `workflows/` del repositorio
  GitHub (instrucción explícita "NUNCA uses `@IsUUID()` en este proyecto").
- **Columnas calculadas (`computed columns`):** 4 en todo el sistema —
  `personal.bomberos.antiguedad` (no `PERSISTED`, depende de la fecha actual),
  `academia.materias.horas_totales` (`PERSISTED`),
  `academia.inscripciones_cursos.participante_id` (`PERSISTED`, `COALESCE`),
  `servicios.servicios.kilometraje_total` (`PERSISTED`).
- **`FOREIGN KEY` agregadas por separado de `CREATE TABLE`:** el patrón documentado es
  crear todas las tablas primero (sin `FOREIGN KEY` inline) y agregar las relaciones
  después vía `ALTER TABLE ... ADD CONSTRAINT` en un archivo de migración dedicado.
  Ver sección 5 y sección 10 para el detalle de qué relaciones están confirmadas como
  físicas y cuáles quedaron solo "lógicas" (por convención de nombre, sin constraint).

### 2.2 Los 11 esquemas y su rol

```
seguridad     → autenticación, RBAC, sesiones, auditoría, apariencia, "Mi Perfil"
organizacion  → catálogos institucionales (rangos, cargos, compañías, cuarteles, ...)
personal      → legajo del bombero (datos, especialidades, certificaciones, ...)
academia      → aspirantes, materias, cursos, exámenes, notas, asistencia
operaciones   → guardias, asignación de guardias, cambios, eventos/marcaciones de asistencia
servicios     → tipos de servicio, servicios (emergencias), personal asignado, tracking
vehiculos     → parque automotor, mantenimientos, consumo de combustible
equipos       → inventario de equipos/EPP, categorías, mantenimientos, préstamos
finanzas      → plan de cuentas contables, movimientos de ingreso/egreso
deposito      → ítems de depósito/almacén, movimientos de stock
documentos    → gestor documental institucional (resoluciones, actas, permisos, ...)
```

**Estado de desarrollo (evidencia documental explícita, sección "Cierre y Próximos
Pasos" del `.docx`):** solo los módulos **Seguridad, Organización Institucional y
Personal** (más las utilidades compartidas de exportación/archivos) tienen backend y
frontend desarrollados. Las tablas de `academia`, `operaciones`, `vehiculos`,
`equipos`, `servicios`, `finanzas`, `deposito` y `documentos` **ya existen en el
esquema** pero, según el propio documento, sus módulos de aplicación "todavía no
fueron desarrollados" — con la salvedad de que los 3 scripts de `workflows/` del
repositorio GitHub sí muestran trabajo posterior en curso sobre `vehiculos` y
`equipos` (tareas "vehiculos" y "equipos" del script
`personal-subrecursos-backend-wf`), lo que sugiere que el sistema avanzó más allá de
lo que refleja la fecha del `.docx`.

### 2.3 Visión a futuro (fuera del alcance de la réplica actual)

El `.docx` documenta una hoja de ruta **aprobada conceptualmente pero no
implementada**: evolucionar hacia una plataforma multi-institución (multi-tenant).
El documento aclara explícitamente que "el esquema de base de datos actual no
contempla todavía ninguna noción de institución/tenant". **Este reporte no incluye
ninguna estructura de aislamiento multi-tenant** porque no existe evidencia de que
se haya implementado.

---

## 3. Inventario de objetos

| Tipo | Cantidad | Estado | Dependencias clave |
|---|---|---|---|
| Esquemas | 11 | ✔ Documentado, scripts listos (`02_create_schemas.sql`) | Ninguna (excepto `organizacion`, que depende de que la BD exista) |
| Tablas | 59 | ✔ Documentado, scripts listos (`04_create_tables.sql`) | Ver tabla de tablas más abajo |
| Primary Keys | 59 (una por tabla) | ✔ Inline en `04_create_tables.sql` | — |
| Foreign Keys físicas confirmadas | 68 | ✔ Scripts listos (`06_create_constraints.sql` Parte A) | Requiere las 59 tablas creadas |
| Relaciones lógicas sin FK física confirmada | ~46 | ⚠ Documentadas pero NO implementadas como constraint (ver sección 5 y 10) | — |
| Índices no clusterizados | 56 | ✔ Scripts listos (`07_create_indexes.sql`) | Requiere las tablas creadas |
| Restricciones UNIQUE | ~40 (inline por tabla, ver sección 4) | ✔ Inline en `04_create_tables.sql` | — |
| Restricciones CHECK | ~65 (inline por tabla, ver sección 4) | ✔ Inline en `04_create_tables.sql` | — |
| Columnas calculadas | 4 | ✔ Inline en `04_create_tables.sql` (1 aproximada, ver sección 10) | — |
| Views | 0 | No detectado en la fuente | — |
| Functions | 0 | No detectado en la fuente | — |
| Stored Procedures | 0 | No detectado en la fuente | — |
| Triggers | 0 | No detectado en la fuente | — |
| Sequences (objeto `SEQUENCE`) | 0 (se usa `NEWSEQUENTIALID()`/`IDENTITY`) | No aplica | — |
| Tipos definidos por el usuario | 0 | No detectado en la fuente | — |
| Datos semilla (permisos + config) | 3 lotes de permisos + 1 fila singleton | ✔ Scripts listos (`12_insert_master_data.sql`) | Requiere fila de rol "Administrador General" preexistente (No determinado, ver sección 10) |
| Datos operativos reales | 0 disponibles | ✘ No disponible, ver sección 6.C y 13_insert_initial_data.sql | — |

### Inventario de tablas (59)

| # | Esquema | Tabla | Propósito funcional (documentado) |
|---|---|---|---|
| 1 | seguridad | usuarios | Cuentas de acceso al sistema (login, seguridad de cuenta, 2FA, redes sociales) |
| 2 | seguridad | roles | Perfiles de trabajo que agrupan permisos (RBAC) |
| 3 | seguridad | permisos | Catálogo granular de acciones controlables del sistema |
| 4 | seguridad | restricciones | Reglas ABAC adicionales sobre un permiso (condición JSON) |
| 5 | seguridad | asignacion_roles | Rol ↔ usuario, con vigencia opcional |
| 6 | seguridad | asignacion_permisos_rol | Permiso ↔ rol |
| 7 | seguridad | asignacion_permisos_directos | Permiso ↔ usuario directo (override, puede denegar) |
| 8 | seguridad | sesiones | Refresh tokens activos/históricos por usuario/dispositivo |
| 9 | seguridad | logs_auditoria | Bitácora de auditoría de alto volumen (PK BIGINT) |
| 10 | seguridad | historial_contrasenas | Histórico de hashes para impedir reutilización |
| 11 | seguridad | configuracion_sistema | Fila única: branding de login/menú + política de perfil |
| 12 | seguridad | usuario_correos | Lista dinámica de correos por usuario |
| 13 | seguridad | usuario_telefonos | Lista dinámica de teléfonos por usuario |
| 14 | organizacion | rangos | Escalafón jerárquico (Bombero, Capitán, ...) |
| 15 | organizacion | cargos | Puestos organizacionales, con jerarquía interna |
| 16 | organizacion | especialidades | Especialidades técnicas del personal |
| 17 | organizacion | companias | Compañías de bomberos (unidad territorial principal) |
| 18 | organizacion | cuarteles | Sedes físicas de una compañía |
| 19 | organizacion | brigadas | Agrupaciones operativas transversales |
| 20 | organizacion | departamentos | Departamentos administrativos/funcionales |
| 21 | organizacion | unidades | Subdivisiones operativas, opcionalmente de una brigada |
| 22 | organizacion | turnos | Turnos de trabajo (horarios) |
| 23 | organizacion | tipos_guardia | Catálogo de modalidades de guardia |
| 24 | organizacion | designaciones | Historial de bombero ↔ cargo, con vigencia |
| 25 | organizacion | ascensos | Historial de cambios de rango de un bombero |
| 26 | personal | bomberos | Legajo maestro del personal bombero |
| 27 | personal | bombero_especialidades | Bombero ↔ especialidad, con fecha de obtención |
| 28 | personal | certificaciones | Certificaciones/cursos obtenidos por un bombero |
| 29 | personal | historial_disciplinario | Medidas disciplinarias aplicadas |
| 30 | personal | historial_medico | Historial clínico del bombero |
| 31 | personal | licencias | Licencias/habilitaciones (ej. de conducir) |
| 32 | academia | materias | Malla curricular (asignaturas) |
| 33 | academia | cursos | Instancia programada de una materia |
| 34 | academia | examenes | Evaluaciones dentro de un curso |
| 35 | academia | inscripciones_cursos | Matrícula de un bombero o aspirante en un curso |
| 36 | academia | notas_examenes | Calificación por inscripción/examen |
| 37 | academia | asistencia_academia | Asistencia diaria a un curso |
| 38 | academia | aspirantes | Postulantes al ingreso a la academia |
| 39 | operaciones | guardias | Turno de guardia programado |
| 40 | operaciones | asignacion_guardias | Bombero asignado a una guardia |
| 41 | operaciones | cambios_guardias | Solicitud de reemplazo de guardia |
| 42 | operaciones | eventos_asistencia | Evento maestro contra el cual se marca asistencia |
| 43 | operaciones | marcaciones_asistencia | Marcación individual de entrada/salida |
| 44 | vehiculos | vehiculos | Ficha maestra del parque automotor |
| 45 | vehiculos | mantenimientos_vehiculos | Historial de mantenimiento de un vehículo |
| 46 | vehiculos | consumos_combustible | Cargas de combustible |
| 47 | equipos | categorias_equipo | Árbol de categorías de equipos/herramientas |
| 48 | equipos | equipos | Inventario individual de equipos/EPP |
| 49 | equipos | mantenimientos_equipos | Historial de mantenimiento/calibración |
| 50 | equipos | prestamos_equipos | Préstamo de un equipo a un bombero o servicio |
| 51 | servicios | tipos_servicio | Catálogo configurable de tipos de emergencia |
| 52 | servicios | servicios | Registro central de cada servicio/emergencia atendido |
| 53 | servicios | personal_servicio | Bomberos que participaron en un servicio |
| 54 | servicios | historial_servicios | Bitácora/tracking GPS de un servicio en curso |
| 55 | finanzas | cuentas_contables | Plan de cuentas contables |
| 56 | finanzas | movimientos | Ingresos y egresos financieros |
| 57 | deposito | items_deposito | Catálogo de ítems/insumos de depósito, con stock |
| 58 | deposito | movimientos_deposito | Entradas/salidas de stock |
| 59 | documentos | documentos | Gestor documental institucional |

---

## 4. Estructura de tablas

**Nota de diseño de esta sección:** la especificación columna-por-columna
**exhaustiva y ejecutable** de las 59 tablas vive en
[`scripts/04_create_tables.sql`](scripts/04_create_tables.sql) (comentado en detalle,
con la fuente/migración de cada elemento). Esta sección resume, por tabla,
lo esencial para lectura humana (clave primaria, claves foráneas relevantes,
restricciones únicas y de negocio más importantes) sin repetir línea por línea las
752 columnas ya documentadas en el script — repetir todo dos veces en formatos
distintos aumentaría el riesgo de que ambos documentos queden inconsistentes entre sí
ante una futura corrección. Para el detalle exacto de tipo/longitud/nulabilidad/
default de cada columna, remitirse siempre a `04_create_tables.sql`, que es la fuente
única de verdad ejecutable de este reporte.

### 4.1 Esquema `seguridad` (13 tablas)

| Tabla | PK | FK relevantes | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `usuarios` | `id` (GUID) | `bombero_id`→personal.bomberos *(lógica)*, `creado_por`→self *(lógica)* | `email`, `username` | `estado IN ('ACTIVO','INACTIVO','BLOQUEADO','PENDIENTE_VERIFICACION')`. Documentada como "preexistente"; 26 columnas conocidas (ver 10) |
| `roles` | `id` | `creado_por`→usuarios *(lógica)* | `nombre` | `metadata` JSON válido; `activo` agregada en migración 011 |
| `permisos` | `id` | — | `nombre` (formato `recurso:accion`) | `metadata` JSON válido |
| `restricciones` | `id` | `permiso_id`→permisos *(lógica)* | — | `tipo IN ('campo','recurso','tiempo','ubicacion','custom')`; `condicion` JSON válido y obligatorio |
| `asignacion_roles` | `id` | `usuario_id`, `rol_id`, `asignado_por` *(todas lógicas)* | `(usuario_id, rol_id)` | `fecha_expiracion NULL` = permanente |
| `asignacion_permisos_rol` | `id` | `rol_id`, `permiso_id`, `asignado_por` *(lógicas)* | `(rol_id, permiso_id)` | — |
| `asignacion_permisos_directos` | `id` | `usuario_id`, `permiso_id`, `asignado_por` *(lógicas)* | `(usuario_id, permiso_id)` | `concedido=0` → denegación explícita (override negativo) |
| `sesiones` | `id` | `usuario_id` *(lógica)* | — | `session_data` JSON válido u opcional |
| `logs_auditoria` | `id` (**BIGINT IDENTITY**, no GUID) | `usuario_id` *(lógica, nullable)* | — | `datos_antes`/`datos_despues`/`metadata` JSON válidos u `NULL` |
| `historial_contrasenas` | `id` | `usuario_id`→usuarios (**física**, `FK_histpass_usuario`) | — | — |
| `configuracion_sistema` | `id` | `actualizado_por`→usuarios (**física**, `FK_configap_actpor`) | — | **Fila única (singleton)**; nombre de tabla/constraints heredado de `configuracion_apariencia` (renombrada en migración 014) |
| `usuario_correos` | `id` | `usuario_id`→usuarios (**física**, `ON DELETE CASCADE`) | — | Lista dinámica 1-a-N, migración 015 |
| `usuario_telefonos` | `id` | `usuario_id`→usuarios (**física**, `ON DELETE CASCADE`) | — | Lista dinámica 1-a-N, migración 015 |

### 4.2 Esquema `organizacion` (12 tablas)

| Tabla | PK | FK relevantes (todas físicas, con nombre confirmado) | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `rangos` | `id` | — (sin FK funcional propia) | `codigo`, `nombre` | `estado IN ('ACTIVO','INACTIVO')` |
| `cargos` | `id` | `dependencia_cargo_id`→self (`FK_cargos_dependencia`, jerarquía) | `codigo`, `nombre` | ídem |
| `especialidades` | `id` | — | `codigo`, `nombre` | ídem |
| `companias` | `id` | — | `codigo`, `nombre` | ídem |
| `cuarteles` | `id` | `compania_id`→companias (`FK_cuartel_compania`), `responsable_bombero_id`→personal.bomberos (`FK_cuartel_responsable`, `SET NULL`) | `codigo` (nombre **NO** único) | ídem |
| `brigadas` | `id` | — | `codigo`, `nombre` | ídem |
| `departamentos` | `id` | — | `codigo`, `nombre` | ídem. **No confundir** con `personal.bomberos.departamento` (dirección/provincia) |
| `unidades` | `id` | `brigada_id`→brigadas (`FK_unidades_brigada`) | `codigo` (nombre **NO** único) | ídem |
| `turnos` | `id` | `responsable_bombero_id`→personal.bomberos (`FK_turno_responsable`, `SET NULL`) | `codigo`, `nombre` | ídem |
| `tipos_guardia` | `id` | — | `codigo`, `nombre` | ídem. Distinta de `operaciones.guardias` (guardias reales programadas) |
| `designaciones` | `id` | `bombero_id` (`FK_desig_bombero`), `cargo_id` (`FK_desig_cargo`), `compania_id` (`FK_desig_compania`), `cuartel_id` (`FK_desig_cuartel`) | — | `estado IN ('ACTIVA','FINALIZADA','ANULADA')`; `fecha_hasta >= fecha_desde` |
| `ascensos` | `id` | `bombero_id` (`FK_ascenso_bombero`), `rango_anterior_id` (`FK_ascenso_rango_anterior`, `SET NULL`), `rango_nuevo_id` (`FK_ascenso_rango_nuevo`) | — | `estado IN ('REGISTRADO','ANULADO')` |

Las 12 tablas comparten además: `estado` + `eliminado_en` (baja lógica),
`creado_en`/`actualizado_en`/`creado_por`/`actualizado_por` con FK física de
auditoría hacia `seguridad.usuarios` (24 constraints, 2 por tabla).

### 4.3 Esquema `personal` (6 tablas)

| Tabla | PK | FK relevantes | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `bomberos` | `id` | `rango_id`, `cargo_principal_id`, `compania_id`, `cuartel_id`, `turno_id`, `tipo_guardia_id` → organización (todas **físicas**, `SET NULL`, agregadas en migración 012) | `cedula`, `numero_bombero` | `sexo IN ('M','F')` o NULL; `estado IN ('ACTIVO','RESERVA','INOPERATIVO','RETIRADO','SUSPENDIDO')`; `contactos_emergencia` JSON; columna calculada `antiguedad` (ver 10) |
| `bombero_especialidades` | `id` | `bombero_id`→bomberos (**física**, `CASCADE`), `especialidad_id`→organizacion.especialidades (**física**) | `(bombero_id, especialidad_id)` | Sin `CHECK` de estado (a diferencia del resto del sistema, documentado explícitamente) |
| `certificaciones` | `id` | `bombero_id` *(lógica)* | — | `tipo IN ('BASICO','INTERMEDIO','AVANZADO','ESPECIALIDAD')`; `estado IN ('VIGENTE','VENCIDO','EN_PROCESO')` |
| `historial_disciplinario` | `id` | `bombero_id`, `creado_por` *(lógicas)* | — | `tipo IN ('APERCIBIMIENTO','SUSPENSION','MULTA','BAJA')`; `estado IN ('ACTIVO','CUMPLIDO','ANULADO')` |
| `historial_medico` | `id` | `bombero_id`, `creado_por` *(lógicas)* | — | `tipo IN ('CONSULTA','EXAMEN','ACCIDENTE','VACUNA')` |
| `licencias` | `id` | `bombero_id` *(lógica)* | — | `estado IN ('VIGENTE','VENCIDA','SUSPENDIDA')` |

### 4.4 Esquema `academia` (7 tablas)

| Tabla | PK | FK (todas **lógicas/implícitas**, sin constraint físico confirmado — ver sección 10) | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `materias` | `id` | — | `codigo` | `nivel IN ('BASICO','INTERMEDIO','AVANZADO')`; `horas_totales` calculada `PERSISTED` |
| `cursos` | `id` | `materia_id`→materias, `instructor_id`→personal.bomberos | — | `fecha_fin >= fecha_inicio`; `estado IN ('PLANIFICADO','EN_CURSO','FINALIZADO','CANCELADO')` |
| `examenes` | `id` | `curso_id`→cursos | — | `tipo IN ('TEORICO','PRACTICO','RECUPERATORIO')` |
| `inscripciones_cursos` | `id` | `curso_id`→cursos, `bombero_id`→personal.bomberos, `aspirante_id`→aspirantes | `(curso_id, participante_id)` | Exactamente uno de `bombero_id`/`aspirante_id` no nulo (`CK_insc_participante`); `participante_id` calculada `PERSISTED` |
| `notas_examenes` | `id` | `examen_id`→examenes, `inscripcion_id`→inscripciones_cursos | `(examen_id, inscripcion_id)` | `estado IN ('PENDIENTE','APROBADO','REPROBADO','RECUPERANDO')` |
| `asistencia_academia` | `id` | `inscripcion_id`→inscripciones_cursos, `marcado_por`→personal.bomberos | `(inscripcion_id, fecha)` | — |
| `aspirantes` | `id` | — | `cedula` | `estado IN ('INSCRITO','EN_CURSO','APROBADO','RECHAZADO','RETIRADO')` |

### 4.5 Esquema `operaciones` (5 tablas)

| Tabla | PK | FK (todas **lógicas/implícitas**) | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `guardias` | `id` | `jefe_guardia_id`→personal.bomberos | — | `turno IN ('DIURNO','NOCTURNO','COMPLETO')`; `tipo IN ('ORDINARIA','ESPECIAL','EXTRAORDINARIA')`; `estado IN ('PROGRAMADA','EN_CURSO','FINALIZADA','CANCELADA','REEMPLAZADA')` |
| `asignacion_guardias` | `id` | `guardia_id`→guardias, `bombero_id`→personal.bomberos, `asignado_por`→personal.bomberos | `(guardia_id, bombero_id)` | `estado IN ('ASIGNADO','CONFIRMADO','REEMPLAZADO','AUSENTE')` |
| `cambios_guardias` | `id` | `asignacion_original_id`→asignacion_guardias, `bombero_nuevo_id`/`solicitante_id`/`aprobado_por`→personal.bomberos | — | `estado IN ('PENDIENTE','APROBADO','RECHAZADO','CANCELADO')` |
| `eventos_asistencia` | `id` | `responsable_id`→personal.bomberos | — | `tipo IN ('GUARDIA','PRACTICA','CITACION','CURSO','ASAMBLEA','SERVICIO')`; `fecha_fin >= fecha_inicio` |
| `marcaciones_asistencia` | `id` | `evento_id`→eventos_asistencia, `bombero_id`/`verificado_por`→personal.bomberos | — | `tipo_marcacion IN ('ENTRADA','SALIDA')`; `metodo IN ('HUELLA','QR','PIN','RFID','MANUAL','APP')` |

### 4.6 Esquema `vehiculos` (3 tablas)

| Tabla | PK | FK | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `vehiculos` | `id` | — | `numero_interno`, `patente` | `estado IN ('OPERATIVO','EN_MANTENIMIENTO','FUERA_SERVICIO','BAJA')`; `fotos`/`documentos` JSON `NOT NULL DEFAULT '[]'`; `metadata` JSON opcional |
| `mantenimientos_vehiculos` | `id` | `vehiculo_id`→vehiculos *(lógica)*, `creado_por`→personal.bomberos *(lógica)* | — | `tipo IN ('PREVENTIVO','CORRECTIVO','EMERGENCIA','ITV','REPARACION')` |
| `consumos_combustible` | `id` | `vehiculo_id`→vehiculos *(lógica)*, `creado_por`→personal.bomberos *(lógica)* | — | `tipo_combustible` sin `CHECK` (valor libre, documentado explícitamente) |

### 4.7 Esquema `equipos` (4 tablas)

| Tabla | PK | FK | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `categorias_equipo` | `id` | `padre_id`→self *(lógica, árbol)* | — | Sin `actualizado_en` |
| `equipos` | `id` | `categoria_id`→categorias_equipo *(lógica)*, `responsable_id`→personal.bomberos *(lógica)* | `codigo_interno` | `estado IN ('OPERATIVO','EN_MANTENIMIENTO','DANIADO','BAJA','PRESTADO')` |
| `mantenimientos_equipos` | `id` | `equipo_id`→equipos *(lógica)*, `creado_por`→personal.bomberos *(lógica)* | — | `tipo IN ('PREVENTIVO','CORRECTIVO','CALIBRACION')` |
| `prestamos_equipos` | `id` | `equipo_id`→equipos *(lógica)*, `bombero_id`/`creado_por`→personal.bomberos *(lógica)*, **`servicio_id`→servicios.servicios (física, `ON DELETE SET NULL`, confirmada en notas de migración 009)** | — | `estado IN ('PRESTADO','DEVUELTO','EXTRAVIADO','DANIADO')` |

### 4.8 Esquema `servicios` (4 tablas)

| Tabla | PK | FK (todas físicas, con nombre confirmado) | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `tipos_servicio` | `id` | — | `codigo` | `metadata` JSON opcional |
| `servicios` | `id` | `tipo_servicio_id` (`FK_ser_tiposervicio`), `vehiculo_principal_id`→vehiculos (`FK_ser_vehiculo`, `SET NULL`), `oficial_ro_id`/`jefe_servicio_id`→personal.bomberos (`FK_ser_oficialro`/`FK_ser_jefeservicio`, ambas `NO ACTION` para evitar rutas múltiples de cascada), `creado_por` (`FK_ser_creadopor`) | `numero_servicio` | `gravedad IN ('LEVE','MODERADA','GRAVE','CRITICA')` o NULL; `estado IN ('REGISTRADO','DESPACHADO','EN_CURSO','FINALIZADO','CANCELADO')`; `kilometraje_total` calculada `PERSISTED` |
| `personal_servicio` | `id` | `servicio_id` (`FK_perser_servicio`, `CASCADE`), `bombero_id` (`FK_perser_bombero`) | `(servicio_id, bombero_id)` | — |
| `historial_servicios` | `id` | `servicio_id` (`FK_hser_servicio`, `CASCADE`), `creado_por` (`FK_hser_creadopor`) | — | `tipo_evento IN ('SALIDA','LLEGADA','GPS','COMBUSTIBLE','INCIDENTE','FIN')`; `datos` JSON opcional |

### 4.9 Esquema `finanzas` (2 tablas)

| Tabla | PK | FK (físicas) | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `cuentas_contables` | `id` | — | `codigo` | `tipo IN ('INGRESO','GASTO','ACTIVO','PASIVO')` |
| `movimientos` | `id` | `cuenta_id` (`FK_mov_cuenta`), `donante_id`→personal.bomberos (`FK_mov_donante`, `SET NULL`), `creado_por` (`FK_mov_creadopor`) | — | `tipo IN ('INGRESO','EGRESO')` |

### 4.10 Esquema `deposito` (2 tablas)

| Tabla | PK | FK (físicas) | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `items_deposito` | `id` | — | `codigo` | `categoria IN ('ESPUMA','COMBUSTIBLE','GUANTES','GASAS','MEDICAMENTOS','PAPELERIA','LIMPIEZA','OTROS')` |
| `movimientos_deposito` | `id` | `item_id` (`FK_movdep_item`, `CASCADE`), `servicio_id` (`FK_movdep_servicio`, `SET NULL`), `bombero_id` (`FK_movdep_bombero`, `SET NULL`), `creado_por` (`FK_movdep_creadopor`) | — | `tipo IN ('ENTRADA','SALIDA')` |

### 4.11 Esquema `documentos` (1 tabla)

| Tabla | PK | FK (físicas) | UNIQUE | CHECK / notas |
|---|---|---|---|---|
| `documentos` | `id` | `bombero_id` (`FK_doc_bombero`, `SET NULL`), `servicio_id` (`FK_doc_servicio`, `SET NULL`), `creado_por` (`FK_doc_creadopor`) | — | `tipo IN ('RESOLUCION','CIRCULAR','CITACION','NOTA','PERMISO','JUSTIFICACION','ACTA','INFORME')`; `estado IN ('ACTIVO','ARCHIVADO','VENCIDO')` |

---

## 5. Relaciones

### 5.1 Relaciones físicas confirmadas (68 — implementadas en `06_create_constraints.sql` Parte A)

Cardinalidad: salvo que se indique lo contrario, todas son **N:1** (muchos-a-uno)
desde la tabla origen hacia la tabla destino.

| # | Tabla origen | Columna | Tabla destino | ON DELETE | ON UPDATE |
|---|---|---|---|---|---|
| 1 | seguridad.configuracion_sistema | actualizado_por | seguridad.usuarios | NO ACTION *(no especificado)* | NO ACTION |
| 2 | seguridad.historial_contrasenas | usuario_id | seguridad.usuarios | NO ACTION | NO ACTION |
| 3 | seguridad.usuario_correos | usuario_id | seguridad.usuarios | **CASCADE** | NO ACTION |
| 4 | seguridad.usuario_telefonos | usuario_id | seguridad.usuarios | **CASCADE** | NO ACTION |
| 5 | organizacion.cargos | dependencia_cargo_id | organizacion.cargos *(auto-referencia)* | NO ACTION | NO ACTION |
| 6 | organizacion.cuarteles | compania_id | organizacion.companias | NO ACTION | NO ACTION |
| 7 | organizacion.cuarteles | responsable_bombero_id | personal.bomberos | **SET NULL** | NO ACTION |
| 8 | organizacion.turnos | responsable_bombero_id | personal.bomberos | **SET NULL** | NO ACTION |
| 9 | organizacion.unidades | brigada_id | organizacion.brigadas | NO ACTION | NO ACTION |
| 10 | organizacion.designaciones | bombero_id | personal.bomberos | NO ACTION | NO ACTION |
| 11 | organizacion.designaciones | cargo_id | organizacion.cargos | NO ACTION | NO ACTION |
| 12 | organizacion.designaciones | compania_id | organizacion.companias | NO ACTION | NO ACTION |
| 13 | organizacion.designaciones | cuartel_id | organizacion.cuarteles | NO ACTION | NO ACTION |
| 14 | organizacion.ascensos | bombero_id | personal.bomberos | NO ACTION | NO ACTION |
| 15 | organizacion.ascensos | rango_anterior_id | organizacion.rangos | **SET NULL** | NO ACTION |
| 16 | organizacion.ascensos | rango_nuevo_id | organizacion.rangos | NO ACTION | NO ACTION |
| 17–40 | organizacion.\* (12 tablas) | creado_por / actualizado_por | seguridad.usuarios | NO ACTION | NO ACTION |
| 41 | personal.bomberos | rango_id | organizacion.rangos | **SET NULL** | NO ACTION |
| 42 | personal.bomberos | cargo_principal_id | organizacion.cargos | **SET NULL** | NO ACTION |
| 43 | personal.bomberos | compania_id | organizacion.companias | **SET NULL** | NO ACTION |
| 44 | personal.bomberos | cuartel_id | organizacion.cuarteles | **SET NULL** | NO ACTION |
| 45 | personal.bomberos | turno_id | organizacion.turnos | **SET NULL** | NO ACTION |
| 46 | personal.bomberos | tipo_guardia_id | organizacion.tipos_guardia | **SET NULL** | NO ACTION |
| 47 | personal.bombero_especialidades | bombero_id | personal.bomberos | **CASCADE** | NO ACTION |
| 48 | personal.bombero_especialidades | especialidad_id | organizacion.especialidades | NO ACTION | NO ACTION |
| 49 | servicios.servicios | tipo_servicio_id | servicios.tipos_servicio | NO ACTION | NO ACTION |
| 50 | servicios.servicios | vehiculo_principal_id | vehiculos.vehiculos | **SET NULL** | NO ACTION |
| 51 | servicios.servicios | oficial_ro_id | personal.bomberos | **NO ACTION** *(explícito, evita rutas múltiples de cascada)* | NO ACTION |
| 52 | servicios.servicios | jefe_servicio_id | personal.bomberos | **NO ACTION** *(ídem)* | NO ACTION |
| 53 | servicios.servicios | creado_por | seguridad.usuarios | NO ACTION | NO ACTION |
| 54 | servicios.personal_servicio | servicio_id | servicios.servicios | **CASCADE** | NO ACTION |
| 55 | servicios.personal_servicio | bombero_id | personal.bomberos | NO ACTION | NO ACTION |
| 56 | servicios.historial_servicios | servicio_id | servicios.servicios | **CASCADE** | NO ACTION |
| 57 | servicios.historial_servicios | creado_por | seguridad.usuarios | NO ACTION | NO ACTION |
| 58 | finanzas.movimientos | cuenta_id | finanzas.cuentas_contables | NO ACTION | NO ACTION |
| 59 | finanzas.movimientos | donante_id | personal.bomberos | **SET NULL** | NO ACTION |
| 60 | finanzas.movimientos | creado_por | seguridad.usuarios | NO ACTION | NO ACTION |
| 61 | deposito.movimientos_deposito | item_id | deposito.items_deposito | **CASCADE** | NO ACTION |
| 62 | deposito.movimientos_deposito | servicio_id | servicios.servicios | **SET NULL** | NO ACTION |
| 63 | deposito.movimientos_deposito | bombero_id | personal.bomberos | **SET NULL** | NO ACTION |
| 64 | deposito.movimientos_deposito | creado_por | seguridad.usuarios | NO ACTION | NO ACTION |
| 65 | documentos.documentos | bombero_id | personal.bomberos | **SET NULL** | NO ACTION |
| 66 | documentos.documentos | servicio_id | servicios.servicios | **SET NULL** | NO ACTION |
| 67 | documentos.documentos | creado_por | seguridad.usuarios | NO ACTION | NO ACTION |
| 68 | equipos.prestamos_equipos | servicio_id | servicios.servicios | **SET NULL** *(confirmado en notas de migración 009, no en la ficha de la tabla)* | NO ACTION |

*(Las filas 17–40 se resumen como rango porque son el mismo patrón, 2 por tabla,
repetido para `rangos, cargos, especialidades, companias, cuarteles, brigadas,
departamentos, unidades, turnos, tipos_guardia, designaciones, ascensos`; el listado
expandido está en `06_create_constraints.sql`.)*

### 5.2 Relaciones lógicas documentadas, **sin constraint físico confirmado**

Aproximadamente 46 relaciones adicionales (columnas `*_id` cuyo nombre sigue la
convención de una FK, pero para las que el documento fuente indica explícitamente
"FK lógica", "FK implícita, sin constraint declarado" o "Referencia inferida").
Incluyen **todas** las relaciones internas de los esquemas `academia` y
`operaciones`, la mayoría de las relaciones internas de `seguridad` (excepto las 4
listadas en 5.1), y varias relaciones puntuales de `personal.certificaciones`/
`historial_disciplinario`/`historial_medico`/`licencias`, `vehiculos.*` y
`equipos.*`. El listado completo, tabla por tabla, está comentado (no ejecutado) en
`06_create_constraints.sql` Parte B, exactamente para que puedan activarse con un
simple *uncomment* si al conectar con el servidor real se confirma que sí existen.

**Por qué importa esta distinción:** replicar la base de datos "tal como es" implica
no agregar integridad referencial que la fuente no confirma que existe — si el
sistema original nunca forzó esas relaciones a nivel de motor (las valida solo la
capa de aplicación NestJS/TypeORM), agregarlas de más podría **rechazar operaciones
que el sistema original permite** (por ejemplo, si en la práctica hay filas
huérfanas toleradas).

---

## 6. Datos a replicar

### A. Datos estructurales
Esquemas, tablas, PK, FK físicas, índices, CHECK/UNIQUE, columnas calculadas.
**Deben replicarse exactamente.** Cubiertos por `02`–`07` (`create_schemas` →
`create_indexes`).

### B. Datos maestros / configuración
- Catálogo de permisos (`seguridad.permisos`) y su asignación a roles
  (`seguridad.asignacion_permisos_rol`) — los lotes documentados explícitamente
  (permiso `seguridad:cerrar_sesion`, los ~49/50 permisos de `organizacion:*`,
  `seguridad:configurar_apariencia`, `seguridad:configurar_politica_perfil`).
  **Deben replicarse exactamente** (son datos de configuración del sistema, no
  información institucional específica del CBVC). Cubiertos por
  `12_insert_master_data.sql`, de forma idempotente.
- Fila única de `seguridad.configuracion_sistema`. **Debe replicarse** el patrón
  (branding, política de perfil) — los valores concretos (`logo-cbvc.png`,
  `SIGBO-CBVC`, `Panel principal`) son específicos de la instalación del CBVC; si el
  entorno destino es para otra institución, **deben regenerarse/ajustarse**, no
  copiarse ciegamente.
- Catálogos institucionales (`organizacion.rangos`, `cargos`, `companias`,
  `cuarteles`, etc.): **no se encontraron INSERT documentados con valores reales**
  (ej. "Bombero", "Capitán", nombres de compañías reales del CBVC). Si existen datos
  reales en el servidor origen, deben **replicarse exactamente** preservando sus
  GUID (para no romper las referencias desde `personal.bomberos`, `designaciones`,
  `ascensos`); si no existen todavía, deben **generarse de nuevo** según el catálogo
  real de la institución destino.
- El rol **"Administrador General"**: se referencia constantemente como destinatario
  de permisos, pero su fila no está documentada (ver sección 10). **Debe generarse de
  nuevo** en el entorno destino si no existe, con los permisos que
  `12_insert_master_data.sql` le asigna.

### C. Datos operativos
Usuarios reales, bomberos, servicios/emergencias atendidos, movimientos financieros,
préstamos de equipo, mantenimientos de vehículos, etc. **No disponibles** en este
análisis (no hubo acceso a un dump ni a la base real). Si se dispone de un `.bak`
generado con `workflows/scripts/backup_sqlserver.ps1` (ya presente en el
repositorio), estos datos **deben replicarse exactamente** mediante restore o
`BCP`/`BULK INSERT`, respetando el orden de la sección 7 y preservando los GUID
originales para no romper relaciones. Ver `13_insert_initial_data.sql` (plantilla,
sin datos).

### D. Datos sensibles

| Dato | Tabla.columna | Tratamiento recomendado |
|---|---|---|
| Hash + salt de contraseña | `seguridad.usuarios.password_hash`, `.salt`; `seguridad.historial_contrasenas.password_hash` | **Enmascarar/regenerar.** Nunca reutilizar hashes reales fuera de un entorno con el mismo nivel de protección que producción. Para entornos de prueba: reemplazar por un hash de una contraseña dummy conocida. |
| Secreto de 2FA | `seguridad.usuarios.two_factor_secret` | **Omitir/regenerar.** Si se copia, cualquiera con el secreto puede generar códigos válidos. |
| Refresh tokens | `seguridad.sesiones.refresh_token_hash` | **Omitir.** Son credenciales de sesión vigentes; no tiene sentido preservarlas en una réplica (invalidar todas las sesiones es lo esperado). |
| Datos personales del personal | `personal.bomberos` (cédula, teléfono, dirección, domicilio_lat/lon, contactos de emergencia, datos médicos, foto) | **Enmascarar** en entornos que no sean producción réplica 1:1 con el mismo nivel de acceso (desarrollo/QA/demo): sustituir por datos ficticios manteniendo el formato y las relaciones. |
| Datos financieros | `finanzas.movimientos` (montos, comprobantes, proveedores) | **Enmascarar** en entornos no productivos. |
| IPs / user agents / geolocalización | `seguridad.sesiones`, `seguridad.logs_auditoria`, `operaciones.marcaciones_asistencia` (latitud/longitud), `servicios.historial_servicios` | **Enmascarar u omitir** en entornos no productivos (dato personal indirecto). |
| Documentos institucionales con firma digital | `documentos.documentos.archivo_firmado_url` | **Omitir el contenido del archivo** al migrar entre entornos si no se dispone de la infraestructura de firma; el registro de metadatos puede replicarse. |

**Nunca se incluyen en este reporte ni en los scripts secretos reales** (no se tuvo
acceso a ninguno; ni siquiera existía una cadena de conexión visible en el
repositorio de GitHub).

---

## 7. Scripts de reconstrucción

Todos en [`scripts/`](scripts/), en SQL Server / T-SQL, numerados según el orden de
ejecución (ver sección 8):

| Script | Contenido | Estado |
|---|---|---|
| `01_create_database.sql` | `CREATE DATABASE sigbo_cbvc` (condicional) | ✔ Completo |
| `02_create_schemas.sql` | Los 11 `CREATE SCHEMA` | ✔ Completo |
| `03_create_types.sql` | N/A — no se detectaron tipos definidos por el usuario | ✔ (vacío, documentado) |
| `04_create_tables.sql` | Las 59 `CREATE TABLE` completas (columnas, PK, DEFAULT, CHECK, UNIQUE inline) | ✔ Completo |
| `05_create_sequences.sql` | N/A — no se usan objetos `SEQUENCE` | ✔ (vacío, documentado) |
| `06_create_constraints.sql` | 68 `FOREIGN KEY` confirmadas (Parte A, ejecutable) + ~46 lógicas documentadas (Parte B, comentadas) | ✔ Completo |
| `07_create_indexes.sql` | 56 índices no clusterizados | ✔ Completo |
| `08_create_functions.sql` | N/A — no se detectaron funciones | ✔ (vacío, documentado) |
| `09_create_procedures.sql` | N/A — no se detectaron procedimientos | ✔ (vacío, documentado) |
| `10_create_triggers.sql` | N/A — no se detectaron triggers | ✔ (vacío, documentado) |
| `11_create_views.sql` | N/A — no se detectaron vistas | ✔ (vacío, documentado) |
| `12_insert_master_data.sql` | Permisos RBAC + otorgamiento a "Administrador General" + fila singleton de configuración | ✔ Completo (idempotente) |
| `13_insert_initial_data.sql` | Plantilla — sin datos operativos reales disponibles | ⚠ Plantilla, sin datos |
| `14_validation.sql` | Consultas de validación estructural + plantilla de comparación contra servidor origen | ✔ Completo |

Motor objetivo: **SQL Server 2019 Express o superior** (T-SQL). No se generó SQL
genérico: todas las construcciones (`NEWSEQUENTIALID()`, `DATETIMEOFFSET(3)`,
`ISJSON()`, `SYSDATETIMEOFFSET()`, columnas calculadas `PERSISTED`) son específicas
de SQL Server.

---

## 8. Procedimiento de ejecución

Ejecutar en **este orden exacto** contra una instancia SQL Server 2019 Express (o
superior) vacía, con `sqlcmd`, Azure Data Studio o SSMS:

```
1.  01_create_database.sql       -- crea sigbo_cbvc
2.  02_create_schemas.sql        -- crea los 11 esquemas
3.  03_create_types.sql          -- no-op (documentado)
4.  04_create_tables.sql         -- crea las 59 tablas (PK/DEFAULT/CHECK/UNIQUE inline)
5.  05_create_sequences.sql      -- no-op (documentado)
6.  06_create_constraints.sql    -- agrega las 68 FOREIGN KEY confirmadas
7.  07_create_indexes.sql        -- crea los 56 indices no clusterizados
8.  08_create_functions.sql      -- no-op (documentado)
9.  09_create_procedures.sql     -- no-op (documentado)
10. 10_create_triggers.sql       -- no-op (documentado)
11. 11_create_views.sql          -- no-op (documentado)
12. 12_insert_master_data.sql    -- siembra permisos + config (requiere rol "Administrador General" ya creado, ver seccion 10)
13. 13_insert_initial_data.sql   -- plantilla; completar solo si se dispone de datos reales
14. 14_validation.sql            -- valida la replica contra las cifras documentadas
```

### Por qué este orden (dependencias)

- **`04` antes que `06`**: las 59 tablas deben existir antes de poder agregar
  `FOREIGN KEY` que las referencian entre sí (patrón real del sistema: crear todo,
  luego relacionar).
- **`06` antes que `07`**: no es estrictamente obligatorio en SQL Server (los índices
  no dependen de las FK), pero se mantiene el orden solicitado por consistencia con
  el patrón documentado del proyecto real (`009_foreign_keys.sql` antes que
  `010_indices.sql`).
- **`12` después de `04`–`07`**: los `INSERT` de permisos y la fila de configuración
  requieren que las tablas `seguridad.permisos`, `seguridad.asignacion_permisos_rol`
  y `seguridad.configuracion_sistema` ya existan.
- **`13` después de `12`**: los datos operativos (bomberos, servicios, etc.)
  dependen de que los catálogos maestros de `organizacion` y los permisos ya estén
  cargados, para no violar las FK físicas de la sección 5.1. Si se cargan datos
  operativos reales, dentro de ese mismo script debe respetarse a su vez:
  1. `organizacion.*` (catálogos, sin dependencias entre sí salvo `cargos.dependencia_cargo_id` y `unidades.brigada_id`)
  2. `personal.bomberos` (depende de `organizacion.rangos/cargos/companias/cuarteles/turnos/tipos_guardia`, todas nullable)
  3. `organizacion.designaciones`, `organizacion.ascensos`, `personal.bombero_especialidades`, `personal.certificaciones`, `personal.historial_*`, `personal.licencias` (dependen de `bomberos`)
  4. `vehiculos.vehiculos`, `equipos.categorias_equipo` → `equipos.equipos`, `servicios.tipos_servicio`, `finanzas.cuentas_contables`, `deposito.items_deposito`, `academia.materias` → `academia.cursos` → `academia.examenes`/`academia.inscripciones_cursos` → `academia.notas_examenes`/`academia.asistencia_academia`
  5. `servicios.servicios` (depende de `tipos_servicio`, `vehiculos.vehiculos`, `personal.bomberos`) → `servicios.personal_servicio`, `servicios.historial_servicios`
  6. Todo lo demás que depende de `servicios.servicios` y `personal.bomberos`:
     `equipos.prestamos_equipos`, `deposito.movimientos_deposito`,
     `documentos.documentos`, `finanzas.movimientos`, `operaciones.*`
- **`14` al final**: valida el resultado acumulado de todos los pasos anteriores.

### Dependencias circulares

**No se detectó ninguna dependencia circular real entre tablas.** El único caso que
podría parecer circular es `organizacion.cargos.dependencia_cargo_id` (auto-FK), que
no es un problema porque referencia la misma tabla y `NULL` es válido para el primer
nivel jerárquico (sin dependencia). No hay ciclos del tipo A→B→A entre tablas
distintas en las 68 relaciones físicas confirmadas.

### Si el rol "Administrador General" no existe todavía

`12_insert_master_data.sql` referencia ese rol por nombre. Como su definición
completa (color, prioridad, jerarquía, etc.) no está documentada (ver sección 10),
este reporte **no la inventa**. Antes de ejecutar `12`, crear manualmente esa fila
con, como mínimo:

```sql
INSERT INTO seguridad.roles (nombre, es_administrativo, es_sistema, activo)
VALUES (N'Administrador General', 1, 1, 1);
```

y luego ejecutar `12_insert_master_data.sql` (es idempotente, se puede correr las
veces que haga falta).

---

## 9. Validación

Implementada en [`scripts/14_validation.sql`](scripts/14_validation.sql). Cada
consulta compara la base recién creada contra las cifras documentadas y emite
`✔ Coincide` / `✘ Diferente` / `⚠ Sin cifra oficial de referencia`:

1. Cantidad de esquemas (11)
2. Cantidad de tablas por esquema y total (59)
3. Cantidad de columnas (752, con nota de posible diferencia menor — sección 10)
4. Cantidad de Primary Keys (59)
5. Cantidad de Foreign Keys físicas (68, cifra propia derivada de esta reconstrucción)
6. Restricciones UNIQUE y CHECK (informativo, sin cifra global en la fuente)
7. Índices no clusterizados (56)
8. Columnas calculadas (4)
9. Views/Functions/Procedures/Triggers (0 cada uno)
10. Fila única en `seguridad.configuracion_sistema` (patrón singleton)
11. Conteo de filas por tabla (para comparar contra el origen si se dispone de acceso)
12. Plantilla de comparación **Base original → Metadatos → Datos → Base réplica →
    Comparación → Reporte de diferencias** vía servidor vinculado (`linked server`),
    a completar con el nombre real del servidor origen cuando exista acceso a él.

**Limitación honesta:** como no hay acceso al servidor SQL Server original ni a un
`.bak`, todas las validaciones de esta sección son **auto-consistencia contra lo
documentado**, no una comparación real base-contra-base. La sección 12 de
`14_validation.sql` deja lista la plantilla para el día en que se tenga acceso al
origen.

---

## 10. Información faltante

### 10.1 Ausencias directas (no se encontró evidencia)

- ⚠ No se encontró el código fuente real del proyecto (`C:\Users\PC-HORIZONTE\sigbo-cbvc`), ni sus archivos de migración `.sql` originales, ni las entidades TypeORM.
- ⚠ No se encontró ningún archivo de configuración de conexión (`.env`, `ormconfig.json`, `data-source.ts`) — no hay evidencia del nombre real del servidor, puerto, usuario de conexión, ni si se usa Windows Auth o SQL Auth en producción.
- ⚠ No se dispone de los datos operativos originales de ninguna tabla (usuarios reales, bomberos, servicios, etc.).
- ⚠ No se encontró la definición completa (INSERT) de la fila del rol **"Administrador General"**, referenciado constantemente como destinatario de permisos.
- ⚠ No se encontraron valores semilla reales para los catálogos de `organizacion` (rangos, cargos, compañías, etc. del CBVC específicamente) — solo su estructura.
- ⚠ No se pudo determinar el **collation**, tamaño/autogrowth de archivos, recovery model ni compatibility level de la base `sigbo_cbvc`.
- ⚠ No se pudo determinar si existen **roles/permisos a nivel de motor SQL Server** (logins, `db_datareader`/`db_datawriter`, usuarios de servicio) — el RBAC documentado es a nivel de aplicación, no de SQL Server.
- ⚠ No se encontró documentación sobre triggers/functions/procedures fuera de los ya confirmados como inexistentes (podría haber sido agregado en migraciones posteriores a la fecha del `.docx`, dado que los scripts de `workflows/` sugieren desarrollo posterior sobre `vehiculos`/`equipos`).
- ⚠ La fórmula exacta de la columna calculada `personal.bomberos.antiguedad` no se transcribe textualmente en la fuente (solo se describe como "`DATEDIFF(YEAR,...)` ajustado por `CASE` según mes/día"); la expresión usada en `04_create_tables.sql` es una **reconstrucción razonable**, no el texto verificado.

### 10.2 Inconsistencias detectadas dentro del propio documento fuente

Estas se marcan explícitamente porque el reporte prioriza no ocultar contradicciones
de la fuente, aun cuando la fuente sea en sí misma de segunda mano:

- ⚠ El documento nombra el archivo de FKs unas veces como **`009_foreign_keys.sql`**
  (en la sección "Notas Adicionales de Migraciones") y otras como
  **`010_foreign_keys.sql`** (nota puntual dentro de la ficha de
  `seguridad.usuarios.bombero_id`). No se pudo determinar cuál es el nombre real.
- ⚠ El resumen de `010_indices.sql` afirma "crea 30 índices no clusterizados", pero
  el listado detallado que el propio documento transcribe a continuación suma **42**.
  Este reporte implementó los 42 (más 12 de la migración 012 y 2 de la 015 = 56 en
  total) por ser la evidencia más específica, pero la cifra "30" no pudo conciliarse.
- ⚠ La migración 012 se describe como generadora de "49 permisos" de
  `organizacion:*`, pero el listado de recursos/acciones que el documento transcribe
  suma **50**. Se implementaron los 50 itemizados en `12_insert_master_data.sql`.
- ⚠ Ambigüedad sobre el alcance real de `009_foreign_keys.sql`: la ficha de cada
  columna de los esquemas `academia`/`operaciones`/`vehiculos`/`equipos` (en la
  sección 6, que se presenta como el estado "actual" del sistema) marca esas FK como
  "implícita, sin constraint declarado", basado aparentemente en una revisión aislada
  de los archivos `004`-`006`. Sin embargo, la nota general de la migración 009 indica
  que ese archivo agrega FK "sobre tablas ya creadas en migraciones previas... (001-006)",
  lo cual sugiere que **podría** haber agregado también esas relaciones, sin
  confirmarlo explícitamente. Se optó por **no** crear esas FK como físicas (ver
  sección 5.2), salvo el único caso donde sí hay confirmación textual explícita
  (`equipos.prestamos_equipos.servicio_id`, citado literalmente en las notas de la
  migración 009).
- ⚠ La ficha de `seguridad.usuarios` en la sección 6 dice textualmente que "solo se
  documentan las 4 columnas de redes sociales/contacto" que agrega la migración 015,
  pero a continuación **sí enumera 26 columnas completas** (no solo 4). Se interpretó
  esto como que el documento efectivamente consolidó el estado completo conocido de
  la tabla (probablemente combinando varias pasadas de revisión), y se usaron esas 26
  columnas como base para `04_create_tables.sql`, dejando constancia de que podrían
  faltar columnas no relevadas si la tabla real tiene más.
- ⚠ La cifra total de "752 columnas" del resumen numérico no se pudo re-verificar
  columna por columna contra el detalle transcrito con precisión aritmética exacta
  (dada la extensión del documento); `14_validation.sql` reporta la cifra real de la
  réplica para que se compare, marcando cualquier diferencia como `⚠` en vez de
  forzar un "coincide" no verificado.

### 10.3 Decisiones de diseño explícitas de este reporte (para que quede claro qué es reconstrucción y qué es transcripción literal)

- El **estado final** de tablas que sufrieron `sp_rename`/`ALTER` a través de varias
  migraciones (`seguridad.usuarios`, `seguridad.roles`,
  `seguridad.configuracion_sistema`/`configuracion_apariencia`,
  `personal.bomberos`) se construyó directamente como el resultado consolidado, en
  vez de repetir en SQL los pasos históricos de rename — esto es lo correcto para
  una **réplica** (se necesita el estado final, no el historial), pero implica que
  este script **no** es una transcripción literal de cada archivo de migración
  original.
- Los nombres de `CONSTRAINT` que el documento no da literalmente (sobre todo varias
  tablas de `seguridad`) se generaron siguiendo la convención que el propio documento
  describe como usada en todo el proyecto (`PK_`, `DF_`, `CK_`, `UQ_`, `FK_`), y se
  marcan como "nombre inferido por convención" en los comentarios del script — si el
  servidor real tiene nombres distintos, esto no afecta la estructura ni los datos,
  solo el nombre visible del constraint.

---

## 11. Riesgos y consideraciones

| Riesgo | Detalle | Mitigación recomendada |
|---|---|---|
| **Fuente de segunda mano** | Todo este reporte deriva de un `.docx` de documentación, no del código/DDL original ni del servidor real. Cualquier error u omisión en ese documento se propaga aquí. | Antes de un despliegue productivo, validar `04_create_tables.sql` y `06_create_constraints.sql` línea por línea contra el servidor SQL Server real (si se recupera acceso) usando `14_validation.sql` sección 12 (comparación vía linked server). |
| **Integridad referencial incompleta a propósito** | ~46 relaciones quedaron sin `FOREIGN KEY` física (sección 5.2) porque la evidencia no confirma que existan en el motor real. Si en la práctica el sistema SÍ las tiene, la réplica quedará **menos estricta** que el original (permitirá insertar filas huérfanas que el original rechazaría). | Verificar contra el servidor real (`sys.foreign_keys`) y activar las líneas comentadas de `06_create_constraints.sql` Parte B que correspondan. |
| **Datos sensibles** | Ningún secreto real fue expuesto en este análisis (no existían en el repositorio). Al migrar datos reales (sección 6.D), riesgo de exponer contraseñas/2FA/datos personales si se copian sin enmascarar. | Aplicar la tabla de la sección 6.D antes de cualquier copia hacia un entorno no productivo. |
| **Secuencias / identidad** | `NEWSEQUENTIALID()` genera un GUID nuevo en cada `INSERT`; si se cargan datos reales preservando IDs originales, hay que insertar el `id` explícitamente (no dejar el `DEFAULT`) para no romper las 68 FK físicas. `seguridad.logs_auditoria.id` requiere `SET IDENTITY_INSERT` si se preserva el id original. | Ver plantilla en `13_insert_initial_data.sql`. |
| **Dependencias entre tablas al cargar datos reales** | Cargar datos fuera de orden (ej. `personal.bomberos` antes que `organizacion.rangos`) fallará contra las 68 FK físicas. | Seguir estrictamente el orden de la sección 8. |
| **Versión del motor** | Se declara SQL Server 2019 Express, pero no se pudo verificar de forma independiente (sin acceso al servidor). Si el entorno real es una versión distinta, construcciones como `DATETIMEOFFSET(3)`, `ISJSON()` y columnas calculadas `PERSISTED` son compatibles desde SQL Server 2016+, por lo que el riesgo de incompatibilidad es bajo pero no nulo. | Confirmar versión real con `SELECT @@VERSION` antes de un despliegue definitivo. |
| **Compatibilidad Express Edition** | SQL Server Express tiene un límite de 10 GB por base de datos. Si el volumen real de datos operativos (sobre todo `seguridad.logs_auditoria`, `servicios.historial_servicios` con tracking GPS, y archivos referenciados por URL) crece más allá de eso, la réplica en Express fallará. | Monitorear tamaño de base; considerar SQL Server Standard si se acerca al límite. |
| **Volumen y performance** | No se tiene visibilidad del volumen real de filas por tabla (no hay acceso a la base origen). Los 56 índices documentados cubren los patrones de consulta conocidos (filtros por estado, fecha, FK), pero no se puede garantizar que sean suficientes para el volumen real de producción. | Ejecutar `14_validation.sql` sección 13 (conteo de filas) contra el entorno real cuando se tenga acceso, y revisar planes de ejecución de las consultas más frecuentes (dashboard, listados con filtros). |
| **Diferencias entre ambientes** | El entorno de origen (Windows, SQL Server 2019 Express, posiblemente instalado localmente según el `backup_sqlserver.ps1` que asume rutas locales) puede diferir del entorno destino (contenedor Linux, Azure SQL, etc.). Azure SQL Database, por ejemplo, no soporta `NEWSEQUENTIALID()` de la misma manera en todas las configuraciones y difiere en manejo de `SCHEMA`/`GO`. | Si el destino no es SQL Server on-prem/VM, revisar compatibilidad de cada construcción específica antes de ejecutar los scripts. |
| **Visión multi-institución no implementada** | El propio sistema documenta una intención futura de multi-tenant que **no existe hoy**. Si se replica pensando ya en soportar múltiples instituciones, se estaría inventando estructura que la fuente dice explícitamente que no existe. | No agregar columnas `institucion_id` ni aislar por tenant en esta réplica; es un cambio de alcance mayor documentado como "retrofit" pendiente en el propio `.docx`. |

---

## Resumen de archivos entregados

```
database/
├── REPORTE_REPLICACION.md      (este documento)
├── README.md                   (guía rápida de ejecución)
└── scripts/
    ├── 01_create_database.sql
    ├── 02_create_schemas.sql
    ├── 03_create_types.sql
    ├── 04_create_tables.sql
    ├── 05_create_sequences.sql
    ├── 06_create_constraints.sql
    ├── 07_create_indexes.sql
    ├── 08_create_functions.sql
    ├── 09_create_procedures.sql
    ├── 10_create_triggers.sql
    ├── 11_create_views.sql
    ├── 12_insert_master_data.sql
    ├── 13_insert_initial_data.sql
    └── 14_validation.sql
```
