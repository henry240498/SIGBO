---
id: configuration--idioma-y-region
tipo: CONFIGURATION
nombre: "Configuracion: Idioma y región"
nivel: L2
dominio: seguridad
resumen: "2 parametro(s) de la categoria \"Idioma y región\", niveles: USUARIO."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [idioma, region, language, timezone, zona, horaria]
---

# Configuracion: Idioma y región

2 parametro(s) de la categoria "Idioma y región", niveles: USUARIO.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `region.language` | USUARIO | selector | `'es-PY'` | — |
| `region.timezone` | USUARIO | selector | `'America/Asuncion'` | — |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
