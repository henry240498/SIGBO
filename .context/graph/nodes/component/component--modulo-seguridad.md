---
id: component--modulo-seguridad
tipo: COMPONENT
nombre: seguridad (modulo NestJS)
nivel: L1
dominio: seguridad
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de seguridad.
capa: backend
archivos:
  - backend/src/modules/seguridad/seguridad.module.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [seguridad, modulo]
---

# seguridad (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de seguridad.


## Entidades registradas (forFeature)

Usuario, Rol, Permiso, AsignacionRol, AsignacionPermisoRol, AsignacionPermisoDirecto, HistorialContrasena, LogAuditoria, Sesion, ConfiguracionSistema, UsuarioTelefono, UsuarioCorreo

## Archivos

- `backend/src/modules/seguridad/seguridad.module.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[service--seguridad-apariencia|AparienciaService]] `uses` →
- [[service--seguridad-auditoria|AuditoriaService]] `uses` →
- [[service--seguridad-dashboard|DashboardService]] `uses` →
- [[service--seguridad-perfil|PerfilService]] `uses` →
- [[service--seguridad-permisos|PermisosService]] `uses` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `uses` →
- [[service--seguridad-roles|RolesService]] `uses` →
- [[service--seguridad-sesiones|SesionesService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →
- [[rule--todo-endpoint-mutante-con-permiso|Todo endpoint que lee o modifica datos declara el permiso que exige]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
