---
id: entity--idioma-bombero
tipo: ENTITY
nombre: IdiomaBombero
nivel: L1
dominio: personal
resumen: Entidad IdiomaBombero, persistida en personal.idiomas_bombero.
tabla: personal.idiomas_bombero
archivos:
  - backend/src/shared/entities/idioma-bombero.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-idiomas-bombero]
terminos: [idioma, bombero, idiomas, personal]
---

# IdiomaBombero

Entidad IdiomaBombero, persistida en personal.idiomas_bombero.

- **Tabla:** [[table--personal-idiomas-bombero|personal.idiomas_bombero]]
- **Columnas mapeadas:** 4

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** FojaServicioController, IdiomasController
- **Servicios:** FojaServicioService, IdiomasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/idioma-bombero.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-idiomas-bombero|personal.idiomas_bombero]]

## Referenciado por

- [[service--personal-foja-servicio|FojaServicioService]] `uses` →
- [[service--personal-idiomas|IdiomasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
