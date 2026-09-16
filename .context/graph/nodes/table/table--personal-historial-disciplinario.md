---
id: table--personal-historial-disciplinario
tipo: TABLE
nombre: personal.historial_disciplinario
nivel: L2
dominio: personal
resumen: Tabla personal.historial_disciplinario (15 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql.
tabla: historial_disciplinario
archivos:
  - database/migrations/003_personal.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--003-personal]
  - [belongs_to, domain--personal]
terminos: [personal, historial, disciplinario, bombero, fecha, tipo, descripcion, articulo, reglamento, resolucion, sancion, duracion, dias, fin, estado, recurso, presentado, resultado, creado]
---

# personal.historial_disciplinario

Tabla personal.historial_disciplinario (15 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** personal · **Columnas:** 15

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| fecha | DATE |
| tipo | NVARCHAR(50) |
| descripcion | NVARCHAR(MAX) |
| articulo_reglamento | NVARCHAR(50) |
| resolucion | NVARCHAR(100) |
| sancion | NVARCHAR(MAX) |
| duracion_dias | INT |
| fecha_fin_sancion | DATE |
| estado | NVARCHAR(20) |
| recurso_presentado | BIT |
| resultado_recurso | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/003_personal.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--003-personal|003_personal.sql]]
- `belongs_to` → [[domain--personal|Personal]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
