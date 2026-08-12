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
  - [uses, service--seguridad-apariencia]
terminos: [perfil, seguridad, usuario, telefono, correo]
---

# PerfilService

Logica de negocio de perfil (modulo seguridad).


## Metodos

`puedeEditar()` · `obtenerPerfil()` · `actualizarPerfilPropio()` · `actualizarPerfilComoAdmin()` · `actualizarFotoPropia()` · `actualizarFotoComoAdmin()`

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
- `uses` → [[service--seguridad-apariencia|AparienciaService]]

## Referenciado por

- [[api--seguridad-perfil|PerfilController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
