---
id: entity--usuario-telefono
tipo: ENTITY
nombre: UsuarioTelefono
nivel: L1
dominio: seguridad
resumen: Entidad UsuarioTelefono, persistida en seguridad.usuario_telefonos.
tabla: seguridad.usuario_telefonos
archivos:
  - backend/src/shared/entities/usuario-telefono.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-usuario-telefonos]
terminos: [usuario, telefono, telefonos, seguridad]
---

# UsuarioTelefono

Entidad UsuarioTelefono, persistida en seguridad.usuario_telefonos.

- **Tabla:** [[table--seguridad-usuario-telefonos|seguridad.usuario_telefonos]]
- **Columnas mapeadas:** 3

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** PerfilController
- **Servicios:** PerfilService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/usuario-telefono.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-usuario-telefonos|seguridad.usuario_telefonos]]

## Referenciado por

- [[service--seguridad-perfil|PerfilService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
