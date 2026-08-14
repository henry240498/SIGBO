---
tipo: RULES
nivel: L0
---

# Reglas e invariantes

<<<<<<< Updated upstream
21 reglas verificadas contra el código. Cada una tiene su nodo curado con el detalle, el
archivo donde vive y qué pasa si se rompe.

> Si vas a modificar código de SIGBO, las **CRÍTICAS** son lectura obligatoria.
=======
19 reglas verificadas contra el código. Cada una tiene su nodo curado con el detalle, el
archivo donde vive y qué pasa si se rompe.

> Si vas a modificar código de SIGBO, las cinco **CRÍTICAS** son lectura obligatoria.
>>>>>>> Stashed changes

## Críticas

| Regla | En una línea |
|---|---|
| [[rule--el-grafo-no-es-la-verdad]] | Ante discrepancia entre `.context/` y el código, gana el código |
| [[rule--permisos-efectivos]] | Roles vigentes + directos concedidos − directos denegados. La denegación gana |
| [[rule--todo-endpoint-mutante-con-permiso]] | Toda ruta declara `@RequirePermission`; un permiso nuevo son **dos** pasos |
| [[rule--frontend-no-autoriza]] | El frontend oculta, el backend autoriza. Ocultar un botón no protege nada |
| [[rule--entidad-y-tabla-en-paralelo]] | Cambiar una entidad exige su migración en el mismo cambio |
| [[rule--migracion-nunca-se-edita]] | Una migración aplicada es historia: se agrega otra |
| [[rule--reglas-duplicadas-bd-y-codigo]] | Los invariantes viven en la BD **y** en el servicio |

## Altas

| Regla | En una línea |
|---|---|
<<<<<<< Updated upstream
| [[rule--guardias-vive-en-operaciones]] | No existe el esquema `guardias`: sus tablas están en `operaciones` |
| [[rule--elegibilidad-de-rol-guardia]] | OR entre filas, AND entre columnas; sin requisitos configurados, no se restringe |
=======
>>>>>>> Stashed changes
| [[rule--sin-clases-css-nuevas]] | Solo 4 clases; hex exactos, nunca parecidos. ACTIVO verde / malo rojo |
| [[rule--api-v1-y-contrato-http]] | `/api/v1` lo agrega `apiFetch`; las pantallas pasan rutas relativas |
| [[rule--identidad-y-tiempo-en-sql-server]] | PK `UNIQUEIDENTIFIER` + `NEWSEQUENTIALID()`, tiempos `DATETIMEOFFSET(3)` |
| [[rule--cedula-y-numero-bombero-unicos]] | Únicos en toda la institución, incluso para quien está de baja |
| [[rule--una-comunicacion-por-servicio]] | 1:1, y `ON DELETE CASCADE` borra el formulario en silencio |
| [[rule--tolerancia-null-es-la-general]] | `tipoEventoId NULL` = regla general. Nunca minutos fijos en el código |
| [[rule--bloqueo-tras-cinco-intentos]] | 5 fallidos → 15 min. El contador solo se reinicia con un login exitoso |

## Medias

| Regla | En una línea |
|---|---|
| [[rule--pantalla-cliente-sin-store]] | `'use client'`, estado local, recargar con `cargar()` tras cada mutación |
| [[rule--snake-case-en-bd-camel-en-typescript]] | `SnakeNamingStrategy` traduce; `name` explícito solo en timestamps |
| [[rule--tema-oscuro-fijo]] | Oscuro fijo en pantallas, aunque Configuración prometa temas |
| [[rule--modulo-visible-por-prefijo]] | Un módulo se ve si `disponible: true` **y** hay permisos de su prefijo |
| [[rule--espanol-y-auditoria]] | Todo en español; auditoría técnica ≠ historial de expediente |

<<<<<<< Updated upstream
## Las cuatro trampas que más tiempo cuestan
=======
## Las tres trampas que más tiempo cuestan
>>>>>>> Stashed changes

Ordenadas por cuánto se tarda en darse cuenta:

