---
tipo: DATABASE
nivel: L1
---

# Base de datos

SQL Server 2019 Express, base `sigbo_cbvc`. **14 esquemas, 150 tablas, 0 procedimientos.**
El esquema se construye con 77 migraciones SQL escritas a mano; TypeORM nunca lo altera.

> `docs/README.md` afirma "42 tablas, 10 esquemas". Eso quedó viejo. Los números de acá
> los cuenta `build-graph.mjs` aplicando las migraciones en orden — correlos de nuevo
> (`node .context/graph/build-graph.mjs`) antes de confiar en esta tabla si pasó tiempo
> desde la última actualización: crecen rápido y nadie los actualiza a mano.

## Esquemas

| Esquema | Tablas | Estado |
|---|---|---|
| `operaciones` | 23 | Activo. **Asistencia y Guardias comparten este esquema** |
| `finanzas` | 21 | Activo. Movimientos, Socios Protectores, facturación, presupuesto |
| `deposito` | 18 | Activo |
| `personal` | 18 | Activo. El expediente del bombero |
| `seguridad` | 15 | Activo. Usuarios, permisos, auditoría, configuración |
| `organizacion` | 15 | Activo. Organigrama, catálogos, identidad institucional |
| `documentos` | 8 | Activo. Numeración institucional, plantillas, expedientes |
| `academia` | 8 | Activo |
| `ia` | 6 | Activo. Motor local (Snoopy), sin dominio propio en `modulos.ts` — ver nota abajo |
| `servicios` | 5 | Activo |
| `vehiculos` | 4 | Activo |
| `denuncias` | 4 | Activo |
| `equipos` | 4 | Activo |
| `contenido` | 1 | Publicaciones (migración 026, creado condicionalmente) |

**11 tablas no tienen entidad** (`seguridad.restricciones`, `personal.licencias`,
`personal.historial_medico`, `personal.historial_disciplinario`, `academia.aspirantes`,
`servicios.historial_servicios`, `finanzas.cuentas_contables`, `finanzas.movimientos`,
`deposito.items_deposito`, `deposito.movimientos_deposito`,
`documentos.documentos` — este último es la tabla legada `documentos.documentos`,
distinta de `documentos.documentos_institucionales`, que sí tiene entidad): el esquema
se diseñó completo desde el principio y el backend se construye por fases. Una tabla sin
entidad no es un error, es trabajo pendiente. Lista siempre actual:
`node .context/graph/validar.mjs` → `tablasSinEntidad`.

**El esquema `ia` no tiene un dominio propio con ese nombre**: `modulos.ts` declara el
dominio como `inteligencia` (permiso `inteligencia:*`), mientras que el esquema SQL, la
carpeta del módulo NestJS y las tablas se llaman `ia`. Mismo patrón que
`guardias`/`operaciones` — ver [[rule--guardias-vive-en-operaciones]]. `build-graph.mjs`
tiene el alias (`DOMAIN_OF_SCHEMA.ia` / `DOMAIN_OF_MODULE.ia` → `'inteligencia'`); si se
renombra el esquema o el módulo alguna vez, ese alias deja de hacer falta.

**No existe un esquema `guardias`.** Sus siete tablas están en `operaciones` — ver
[[rule--guardias-vive-en-operaciones]].

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
de verano y las marcaciones y pernoctes nocturnos no pueden quedar ambiguos.

Detalle: [[rule--identidad-y-tiempo-en-sql-server]].

### Nombres

- Tablas y columnas en `snake_case`; propiedades TypeScript en `camelCase`.
  `SnakeNamingStrategy` traduce solo — ver
  [[rule--snake-case-en-bd-camel-en-typescript]].
- Nombre de tabla **explícito** en cada entidad. Ojo: el orden de las claves varía —
  hay `@Entity({ name: 'x', schema: 'y' })` y `@Entity({schema:'y',name:'x'})`.
- Mayormente plurales, con singulares deliberados en tablas de condición
  (`condicion_combatiente`, `actividad_profesional`, `personal_servicio`,
  `historial_codigo`).
