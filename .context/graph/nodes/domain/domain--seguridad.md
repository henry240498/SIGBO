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
- [[table--seguridad-pantallas|seguridad.pantallas]] `belongs_to` →
- [[table--seguridad-pantalla-permisos|seguridad.pantalla_permisos]] `belongs_to` →
- [[table--seguridad-navegacion-eventos|seguridad.navegacion_eventos]] `belongs_to` →
- [[component--modulo-auth|auth (modulo NestJS)]] `belongs_to` →
- [[component--modulo-configuracion|configuracion (modulo NestJS)]] `belongs_to` →
- [[component--modulo-pantallas|pantallas (modulo NestJS)]] `belongs_to` →
- [[component--modulo-reportes|reportes (modulo NestJS)]] `belongs_to` →
- [[component--modulo-salud|salud (modulo NestJS)]] `belongs_to` →
- [[component--modulo-seguridad|seguridad (modulo NestJS)]] `belongs_to` →
- [[service--auth-auth|AuthService]] `belongs_to` →
- [[service--configuracion-configuracion|ConfiguracionService]] `belongs_to` →
- [[service--pantallas-navegacion|NavegacionService]] `belongs_to` →
- [[service--pantallas-pantallas|PantallasService]] `belongs_to` →
- [[service--reportes-reportes|ReportesService]] `belongs_to` →
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
- [[api--pantallas-pantallas|PantallasController]] `belongs_to` →
- [[api--reportes-reportes|ReportesController]] `belongs_to` →
- [[api--salud-salud|SaludController]] `belongs_to` →
- [[api--seguridad-apariencia|AparienciaController]] `belongs_to` →
- [[api--seguridad-auditoria|AuditoriaController]] `belongs_to` →
- [[api--seguridad-dashboard|DashboardController]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
