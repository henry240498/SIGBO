---
tipo: DATABASE
nivel: L1
---

# Base de datos

<<<<<<< Updated upstream
SQL Server 2019 Express, base `sigbo_cbvc`. **12 esquemas, 88 tablas, 0 procedimientos.**
El esquema se construye con 29 migraciones SQL escritas a mano; TypeORM nunca lo altera.

> `docs/README.md` afirma "42 tablas, 10 esquemas". Eso quedó viejo. Los números de acá
> los cuenta `build-graph.mjs` aplicando las migraciones en orden.

## Esquemas

| Esquema | Tablas | Estado |
|---|---|---|
| `personal` | 18 | Activo. El expediente del bombero |
| `operaciones` | 16 | Activo. **Asistencia y Guardias comparten este esquema** |
| `seguridad` | 15 | Activo. Usuarios, permisos, auditoría, configuración |
| `organizacion` | 13 | Activo. Organigrama y catálogos |
| `academia` | 7 | Parcial: solo cursos, materias e inscripciones tienen entidad |
| `servicios` | 5 | Activo |
| `vehiculos` | 4 | API sin pantalla |
| `equipos` | 4 | API sin pantalla |
| `finanzas` | 2 | Solo esquema |
| `deposito` | 2 | Solo esquema |
| `documentos` | 1 | Solo esquema |
| `contenido` | 1 | Publicaciones (migración 026, creado condicionalmente) |

**14 tablas no tienen entidad**: el esquema se diseñó completo desde el principio y el
backend se construye por fases. Una tabla sin entidad no es un error, es trabajo
pendiente.

**No existe un esquema `guardias`.** Sus siete tablas están en `operaciones` — ver
[[rule--guardias-vive-en-operaciones]].

=======
SQL Server 2019 Express, base `sigbo_cbvc`. **12 esquemas, 81 tablas, 0 procedimientos.**
El esquema se construye con 26 migraciones SQL escritas a mano; TypeORM nunca lo altera.

> Los números de esta página los cuenta `build-graph.mjs` aplicando las migraciones en
> orden y deben coincidir con `docs/README.md`.

## Esquemas

| Esquema | Tablas | Entidades | Estado |
|---|---|---|---|
| `personal` | 18 | 13 | Activo. El expediente del bombero |
| `seguridad` | 15 | 14 | Activo. Usuarios, permisos, auditoría, configuración |
| `organizacion` | 13 | 13 | Activo. Organigrama y catálogos |
| `operaciones` | 10 | 10 | Activo. Asistencia y guardias |
| `academia` | 7 | 3 | Parcial: solo cursos, materias e inscripciones |
| `servicios` | 5 | 4 | Activo. Desarrollo en curso |
| `equipos` | 4 | 3 | API sin pantalla |
| `vehiculos` | 3 | 1 | API sin pantalla |
| `finanzas` | 2 | 0 | Solo esquema |
| `deposito` | 2 | 0 | Solo esquema |
| `documentos` | 1 | 0 | Solo esquema |
| `contenido` | 1 | 0 | Publicaciones (migración 023, creado condicionalmente) |

**17 tablas no tienen entidad**: el esquema se diseñó completo desde el principio y el
backend se construye por fases. Una tabla sin entidad no es un error, es trabajo
pendiente.

>>>>>>> Stashed changes
## Convenciones, sin excepción

### Identidad y tiempo

```sql
id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_<tabla>_id DEFAULT NEWSEQUENTIALID(),
CONSTRAINT PK_<tabla> PRIMARY KEY CLUSTERED (id),
creado_en      DATETIMEOFFSET(3) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
actualizado_en DATETIMEOFFSET(3) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
creado_por     UNIQUEIDENTIFIER NULL,
actualizado_por UNIQUEIDENTIFIER NULL,
```

`NEWSEQUENTIALID()` en vez de `NEWID()` para no fragmentar el índice clustered — al
costo de que los GUIDs sean parcialmente predecibles. Los ids van en URLs: **no son
secretos**, la autorización la da el permiso.

