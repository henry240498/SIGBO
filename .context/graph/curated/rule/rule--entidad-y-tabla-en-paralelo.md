---
id: rule--entidad-y-tabla-en-paralelo
tipo: RULE
nombre: Cambiar una entidad exige la migracion correspondiente en el mismo cambio
nivel: L1
resumen: Con synchronize false, agregar un @Column no crea la columna. Entidad y migracion se cambian juntas o el backend falla en tiempo de ejecucion.
severidad: CRITICA
archivos: [backend/src/shared/entities, database/migrations]
terminos: [entidad, tabla, columna, migracion, synchronize, typeorm, paralelo, invalid, column]
edges:
  - [affects, configuration--conexion-datos]
---

## El invariante

`synchronize: false`. TypeORM **lee** el esquema, no lo escribe. Entonces:

| Cambio en la entidad | Migracion necesaria |
|---|---|
| Nueva propiedad `@Column` | `ALTER TABLE ... ADD` |
| Cambio de tipo o longitud | `ALTER TABLE ... ALTER COLUMN` |
| Propiedad renombrada | `sp_rename` o add + backfill + drop |
| Nueva entidad | `CREATE TABLE` + FKs + indices |
| Nuevo valor en un `export type` de estados | actualizar el `CHECK` de la tabla |

Esa ultima fila es la que mas se olvida: agregar `'PAUSADO'` al tipo TypeScript
compila perfecto y despues **falla al guardar**, porque el `CHECK` de la BD sigue
aceptando solo los valores viejos.

## Como se ve el fallo

- Columna faltante: `Invalid column name 'x'` en cada consulta a esa tabla — la
  entidad entera queda inutilizable, no solo el campo nuevo.
- Valor de estado no permitido: violacion de constraint `CK_...` al insertar o
  actualizar.
- Tabla faltante: el generador del grafo lo detecta y marca la entidad como
  **huerfana** (`graph/indexes/stats.json`, seccion `entidadesSinTabla`). Hoy hay
  una: `ConfiguracionApariencia`, cuya tabla fue renombrada en la migracion 014 y
  que ya no se usa en ningun lado.

## Ademas: registrar la entidad

Una entidad nueva tiene que exportarse desde `backend/src/shared/entities/index.ts`
(el DataSource carga `Object.values(entities)`) y registrarse con
`TypeOrmModule.forFeature([...])` en el modulo que la use. Si falta lo primero,
TypeORM no la conoce; si falta lo segundo, la inyeccion del repositorio falla al
arrancar.

## Convencion de nombres entre las dos capas

`SnakeNamingStrategy` traduce automaticamente: `numeroBombero` es `numero_bombero`.
Ver [[rule--snake-case-en-bd-camel-en-typescript]].

## Un desajuste que ya existe

La migracion 017 declara `estado NVARCHAR(30)` en `comunicaciones_servicio`; la
entidad declara `length: 20`. Los cinco valores del `CHECK` caben en 20, asi que no
falla, pero las dos capas no coinciden. Al agregar un estado, verificar **ambos**
numeros.
