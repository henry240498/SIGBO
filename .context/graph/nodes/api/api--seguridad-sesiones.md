---
id: api--seguridad-sesiones
tipo: API
nombre: SesionesController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de sesiones bajo /api/v1/seguridad/sesiones.
prefijo: /api/v1/seguridad/sesiones
capa: backend
permisos: [seguridad:ver_usuarios]
archivos:
  - backend/src/modules/seguridad/sesiones.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--seguridad-sesiones]
  - [exposes, service--seguridad-auditoria]
terminos: [sesiones, seguridad, ver, usuarios]
---

# SesionesController

Superficie HTTP de sesiones bajo /api/v1/seguridad/sesiones.

- **Prefijo:** `/api/v1/seguridad/sesiones`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/seguridad/sesiones` | `seguridad:ver_usuarios` |
<<<<<<< Updated upstream
=======
| GET | `/seguridad/sesiones/mias` | — |
| DELETE | `/seguridad/sesiones/mias/:id` | — |
| POST | `/seguridad/sesiones/mias/cerrar-todas` | — |
>>>>>>> Stashed changes

## Archivos

- `backend/src/modules/seguridad/sesiones.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--seguridad-sesiones|SesionesService]]
- `exposes` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

<<<<<<< Updated upstream
=======
- [[screen--dashboard-mi-perfil-seguridad|/dashboard/mi-perfil/seguridad]] `calls` →
- [[screen--dashboard-mi-perfil-seguridad|/dashboard/mi-perfil/seguridad]] `calls` →
- [[screen--dashboard-mi-perfil-seguridad|/dashboard/mi-perfil/seguridad]] `calls` →
>>>>>>> Stashed changes
- [[screen--dashboard-seguridad-sesiones|/dashboard/seguridad/sesiones]] `calls` →
- [[screen--dashboard-seguridad-sesiones|/dashboard/seguridad/sesiones]] `calls` →
- [[screen--dashboard-seguridad-usuarios-id|/dashboard/seguridad/usuarios/[id]]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
