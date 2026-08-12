---
id: rule--migracion-nunca-se-edita
tipo: RULE
nombre: Una migracion ya aplicada nunca se edita, se agrega otra
nivel: L1
resumen: Los archivos de database/migrations son inmutables una vez ejecutados. Todo cambio de esquema es un archivo nuevo con el siguiente numero libre.
severidad: CRITICA
archivos: [database/migrations, database/run-migrations.ps1]
terminos: [migracion, inmutable, editar, numero, orden, esquema, ddl, prefijo]
edges:
  - [affects, component--modulo-configuracion]
---

## El invariante

Una migracion ejecutada contra una base con datos es **historia**. Editarla no
cambia la base ya migrada: crea una divergencia silenciosa entre lo que el archivo
dice y lo que la base tiene. La proxima persona que corra las migraciones desde cero
obtiene un esquema distinto del que esta en produccion.

Todo cambio es un archivo nuevo: `ALTER TABLE`, `DROP CONSTRAINT`, `CREATE INDEX`, lo
que haga falta.

## Antes de crear una migracion: verificar el numero

La numeracion **ya colisiono**. Hoy existen dos archivos con prefijo `017`:

- `017_comunicaciones_servicio.sql`
- `017_tipos_bombero.sql`

Con dos archivos del mismo numero, el orden de ejecucion depende del orden
alfabetico del sistema de archivos — no es una garantia sobre la que se pueda
construir una dependencia. Antes de agregar una migracion:

```bash
ls database/migrations | sort | tail -5
```

y usar un numero **estrictamente mayor** al mas alto (hoy `025_guardias.sql`).

## Estilo de las migraciones existentes

- Encabezado en comentario con el numero y el proposito.
- `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON;` al inicio — ver
  [[error--quoted-identifier-en-migraciones]].
- `GO` entre lotes (T-SQL lo exige para separar DDL).
- Constraints **siempre nombrados**: `PK_`, `FK_`, `UQ_`, `CK_`, `DF_`, `IX_`. Sin
  nombre no se pueden borrar despues de forma legible.
- Creacion idempotente cuando aplica:
  `IF OBJECT_ID(N'schema.tabla',N'U') IS NULL` / `IF NOT EXISTS(SELECT 1 FROM sys.schemas ...)`.

`025_guardias.sql` es el molde mas reciente y completo para copiar.
