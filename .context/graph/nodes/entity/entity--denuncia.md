---
id: entity--denuncia
tipo: ENTITY
nombre: Denuncia
nivel: L1
dominio: denuncias
resumen: Entidad Denuncia, persistida en denuncias.denuncias.
tabla: denuncias.denuncias
archivos:
  - backend/src/shared/entities/denuncia.entity.ts
edges:
  - [belongs_to, domain--denuncias]
  - [persisted_in, table--denuncias-denuncias]
terminos: [denuncia, denuncias, estado, nueva, revision, asignada, investigacion, resuelta, cerrada, descartada, duplicada]
---

# Denuncia

Entidad Denuncia, persistida en denuncias.denuncias.

- **Tabla:** [[table--denuncias-denuncias|denuncias.denuncias]]
- **Columnas mapeadas:** 19

## Estados y enumeraciones

- `EstadoDenuncia`: `NUEVA` · `EN_REVISION` · `ASIGNADA` · `EN_INVESTIGACION` · `RESUELTA` · `CERRADA` · `DESCARTADA` · `DUPLICADA`

## Donde se usa

- **Pantallas:** `/dashboard/denuncias`, `/dashboard/denuncias/[id]`
- **Endpoints:** DenunciasController, DenunciasPublicasController
- **Servicios:** DenunciasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/denuncia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `persisted_in` → [[table--denuncias-denuncias|denuncias.denuncias]]

## Referenciado por

- [[service--denuncias-denuncias|DenunciasService]] `uses` →
- [[rule--datos-tecnicos-de-denuncia-restringidos|La IP, el GPS y el user agent de una denuncia exigen un permiso aparte]] `affects` →
- [[workflow--denuncia-rapida|Denuncia rapida: formulario publico, evidencias y gestion interna]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
