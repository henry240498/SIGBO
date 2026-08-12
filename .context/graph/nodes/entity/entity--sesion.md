---
id: entity--sesion
tipo: ENTITY
nombre: Sesion
nivel: L1
dominio: seguridad
resumen: Entidad Sesion, persistida en seguridad.sesiones.
tabla: seguridad.sesiones
archivos:
  - backend/src/shared/entities/sesion.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-sesiones]
terminos: [sesion, sesiones, seguridad]
---

# Sesion

Entidad Sesion, persistida en seguridad.sesiones.

- **Tabla:** [[table--seguridad-sesiones|seguridad.sesiones]]
- **Columnas mapeadas:** 9

## Archivos

- `backend/src/shared/entities/sesion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-sesiones|seguridad.sesiones]]

## Referenciado por

- [[service--auth-auth|AuthService]] `uses` →
- [[service--seguridad-sesiones|SesionesService]] `uses` →
- [[workflow--login-y-sesion|Login, sesion y refresco de token]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
