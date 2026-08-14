---
id: entity--historial-codigo
tipo: ENTITY
nombre: HistorialCodigo
nivel: L1
dominio: personal
resumen: Entidad HistorialCodigo, persistida en personal.historial_codigo.
tabla: personal.historial_codigo
archivos:
  - backend/src/shared/entities/historial-codigo.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-historial-codigo]
terminos: [historial, codigo, personal]
---

# HistorialCodigo

Entidad HistorialCodigo, persistida en personal.historial_codigo.

- **Tabla:** [[table--personal-historial-codigo|personal.historial_codigo]]
- **Columnas mapeadas:** 6

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** BomberosController
- **Servicios:** BomberosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/historial-codigo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-historial-codigo|personal.historial_codigo]]

## Referenciado por

- [[service--personal-bomberos|BomberosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
