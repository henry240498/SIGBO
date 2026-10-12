---
id: rule--pantalla-nueva-entra-a-la-matriz
tipo: RULE
nombre: "Pantalla nueva ⇒ npm run generar:pantallas (también alimenta la matriz)"
nivel: L1
dominio: seguridad
resumen: El generador asigna el código estable de la pantalla, registra a qué rutas de la API llama y actualiza el catálogo del backend. Si no se corre, la pantalla funciona pero no se puede restringir por usuario/rol/rango/cargo, y CI falla en verificar:pantallas.
severidad: ALTA
archivos:
  - frontend/scripts/generar-pantallas.mjs
  - frontend/scripts/pantallas-codigos.json
  - frontend/scripts/pantallas-api-extra.json
edges:
  - [belongs_to, domain--seguridad]
terminos: [pantalla, generar, catalogo, codigo, matriz, ci, nueva, npm, run, pantallas, tambien, alimenta, generador, asigna, estable, registra, rutas, api, llama, actualiza, corre, funciona, pero, puede, restringir, usuario, rol, rango, cargo, falla, verificar]
---

# Pantalla nueva ⇒ npm run generar:pantallas (también alimenta la matriz)

El generador asigna el código estable de la pantalla, registra a qué rutas de la API llama y actualiza el catálogo del backend. Si no se corre, la pantalla funciona pero no se puede restringir por usuario/rol/rango/cargo, y CI falla en verificar:pantallas.

Los códigos de `frontend/scripts/pantallas-codigos.json` **nunca** se renumeran ni se reutilizan:
las reglas los referencian. Una llamada que el generador no puede deducir (ruta armada en una
variable) se declara en `pantallas-api-extra.json`, junto con los POST que no crean nada.


## Archivos

- `frontend/scripts/generar-pantallas.mjs`
- `frontend/scripts/pantallas-codigos.json`
- `frontend/scripts/pantallas-api-extra.json`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo **curado** (editable a mano).</sub>
