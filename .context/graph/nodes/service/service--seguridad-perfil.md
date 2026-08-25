---
id: service--seguridad-perfil
tipo: SERVICE
nombre: PerfilService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de perfil (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/perfil.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--usuario]
  - [reads, table--seguridad-usuarios]
  - [uses, entity--usuario-telefono]
  - [reads, table--seguridad-usuario-telefonos]
  - [uses, entity--usuario-correo]
  - [reads, table--seguridad-usuario-correos]
  - [uses, entity--asignacion-guardia]
  - [reads, table--operaciones-asignacion-guardias]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--personal-servicio]
  - [reads, table--servicios-personal-servicio]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
  - [uses, entity--tipo-servicio]
  - [reads, table--servicios-tipos-servicio]
  - [uses, service--seguridad-apariencia]
terminos: [perfil, seguridad, usuario, telefono, correo, asignacion, guardia, personal, servicio, tipo]
---

# PerfilService

Logica de negocio de perfil (modulo seguridad).


## Metodos

`puedeEditar()` · `obtenerPerfil()` · `obtenerInicioPropio()` · `actualizarPerfilPropio()` · `actualizarPerfilComoAdmin()` · `actualizarFotoPropia()` · `actualizarFotoComoAdmin()` · `obtenerFoto()`

## Archivos

- `backend/src/modules/seguridad/perfil.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--usuario|Usuario]]
- `reads` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `uses` → [[entity--usuario-telefono|UsuarioTelefono]]
- `reads` → [[table--seguridad-usuario-telefonos|seguridad.usuario_telefonos]]
- `uses` → [[entity--usuario-correo|UsuarioCorreo]]
- `reads` → [[table--seguridad-usuario-correos|seguridad.usuario_correos]]
- `uses` → [[entity--asignacion-guardia|AsignacionGuardia]]
- `reads` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--personal-servicio|PersonalServicio]]
- `reads` → [[table--servicios-personal-servicio|servicios.personal_servicio]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]
- `uses` → [[entity--tipo-servicio|TipoServicio]]
- `reads` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- `uses` → [[service--seguridad-apariencia|AparienciaService]]

## Referenciado por

- [[api--seguridad-perfil|PerfilController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
