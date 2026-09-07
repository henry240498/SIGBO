---
id: api--academia-consultas-academia
tipo: API
nombre: ConsultasAcademiaController
nivel: L2
dominio: academia
resumen: Endpoints de solo lectura pensados para consumo automatizado (Snoopy IA, a futuro) ademas de uso directo desde el frontend. Todos requieren academia:ver -- una IA que consulte en nombre de un usuario hereda exactamente los mismos permisos de ese usuario, nunca mas.
prefijo: /api/v1/academia/consultas
capa: backend
permisos: [academia:ver]
archivos:
  - backend/src/modules/academia/consultas-academia.controller.ts
edges:
  - [belongs_to, domain--academia]
  - [exposes, service--academia-consultas-academia]
terminos: [consultas, academia, ver]
---

# ConsultasAcademiaController

Endpoints de solo lectura pensados para consumo automatizado (Snoopy IA, a futuro) ademas de uso directo desde el frontend. Todos requieren academia:ver -- una IA que consulte en nombre de un usuario hereda exactamente los mismos permisos de ese usuario, nunca mas.

- **Prefijo:** `/api/v1/academia/consultas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/academia/consultas/formacion-bombero/:bomberoId` | `academia:ver` |
| GET | `/academia/consultas/actividades-vigentes` | `academia:ver` |
| GET | `/academia/consultas/resumen-institucional` | `academia:ver` |

## Archivos

- `backend/src/modules/academia/consultas-academia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `exposes` → [[service--academia-consultas-academia|ConsultasAcademiaService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
