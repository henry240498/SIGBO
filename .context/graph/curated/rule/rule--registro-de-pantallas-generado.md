---
id: rule--registro-de-pantallas-generado
tipo: RULE
nombre: Pantalla nueva significa regenerar el registro de pantallas
nivel: L2
resumen: src/lib/pantallas.generado.ts alimenta las migas de pan y el buscador Ctrl+K. Se genera desde el arbol de rutas y los TABS de cada layout; si no se regenera, la pantalla existe pero nadie la encuentra.
severidad: MEDIA
archivos: [frontend/scripts/generar-pantallas.mjs, frontend/src/lib/pantallas.generado.ts, frontend/src/lib/navegacion.ts, frontend/src/app/components/BuscadorPantallas.tsx]
terminos: [pantalla, ruta, navegacion, buscador, migas, breadcrumb, registro, generado, tabs]
edges:
  - [affects, component--front-modulos]
---

## Por que existe el registro

El menu lateral llega al **modulo**, no a la pantalla. Con 15 modulos y ~97 pantallas,
para abrir "Inventarios fisicos" habia que entrar a Deposito y encontrar la pestana
correcta. `src/lib/pantallas.generado.ts` es la lista completa, y de ahi salen las migas
de pan y el buscador que abre `Ctrl+K`.

## El paso que se olvida

```powershell
cd frontend; npm run generar:pantallas
```

El generador recorre `src/app/dashboard/**/page.tsx` y toma el **nombre legible** del
array `TABS` del `layout.tsx` del modulo. Entonces, al agregar una pantalla:

1. sumarla al `TABS` de su modulo (si no, queda con el slug crudo como nombre);
2. regenerar.

Si no se regenera, la pantalla funciona pero el buscador no la lista y las migas la
muestran con el slug. Las rutas con `[id]` se excluyen a proposito: son fichas, no
destinos a los que se salte, y en las migas aparecen como "Detalle".

`pantallas.generado.ts` **no se edita a mano** -- se sobrescribe entero. Los nombres que
no salen bien del slug se corrigen en el mapa `NOMBRES_POR_RUTA` del generador.
