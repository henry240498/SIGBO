---
id: rule--pantalla-nueva-entra-a-la-matriz
tipo: RULE
nombre: Pantalla nueva ⇒ npm run generar:pantallas (también alimenta la matriz)
nivel: L1
resumen: El generador asigna el código estable de la pantalla, registra a qué rutas de la API llama y actualiza el catálogo del backend. Si no se corre, la pantalla funciona pero no se puede restringir por usuario/rol/rango/cargo, y CI falla en verificar:pantallas.
severidad: ALTA
dominio: seguridad
archivos: [frontend/scripts/generar-pantallas.mjs, frontend/scripts/pantallas-codigos.json, frontend/scripts/pantallas-api-extra.json]
terminos: [pantalla, generar, catalogo, codigo, matriz, ci]
---

Los códigos de `frontend/scripts/pantallas-codigos.json` **nunca** se renumeran ni se reutilizan:
las reglas los referencian. Una llamada que el generador no puede deducir (ruta armada en una
variable) se declara en `pantallas-api-extra.json`, junto con los POST que no crean nada.
