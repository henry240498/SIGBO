---
id: entity--usuario
tipo: ENTITY
nombre: Usuario
nivel: L1
dominio: seguridad
resumen: Entidad Usuario, persistida en seguridad.usuarios.
tabla: seguridad.usuarios
archivos:
  - backend/src/shared/entities/usuario.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-usuarios]
terminos: [usuario, usuarios, seguridad]
---

# Usuario

Entidad Usuario, persistida en seguridad.usuarios.

- **Tabla:** [[table--seguridad-usuarios|seguridad.usuarios]]
- **Columnas mapeadas:** 23

## Donde se usa

- **Pantallas:** `/dashboard/denuncias`, `/dashboard/denuncias/[id]`, `/dashboard/mi-perfil`, `/dashboard/mi-perfil/seguridad`, `/dashboard/organizacion`, `/dashboard/seguridad`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** AuthController, BitacoraController, DashboardController, DashboardController, DenunciasController, DenunciasPublicasController, MeController, PerfilController, SesionesController, UsuariosController
- **Servicios:** AuthService, BitacoraService, DashboardService, DenunciasService, PerfilService, SesionesService, UsuariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/usuario.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[service--auth-auth|AuthService]] `uses` →
- [[service--denuncias-denuncias|DenunciasService]] `uses` →
- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--seguridad-dashboard|DashboardService]] `uses` →
- [[service--seguridad-perfil|PerfilService]] `uses` →
- [[service--seguridad-sesiones|SesionesService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →
- [[rule--bloqueo-tras-cinco-intentos|Cinco intentos fallidos bloquean la cuenta 15 minutos]] `affects` →
- [[workflow--login-y-sesion|Login, sesion y refresco de token]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
