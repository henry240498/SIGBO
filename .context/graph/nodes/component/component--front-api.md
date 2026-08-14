---
id: component--front-api
tipo: COMPONENT
nombre: api
nivel: L2
resumen: "Helper de frontend \"api\" (8 exportaciones)."
capa: frontend
archivos:
  - frontend/src/lib/api.ts
terminos: [api, origin, sesion, guardar, obtener, cerrar, local, login, logout, fetch]
---

# api

Helper de frontend "api" (8 exportaciones).


## Archivos

- `frontend/src/lib/api.ts`

## Referenciado por

- [[screen--dashboard-asistencia-auditoria|/dashboard/asistencia/auditoria]] `uses` →
- [[screen--dashboard-asistencia-eventos|/dashboard/asistencia/eventos]] `uses` →
- [[screen--dashboard-asistencia-eventos-id|/dashboard/asistencia/eventos/[id]]] `uses` →
- [[screen--dashboard-asistencia-externos|/dashboard/asistencia/externos]] `uses` →
<<<<<<< Updated upstream
- [[screen--dashboard-asistencia-registro|/dashboard/asistencia/registro]] `uses` →
- [[screen--dashboard-asistencia-tolerancias|/dashboard/asistencia/tolerancias]] `uses` →
- [[screen--dashboard-equipos-categorias|/dashboard/equipos/categorias]] `uses` →
- [[screen--dashboard-equipos|/dashboard/equipos]] `uses` →
- [[screen--dashboard-equipos-id|/dashboard/equipos/[id]]] `uses` →
- [[screen--dashboard-guardias-auditoria|/dashboard/guardias/auditoria]] `uses` →
- [[screen--dashboard-guardias-grupos|/dashboard/guardias/grupos]] `uses` →
- [[screen--dashboard-guardias-grupos-id|/dashboard/guardias/grupos/[id]]] `uses` →
- [[screen--dashboard-guardias|/dashboard/guardias]] `uses` →
- [[screen--dashboard-guardias-pernoctes|/dashboard/guardias/pernoctes]] `uses` →
- [[screen--dashboard-guardias-requisitos|/dashboard/guardias/requisitos]] `uses` →
- [[screen--dashboard-guardias-id|/dashboard/guardias/[id]]] `uses` →
- [[screen--dashboard-mi-perfil|/dashboard/mi-perfil]] `uses` →
=======
- [[screen--dashboard-asistencia-guardias|/dashboard/asistencia/guardias]] `uses` →
- [[screen--dashboard-asistencia-guardias-id|/dashboard/asistencia/guardias/[id]]] `uses` →
- [[screen--dashboard-asistencia-registro|/dashboard/asistencia/registro]] `uses` →
- [[screen--dashboard-asistencia-tolerancias|/dashboard/asistencia/tolerancias]] `uses` →
- [[screen--dashboard-mi-perfil|/dashboard/mi-perfil]] `uses` →
- [[screen--dashboard-mi-perfil-preferencias|/dashboard/mi-perfil/preferencias]] `uses` →
- [[screen--dashboard-mi-perfil-seguridad|/dashboard/mi-perfil/seguridad]] `uses` →
>>>>>>> Stashed changes
- [[screen--dashboard-organizacion-ascensos|/dashboard/organizacion/ascensos]] `uses` →
- [[screen--dashboard-organizacion-brigadas|/dashboard/organizacion/brigadas]] `uses` →
- [[screen--dashboard-organizacion-cargos|/dashboard/organizacion/cargos]] `uses` →
- [[screen--dashboard-organizacion-companias|/dashboard/organizacion/companias]] `uses` →
- [[screen--dashboard-organizacion-cuarteles|/dashboard/organizacion/cuarteles]] `uses` →
- [[screen--dashboard-organizacion-departamentos|/dashboard/organizacion/departamentos]] `uses` →
- [[screen--dashboard-organizacion-designaciones|/dashboard/organizacion/designaciones]] `uses` →
- [[screen--dashboard-organizacion-especialidades|/dashboard/organizacion/especialidades]] `uses` →
- [[screen--dashboard-organizacion-guardias|/dashboard/organizacion/guardias]] `uses` →
- [[screen--dashboard-organizacion|/dashboard/organizacion]] `uses` →
- [[screen--dashboard-organizacion-parametros|/dashboard/organizacion/parametros]] `uses` →
- [[screen--dashboard-organizacion-rangos|/dashboard/organizacion/rangos]] `uses` →
- [[screen--dashboard-organizacion-tipos-bombero|/dashboard/organizacion/tipos-bombero]] `uses` →
- [[screen--dashboard-organizacion-turnos|/dashboard/organizacion/turnos]] `uses` →
- [[screen--dashboard-organizacion-unidades|/dashboard/organizacion/unidades]] `uses` →
- [[screen--dashboard|/dashboard]] `uses` →
- [[screen--dashboard-personal-nuevo|/dashboard/personal/nuevo]] `uses` →
- [[screen--dashboard-personal|/dashboard/personal]] `uses` →
- [[screen--dashboard-personal-id|/dashboard/personal/[id]]] `uses` →
- [[screen--dashboard-seguridad-apariencia|/dashboard/seguridad/apariencia]] `uses` →
- [[screen--dashboard-seguridad-auditoria|/dashboard/seguridad/auditoria]] `uses` →
- [[screen--dashboard-seguridad-configuracion|/dashboard/seguridad/configuracion]] `uses` →
- [[screen--dashboard-seguridad|/dashboard/seguridad]] `uses` →
- [[screen--dashboard-seguridad-permisos|/dashboard/seguridad/permisos]] `uses` →
- [[screen--dashboard-seguridad-roles|/dashboard/seguridad/roles]] `uses` →
- [[screen--dashboard-seguridad-sesiones|/dashboard/seguridad/sesiones]] `uses` →
- [[screen--dashboard-seguridad-usuarios|/dashboard/seguridad/usuarios]] `uses` →
- [[screen--dashboard-seguridad-usuarios-id|/dashboard/seguridad/usuarios/[id]]] `uses` →
- [[screen--dashboard-servicios-nuevo|/dashboard/servicios/nuevo]] `uses` →
- [[screen--dashboard-servicios|/dashboard/servicios]] `uses` →
<<<<<<< Updated upstream
- [[screen--dashboard-vehiculos-checklist-items|/dashboard/vehiculos/checklist-items]] `uses` →
- [[screen--dashboard-vehiculos|/dashboard/vehiculos]] `uses` →
- [[screen--dashboard-vehiculos-id|/dashboard/vehiculos/[id]]] `uses` →
=======
>>>>>>> Stashed changes
- [[screen--login|/login]] `uses` →
- [[screen--raiz|/]] `uses` →
- [[rule--api-v1-y-contrato-http|Toda la API vive bajo /api/v1 y el frontend nunca escribe ese prefijo]] `affects` →
- [[rule--pantalla-cliente-sin-store|Cada pantalla es cliente, duena de su estado, y recarga con cargar()]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