`DATETIMEOFFSET(3)` guarda el offset, necesario porque `America/Asuncion` tiene horario
<<<<<<< Updated upstream
de verano y las marcaciones y pernoctes nocturnos no pueden quedar ambiguos.
=======
de verano y las marcaciones nocturnas no pueden quedar ambiguas.
>>>>>>> Stashed changes

Detalle: [[rule--identidad-y-tiempo-en-sql-server]].

### Nombres

- Tablas y columnas en `snake_case`; propiedades TypeScript en `camelCase`.
  `SnakeNamingStrategy` traduce solo — ver
  [[rule--snake-case-en-bd-camel-en-typescript]].
<<<<<<< Updated upstream
- Nombre de tabla **explícito** en cada entidad. Ojo: el orden de las claves varía —
  hay `@Entity({ name: 'x', schema: 'y' })` y `@Entity({schema:'y',name:'x'})`.
- Mayormente plurales, con singulares deliberados en tablas de condición
  (`condicion_combatiente`, `actividad_profesional`, `personal_servicio`,
  `historial_codigo`).
- Constraints **siempre nombrados**: `PK_`, `FK_`, `UQ_`, `CK_`, `DF_`, `IX_`. Sin nombre
  no se pueden borrar de forma legible.
=======
- Nombre de tabla **explícito** en cada entidad: `@Entity({ name: 'bomberos', schema: 'personal' })`.
- Mayormente plurales, con singulares deliberados en tablas de condición
  (`condicion_combatiente`, `actividad_profesional`, `personal_servicio`,
  `historial_codigo`).
- Constraints **siempre nombrados**: `PK_`, `FK_`, `UQ_`, `CK_`, `DF_`, `IX_`. Nunca
  anónimos: sin nombre no se pueden borrar de forma legible.
>>>>>>> Stashed changes

### JSON

Sin `JSONB`, así que el patrón es `NVARCHAR(MAX)` + validación:

```sql
datos NVARCHAR(MAX) NOT NULL CONSTRAINT CK_comser_datos CHECK (ISJSON(datos) = 1)
```

Se usa en `servicios.comunicaciones_servicio.datos` y
`personal.fojas_servicio.contenido_json`. **No es consultable con SQL indexado**: se lee
y se parsea en la aplicación. Ver [[decision--comunicacion-como-json]].

## Las reglas que la base impone por sí sola

Los `CHECK` y `UNIQUE` son la última línea de defensa, y **duplican a propósito** las
validaciones de los servicios — ver [[rule--reglas-duplicadas-bd-y-codigo]].

<<<<<<< Updated upstream
=======
Ejemplos verificados:

>>>>>>> Stashed changes
```sql
-- personal.bomberos
CONSTRAINT UQ_bomberos_cedula UNIQUE (cedula),
CONSTRAINT UQ_bomberos_numero UNIQUE (numero_bombero),

-- servicios.comunicaciones_servicio
CONSTRAINT UQ_comunicaciones_servicio_servicio UNIQUE (servicio_id),
<<<<<<< Updated upstream
=======
CONSTRAINT CK_comser_tipo   CHECK (tipo   IN ('OTRAS_OCURRENCIAS','INCENDIO')),
>>>>>>> Stashed changes
CONSTRAINT CK_comser_estado CHECK (estado IN ('BORRADOR','PENDIENTE_REVISION','OBSERVADO','FINALIZADA','ANULADO')),
CONSTRAINT FK_comser_servicio FOREIGN KEY (servicio_id)
  REFERENCES servicios.servicios(id) ON DELETE CASCADE
```

Ese `ON DELETE CASCADE` es la trampa más peligrosa del esquema: borrar un servicio
destruye su comunicación **incluso finalizada**, sin pasar por ninguna validación de la
aplicación. Ver [[rule--una-comunicacion-por-servicio]].