- Constraints **siempre nombrados**: `PK_`, `FK_`, `UQ_`, `CK_`, `DF_`, `IX_`. Sin nombre
  no se pueden borrar de forma legible.

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

```sql
-- personal.bomberos
CONSTRAINT UQ_bomberos_cedula UNIQUE (cedula),
CONSTRAINT UQ_bomberos_numero UNIQUE (numero_bombero),

-- servicios.comunicaciones_servicio
CONSTRAINT UQ_comunicaciones_servicio_servicio UNIQUE (servicio_id),
CONSTRAINT CK_comser_estado CHECK (estado IN ('BORRADOR','PENDIENTE_REVISION','OBSERVADO','FINALIZADA','ANULADO')),
CONSTRAINT FK_comser_servicio FOREIGN KEY (servicio_id)
  REFERENCES servicios.servicios(id) ON DELETE CASCADE
```

Ese `ON DELETE CASCADE` es la trampa más peligrosa del esquema: borrar un servicio
destruye su comunicación **incluso finalizada**, sin pasar por ninguna validación de la
aplicación. Ver [[rule--una-comunicacion-por-servicio]].

**No todos los enums tienen su `CHECK`.** `requisitos_rol_guardia.rol` es texto libre sin
constraint contra `RolGrupoGuardia`. Antes de asumir que la BD protege un enum, mirar el
nodo `TABLE` en el grafo, que lista los `CHECK` reales.

## Migraciones

```powershell
database\run-migrations.ps1     # ejecuta en orden numérico, con QUOTED_IDENTIFIER ON
```

Reglas: [[rule--migracion-nunca-se-edita]] y [[decision--migraciones-a-mano]].

**Antes de crear una nueva, verificá el número libre.** La numeración ya colisionó varias
veces (`017`, `023`, `024`, `026`, `027`, `031` — cada uno con dos archivos, orden de
ejecución no garantizado), y el repositorio está en desarrollo activo:
`node .context/graph/validar.mjs` imprime el último prefijo usado y el siguiente libre en
su primera línea.

```bash
ls database/migrations | sort | tail -5
```

`QUOTED_IDENTIFIER ON` es obligatorio (commit `4f45d1f`) — declaralo dentro del archivo,
no confíes en la sesión: [[error--quoted-identifier-en-migraciones]].

### El esquema no es solo los CREATE TABLE

La migración 014 **renombra** `seguridad.configuracion_apariencia` a
`configuracion_sistema` con `sp_rename`. Por eso `build-graph.mjs` aplica las migraciones
en orden (`CREATE`, `sp_rename`, `ALTER`, `DROP`) en vez de solo leer los `CREATE TABLE`:
de otro modo describiría un esquema que ya no existe.

Eso ya rindió: el generador detectó que la entidad `ConfiguracionApariencia` seguía
apuntando a la tabla vieja y la reportó como **entidad huérfana**. Era código muerto y se
eliminó. La verificación corre en cada build (`stats.json`, `huecos.entidadesSinTabla`),
así que el próximo desajuste entre entidad y esquema aparece solo.

## Conexión

```
DB_HOST=localhost  DB_PORT=1433  DB_NAME=sigbo_cbvc  DB_USER=sigbo_app
DB_ENCRYPT=false   DB_TRUST_SERVER_CERTIFICATE=true
pool: max 10, min 0, idleTimeoutMillis 15000 · requestTimeout 15000
```

`min: 0` + `idleTimeoutMillis` bajo existen para descartar conexiones colgadas —
[[decision--pool-idle-timeout]]. Si todos los endpoints tardan exactamente 15 s, es eso:
[[error--pool-conexion-colgada]].

DBeaver: `database/dbeaver/conexion-sigbo-local.md`. TCP viene deshabilitado:
[[error--tcp-sqlexpress-deshabilitado]].

## Consultar el impacto de un cambio

```bash
node .context/graph/context.mjs --tabla personal.bomberos --level L2
```

Devuelve la entidad, el servicio que la lee, las tablas que la referencian, las reglas
que la afectan y las migraciones que la tocaron.
