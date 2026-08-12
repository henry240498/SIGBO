---
id: rule--identidad-y-tiempo-en-sql-server
tipo: RULE
nombre: PK UNIQUEIDENTIFIER con NEWSEQUENTIALID y tiempos en DATETIMEOFFSET(3)
nivel: L2
resumen: Toda tabla usa UNIQUEIDENTIFIER como clave primaria con DEFAULT NEWSEQUENTIALID(), y todos los timestamps son DATETIMEOFFSET(3).
severidad: ALTA
archivos:
  - database/migrations
edges:
  - [affects, table--personal-bomberos]
terminos: [uniqueidentifier, guid, uuid, newsequentialid, datetimeoffset, precision, clave, primaria, tiempo, tiempos, toda, tabla, usa, default, todos, timestamps, son]
---

# PK UNIQUEIDENTIFIER con NEWSEQUENTIALID y tiempos en DATETIMEOFFSET(3)

Toda tabla usa UNIQUEIDENTIFIER como clave primaria con DEFAULT NEWSEQUENTIALID(), y todos los timestamps son DATETIMEOFFSET(3).

## El invariante, repetido en las 87 tablas

```sql
id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_<tabla>_id DEFAULT NEWSEQUENTIALID(),
CONSTRAINT PK_<tabla> PRIMARY KEY CLUSTERED (id),
creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_<tabla>_creado DEFAULT SYSDATETIMEOFFSET(),
```

Del lado de TypeScript: `@PrimaryGeneratedColumn('uuid')`.

## Por que NEWSEQUENTIALID y no NEWID

`NEWID()` genera GUIDs aleatorios, que en un indice **clustered** provocan
fragmentacion y division de paginas en cada insercion. `NEWSEQUENTIALID()` genera
valores crecientes: las inserciones van al final del indice.

El costo es que los GUIDs resultan **parcialmente predecibles**. Como los ids
aparecen en URLs (`/dashboard/personal/[id]`, `/dashboard/guardias/[id]`), no hay que
tratarlos como secretos: la autorizacion la da el permiso, nunca la dificultad de
adivinar un id.

## Por que DATETIMEOFFSET(3) y no DATETIME2

Guarda el offset de zona horaria. La institucion opera en `America/Asuncion`, que
tiene horario de verano: un `DATETIME2` sin offset vuelve ambiguas las marcaciones de
asistencia y los pernoctes en la noche del cambio de hora — exactamente el dato que no
puede quedar ambiguo.

`precision: 3` = milisegundos. Suficiente y mas liviano que el default de 7 digitos.

## Al escribir una tabla nueva

Copiar el encabezado de una migracion reciente (`025_guardias.sql` es el molde mas
actual) en vez de escribirlo de memoria: tiene los elementos —PK, defaults,
timestamps, constraints nombrados, `GO`, creacion idempotente— en la forma que el
resto del esquema ya usa.


## Archivos

- `database/migrations`

## Relaciones

- `affects` → [[table--personal-bomberos|personal.bomberos]]

---
<sub>Nodo **curado** (editable a mano).</sub>
