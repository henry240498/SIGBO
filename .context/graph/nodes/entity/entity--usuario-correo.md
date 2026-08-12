---
id: entity--usuario-correo
tipo: ENTITY
nombre: UsuarioCorreo
nivel: L1
dominio: seguridad
resumen: Entidad UsuarioCorreo, persistida en seguridad.usuario_correos.
tabla: seguridad.usuario_correos
archivos:
  - backend/src/shared/entities/usuario-correo.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-usuario-correos]
terminos: [usuario, correo, correos, seguridad]
---

# UsuarioCorreo

Entidad UsuarioCorreo, persistida en seguridad.usuario_correos.

- **Tabla:** [[table--seguridad-usuario-correos|seguridad.usuario_correos]]
- **Columnas mapeadas:** 3

## Archivos

- `backend/src/shared/entities/usuario-correo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-usuario-correos|seguridad.usuario_correos]]

## Referenciado por

- [[service--seguridad-perfil|PerfilService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
