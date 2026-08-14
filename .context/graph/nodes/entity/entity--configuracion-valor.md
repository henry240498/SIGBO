---
id: entity--configuracion-valor
tipo: ENTITY
nombre: ConfiguracionValor
nivel: L1
dominio: seguridad
resumen: Entidad ConfiguracionValor, persistida en seguridad.configuracion_valores.
tabla: seguridad.configuracion_valores
archivos:
  - backend/src/shared/entities/configuracion-valor.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-configuracion-valores]
terminos: [configuracion, valor, valores, seguridad]
---

# ConfiguracionValor

Entidad ConfiguracionValor, persistida en seguridad.configuracion_valores.

- **Tabla:** [[table--seguridad-configuracion-valores|seguridad.configuracion_valores]]
- **Columnas mapeadas:** 6

## Donde se usa

- **Pantallas:** `/dashboard/mi-perfil/preferencias`, `/dashboard/seguridad/configuracion`
- **Endpoints:** ConfiguracionController
- **Servicios:** ConfiguracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/configuracion-valor.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-configuracion-valores|seguridad.configuracion_valores]]

## Referenciado por

- [[service--configuracion-configuracion|ConfiguracionService]] `uses` →
- [[workflow--configuracion-versionada|Configuracion del sistema en tres niveles, con borrador y version publicada]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
