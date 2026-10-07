---
id: table--servicios-tipos-recurso
tipo: TABLE
nombre: servicios.tipos_recurso
nivel: L2
dominio: servicios
resumen: Tabla servicios.tipos_recurso (6 columnas). Creada en 093_centro_operaciones_incidentes.sql.
tabla: tipos_recurso
archivos:
  - database/migrations/093_centro_operaciones_incidentes.sql
edges:
  - [defined_in, file--093-centro-operaciones-incidentes]
  - [belongs_to, domain--servicios]
terminos: [servicios, tipos, recurso, codigo, nombre, categoria, orden, activo]
---

# servicios.tipos_recurso

Tabla servicios.tipos_recurso (6 columnas). Creada en 093_centro_operaciones_incidentes.sql.

- **Esquema:** servicios · **Columnas:** 6

## Restricciones CHECK (reglas que la BD impone)

- `categoria IN ('MOVIL', 'PERSONAL', 'INSUMO', 'EXTERNO', 'OTRO')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(30) |
| nombre | NVARCHAR(80) |
| categoria | NVARCHAR(10) |
| orden | INT |
| activo | BIT |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/093_centro_operaciones_incidentes.sql`

## Relaciones

- `defined_in` → [[file--093-centro-operaciones-incidentes|093_centro_operaciones_incidentes.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[table--servicios-incidente-solicitudes|servicios.incidente_solicitudes]] `references` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
