---
id: table--personal-avisos-vencimiento
tipo: TABLE
nombre: personal.avisos_vencimiento
nivel: L2
dominio: personal
resumen: Tabla personal.avisos_vencimiento (2 columnas). Creada en 086_campo_adjuntos_ausencias.sql.
tabla: avisos_vencimiento
archivos:
  - database/migrations/086_campo_adjuntos_ausencias.sql
edges:
  - [defined_in, file--086-campo-adjuntos-ausencias]
  - [belongs_to, domain--personal]
terminos: [personal, avisos, vencimiento, clave, avisado]
---

# personal.avisos_vencimiento

Tabla personal.avisos_vencimiento (2 columnas). Creada en 086_campo_adjuntos_ausencias.sql.

- **Esquema:** personal · **Columnas:** 2

## Columnas

| Columna | Tipo |
|---|---|
| clave | NVARCHAR(200) |
| avisado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/086_campo_adjuntos_ausencias.sql`

## Relaciones

- `defined_in` → [[file--086-campo-adjuntos-ausencias|086_campo_adjuntos_ausencias.sql]]
- `belongs_to` → [[domain--personal|Personal]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
