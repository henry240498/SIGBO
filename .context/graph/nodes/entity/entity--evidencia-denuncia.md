---
id: entity--evidencia-denuncia
tipo: ENTITY
nombre: EvidenciaDenuncia
nivel: L1
dominio: denuncias
resumen: Entidad EvidenciaDenuncia, persistida en denuncias.evidencias_denuncia.
tabla: denuncias.evidencias_denuncia
archivos:
  - backend/src/shared/entities/evidencia-denuncia.entity.ts
edges:
  - [belongs_to, domain--denuncias]
  - [persisted_in, table--denuncias-evidencias-denuncia]
terminos: [evidencia, denuncia, evidencias, denuncias, tipo, audio]
---

# EvidenciaDenuncia

Entidad EvidenciaDenuncia, persistida en denuncias.evidencias_denuncia.

- **Tabla:** [[table--denuncias-evidencias-denuncia|denuncias.evidencias_denuncia]]
- **Columnas mapeadas:** 8

## Estados y enumeraciones

- `TipoEvidenciaDenuncia`: `AUDIO` · `EVIDENCIA`

## Donde se usa

- **Pantallas:** `/dashboard/denuncias`, `/dashboard/denuncias/[id]`
- **Endpoints:** DenunciasController, DenunciasPublicasController
- **Servicios:** DenunciasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/evidencia-denuncia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `persisted_in` → [[table--denuncias-evidencias-denuncia|denuncias.evidencias_denuncia]]

## Referenciado por

- [[service--denuncias-denuncias|DenunciasService]] `uses` →
- [[workflow--denuncia-rapida|Denuncia rapida: formulario publico, evidencias y gestion interna]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
