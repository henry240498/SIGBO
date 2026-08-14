---
id: entity--historial-estado-denuncia
tipo: ENTITY
nombre: HistorialEstadoDenuncia
nivel: L1
dominio: denuncias
resumen: Entidad HistorialEstadoDenuncia, persistida en denuncias.historial_estados_denuncia.
tabla: denuncias.historial_estados_denuncia
archivos:
  - backend/src/shared/entities/historial-estado-denuncia.entity.ts
edges:
  - [belongs_to, domain--denuncias]
  - [persisted_in, table--denuncias-historial-estados-denuncia]
terminos: [historial, estado, denuncia, estados, denuncias]
---

# HistorialEstadoDenuncia

Entidad HistorialEstadoDenuncia, persistida en denuncias.historial_estados_denuncia.

- **Tabla:** [[table--denuncias-historial-estados-denuncia|denuncias.historial_estados_denuncia]]
- **Columnas mapeadas:** 5

## Donde se usa

- **Pantallas:** `/dashboard/denuncias`, `/dashboard/denuncias/[id]`
- **Endpoints:** DenunciasController, DenunciasPublicasController
- **Servicios:** DenunciasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/historial-estado-denuncia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `persisted_in` → [[table--denuncias-historial-estados-denuncia|denuncias.historial_estados_denuncia]]

## Referenciado por

- [[service--denuncias-denuncias|DenunciasService]] `uses` →
- [[workflow--denuncia-rapida|Denuncia rapida: formulario publico, evidencias y gestion interna]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
