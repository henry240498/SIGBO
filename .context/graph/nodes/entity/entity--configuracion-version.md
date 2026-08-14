---
id: entity--configuracion-version
tipo: ENTITY
nombre: ConfiguracionVersion
nivel: L1
dominio: seguridad
resumen: Entidad ConfiguracionVersion, persistida en seguridad.configuracion_versiones.
tabla: seguridad.configuracion_versiones
archivos:
  - backend/src/shared/entities/configuracion-version.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-configuracion-versiones]
terminos: [configuracion, version, versiones, seguridad]
---

# ConfiguracionVersion

Entidad ConfiguracionVersion, persistida en seguridad.configuracion_versiones.

- **Tabla:** [[table--seguridad-configuracion-versiones|seguridad.configuracion_versiones]]
- **Columnas mapeadas:** 8

## Donde se usa

- **Pantallas:** `/dashboard/mi-perfil/preferencias`, `/dashboard/seguridad/configuracion`
- **Endpoints:** ConfiguracionController
- **Servicios:** ConfiguracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/configuracion-version.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-configuracion-versiones|seguridad.configuracion_versiones]]

## Referenciado por

- [[service--configuracion-configuracion|ConfiguracionService]] `uses` →
- [[workflow--configuracion-versionada|Configuracion del sistema en tres niveles, con borrador y version publicada]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
