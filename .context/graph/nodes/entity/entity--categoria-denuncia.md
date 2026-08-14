---
id: entity--categoria-denuncia
tipo: ENTITY
nombre: CategoriaDenuncia
nivel: L1
dominio: denuncias
resumen: Entidad CategoriaDenuncia, persistida en denuncias.categorias_denuncia.
tabla: denuncias.categorias_denuncia
archivos:
  - backend/src/shared/entities/categoria-denuncia.entity.ts
edges:
  - [belongs_to, domain--denuncias]
  - [persisted_in, table--denuncias-categorias-denuncia]
terminos: [categoria, denuncia, categorias, denuncias]
---

# CategoriaDenuncia

Entidad CategoriaDenuncia, persistida en denuncias.categorias_denuncia.

- **Tabla:** [[table--denuncias-categorias-denuncia|denuncias.categorias_denuncia]]
- **Columnas mapeadas:** 4

## Donde se usa

- **Pantallas:** `/dashboard/denuncias`, `/dashboard/denuncias/[id]`
- **Endpoints:** DenunciasController, DenunciasPublicasController
- **Servicios:** DenunciasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/categoria-denuncia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `persisted_in` → [[table--denuncias-categorias-denuncia|denuncias.categorias_denuncia]]

## Referenciado por

- [[service--denuncias-denuncias|DenunciasService]] `uses` →
- [[workflow--denuncia-rapida|Denuncia rapida: formulario publico, evidencias y gestion interna]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
