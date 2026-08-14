---
id: domain--seguridad
tipo: DOMAIN
nombre: Seguridad
nivel: L0
dominio: seguridad
estado: ACTIVO
resumen: "Modulo funcional \"Seguridad\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [seguridad]
---

# Seguridad

Modulo funcional "Seguridad". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--asignacion-permiso-directo|AsignacionPermisoDirecto]] `belongs_to` →
- [[entity--asignacion-permiso-rol|AsignacionPermisoRol]] `belongs_to` →
- [[entity--asignacion-rol|AsignacionRol]] `belongs_to` →
- [[entity--configuracion-sistema|ConfiguracionSistema]] `belongs_to` →
- [[entity--configuracion-valor|ConfiguracionValor]] `belongs_to` →
- [[entity--configuracion-version|ConfiguracionVersion]] `belongs_to` →
- [[entity--historial-contrasena|HistorialContrasena]] `belongs_to` →
- [[entity--log-auditoria|LogAuditoria]] `belongs_to` →
- [[entity--permiso|Permiso]] `belongs_to` →
- [[entity--rol|Rol]] `belongs_to` →
- [[entity--sesion|Sesion]] `belongs_to` →
- [[entity--usuario-correo|UsuarioCorreo]] `belongs_to` →
- [[entity--usuario-telefono|UsuarioTelefono]] `belongs_to` →
- [[entity--usuario|Usuario]] `belongs_to` →
- [[table--seguridad-usuarios|seguridad.usuarios]] `belongs_to` →
- [[table--seguridad-roles|seguridad.roles]] `belongs_to` →
- [[table--seguridad-permisos|seguridad.permisos]] `belongs_to` →
- [[table--seguridad-asignacion-roles|seguridad.asignacion_roles]] `belongs_to` →
- [[table--seguridad-asignacion-permisos-directos|seguridad.asignacion_permisos_directos]] `belongs_to` →
- [[table--seguridad-asignacion-permisos-rol|seguridad.asignacion_permisos_rol]] `belongs_to` →
- [[table--seguridad-restricciones|seguridad.restricciones]] `belongs_to` →
- [[table--seguridad-sesiones|seguridad.sesiones]] `belongs_to` →
- [[table--seguridad-logs-auditoria|seguridad.logs_auditoria]] `belongs_to` →
- [[table--seguridad-historial-contrasenas|seguridad.historial_contrasenas]] `belongs_to` →
- [[table--seguridad-configuracion-sistema|seguridad.configuracion_sistema]] `belongs_to` →
- [[table--seguridad-usuario-telefonos|seguridad.usuario_telefonos]] `belongs_to` →
- [[table--seguridad-usuario-correos|seguridad.usuario_correos]] `belongs_to` →
- [[table--seguridad-configuracion-valores|seguridad.configuracion_valores]] `belongs_to` →
- [[table--seguridad-configuracion-versiones|seguridad.configuracion_versiones]] `belongs_to` →
- [[component--modulo-auth|auth (modulo NestJS)]] `belongs_to` →
- [[component--modulo-configuracion|configuracion (modulo NestJS)]] `belongs_to` →
- [[component--modulo-seguridad|seguridad (modulo NestJS)]] `belongs_to` →
- [[service--auth-auth|AuthService]] `belongs_to` →
- [[service--configuracion-configuracion|ConfiguracionService]] `belongs_to` →
- [[service--seguridad-apariencia|AparienciaService]] `belongs_to` →
- [[service--seguridad-auditoria|AuditoriaService]] `belongs_to` →
- [[service--seguridad-dashboard|DashboardService]] `belongs_to` →
- [[service--seguridad-perfil|PerfilService]] `belongs_to` →
- [[service--seguridad-permisos|PermisosService]] `belongs_to` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `belongs_to` →
- [[service--seguridad-roles|RolesService]] `belongs_to` →
- [[service--seguridad-sesiones|SesionesService]] `belongs_to` →
- [[service--seguridad-usuarios|UsuariosService]] `belongs_to` →
- [[api--auth-auth|AuthController]] `belongs_to` →
- [[api--configuracion-configuracion|ConfiguracionController]] `belongs_to` →
- [[api--seguridad-apariencia|AparienciaController]] `belongs_to` →
- [[api--seguridad-auditoria|AuditoriaController]] `belongs_to` →
- [[api--seguridad-dashboard|DashboardController]] `belongs_to` →
- [[api--seguridad-me|MeController]] `belongs_to` →
- [[api--seguridad-perfil|PerfilController]] `belongs_to` →
- [[api--seguridad-permisos|PermisosController]] `belongs_to` →
- [[api--seguridad-roles|RolesController]] `belongs_to` →
- [[api--seguridad-sesiones|SesionesController]] `belongs_to` →
- [[api--seguridad-usuarios|UsuariosController]] `belongs_to` →
- [[screen--dashboard-mi-perfil|/dashboard/mi-perfil]] `belongs_to` →
<<<<<<< Updated upstream
- [[screen--dashboard|/dashboard]] `belongs_to` →
- [[screen--dashboard-seguridad-apariencia|/dashboard/seguridad/apariencia]] `belongs_to` →
- [[screen--dashboard-seguridad-auditoria|/dashboard/seguridad/auditoria]] `belongs_to` →
- [[screen--dashboard-seguridad-configuracion|/dashboard/seguridad/configuracion]] `belongs_to` →
- [[screen--dashboard-seguridad|/dashboard/seguridad]] `belongs_to` →
=======
- [[screen--dashboard-mi-perfil-preferencias|/dashboard/mi-perfil/preferencias]] `belongs_to` →
- [[screen--dashboard-mi-perfil-seguridad|/dashboard/mi-perfil/seguridad]] `belongs_to` →
- [[screen--dashboard|/dashboard]] `belongs_to` →
- [[screen--dashboard-seguridad-apariencia|/dashboard/seguridad/apariencia]] `belongs_to` →
- [[screen--dashboard-seguridad-auditoria|/dashboard/seguridad/auditoria]] `belongs_to` →
>>>>>>> Stashed changes

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
