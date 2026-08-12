---
id: decision--logica-en-typescript
tipo: DECISION
nombre: Cero procedimientos almacenados, toda la logica vive en TypeScript
nivel: L1
estado: VIGENTE
resumen: La base de datos no tiene procedures, funciones, vistas ni triggers. Solo tablas, constraints e indices. La logica de negocio esta en los servicios NestJS.
edges:
  - [constrains, rule--reglas-duplicadas-bd-y-codigo]
terminos: [procedure, trigger, vista, funcion, logica, negocio, constraint, ddl, cero, procedimientos, almacenados, toda, vive, type, script, base, datos, tiene, procedures, funciones, vistas, triggers, solo, tablas, constraints, indices, esta, servicios, nest]
---

# Cero procedimientos almacenados, toda la logica vive en TypeScript

La base de datos no tiene procedures, funciones, vistas ni triggers. Solo tablas, constraints e indices. La logica de negocio esta en los servicios NestJS.

## Decision

`database/` contiene **solo** DDL de tablas, llaves foraneas, indices y
constraints. Cero `CREATE PROCEDURE`, `CREATE FUNCTION`, `CREATE VIEW`,
`CREATE TRIGGER`. Los archivos `database/scripts/09_create_procedures.sql` y
`10_create_triggers.sql` existen como estructura del andamiaje pero no crean
objetos.

## Motivo

Una sola sede para la logica: los servicios NestJS. Depurable, testeable y
versionada junto al resto del codigo. Nada de reglas invisibles disparandose
desde el motor de base de datos.

## Consecuencia importante

La base de datos **si** impone reglas, via `CHECK` y `UNIQUE`. Eso significa que
varios invariantes viven en dos lugares a la vez: el constraint en la migracion y
la validacion en el servicio. La duplicacion es intencional —la BD es la ultima
linea de defensa— pero hay que mantener ambos lados sincronizados. Ver
[[rule--reglas-duplicadas-bd-y-codigo]].

## Efecto en este grafo

El tipo de nodo `PROCEDURE` existe en la taxonomia y esta **en cero**. Que este
vacio es informacion verificada, no un olvido del generador.


## Relaciones

- `constrains` → [[rule--reglas-duplicadas-bd-y-codigo|Los invariantes viven en la BD y en el servicio, y hay que cambiar los dos]]

---
<sub>Nodo **curado** (editable a mano).</sub>