<<<<<<< Updated upstream
**No todos los enums tienen su `CHECK`.** `requisitos_rol_guardia.rol` es texto libre sin
constraint contra `RolGrupoGuardia`. Antes de asumir que la BD protege un enum, mirar el
nodo `TABLE` en el grafo, que lista los `CHECK` reales.
=======
Cada estado del dominio existe **dos veces**: como `export type` en la entidad y como
`CHECK` en la tabla. Ampliar uno sin el otro compila y falla al guardar.
>>>>>>> Stashed changes

## Migraciones

```powershell
database\run-migrations.ps1     # ejecuta en orden numérico, con QUOTED_IDENTIFIER ON
```

Reglas: [[rule--migracion-nunca-se-edita]] y [[decision--migraciones-a-mano]].

<<<<<<< Updated upstream
**Antes de crear una nueva, verificá el número libre.** La numeración ya colisionó (dos
archivos `017`), y el repositorio está en desarrollo activo: hoy la última es
`027_personal_reconciliacion_segura.sql`.
=======
**Antes de crear una nueva, verificá el número libre.** La numeración ya colisionó: hay
dos archivos con prefijo `017`.
>>>>>>> Stashed changes

```bash
ls database/migrations | sort | tail -5
```

`QUOTED_IDENTIFIER ON` es obligatorio (commit `4f45d1f`) — declaralo dentro del archivo,
no confíes en la sesión: [[error--quoted-identifier-en-migraciones]].

### El esquema no es solo los CREATE TABLE

La migración 014 **renombra** `seguridad.configuracion_apariencia` a
<<<<<<< Updated upstream
`configuracion_sistema` con `sp_rename`. Por eso `build-graph.mjs` aplica las migraciones
en orden (`CREATE`, `sp_rename`, `ALTER`, `DROP`) en vez de solo leer los `CREATE TABLE`:
de otro modo describiría un esquema que ya no existe.

Eso ya rindió: el generador detectó que la entidad `ConfiguracionApariencia` seguía
apuntando a la tabla vieja y la reportó como **entidad huérfana**. Era código muerto y se
eliminó. La verificación corre en cada build (`stats.json`, `huecos.entidadesSinTabla`),
así que el próximo desajuste entre entidad y esquema aparece solo.
=======
`configuracion_sistema` con `sp_rename`. Por eso `build-graph.mjs` aplica las
migraciones en orden (renames, `ALTER`, `DROP`) en vez de solo leer los `CREATE TABLE`:
de otro modo describiría un esquema que ya no existe.

La antigua entidad que apuntaba a esa tabla fue retirada porque no se usaba; la
configuración vigente se persiste en `seguridad.configuracion_sistema`.
>>>>>>> Stashed changes

## Conexión

```
DB_HOST=localhost  DB_PORT=1433  DB_NAME=sigbo_cbvc  DB_USER=sigbo_app
DB_ENCRYPT=false   DB_TRUST_SERVER_CERTIFICATE=true
pool: max 10, min 0, idleTimeoutMillis 15000 · requestTimeout 15000
```

`min: 0` + `idleTimeoutMillis` bajo existen para descartar conexiones colgadas —
<<<<<<< Updated upstream
[[decision--pool-idle-timeout]]. Si todos los endpoints tardan exactamente 15 s, es eso:
[[error--pool-conexion-colgada]].
=======
[[decision--pool-idle-timeout]]. Si todos los endpoints tardan exactamente 15 s,
es eso: [[error--pool-conexion-colgada]].
>>>>>>> Stashed changes

DBeaver: `database/dbeaver/conexion-sigbo-local.md`. TCP viene deshabilitado:
[[error--tcp-sqlexpress-deshabilitado]].

## Consultar el impacto de un cambio

```bash
node .context/graph/context.mjs --tabla personal.bomberos --level L2
```

Devuelve la entidad, el servicio que la lee, las tablas que la referencian, las reglas
que la afectan y las migraciones que la tocaron.
