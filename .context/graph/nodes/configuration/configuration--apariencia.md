---
id: configuration--apariencia
tipo: CONFIGURATION
nombre: "Configuracion: Apariencia"
nivel: L2
dominio: seguridad
resumen: "5 parametro(s) de la categoria \"Apariencia\", niveles: VISITANTE."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [apariencia, appearance, theme, tema, accent, color, acento, font, size, tamano, fuente, density, densidad, radius, radio, visual]
---

# Configuracion: Apariencia

5 parametro(s) de la categoria "Apariencia", niveles: VISITANTE.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `appearance.theme` | VISITANTE | selector | `'auto'` | — |
| `appearance.accent` | VISITANTE | color | `'#2563eb'` | — |
| `appearance.fontSize` | VISITANTE | numero | `100` | — |
| `appearance.density` | VISITANTE | selector | `'comfortable'` | — |
| `appearance.radius` | VISITANTE | numero | `8` | — |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[rule--tema-oscuro-fijo|El tema oscuro esta fijo en las pantallas, aunque Configuracion prometa temas]] `affects` →
- [[workflow--configuracion-versionada|Configuracion del sistema en tres niveles, con borrador y version publicada]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
