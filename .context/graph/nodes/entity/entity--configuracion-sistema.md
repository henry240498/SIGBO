---
id: entity--configuracion-sistema
tipo: ENTITY
nombre: ConfiguracionSistema
nivel: L1
dominio: seguridad
resumen: Entidad ConfiguracionSistema, persistida en seguridad.configuracion_sistema.
tabla: seguridad.configuracion_sistema
archivos:
  - backend/src/shared/entities/configuracion-sistema.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-configuracion-sistema]
terminos: [configuracion, sistema, seguridad]
---

# ConfiguracionSistema

Entidad ConfiguracionSistema, persistida en seguridad.configuracion_sistema.

- **Tabla:** [[table--seguridad-configuracion-sistema|seguridad.configuracion_sistema]]
- **Columnas mapeadas:** 8

## Archivos

- `backend/src/shared/entities/configuracion-sistema.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-configuracion-sistema|seguridad.configuracion_sistema]]

## Referenciado por

- [[service--seguridad-apariencia|AparienciaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
