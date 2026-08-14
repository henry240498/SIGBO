---
id: decision--migraciones-a-mano
tipo: DECISION
nombre: Migraciones SQL escritas a mano con synchronize desactivado
nivel: L1
estado: VIGENTE
resumen: TypeORM nunca altera el esquema. synchronize es false y toda la estructura se crea con archivos SQL numerados que se ejecutan en orden.
archivos:
  - backend/src/core/database/data-source-options.ts
  - database/run-migrations.ps1
edges:
  - [constrains, rule--migracion-nunca-se-edita]
  - [constrains, rule--entidad-y-tabla-en-paralelo]
terminos: [migracion, migraciones, synchronize, typeorm, esquema, ddl, orden, sql, escritas, mano, desactivado, type, orm, nunca, altera, false, toda, estructura, crea, archivos, numerados, ejecutan]
---

# Migraciones SQL escritas a mano con synchronize desactivado

TypeORM nunca altera el esquema. synchronize es false y toda la estructura se crea con archivos SQL numerados que se ejecutan en orden.

## Decision

`synchronize: false` en `data-source-options.ts`. La estructura de la base se
define exclusivamente en `database/migrations/NNN_nombre.sql`, ejecutados en orden
<<<<<<< Updated upstream
numerico por `database/run-migrations.ps1`. Hoy son **27 migraciones**, hasta
`025_guardias.sql`.
=======
numerico por `database/run-migrations.ps1`.
>>>>>>> Stashed changes

## Motivo

`synchronize: true` habria borrado o alterado columnas en produccion siguiendo los
<<<<<<< Updated upstream
cambios de las entidades. Con 87 tablas y datos reales de 164 personas cargadas, un
=======
cambios de las entidades. Con 80 tablas y datos reales de 164 personas cargadas, un
>>>>>>> Stashed changes
DROP automatico no es un riesgo aceptable.

## Consecuencias que hay que respetar

<<<<<<< Updated upstream
1. **La entidad no crea la tabla.** Agregar una propiedad `@Column` no agrega la
   columna: hace falta una migracion. Si se olvida, TypeORM falla en tiempo de
   ejecucion al consultar una columna inexistente. Ver
   [[rule--entidad-y-tabla-en-paralelo]].
2. **Las migraciones ya aplicadas son inmutables.** Ver [[rule--migracion-nunca-se-edita]].
3. El numero mas alto es el estado del esquema. La numeracion **ya colisiono**: hay
   dos archivos con prefijo `017` (`017_comunicaciones_servicio.sql` y
   `017_tipos_bombero.sql`). Verificar el prefijo libre antes de crear una nueva.

## El esquema no es solo los CREATE TABLE

La migracion 014 **renombra** una tabla con `sp_rename`. Por eso el generador del
grafo aplica las migraciones en orden (renames, `ALTER`, `DROP`) en vez de solo leer
los `CREATE TABLE`: de otro modo describiria un esquema que ya no existe.
=======
1. **La entidad no crea la tabla.** Agregar una propiedad `@Column` a una entidad no
   agrega la columna: hace falta una migracion. Si se olvida, TypeORM falla en tiempo
   de ejecucion al consultar una columna inexistente. Ver
   [[rule--entidad-y-tabla-en-paralelo]].
2. **Las migraciones ya aplicadas son inmutables.** Ver [[rule--migracion-nunca-se-edita]].
3. El numero de migracion mas alto es el estado del esquema. Hoy hay **dos** archivos
   con prefijo `017` (`017_comunicaciones_servicio.sql` y `017_tipos_bombero.sql`):
   la numeracion ya colisiono una vez, hay que verificar el prefijo libre antes de
   crear una migracion nueva.
>>>>>>> Stashed changes

## Nota sobre el estado real

`database/scripts/` contiene un andamiaje paralelo (`01_create_database.sql` …
`10_create_triggers.sql`) que **no** es el camino vigente. El camino vigente es
`database/migrations/`.


## Archivos

- `backend/src/core/database/data-source-options.ts`
- `database/run-migrations.ps1`

## Relaciones

- `constrains` → [[rule--migracion-nunca-se-edita|Una migracion ya aplicada nunca se edita, se agrega otra]]
- `constrains` → [[rule--entidad-y-tabla-en-paralelo|Cambiar una entidad exige la migracion correspondiente en el mismo cambio]]

---
<sub>Nodo **curado** (editable a mano).</sub>