### 1. "Mi cambio no surte efecto"

`start-sigbo.ps1` **no reinicia** un servicio que ya escucha: sigue corriendo el proceso
viejo. Antes de dudar del código:

```powershell
Get-Process node | Select-Object Id, StartTime
```

Si el `StartTime` es anterior a tu edición, no es tu código el que corre.
Ver [[error--start-script-no-reinicia-servicios]].

<<<<<<< Updated upstream
### 2. Buscar el esquema `guardias`

No existe. Las tablas de guardias están en `operaciones`, junto con las de asistencia.
Ver [[rule--guardias-vive-en-operaciones]].

### 3. Un 403 inexplicable

El `@RequirePermission` usa un código que no está sembrado en `seguridad.permisos`. El
endpoint compila, arranca y nadie puede usarlo. Cruzá contra
`graph/indexes/permissions.json`.

### 4. `Invalid column name` o violación de `CHECK`
=======
### 2. Un 403 inexplicable

El `@RequirePermission` usa un código que no está sembrado en `seguridad.permisos`.
El endpoint compila, arranca y nadie puede usarlo. Cruzá contra
`graph/indexes/permissions.json`.

### 3. `Invalid column name` o violación de `CHECK`
>>>>>>> Stashed changes

Cambiaste la entidad y no la migración. La columna nueva no existe, o el estado nuevo no
está en el `CHECK`. Ver [[rule--entidad-y-tabla-en-paralelo]].

<<<<<<< Updated upstream
## Fallas conocidas del entorno

6 nodos `ERROR` con síntoma, causa y solución:

```bash
node .context/graph/context.mjs --tipo ERROR --level L2
```

- [[error--tcp-sqlexpress-deshabilitado]] — SQLEXPRESS viene con TCP apagado
- [[error--pool-conexion-colgada]] — timeouts de exactamente 15 s en todo
- [[error--quoted-identifier-en-migraciones]] — migraciones que fallan solo en el runner
- [[error--start-script-no-reinicia-servicios]] — el cambio que "no surte efecto"
- [[error--413-croquis-grande]] — 413 al guardar una comunicación con croquis
- [[error--context-borrado-del-disco]] — por qué este directorio tiene que estar en git

=======
>>>>>>> Stashed changes
## Consultar reglas por tema

```bash
node .context/graph/context.mjs --tipo RULE                        # todas
<<<<<<< Updated upstream
node .context/graph/context.mjs --tipo RULE --dominio guardias      # de un dominio
node .context/graph/context.mjs permisos --level L2                # reglas de un tema
=======
node .context/graph/context.mjs --tipo RULE --dominio servicios    # de un dominio
node .context/graph/context.mjs permisos --level L2                # reglas de un tema
node .context/graph/context.mjs --tipo ERROR                       # fallas conocidas
>>>>>>> Stashed changes
```

## Agregar una regla

Un nodo en `.context/graph/curated/rule/`:

```yaml
---
id: rule--<slug>
tipo: RULE
nombre: <el invariante, afirmativo y en una línea>
nivel: L1
resumen: <qué debe cumplirse siempre>
severidad: CRITICA | ALTA | MEDIA
<<<<<<< Updated upstream
fuente: <contra qué se verificó>
=======
>>>>>>> Stashed changes
archivos: [<dónde vive>]
edges:
  - [affects, <entity|table|service|screen afectado>]
---
```

En el cuerpo: **el invariante** (con el código real que lo implementa), **qué pasa si se
rompe** y **cómo se ve el fallo**. Una regla que no dice cómo se manifiesta el fallo no
ayuda a nadie a las tres de la mañana.

<<<<<<< Updated upstream
Solo escribí reglas **verificadas contra el código**. Después:
`node .context/graph/build-graph.mjs && node .context/graph/validar.mjs`.
=======
Solo escribí reglas **verificadas contra el código**, y anotá en `fuente` contra qué se
verificaron. Después: `node .context/graph/build-graph.mjs`.
>>>>>>> Stashed changes
